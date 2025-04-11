import axios from "axios";
import { base_url } from "../../utils/baseURL.js";


// Fetch all products
export const getAllProducts = async () => {
    const response = await axios.get(`${base_url}products`);
    return response.data;
};

// Fetch a single product by ID
export const getProductById = async (productId) => {
    const response = await axios.get(`${base_url}products/${productId}`);
    return response.data;
};
