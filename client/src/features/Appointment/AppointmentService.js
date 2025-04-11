import axios from "axios";
import { base_url } from "../../utils/baseURL.js";
import doctorConfig from "../../utils/doctorConfig.js";
import config from "../../utils/userConfig.js";

const API_URL = `${base_url}appointments`;

// Book an Appointment
const bookAppointment = async (appointmentData) => {
    const response = await axios.post(API_URL, appointmentData, config);
    return response.data;
};

// Get User's Appointments (Patients)
const getMyAppointments = async () => {
    const response = await axios.get(`${API_URL}/my-appointments`, config);
    return response.data;
};

// Get Doctor's Appointments
const getDoctorAppointments = async () => {
    const response = await axios.get(`${API_URL}/doctor-appointments`, doctorConfig);
    return response.data;
};

// Update Appointment Status (With Notes & Payment Status)
const updateAppointmentStatus = async ({ appointmentId, status, notes, paymentStatus }) => {
    const response = await axios.patch(
        `${API_URL}/${appointmentId}/status`,
        { status, notes, paymentStatus }, // Include paymentStatus
        doctorConfig
    );
    return response.data;
};

// Cancel Appointment
const cancelAppointment = async ({ appointmentId, notes }) => {
    const response = await axios.patch(
        `${API_URL}/${appointmentId}/cancel`,
        { notes }, // Include notes
        doctorConfig
    );
    return response.data;
};

// Complete Appointment (With Notes & Payment Status)
const completeAppointment = async ({ appointmentId, notes, paymentStatus }) => {
    const response = await axios.patch(
        `${API_URL}/${appointmentId}/complete`,
        { notes, paymentStatus }, // Include paymentStatus
        doctorConfig
    );
    return response.data;
};

// Check Availability
const checkAvailability = async (availabilityData) => {
    const response = await axios.post(`${API_URL}/check-availability`, availabilityData, config);
    return response.data;
};

const appointmentService = {
    bookAppointment,
    getMyAppointments,
    getDoctorAppointments,
    updateAppointmentStatus,
    cancelAppointment,
    completeAppointment,
    checkAvailability,
};

export default appointmentService;
