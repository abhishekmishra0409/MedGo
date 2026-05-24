import axios from "axios";
import { buildApiUrl, createAuthConfig } from "../../utils/api.js";

const getNotifications = async ({ page = 1, limit = 30, unreadOnly = false } = {}) => {
    const response = await axios.get(buildApiUrl("notifications"), {
        ...createAuthConfig("userToken"),
        params: { page, limit, unreadOnly },
    });
    return response.data;
};

const markRead = async (notificationId) => {
    const response = await axios.patch(
        buildApiUrl(`notifications/${notificationId}/read`),
        {},
        createAuthConfig("userToken")
    );
    return response.data;
};

const markAllRead = async () => {
    const response = await axios.patch(
        buildApiUrl("notifications/read-all"),
        {},
        createAuthConfig("userToken")
    );
    return response.data;
};

export const notificationService = {
    getNotifications,
    markRead,
    markAllRead,
};
