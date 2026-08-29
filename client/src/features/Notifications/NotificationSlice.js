import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import notificationService from "./NotificationService.js";

const resolveTokenKey = (state, fallback = "userToken") => {
    if (state?.doctor?.isAuthenticated) {
        return "doctorToken";
    }

    if (state?.auth?.isAuthenticated) {
        return "userToken";
    }

    return fallback;
};

export const fetchNotifications = createAsyncThunk(
    "notifications/fetch",
    async (options = {}, thunkApi) => {
        try {
            const tokenKey = options.tokenKey || resolveTokenKey(thunkApi.getState());
            return await notificationService.getNotifications({ ...options, tokenKey });
        } catch (error) {
            return thunkApi.rejectWithValue(error?.response?.data?.error || "Failed to load notifications");
        }
    }
);

export const markNotificationRead = createAsyncThunk(
    "notifications/markRead",
    async ({ notificationId, tokenKey }, thunkApi) => {
        try {
            const resolvedTokenKey = tokenKey || resolveTokenKey(thunkApi.getState());
            return await notificationService.markRead({ notificationId, tokenKey: resolvedTokenKey });
        } catch (error) {
            return thunkApi.rejectWithValue(error?.response?.data?.error || "Failed to update notification");
        }
    }
);

export const markAllNotificationsRead = createAsyncThunk(
    "notifications/markAllRead",
    async ({ tokenKey } = {}, thunkApi) => {
        try {
            const resolvedTokenKey = tokenKey || resolveTokenKey(thunkApi.getState());
            return await notificationService.markAllRead({ tokenKey: resolvedTokenKey });
        } catch (error) {
            return thunkApi.rejectWithValue(error?.response?.data?.error || "Failed to update notifications");
        }
    }
);

const initialState = {
    items: [],
    unreadCount: 0,
    pagination: null,
    isLoading: false,
    isError: false,
    message: "",
};

const notificationSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        resetNotifications: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.message = "";
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.items = Array.isArray(action.payload?.data) ? action.payload.data : [];
                state.unreadCount = Number(action.payload?.unreadCount || 0);
                state.pagination = action.payload?.pagination || null;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(markNotificationRead.fulfilled, (state, action) => {
                const updated = action.payload?.data;
                if (!updated?._id) {
                    return;
                }

                const wasUnread = state.items.some((item) => item._id === updated._id && !item.readAt);
                state.items = state.items.map((item) => (item._id === updated._id ? updated : item));
                if (wasUnread) {
                    // ponytail: decrement, don't recount — items holds one page, unreadCount is server-wide
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            .addCase(markAllNotificationsRead.fulfilled, (state) => {
                const readAt = new Date().toISOString();
                state.items = state.items.map((item) => ({ ...item, readAt: item.readAt || readAt }));
                state.unreadCount = 0;
            });
    },
});

export const { resetNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
