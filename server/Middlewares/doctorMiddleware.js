const jwt = require('jsonwebtoken');
const User = require('../Models/UserModel');
const config = require('../config/config');

module.exports = async (req, res, next) => {
    try {
        // 1. Get token from header
        const token = req.headers.authorization?.split(' ')[1];
        // console.log(token)
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // 2. Verify token
        const decoded = jwt.verify(token, config.JWT_SECRET);

        // 3. Check if doctor still exists
        const currentDoctor = await User.findById(decoded.id).select('-password');
        if (!currentDoctor || currentDoctor.role !== 'doctor') {
            return res.status(401).json({ error: 'Doctor not found' });
        }

        // 4. Platform approval gate. Pending/rejected doctors can still log in
        // (see UserService.loginUser) but can't touch doctor-only features —
        // appointments, blogs, lab bookings, messages all route through here.
        if (currentDoctor.doctorProfile?.approvalStatus !== 'approved') {
            return res.status(403).json({
                error: 'Your doctor account is awaiting platform approval.',
                approvalStatus: currentDoctor.doctorProfile?.approvalStatus || 'pending',
            });
        }

        // 5. Attach doctor to request
        req.user = currentDoctor;
        next();
    } catch (error) {
        // Handle different JWT errors specifically
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        res.status(500).json({ error: 'Authentication failed' });
    }
};
