const Cart = require('../Models/CartModel');
const Product = require('../Models/ProductModel');

class CartService {
    static async getCart(userId) {
        return await Cart.findOne({ user: userId }).populate('items.product');
    }

    static async addToCart(userId, productId, quantity = 1) {
        const product = await Product.findById(productId);
        if (!product) throw new Error('Product not found');
        if (product.stock < quantity) throw new Error('Insufficient stock');

        let cart = await Cart.findOne({ user: userId });

        if (!cart) {
            cart = new Cart({
                user: userId,
                items: []
            });
        }

        const existingItem = cart.items.find(item => item.product.equals(productId));

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                priceAtAddition: product.price
            });
        }

        return await cart.save();
    }

    static async removeFromCart(userId, productId) {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) throw new Error('Cart not found');

        cart.items = cart.items.filter(item => !item.product.equals(productId));
        return await cart.save();
    }

    static async updateCartItem(userId, productId, quantity) {
        if (quantity < 1) throw new Error('Quantity must be at least 1');

        const product = await Product.findById(productId);
        if (!product) throw new Error('Product not found');
        if (product.stock < quantity) throw new Error('Insufficient stock');

        const cart = await Cart.findOne({ user: userId });
        if (!cart) throw new Error('Cart not found');

        const item = cart.items.find(item => item.product.equals(productId));
        if (!item) throw new Error('Item not in cart');

        item.quantity = quantity;
        return await cart.save();
    }

    static async clearCart(userId) {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) throw new Error('Cart not found');

        cart.items = [];
        return await cart.save();
    }
}

module.exports = CartService;