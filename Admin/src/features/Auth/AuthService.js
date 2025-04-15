import axios from "axios";
import { base_url } from "../../utils/baseUrl.js";
import config from "../../utils/config.js";

// Login User
const login = async (loginData) => {
    const response = await axios.post(`${base_url}users/login`, loginData);
    if (response.data.token) {
        localStorage.setItem("userToken", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
};

// Get All Users (admin only)
const getAllUsers = async () => {
    const response = await axios.get(`${base_url}users`, config);
    return response.data;
};

// Get User by ID (admin only)
const getUser = async (id) => {
    const response = await axios.get(`${base_url}users/${id}`, config);
    return response.data;
};

// Delete user account
const deleteAccount = async () => {
    const response = await axios.delete(`${base_url}users/account`, config);
    return response.data;
};

// Logout
const logout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");
};

export const authService = {
    login,
    getAllUsers,
    getUser,
    deleteAccount,
    logout,
};
