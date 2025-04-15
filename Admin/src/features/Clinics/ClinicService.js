import axios from "axios";
import { base_url } from "../../utils/baseURL";
import config from "../../utils/config.js";

// Get all clinics (public)
const getClinics = async () => {
    const response = await axios.get(`${base_url}clinics`);
    return response.data;
};

// Create a new clinic (admin only)
const createClinic = async (clinicData) => {
    const response = await axios.post(`${base_url}clinics`, clinicData, config);
    return response.data;
};

// Update an existing clinic (admin only)
const updateClinic = async ({ id, clinicData }) => {
    console.log(clinicData)
    const response = await axios.put(`${base_url}clinics/${id}`, clinicData, config);
    return response.data;
};

// Add a doctor to a clinic (admin only)
const addDoctorToClinic = async ({ clinicId, doctorData }) => {
    console.log(doctorData)
    const response = await axios.post(`${base_url}clinics/${clinicId}/doctors`, doctorData, config);
    return response.data;
};

// Remove a doctor from a clinic (admin only)
const removeDoctorFromClinic = async (clinicId, doctorId) => {
    const response = await axios.delete(
        `${base_url}clinics/${clinicId}/doctors`,
        { data: { doctorId }, ...config }
    );
    return response.data;
};

export const clinicService = {
    getClinics,
    createClinic,
    updateClinic,
    addDoctorToClinic,
    removeDoctorFromClinic
};
