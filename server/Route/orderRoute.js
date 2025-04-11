const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authMiddleware = require('../Middlewares/authMiddleware');
const adminMiddleware = require('../Middlewares/adminMiddleware');

// Create new order
router.post('/', authMiddleware, orderController.createOrder);

// Get single order (user's own order)
router.get('/:id', authMiddleware, orderController.getOrder);

// Get all orders for logged-in user (with pagination)
router.get('/', authMiddleware, orderController.getMyOrders);

// Update order status (admin only)
router.patch('/:id/status', authMiddleware, adminMiddleware, orderController.updateOrderStatus);

// Get orders by status (admin only)
router.get('/status/:status', authMiddleware, adminMiddleware, orderController.getOrdersByStatus);

module.exports = router;