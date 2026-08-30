import axios from "axios";
import { buildApiUrl } from "../../utils/baseURL.js";
import doctorConfig from "../../utils/doctorConfig.js";
import userConfig from "../../utils/userConfig.js";

const API_URL = buildApiUrl("appointments");

const bookAppointment = async (appointmentData) => {
    const response = await axios.post(API_URL, appointmentData, userConfig());
    return response.data;
};

const getMyAppointments = async () => {
    const response = await axios.get(`${API_URL}/my-appointments`, userConfig());
    return response.data;
};

const getDoctorAppointments = async () => {
    const response = await axios.get(`${API_URL}/doctor-appointments`, doctorConfig());
    return response.data;
};

const updateAppointmentStatus = async ({ appointmentId, status, notes, paymentStatus }) => {
    const response = await axios.patch(
        `${API_URL}/${appointmentId}/status`,
        { status, notes, paymentStatus },
        doctorConfig()
    );
    return response.data;
};

// Either party can cancel, so the caller says which token to use.
const cancelAppointment = async ({ appointmentId, notes, as = "doctor" }) => {
    const config = as === "user" ? userConfig() : doctorConfig();
    const response = await axios.patch(`${API_URL}/${appointmentId}/cancel`, { notes }, config);
    return response.data;
};

const completeAppointment = async ({ appointmentId, notes, paymentStatus }) => {
    const response = await axios.patch(
        `${API_URL}/${appointmentId}/complete`,
        { notes, paymentStatus },
        doctorConfig()
    );
    return response.data;
};

// One request per date change instead of one per slot.
const getBookedSlots = async ({ doctor, date }) => {
    const response = await axios.get(`${API_URL}/booked`, {
        ...userConfig(),
        params: { doctor, date },
    });
    return response.data;
};

const checkAvailability = async (availabilityData) => {
    const response = await axios.post(`${API_URL}/check-availability`, availabilityData, userConfig());
    return response.data;
};

const appointmentService = {
    getBookedSlots,
    bookAppointment,
    getMyAppointments,
    getDoctorAppointments,
    updateAppointmentStatus,
    cancelAppointment,
    completeAppointment,
    checkAvailability,
};

export default appointmentService;
