import axios from "axios";
import { buildApiUrl, getErrorMessage } from "../../utils/api.js";

const register = async (userData) => {
    try {
        const response = await axios.post(buildApiUrl("users/register"), userData);
        return response.data;
    } catch (error) {
        throw getErrorMessage(error, "Registration failed");
    }
};

const uploadDoctorProfileImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
        const response = await axios.post(buildApiUrl("users/upload-profile-image"), formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    } catch (error) {
        throw getErrorMessage(error, "Failed to upload profile image");
    }
};

const login = async (loginData) => {
    try {
        const response = await axios.post(buildApiUrl("users/login"), loginData);
        return response.data;
    } catch (error) {
        throw getErrorMessage(error, "Invalid credentials");
    }
};

const requestPasswordReset = async (email) => {
    try {
        const response = await axios.post(buildApiUrl("users/forgot-password"), { email });
        return response.data;
    } catch (error) {
        throw getErrorMessage(error, "Failed to start password reset");
    }
};

const resetPassword = async ({ token, password, confirmPassword }) => {
    try {
        const response = await axios.post(buildApiUrl(`users/reset-password/${token}`), {
            password,
            confirmPassword,
        });
        return response.data;
    } catch (error) {
        throw getErrorMessage(error, "Failed to reset password");
    }
};

const updateUser = async (userData, config) => {
    try {
        const response = await axios.put(buildApiUrl("users/profile"), userData, config);
        return response.data;
    } catch (error) {
        throw getErrorMessage(error, "Failed to update profile");
    }
};

const getUserdata = async (config) => {
    try {
        const response = await axios.get(buildApiUrl("users/me"), config);
        return response.data;
    } catch (error) {
        throw getErrorMessage(error, "Failed to fetch user data");
    }
};

const logout = async () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userSession");
    localStorage.removeItem("cartItems");
    localStorage.removeItem("cartCoupon");
};

export const authService = {
    register,
    uploadDoctorProfileImage,
    login,
    requestPasswordReset,
    resetPassword,
    logout,
    updateUser,
    getUserdata,
};
