import axios from "axios";
import { base_url } from "../../utils/baseURL.js";
import config from "../../utils/userConfig.js";

// Register function
const register = async (userData) => {
    try {
        const response = await axios.post(`${base_url}users/register`, userData);
        return response.data;
    } catch (error) {
        console.log(error.response.data.error)
        throw error.response.data.error || error.message;
    }
};

// Login function
const login = async (loginData) => {
    try {
        const response = await axios.post(`${base_url}users/login`, loginData);
        if (response.data.token) {
            localStorage.setItem('userToken', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Update user profile or address
const updateUser = async (userData) => {
    try {
        const response = await axios.put(`${base_url}users/profile`, userData, config);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get Orders function
const getUserdata = async () => {
    try {
        const response = await axios.get(`${base_url}users/me`, config);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Logout function
const logout = async () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    localStorage.removeItem('cartItems');
    localStorage.removeItem('cartCoupon');


};

export const authService = {
    register,
    login,
    logout,
    updateUser,
    getUserdata
};