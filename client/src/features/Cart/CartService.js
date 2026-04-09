import axios from "axios";
import { buildApiUrl } from "../../utils/baseURL.js";
import userConfig from "../../utils/userConfig.js";

const API_URL = buildApiUrl("carts");

const getCart = async () => {
    const response = await axios.get(API_URL, userConfig());
    return response.data;
};

const addToCart = async (productData) => {
    await axios.post(`${API_URL}/add`, productData, userConfig());
    return getCart();
};

const updateCartItem = async ({ productId, updatedData }) => {
    await axios.put(`${API_URL}/${productId}`, updatedData, userConfig());
    return getCart();
};

const removeFromCart = async (productId) => {
    await axios.delete(`${API_URL}/${productId}`, userConfig());
    return getCart();
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
