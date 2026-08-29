const express = require('express');
const userRoutes = require('./userRoute');
const doctorRoutes = require('./doctorRoute');
const productRoutes = require('./productRoute');
const blogRoutes = require('./blogRoute');
const clinicRoutes = require('./clinicRoute');
const appointmentRoutes = require('./appointmentRoute');
const testRoutes = require('./testRoute');
const labTestRoutes = require('./labTestRoute');
const cartRoutes = require('./cartRoute');
const orderRoutes = require('./orderRoute');
const messageRoutes = require('./messageRoute');
const notificationRoutes = require('./notificationRoute');

const authMiddleware = require('../Middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for API endpoints.
// 100/15min was low enough that ordinary use tripped it: one dashboard view
// fires ~9 requests, React StrictMode double-invokes every effect in dev, and
// the whole API then 429s — which reads as "lab tests and appointments are
// broken" rather than as a rate limit.
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX) || 1000,
    standardHeaders: true,
    legacyHeaders: false,
    // A bare string body gives axios nothing to read, so the client shows
    // "Request failed with status code 429" instead of the reason.
    message: { success: false, error: 'Too many requests from this IP, please try again later' },
    // Dev reloads and StrictMode make the limit meaningless locally.
    skip: () => process.env.NODE_ENV !== 'production',
});

// Health check endpoint — must answer even when the limiter is engaged.
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Apply rate limiting to all routes below the health check
router.use(apiLimiter);

// API versioning and routes
router.use('/users', userRoutes);
router.use('/doctors', doctorRoutes);
router.use('/products', productRoutes);
router.use('/blogs', blogRoutes);
router.use('/clinics', clinicRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/tests', testRoutes);
router.use('/lab-tests', labTestRoutes);
router.use('/carts', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/messages', messageRoutes);
router.use('/notifications', notificationRoutes);

// 404 handler for undefined routes
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        requestedUrl: req.originalUrl
    });
});

module.exports = router;
