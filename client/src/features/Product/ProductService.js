import axios from "axios";
import { buildApiUrl } from "../../utils/baseURL.js";

export const getAllProducts = async (params = {}) => {
    const response = await axios.get(buildApiUrl("products"), { params });
    return response.data;
};

export const getProductById = async (productId) => {
    const response = await axios.get(buildApiUrl(`products/${productId}`));
    return response.data;
};
