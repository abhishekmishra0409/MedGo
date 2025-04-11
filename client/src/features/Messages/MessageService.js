import axios from "axios";
import { base_url } from "../../utils/baseURL";
import userConfig from "../../utils/userConfig";
import doctorConfig from "../../utils/doctorConfig";

const API_URL = `${base_url}messages`;

// USER routes
const sendUserMessage = async (messageData) => {
    const response = await axios.post(`${API_URL}/user/send`, messageData, userConfig);
    return response.data;
};

const getUserConversations = async () => {
    const response = await axios.get(`${API_URL}/user/conversations`, userConfig);
    return response.data;
};

const getUserMessages = async (conversationId) => {
    const response = await axios.get(`${API_URL}/user/conversations/${conversationId}/messages`, userConfig);
    return response.data;
};

const markUserMessagesRead = async (conversationId) => {
    const response = await axios.patch(`${API_URL}/user/conversations/${conversationId}/mark-read`, {}, userConfig);
    return response.data;
};

// DOCTOR routes
const sendDoctorMessage = async (messageData) => {
    const response = await axios.post(`${API_URL}/doctor/send`, messageData, doctorConfig);
    return response.data;
};

const getDoctorConversations = async () => {
    const response = await axios.get(`${API_URL}/doctor/conversations`, doctorConfig);
    return response.data;
};

const getDoctorMessages = async (conversationId) => {
    const response = await axios.get(`${API_URL}/doctor/conversations/${conversationId}/messages`, doctorConfig);
    return response.data;
};

const markDoctorMessagesRead = async (conversationId) => {
    const response = await axios.patch(`${API_URL}/doctor/conversations/${conversationId}/mark-read`, {}, doctorConfig);
    return response.data;
};

const messageService = {
    sendUserMessage,
    getUserConversations,
    getUserMessages,
    markUserMessagesRead,
    sendDoctorMessage,
    getDoctorConversations,
    getDoctorMessages,
    markDoctorMessagesRead,
};

export default messageService;
