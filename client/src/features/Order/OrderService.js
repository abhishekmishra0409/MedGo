import axios from "axios";
import { base_url } from "../../utils/baseURL.js";
import config from "../../utils/userConfig.js";

// Create an Order
const createOrder = async (orderData) => {
    const response = await axios.post(`${base_url}orders`, orderData, config);
    return response.data;
};

// Get a Single Order by ID
const getOrderById = async (orderId) => {
    const response = await axios.get(`${base_url}orders/${orderId}`, config);
    return response.data;
};

// Get User's Orders
const getMyOrders = async () => {
    const response = await axios.get(`${base_url}orders`, config);
    return response.data;
};

const orderService = { createOrder, getOrderById, getMyOrders };

export default orderService;
