import axios from "axios";
import { base_url } from "../../utils/baseURL";
import config from "../../utils/config.js";

// Get all products
const getAllProducts = async () => {
    const response = await axios.get(`${base_url}products/`);
    return response.data;
};

// Get a single product by ID
const getProductById = async (id) => {
    const response = await axios.get(`${base_url}products/${id}`);
    return response.data;
};

// Create product (admin only)
const createProduct = async (productData) => {
    const response = await axios.post(`${base_url}products/`, productData, config);
    return response.data;
};

// Update product (admin only)
const updateProduct = async (id, updatedData) => {
    const response = await axios.put(`${base_url}products/${id}`, updatedData, config);
    return response.data;
};

// Delete product (admin only)
const deleteProduct = async (id) => {
    const response = await axios.delete(`${base_url}products/${id}`, config);
    return response.data;
};

export const productService = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
