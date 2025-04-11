const jwt = require('jsonwebtoken');
const User = require('../Models/UserModel');
const config = require('../config/config');

module.exports = async (req, res, next) => {
    try {
        // 1. Get token from header
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        // 2. Verify token
        const decoded = jwt.verify(token, config.JWT_SECRET);

        // 3. Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({ error: 'Doctor not found' });
        }

        // 4. Attach user to request
        req.user = currentUser;
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