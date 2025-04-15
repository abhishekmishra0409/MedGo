const express = require('express');
const router = express.Router();
const cartController = require('../Controllers/cartController');
const authMiddleware = require('../Middlewares/authMiddleware');

router.get('/', authMiddleware, cartController.getCart);
router.post('/add', authMiddleware, cartController.addToCart);
router.put('/:productId', authMiddleware, cartController.updateCartItem);
router.delete('/:productId', authMiddleware, cartController.removeFromCart);
router.delete('/', authMiddleware, cartController.clearCart);

module.exports = router;