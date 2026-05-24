import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { notificationService } from "./NotificationService.js";
import { getErrorMessage } from "../../utils/api.js";

export const fetchNotifications = createAsyncThunk("notifications/fetch", async (options = {}, thunkAPI) => {
    try {
        return await notificationService.getNotifications(options);
    } catch (error) {
        return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to load notifications"));
    }
});

export const markNotificationRead = createAsyncThunk("notifications/markRead", async (notificationId, thunkAPI) => {
    try {
        return await notificationService.markRead(notificationId);
    } catch (error) {
        return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to update notification"));
    }
});

export const markAllNotificationsRead = createAsyncThunk("notifications/markAllRead", async (_, thunkAPI) => {
    try {
        return await notificationService.markAllRead();
    } catch (error) {
        return thunkAPI.rejectWithValue(getErrorMessage(error, "Failed to update notifications"));
    }
});

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
                if (!updated?._id) return;

                state.items = state.items.map((item) => (item._id === updated._id ? updated : item));
                state.unreadCount = state.items.filter((item) => !item.readAt).length;
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
