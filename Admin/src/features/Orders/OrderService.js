import axios from "axios";
import { base_url } from "../../utils/baseURL";
import config from "../../utils/config.js";

// Get all orders (paginated)
const getAllOrders = async (page = 1, limit = 10) => {
    const response = await axios.get(`${base_url}orders/all?page=${page}&limit=${limit}`, config);
    return response.data;
};

// Get orders by status
const getOrdersByStatus = async (status) => {
    const response = await axios.get(`${base_url}orders/status/${status}`, config);
    return response.data;
};

// Update order status
const updateOrderStatus = async ({ orderId, status }) => {
    const response = await axios.patch(`${base_url}orders/${orderId}/status`, { status }, config);
    return response.data;
};

export const orderAdminService = {
    getAllOrders,
    getOrdersByStatus,
    updateOrderStatus
};
