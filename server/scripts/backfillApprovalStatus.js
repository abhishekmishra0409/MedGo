// Run once, before deploying the buildDoctorSearchQuery fix that drops the
// $exists:false / null fallback. Without this, legacy doctors with no
// doctorProfile.approvalStatus at all disappear from the public listing.
//
// Usage: node scripts/backfillApprovalStatus.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../Models/UserModel');

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const approvedResult = await User.updateMany(
        { role: 'doctor', 'doctorProfile.approvalStatus': { $in: [null] } },
        { $set: { 'doctorProfile.approvalStatus': 'approved' } }
    );
    console.log(`Materialised approvalStatus on ${approvedResult.modifiedCount} legacy doctor(s).`);

    const councilResult = await User.updateMany(
        { 'doctorProfile.councilRegistrationNumber': '' },
        { $unset: { 'doctorProfile.councilRegistrationNumber': '' } }
    );
    console.log(`Cleared empty councilRegistrationNumber on ${councilResult.modifiedCount} doctor(s).`);

    await mongoose.disconnect();
};

run().catch((error) => {
    console.error('Backfill failed:', error);
    process.exit(1);
});
