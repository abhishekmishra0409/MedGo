import axios from "axios";
import { buildApiUrl, getErrorMessage } from "../../utils/api.js";
import workspaceConfig from "../../utils/workspaceConfig.js";

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

const getMyClinic = async () => {
    try {
        const response = await axios.get(`${API_URL}/me/workspace`, workspaceConfig());
        return response.data;
    } catch (error) {
        throw getErrorMessage(error, "Failed to fetch your clinic");
    }
};

const updateMyClinic = async (clinicData) => {
    try {
        const response = await axios.put(`${API_URL}/me/workspace`, clinicData, workspaceConfig());
        return response.data;
    } catch (error) {
        throw getErrorMessage(error, "Failed to update clinic");
    }
};

const joinClinic = async (accessCode) => {
    try {
        const response = await axios.post(`${API_URL}/join`, { accessCode }, workspaceConfig());
        return response.data;
    } catch (error) {
        throw getErrorMessage(error, "Failed to join clinic");
    }
};

const getMyRoster = async () => {
    try {
        const response = await axios.get(`${API_URL}/me/roster`, workspaceConfig());
        return response.data;
    } catch (error) {
        throw getErrorMessage(error, "Failed to fetch doctor roster");
    }
};

const updateRosterMembership = async ({ doctorId, status, notes }) => {
    try {
        const response = await axios.patch(`${API_URL}/me/roster/${doctorId}`, { status, notes }, workspaceConfig());
        return response.data;
    } catch (error) {
        throw getErrorMessage(error, "Failed to update roster membership");
    }
};

const clinicService = {
    getClinics,
    getClinic,
    getAvailableSlots,
    getClinicByDoctor,
    getMyClinic,
    updateMyClinic,
    joinClinic,
    getMyRoster,
    updateRosterMembership,
};

export default clinicService;
