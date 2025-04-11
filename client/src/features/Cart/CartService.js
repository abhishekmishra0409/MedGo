import axios from "axios";
import { base_url } from "../../utils/baseURL.js";
import config from "../../utils/userConfig.js";

// Get Cart
const getCart = async () => {
    const response = await axios.get(`${base_url}carts`, config);
    return response.data;
};

// Add Item to Cart
const addToCart = async (productData) => {
    const response = await axios.post(`${base_url}carts/add`, productData, config);
    return response.data;
};

// Update Cart Item
const updateCartItem = async ({ productId, updatedData }) => {
    const response = await axios.put(`${base_url}carts/${productId}`, updatedData, config);
    return response.data;
};

// Remove Item from Cart
const removeFromCart = async (productId) => {
    const response = await axios.delete(`${base_url}carts/${productId}`, config);
    return response.data;
};

// Clear Entire Cart
const clearCart = async () => {
    const response = await axios.delete(`${base_url}carts`, config);
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
