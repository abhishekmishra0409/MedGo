const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../Middlewares/authMiddleware');
const adminMiddleware = require('../Middlewares/adminMiddleware');

// Create new order
router.post('/', authMiddleware, orderController.createOrder);

// Get all orders for logged-in user (with pagination)
router.get('/', authMiddleware, orderController.getMyOrders);

// Get all orders (admin only)
router.get('/all', authMiddleware, adminMiddleware, orderController.getAllOrders);

// Get orders by status (admin only)
router.get('/status/:status', authMiddleware, adminMiddleware, orderController.getOrdersByStatus);

// Update order status (admin only)
router.patch('/:id/status', authMiddleware, adminMiddleware, orderController.updateOrderStatus);

// Get single order (user's own order) - should come **after** the specific routes
router.get('/:id', authMiddleware, orderController.getOrder);

module.exports = router;
