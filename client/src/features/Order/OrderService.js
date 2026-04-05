import axios from "axios";
import { buildApiUrl } from "../../utils/baseURL.js";
import userConfig from "../../utils/userConfig.js";

const createOrder = async (orderData) => {
    const response = await axios.post(buildApiUrl("orders"), orderData, userConfig());
    return response.data;
};

const getOrderById = async (orderId) => {
    const response = await axios.get(buildApiUrl(`orders/${orderId}`), userConfig());
    return response.data;
};

const getMyOrders = async () => {
    const response = await axios.get(buildApiUrl("orders"), userConfig());
    return response.data;
};

const orderService = { createOrder, getOrderById, getMyOrders };

export default orderService;
