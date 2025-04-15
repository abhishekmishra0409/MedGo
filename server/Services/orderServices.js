const Order = require('../Models/OrderModel');
const Cart = require('../Models/CartModel');
const Product = require('../Models/ProductModel');
const User = require('../Models/UserModel');
// const { sendOrderConfirmationEmail } = require('../utils/emailService');

class OrderService {
    static async createOrder(userId, orderData) {
        const session = await Order.startSession();
        session.startTransaction();

        try {
            const user = await User.findById(userId).session(session);
            if (!user) throw new Error('User not found');

            const cart = await Cart.findOne({ user: userId })
                .populate('items.product')
                .session(session);

            if (!cart || cart.items.length === 0) throw new Error('Cart is empty');

            // Verify stock and calculate totals
            let subtotal = 0;
            const items = [];
            const unavailableItems = [];

            for (const item of cart.items) {
                const product = item.product;
                if (product.stock < item.quantity) {
                    unavailableItems.push({
                        product: product.name,
                        available: product.stock
                    });
                    continue;
                }

                subtotal += product.price * item.quantity;
                items.push({
                    product: product._id,
                    name: product.name,
                    image: product.image,
                    quantity: item.quantity,
                    priceAtPurchase: product.price
                });

                // Update product stock
                product.stock -= item.quantity;
                await product.save({ session });
            }

            if (unavailableItems.length > 0) {
                throw new Error({
                    message: 'Some items are unavailable',
                    unavailableItems
                });
            }

            const shippingFee = orderData.shippingFee || (subtotal > 1000 ? 0 : 50);
            const tax = subtotal * 0.18; // 18% tax
            const total = subtotal + shippingFee + tax - (orderData.discount || 0);

            const order = new Order({
                user: userId,
                items,
                subtotal,
                shippingFee,
                tax,
                discount: orderData.discount || 0,
                total,
                shippingAddress: orderData.shippingAddress,
                paymentMethod: orderData.paymentMethod,
                paymentStatus: orderData.paymentMethod === 'cash_on_delivery' ? 'pending' : 'completed'
            });

            await order.save({ session });
            // await Cart.findOneAndDelete({ user: userId }).session(session);

            await session.commitTransaction();
            session.endSession();

            // Send confirmation email (non-blocking)
            // try {
            //     await sendOrderConfirmationEmail(user.email, order);
            // } catch (emailError) {
            //     console.error('Failed to send confirmation email:', emailError);
            // }

            return order;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    static async getOrder(orderId, userId = null) {
        const order = await Order.findById(orderId).populate('items.product');
        if (!order) throw new Error('Order not found');

        if (userId && !order.user.equals(userId)) {
            throw new Error('Unauthorized to view this order');
        }

        return order;
    }

    static async getUserOrders(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find({ user: userId })
                .populate('items.product')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order.countDocuments({ user: userId })
        ]);

        return {
            orders,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        };
    }

    static async updateOrderStatus(orderId, status, userId = null) {
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) throw new Error('Invalid status');

        const update = { status };

        // If order is delivered, set deliveredAt timestamp
        if (status === 'delivered') {
            update.deliveredAt = Date.now();
        }

        // If order is cancelled, restock products
        if (status === 'cancelled') {
            const session = await Order.startSession();
            session.startTransaction();

            try {
                const order = await Order.findById(orderId).session(session);
                if (!order) throw new Error('Order not found');

                if (userId && !order.user.equals(userId)) {
                    throw new Error('Unauthorized to update this order');
                }

                // Restock products
                await Promise.all(order.items.map(async item => {
                    await Product.findByIdAndUpdate(
                        item.product,
                        { $inc: { stock: item.quantity } },
                        { session }
                    );
                }));

                const updatedOrder = await Order.findByIdAndUpdate(
                    orderId,
                    update,
                    { new: true, session }
                );

                await session.commitTransaction();
                session.endSession();
                return updatedOrder;
            } catch (error) {
                await session.abortTransaction();
                session.endSession();
                throw error;
            }
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            update,
            { new: true }
        );

        if (!order) throw new Error('Order not found');
        if (userId && !order.user.equals(userId)) {
            throw new Error('Unauthorized to update this order');
        }

        return order;
    }

    static async getOrdersByStatus(status, page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find({ status })
                .populate('user', 'username email')
                .populate('items.product')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order.countDocuments({ status })
        ]);

        return {
            orders,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        };
    }

    static async getAllOrders(page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            Order.find()
                .populate('user', 'username email')
                .populate('items.product')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Order.countDocuments()
        ]);

        return {
            orders,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        };
    }
}

module.exports = OrderService;