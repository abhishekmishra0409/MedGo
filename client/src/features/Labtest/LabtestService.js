import axios from "axios";
import { buildApiUrl } from "../../utils/baseURL.js";
import userConfig from "../../utils/userConfig.js";
import doctorConfig from "../../utils/doctorConfig.js";

const TEST_URL = buildApiUrl("tests");
const API_URL = buildApiUrl("lab-tests");

const getAllTests = async (params = {}) => {
    const response = await axios.get(TEST_URL, { params });
    return response.data;
};

const bookTest = async (testData) => {
    const response = await axios.post(`${API_URL}/book`, testData, userConfig());
    return response.data;
};

const getMyBookings = async () => {
    const response = await axios.get(`${API_URL}/my-bookings`, userConfig());
    return response.data;
};

const updateBookingStatus = async ({ bookingId, status }) => {
    const response = await axios.patch(`${API_URL}/${bookingId}/status`, { status }, doctorConfig());
    return response.data;
};

const getClinicBookings = async (clinicId) => {
    const response = await axios.get(`${API_URL}/clinic/${clinicId}`, doctorConfig());
    return response.data;
};

const uploadLabTestReport = async (bookingId, file) => {
    const formData = new FormData();
    formData.append("report", file);

    const doctorHeaders = doctorConfig();

    const response = await axios.post(`${API_URL}/${bookingId}/report`, formData, {
        ...doctorHeaders,
        headers: {
            ...doctorHeaders.headers,
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};

const labTestService = {
    getAllTests,
    bookTest,
    getMyBookings,
    updateBookingStatus,
    getClinicBookings,
    uploadLabTestReport,
};

export default labTestService;
