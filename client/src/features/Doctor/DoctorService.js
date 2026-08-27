import axios from "axios";
import { buildApiUrl, getErrorMessage } from "../../utils/api.js";
import doctorConfig from "../../utils/doctorConfig.js";

const getAllDoctors = async (params = {}) => {
    try {
        const response = await axios.get(buildApiUrl("users/doctors"), { params });
        return response.data;
    } catch (error) {
        throw getErrorMessage(error, "Failed to fetch doctors");
    }
};

const getDoctorById = async (doctorId) => {
    try {
        const response = await axios.get(buildApiUrl(`users/doctors/${doctorId}`));
        return response.data;
    } catch (error) {
        throw getErrorMessage(error, "Doctor not found");
    }
};

const getMyProfile = async () => {
    try {
        const response = await axios.get(buildApiUrl("users/me"), doctorConfig());
        return response.data;
    } catch (error) {
        throw getErrorMessage(error, "Failed to load doctor profile");
    }
};

const updateMyProfile = async (profileData) => {
    try {
        const response = await axios.put(buildApiUrl("users/profile"), profileData, doctorConfig());
        return response.data;
    } catch (error) {
        throw getErrorMessage(error, "Failed to update doctor profile");
    }
};

const logoutDoctor = async () => {
    localStorage.removeItem("doctorToken");
    localStorage.removeItem("doctor");
    localStorage.removeItem("doctorSession");
};

export const doctorService = {
    getAllDoctors,
    getDoctorById,
    getMyProfile,
    updateMyProfile,
    logoutDoctor,
};
