import axios from "axios";
import { buildApiUrl, getErrorMessage } from "../../utils/api.js";

const API_URL = buildApiUrl("clinics");

const getClinics = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        throw getErrorMessage(error, "Failed to fetch clinics");
    }
};

const getClinic = async (clinicId) => {
    const response = await axios.get(`${API_URL}/${clinicId}`);
    return response.data;
};

const getAvailableSlots = async ({ clinicId, date }) => {
    const response = await axios.get(`${API_URL}/${clinicId}/slots?date=${date}`);
    return response.data;
};

const getClinicByDoctor = async (doctorId) => {
    const response = await axios.get(`${API_URL}/all-by-doctor/${doctorId}`);
    return response.data;
};

const clinicService = {
    getClinics,
    getClinic,
    getAvailableSlots,
    getClinicByDoctor,
};

export default clinicService;
