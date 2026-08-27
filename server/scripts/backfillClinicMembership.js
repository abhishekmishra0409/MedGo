// Run once, after UserModel.js gains doctorProfile.clinicMembershipStatus.
// Grandfathers in doctors already attached to a clinic (clinicMembershipStatus
// defaults to 'none', which would otherwise delist them from clinic rosters
// and public clinic pages under the new two-layer approval filter).
//
// Usage: node scripts/backfillClinicMembership.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../Models/UserModel');

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const result = await User.updateMany(
        { role: 'doctor', 'doctorProfile.clinicMembershipStatus': { $exists: false } },
        [{ $set: { 'doctorProfile.clinicMembershipStatus': {
            $cond: [{ $ifNull: ['$doctorProfile.primaryClinic', false] }, 'approved', 'none'] } } }]
    );
    console.log(`Seeded clinicMembershipStatus on ${result.modifiedCount} doctor(s).`);

    await mongoose.disconnect();
};

run().catch((error) => {
    console.error('Backfill failed:', error);
    process.exit(1);
});
