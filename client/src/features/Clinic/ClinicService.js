import axios from "axios";
import { base_url } from "../../utils/baseURL.js";

const API_URL = `${base_url}clinics`;

// Get All Clinics
const getClinics = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// Get Single Clinic by ID
const getClinic = async (clinicId) => {
    const response = await axios.get(`${API_URL}/${clinicId}`);
    return response.data;
};

// Get Available Slots for a Clinic on Specific Date
const getAvailableSlots = async ({ clinicId, date }) => {
    const response = await axios.get(`${API_URL}/${clinicId}/slots?date=${date}`);
    return response.data;
};

// Get Clinics by Doctor ID
const getClinicByDoctor = async (doctorId) => {
    const response = await axios.get(`${API_URL}/doctor/${doctorId}`);
    return response.data;
};

const clinicService = {
    getClinics,
    getClinic,
    getAvailableSlots,
    getClinicByDoctor,
};

export default clinicService;