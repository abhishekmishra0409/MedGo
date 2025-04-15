const OrderService = require('../Services/orderServices');

exports.createOrder = async (req, res) => {
    try {
        const order = await OrderService.createOrder(req.user.id, req.body);
        res.status(201).json({
            success: true,
            data: order,
            message: 'Order created successfully'
        });
    } catch (error) {
        if (error.unavailableItems) {
            return res.status(400).json({
                success: false,
                error: error.message,
                unavailableItems: error.unavailableItems
            });
        }
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.getOrder = async (req, res) => {
    try {
        const order = await OrderService.getOrder(req.params.id, req.user.id);
        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(error.message.includes('Unauthorized') ? 403 : 404).json({
            success: false,
            error: error.message
        });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await OrderService.getUserOrders(req.user.id, page, limit);
        res.json({
            success: true,
            data: result.orders,
            pagination: {
                total: result.total,
                pages: result.pages,
                currentPage: result.currentPage
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        // Allow admin to update any order, users can only cancel their own orders
        const userId = req.user.role === 'admin' ? null : req.user.id;
        const order = await OrderService.updateOrderStatus(
            req.params.id,
            req.body.status,
            userId
        );
        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(error.message.includes('Unauthorized') ? 403 : 400).json({
            success: false,
            error: error.message
        });
    }
};

exports.getOrdersByStatus = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized access'
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await OrderService.getOrdersByStatus(
            req.params.status,
            page,
            limit
        );

        res.json({
            success: true,
            orders: result.orders,
            pagination: {
                total: result.total,
                pages: result.pages,
                currentPage: result.currentPage
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const data = await OrderService.getAllOrders(page, limit);

        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ error: "Failed to fetch orders." });
    }
};