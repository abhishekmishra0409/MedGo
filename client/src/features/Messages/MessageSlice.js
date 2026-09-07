import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import messageService from "./MessageService.js";
import { toast } from "react-toastify";

const initialState = {
    conversations: [],
    messages: [],
    messagePagination: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: "",
    activeConversationId: null,
    typingByConversation: {},
};

const showMessageError = (message) => {
    const text = message || "Something went wrong. Please try again.";
    toast.error(text, { toastId: `message-error-${text}` });
};

// Swaps the optimistic "sending..." bubble for the server-confirmed message
// (matched by the tempId the composer generated); falls back to a plain
// push when there was no pending bubble (e.g. the "new conversation" flow).
const resolveOrPushMessage = (state, action) => {
    const tempId = action.meta.arg?.tempId;
    const realMessage = action.payload.data;
    const index = tempId ? state.messages.findIndex((m) => m._id === tempId) : -1;

    if (index !== -1) {
        state.messages[index] = realMessage;
    } else {
        state.messages.push(realMessage);
    }
};

// USER THUNKS
export const sendUserMessage = createAsyncThunk("messages/sendUserMessage", async (messageData, thunkAPI) => {
    try {
        return await messageService.sendUserMessage(messageData);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || error.response?.data?.message || "Failed to send user message");
    }
});

export const getUserConversations = createAsyncThunk("messages/getUserConversations", async (_, thunkAPI) => {
    try {
        return await messageService.getUserConversations();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || error.response?.data?.message || "Failed to fetch user conversations");
    }
});

export const getUserMessages = createAsyncThunk("messages/getUserMessages", async (args, thunkAPI) => {
    try {
        const params = typeof args === "string" ? { conversationId: args } : args;
        return await messageService.getUserMessages(params);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || error.response?.data?.message || "Failed to fetch user messages");
    }
});

export const markUserMessagesRead = createAsyncThunk("messages/markUserMessagesRead", async (conversationId, thunkAPI) => {
    try {
        return await messageService.markUserMessagesRead(conversationId);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || error.response?.data?.message || "Failed to mark messages as read");
    }
});

// DOCTOR THUNKS
export const sendDoctorMessage = createAsyncThunk("messages/sendDoctorMessage", async (messageData, thunkAPI) => {
    try {
        return await messageService.sendDoctorMessage(messageData);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || error.response?.data?.message || "Failed to send doctor message");
    }
});

export const getDoctorConversations = createAsyncThunk("messages/getDoctorConversations", async (_, thunkAPI) => {
    try {
        return await messageService.getDoctorConversations();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || error.response?.data?.message || "Failed to fetch doctor conversations");
    }
});

export const getDoctorMessages = createAsyncThunk("messages/getDoctorMessages", async (args, thunkAPI) => {
    try {
        const params = typeof args === "string" ? { conversationId: args } : args;
        return await messageService.getDoctorMessages(params);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || error.response?.data?.message || "Failed to fetch doctor messages");
    }
});

export const markDoctorMessagesRead = createAsyncThunk("messages/markDoctorMessagesRead", async (conversationId, thunkAPI) => {
    try {
        return await messageService.markDoctorMessagesRead(conversationId);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || error.response?.data?.message || "Failed to mark messages as read");
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
        clearMessages: (state) => {
            state.messages = [];
            state.message = "";
        },
        setActiveConversationId: (state, action) => {
            state.activeConversationId = action.payload;
        },
        addPendingMessage: (state, action) => {
            const { tempId, conversation, content, senderRole } = action.payload;
            state.messages.push({
                _id: tempId,
                conversation,
                content,
                senderRole,
                isRead: false,
                pending: true,
                createdAt: null,
            });
        },
        failPendingMessage: (state, action) => {
            const tempId = action.payload;
            state.messages = state.messages.filter((m) => m._id !== tempId);
        },
        wsMessageReceived: (state, action) => {
            const message = action.payload;
            if (message?.conversation === state.activeConversationId) {
                const alreadyPresent = state.messages.some((m) => m._id === message._id);
                if (!alreadyPresent) {
                    state.messages.push(message);
                }
            }
        },
        wsConversationsUpdated: (state, action) => {
            state.conversations = Array.isArray(action.payload) ? action.payload : state.conversations;
        },
        wsMessagesRead: (state, action) => {
            const { conversationId } = action.payload || {};
            state.messages = state.messages.map((m) => (
                m.conversation === conversationId ? { ...m, isRead: true } : m
            ));
        },
        wsTypingIndicator: (state, action) => {
            const { conversationId, isTyping } = action.payload || {};
            if (!conversationId) return;
            state.typingByConversation = {
                ...state.typingByConversation,
                [conversationId]: isTyping,
            };
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
                toast.success("Message sent successfully", { toastId: "message-send-success" });
                resolveOrPushMessage(state, action);
            })
            .addCase(sendUserMessage.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                showMessageError(action.payload);
            })

            // Send doctor message
            .addCase(sendDoctorMessage.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(sendDoctorMessage.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                toast.success("Message sent successfully", { toastId: "message-send-success" });
                resolveOrPushMessage(state, action);
            })
            .addCase(sendDoctorMessage.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                showMessageError(action.payload);
            })

            // Get user conversations
            .addCase(getUserConversations.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getUserConversations.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.conversations = Array.isArray(action.payload?.data) ? action.payload.data : [];
            })
            .addCase(getUserConversations.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                showMessageError(action.payload);
            })

            // Get doctor conversations
            .addCase(getDoctorConversations.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getDoctorConversations.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.conversations = Array.isArray(action.payload?.data) ? action.payload.data : [];
            })
            .addCase(getDoctorConversations.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                showMessageError(action.payload);
            })

            // Get user messages
            .addCase(getUserMessages.pending, (state) => {
                state.isLoading = true;
                state.messages = [];
            })
            .addCase(getUserMessages.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                const batch = Array.isArray(action.payload?.data) ? action.payload.data : [];
                // Page 1 is the newest slice; later pages are older history and
                // belong in front of what is already on screen.
                state.messages = action.meta.arg?.page > 1 ? [...batch, ...state.messages] : batch;
                state.messagePagination = action.payload?.pagination || null;
            })
            .addCase(getUserMessages.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                showMessageError(action.payload);
            })

            // Get doctor messages
            .addCase(getDoctorMessages.pending, (state) => {
                state.isLoading = true;
                state.messages = [];
            })
            .addCase(getDoctorMessages.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                const batch = Array.isArray(action.payload?.data) ? action.payload.data : [];
                // Page 1 is the newest slice; later pages are older history and
                // belong in front of what is already on screen.
                state.messages = action.meta.arg?.page > 1 ? [...batch, ...state.messages] : batch;
                state.messagePagination = action.payload?.pagination || null;
            })
            .addCase(getDoctorMessages.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                showMessageError(action.payload);
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
                showMessageError(action.payload);
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
                showMessageError(action.payload);
            });
    },
});

export const {
    resetMessageState,
    clearMessages,
    setActiveConversationId,
    addPendingMessage,
    failPendingMessage,
    wsMessageReceived,
    wsConversationsUpdated,
    wsMessagesRead,
    wsTypingIndicator,
} = messageSlice.actions;
export default messageSlice.reducer;
