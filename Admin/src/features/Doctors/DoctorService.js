import axios from "axios";
import { base_url } from "../../utils/baseURL";
import config from "../../utils/config.js";

// Get all doctors
const getAllDoctors = async () => {
    const response = await axios.get(`${base_url}doctors`);
    return response.data;
};

// Create doctor (admin only)
const createDoctor = async (doctorData) => {
    // const formData = new FormData();
    // for (const key in doctorData) {
    //     formData.append(key, doctorData[key]);
    // }

    const response = await axios.post(`${base_url}doctors/register`, doctorData, {
        ...config,
        headers: {
            ...config.headers,
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data;
};

// Update doctor (admin only)
const updateDoctor = async ({ id, updatedData }) => {
    // const formData = new FormData();
    // for (const key in updatedData) {
    //     formData.append(key, updatedData[key]);
    // }
    console.log(updatedData)

    const response = await axios.put(`${base_url}doctors/${id}`, updatedData, {
        ...config,
        headers: {
            ...config.headers,
            "Content-Type": "multipart/form-data"
        }
    });
    return response.data;
};

// Delete doctor (admin only)
const deleteDoctor = async (id) => {
    const response = await axios.delete(`${base_url}doctors/${id}`, config);
    return response.data;
};

export const doctorService = {
    getAllDoctors,
    createDoctor,
    updateDoctor,
    deleteDoctor,
};
