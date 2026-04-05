import axios from "axios";
import { buildApiUrl } from "../../utils/baseURL.js";
import userConfig from "../../utils/userConfig.js";

const API_URL = buildApiUrl("carts");

const getCart = async () => {
    const response = await axios.get(API_URL, userConfig());
    return response.data;
};

const addToCart = async (productData) => {
    const response = await axios.post(`${API_URL}/add`, productData, userConfig());
    return response.data;
};

const updateCartItem = async ({ productId, updatedData }) => {
    const response = await axios.put(`${API_URL}/${productId}`, updatedData, userConfig());
    return response.data;
};

const removeFromCart = async (productId) => {
    const response = await axios.delete(`${API_URL}/${productId}`, userConfig());
    return response.data;
};

const clearCart = async () => {
    const response = await axios.delete(API_URL, userConfig());
    return response.data;
};

const cartService = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
};

export default cartService;
