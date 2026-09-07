const jwt = require('jsonwebtoken');
const User = require('../Models/UserModel');
const config = require('../config/config');

// Scoped variant of authMiddleware.js that additionally requires role === 'user'.
// Kept separate rather than modifying the shared middleware, since other routes
// mount authMiddleware.js directly and may rely on it accepting any authenticated role.
module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);

        const currentUser = await User.findById(decoded.id);
        if (!currentUser || currentUser.role !== 'user') {
            return res.status(403).json({ error: 'This endpoint is only available to patient accounts.' });
        }

        req.user = currentUser;
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
