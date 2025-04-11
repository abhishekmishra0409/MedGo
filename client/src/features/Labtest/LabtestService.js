import axios from "axios";
import { base_url } from "../../utils/baseURL.js";
import config from "../../utils/userConfig.js";
import doctorConfig from "../../utils/doctorConfig.js";

const TEST_URL = `${base_url}tests`;
const API_URL = `${base_url}lab-tests`;

// Get All Tests
const getAllTests = async () => {
    const response = await axios.get(TEST_URL);
    return response.data;
};

// Book a Lab Test
const bookTest = async (testData) => {
    const response = await axios.post(`${API_URL}/book`, testData, config);
    return response.data;
};

// Get User's Booked Tests
const getMyBookings = async () => {
    const response = await axios.get(`${API_URL}/my-bookings`, config);
    return response.data;
};

// Update Lab Test Booking Status (For Clinic Staff)
const updateBookingStatus = async ({ bookingId, status }) => {
    const response = await axios.patch(`${API_URL}/${bookingId}/status`, { status }, doctorConfig);
    return response.data;
};

// Get All Lab Test Bookings for a Clinic (For Clinic Staff)
const getClinicBookings = async (clinicId) => {
    const response = await axios.get(`${API_URL}/clinic/${clinicId}`, doctorConfig);
    return response.data;
};

// upload Report
const uploadLabTestReport = async (bookingId, file) => {
    const formData = new FormData();
    formData.append('report', file); // Must match the field name expected by backend

    const response = await axios.post(
        `${API_URL}/${bookingId}/report`,
        formData,
        {
            ...doctorConfig,
            headers: {
                ...doctorConfig.headers,
                'Content-Type': 'multipart/form-data'
            }
        }
    );
    return response.data;
};

const labTestService = {
    getAllTests,
    bookTest,
    getMyBookings,
    updateBookingStatus,
    getClinicBookings,
    uploadLabTestReport
};

export default labTestService;
