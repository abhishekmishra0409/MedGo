const jwt = require('jsonwebtoken');
const User = require('../Models/UserModel');
const config = require('../config/config');

// Mirrors doctorMiddleware for the clinic-owner role. Not currently wired to
// the shared /clinics/me/* routes — those must stay open to a pending owner
// so they can finish setting up their clinic (see clinicService.resolveManagedClinic).
// The actual roster-approval trust gate lives inline in
// clinicService.updateRosterMembership, since that action is shared by both
// clinic-owner-role users and doctor-owners (role: 'doctor', clinicRole: 'owner'),
// and a blanket role==='clinic-owner' check here would wrongly block the latter.
// Reserved for a future clinic-owner-exclusive route.
module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        const currentOwner = await User.findById(decoded.id).select('-password');
        if (!currentOwner || currentOwner.role !== 'clinic-owner') {
            return res.status(401).json({ error: 'Clinic owner not found' });
        }

        if (currentOwner.ownerProfile?.approvalStatus !== 'approved') {
            return res.status(403).json({
                error: 'Your clinic account is awaiting platform approval.',
                approvalStatus: currentOwner.ownerProfile?.approvalStatus || 'pending',
            });
        }

        req.user = currentOwner;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        res.status(500).json({ error: 'Authentication failed' });
    }
};
