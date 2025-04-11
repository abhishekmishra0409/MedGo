import axios from "axios";
import { base_url } from "../../utils/baseURL.js";


// Get all doctors
const getAllDoctors = async () => {
    try {
        const response = await axios.get(`${base_url}doctors/`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get doctor by ID
const getDoctorById = async (doctorId) => {
    try {
        const response = await axios.get(`${base_url}doctors/${doctorId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Doctor login
const loginDoctor = async (loginData) => {
    try {
        const response = await axios.post(`${base_url}doctors/login`, loginData);
        if (response.data.data.token) {
            localStorage.setItem("doctorToken", response.data.data.token);
            localStorage.setItem("doctor", JSON.stringify(response.data.data.doctor));
        }
        console.log(response.data.data)
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Logout doctor
const logoutDoctor = async () => {
    localStorage.removeItem("doctorToken");
    localStorage.removeItem("doctor");
};

export const doctorService = {
    getAllDoctors,
    getDoctorById,
    loginDoctor,
    logoutDoctor,
};
