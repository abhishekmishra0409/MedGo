import axios from "axios";
import { buildApiUrl, createAuthConfig } from "../../utils/api.js";

const buildConfig = (tokenKey, params) => ({
    ...createAuthConfig(tokenKey),
    params,
});

const getNotifications = async ({ tokenKey, page = 1, limit = 30, unreadOnly = false }) => {
    const response = await axios.get(
        buildApiUrl("notifications"),
        buildConfig(tokenKey, { page, limit, unreadOnly })
    );
    return response.data;
};

const markRead = async ({ tokenKey, notificationId }) => {
    const response = await axios.patch(
        buildApiUrl(`notifications/${notificationId}/read`),
        {},
        createAuthConfig(tokenKey)
    );
    return response.data;
};

const markAllRead = async ({ tokenKey }) => {
    const response = await axios.patch(
        buildApiUrl("notifications/read-all"),
        {},
        createAuthConfig(tokenKey)
    );
    return response.data;
};

const notificationService = {
    getNotifications,
    markRead,
    markAllRead,
};

export default notificationService;
