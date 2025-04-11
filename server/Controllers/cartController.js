const CartService = require('../Services/cartServices');

exports.getCart = async (req, res) => {
    try {
        const cart = await CartService.getCart(req.user.id);
        res.json({ success: true, data: cart });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.addToCart = async (req, res) => {
    try {
        const cart = await CartService.addToCart(
            req.user.id,
            req.body.productId,
            req.body.quantity
        );
        res.status(201).json({ success: true, data: cart });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.updateCartItem = async (req, res) => {
    try {
        const cart = await CartService.updateCartItem(
            req.user.id,
            req.params.productId,
            req.body.quantity
        );
        res.json({ success: true, data: cart });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const cart = await CartService.removeFromCart(req.user.id, req.params.productId);
        res.json({ success: true, data: cart });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.clearCart = async (req, res) => {
    try {
        await CartService.clearCart(req.user.id);
        res.json({ success: true, message: 'Cart cleared successfully' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};