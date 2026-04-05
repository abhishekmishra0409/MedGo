import axios from "axios";
import { base_url } from "../../utils/baseURL";
import config from "../../utils/config.js";

// Get all doctors
const getAllDoctors = async (params = {}) => {
    const response = await axios.get(`${base_url}users/admin/doctors`, {
        ...config(),
        params,
    });
    return response.data;
};

// Create doctor (admin only)
const createDoctor = async (doctorData) => {
    const response = await axios.post(`${base_url}users/admin/doctors`, doctorData, config());
    return response.data;
};

// Update doctor (admin only)
const updateDoctor = async ({ id, updatedData }) => {
    const response = await axios.put(`${base_url}users/admin/doctors/${id}`, updatedData, config());
    return response.data;
};

const updateDoctorApproval = async ({ id, approvalStatus, approvalNotes = "" }) => {
    const response = await axios.patch(
        `${base_url}users/admin/doctors/${id}/approval`,
        { approvalStatus, approvalNotes },
        config()
    );
    return response.data;
};

// Delete doctor (admin only)
const deleteDoctor = async (id) => {
    const response = await axios.delete(`${base_url}users/admin/doctors/${id}`, config());
    return response.data;
};

export const doctorService = {
    getAllDoctors,
    createDoctor,
    updateDoctor,
    updateDoctorApproval,
    deleteDoctor,
};
