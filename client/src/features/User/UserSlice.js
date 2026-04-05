import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "./UserService.js";
import { toast } from "react-toastify";
import userConfig from "../../utils/userConfig.js";
import { clearSession, getStoredSession, persistSession } from "../../utils/session.js";

// Async thunk for user registration
export const registerUser = createAsyncThunk(
    "auth/register",
    async (userData, thunkApi) => {
        try {
            return await authService.register(userData);
        } catch (e) {
            return thunkApi.rejectWithValue(e || "Registration failed");
        }
    }
);

// Async thunk for user login
export const loginUser = createAsyncThunk(
    "auth/login",
    async (loginData, thunkApi) => {
        try {
            return await authService.login(loginData);
        } catch (e) {
            return thunkApi.rejectWithValue(e?.message || "Invalid credentials");
        }
    }
);

// Async thunk to update user profile
export const updateUser = createAsyncThunk(
    "auth/updateUser",
    async (userData, thunkApi) => {
        try {
            return await authService.updateUser(userData, userConfig());
        } catch (error) {
            return thunkApi.rejectWithValue(error?.message || "Failed to update profile");
        }
    }
);

// Async thunk for user logout
export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, thunkApi) => {
        try {
            await authService.logout();
            return true;
        } catch {
            return thunkApi.rejectWithValue("Logout failed");
        }
    }
);

// Async thunk to fetch user data
export const getUserData = createAsyncThunk(
    "auth/getUserData",
    async (_, thunkApi) => {
        try {
            return await authService.getUserdata(userConfig());
        } catch (error) {
            return thunkApi.rejectWithValue(error?.message || "Failed to fetch user data");
        }
    }
);

const storedSession = getStoredSession("user");

const initialState = {
    user: storedSession?.raw || null,
    profile: storedSession?.profile || null,
    token: storedSession?.token || "",
    role: storedSession?.role || null,
    isAuthenticated: !!storedSession?.token,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: "",
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuthenticated: (state, action) => {
            state.isAuthenticated = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Register user
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.isSuccess = false;
                state.message = "";
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.isLoading = false;
                state.isError = false;
                state.isSuccess = true;
                state.user = null;
                state.profile = null;
                state.token = "";
                state.role = null;
                state.isAuthenticated = false;
                toast.success("Registration successful! Please login.");
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.isSuccess = false;
                state.message = action.payload;
                toast.error(state.message);
            })

            // Login user
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.isSuccess = false;
                state.message = "";
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                const session = persistSession("user", action.payload);
                state.isLoading = false;
                state.isError = false;
                state.isSuccess = true;
                state.user = session.raw;
                state.profile = session.profile;
                state.token = session.token;
                state.role = session.role;
                state.isAuthenticated = true;
                toast.success("Login successful!");
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.isSuccess = false;
                state.message = action.payload;
                state.isAuthenticated = false;
                toast.error(state.message);
            })

            // Update user profile
            .addCase(updateUser.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.isSuccess = false;
                state.message = "";
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                const session = persistSession("user", {
                    token: state.token,
                    data: action.payload.data,
                });
                state.isLoading = false;
                state.isError = false;
                state.isSuccess = true;
                state.user = session.raw;
                state.profile = session.profile;
                state.role = session.role;
                toast.success("User profile updated successfully!");
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                toast.error(state.message);
            })

            // Logout user
            .addCase(logoutUser.fulfilled, (state) => {
                clearSession("user");
                state.user = null;
                state.profile = null;
                state.token = "";
                state.role = null;
                state.isAuthenticated = false;
                state.isSuccess = false;
                state.isError = false;
                state.isLoading = false;
                toast.success("Logged out successfully.");
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.isError = true;
                state.message = action.payload;
                toast.error(state.message);
            })

            // Fetch user data
            .addCase(getUserData.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getUserData.fulfilled, (state, action) => {
                const session = persistSession("user", {
                    token: state.token,
                    data: action.payload.data,
                });
                state.isLoading = false;
                state.isError = false;
                state.isSuccess = true;
                state.user = session.raw;
                state.profile = session.profile;
                state.role = session.role;
            })
            .addCase(getUserData.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { setAuthenticated } = authSlice.actions;
export default authSlice.reducer;
