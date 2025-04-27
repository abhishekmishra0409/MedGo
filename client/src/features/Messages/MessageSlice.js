import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import messageService from "./MessageService.js";
import { toast } from "react-toastify";

const initialState = {
    conversations: [],
    messages: [],
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: "",
};

// USER THUNKS
export const sendUserMessage = createAsyncThunk("messages/sendUserMessage", async (messageData, thunkAPI) => {
    try {
        return await messageService.sendUserMessage(messageData);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to send user message");
    }
});

export const getUserConversations = createAsyncThunk("messages/getUserConversations", async (_, thunkAPI) => {
    try {
        return await messageService.getUserConversations();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch user conversations");
    }
});

export const getUserMessages = createAsyncThunk("messages/getUserMessages", async (conversationId, thunkAPI) => {
    try {
        return await messageService.getUserMessages(conversationId);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch user messages");
    }
});

export const markUserMessagesRead = createAsyncThunk("messages/markUserMessagesRead", async (conversationId, thunkAPI) => {
    try {
        return await messageService.markUserMessagesRead(conversationId);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to mark messages as read");
    }
});

// DOCTOR THUNKS
export const sendDoctorMessage = createAsyncThunk("messages/sendDoctorMessage", async (messageData, thunkAPI) => {
    try {
        return await messageService.sendDoctorMessage(messageData);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to send doctor message");
    }
});

export const getDoctorConversations = createAsyncThunk("messages/getDoctorConversations", async (_, thunkAPI) => {
    try {
        return await messageService.getDoctorConversations();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch doctor conversations");
    }
});

export const getDoctorMessages = createAsyncThunk("messages/getDoctorMessages", async (conversationId, thunkAPI) => {
    try {
        return await messageService.getDoctorMessages(conversationId);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch doctor messages");
    }
});

export const markDoctorMessagesRead = createAsyncThunk("messages/markDoctorMessagesRead", async (conversationId, thunkAPI) => {
    try {
        return await messageService.markDoctorMessagesRead(conversationId);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to mark messages as read");
    }
});

// SLICE
const messageSlice = createSlice({
    name: "messages",
    initialState,
    reducers: {
        resetMessageState: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = "";
            state.messages = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Send user message
            .addCase(sendUserMessage.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(sendUserMessage.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                toast.success("Message sent successfully");
                state.messages.push(action.payload.data);
            })
            .addCase(sendUserMessage.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                toast.error(action.payload);
            })

            // Send doctor message
            .addCase(sendDoctorMessage.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(sendDoctorMessage.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                toast.success("Message sent successfully");
                state.messages.push(action.payload.data);
            })
            .addCase(sendDoctorMessage.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                toast.error(action.payload);
            })

            // Get user conversations
            .addCase(getUserConversations.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getUserConversations.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.conversations = action.payload.data;
            })
            .addCase(getUserConversations.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                toast.error(action.payload);
            })

            // Get doctor conversations
            .addCase(getDoctorConversations.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getDoctorConversations.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.conversations = action.payload.data;
            })
            .addCase(getDoctorConversations.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                toast.error(action.payload);
            })

            // Get user messages
            .addCase(getUserMessages.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getUserMessages.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.messages = action.payload.data;
            })
            .addCase(getUserMessages.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                toast.error(action.payload);
            })

            // Get doctor messages
            .addCase(getDoctorMessages.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getDoctorMessages.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.messages = action.payload.data;
            })
            .addCase(getDoctorMessages.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                toast.error(action.payload);
            })

            // Mark user messages as read
            .addCase(markUserMessagesRead.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(markUserMessagesRead.fulfilled, (state) => {
                state.isLoading = false;
                state.isSuccess = true;
            })
            .addCase(markUserMessagesRead.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                toast.error(action.payload);
            })

            // Mark doctor messages as read
            .addCase(markDoctorMessagesRead.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(markDoctorMessagesRead.fulfilled, (state) => {
                state.isLoading = false;
                state.isSuccess = true;
            })
            .addCase(markDoctorMessagesRead.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                toast.error(action.payload);
            });
    },
});

export const { resetMessageState } = messageSlice.actions;
export default messageSlice.reducer;
