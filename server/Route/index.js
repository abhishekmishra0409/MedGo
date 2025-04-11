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

const authMiddleware = require('../Middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});

// Apply rate limiting to all routes
router.use(apiLimiter);

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

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
router.use('/messages',messageRoutes)

// 404 handler for undefined routes
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        requestedUrl: req.originalUrl
    });
});

module.exports = router;