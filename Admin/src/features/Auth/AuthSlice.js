import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "./AuthService.js";

// Login
export const loginUser = createAsyncThunk("user/login", async (userData, thunkAPI) => {
    try {
        return await authService.login(userData);
    } catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

// Get All Users
export const fetchAllUsers = createAsyncThunk("user/fetchAll", async (_, thunkAPI) => {
    try {
        return await authService.getAllUsers();
    } catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

// Get User by ID
export const fetchUserById = createAsyncThunk("user/fetchById", async (id, thunkAPI) => {
    try {
        return await authService.getUser(id);
    } catch (error) {
        return thunkAPI.rejectWithValue(error);
    }
});

// Delete User Account
export const deleteUserAccount = createAsyncThunk("user/deleteAccount", async (_, thunkAPI) => {
    try {
        return await authService.deleteAccount();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
});

// Logout
export const logoutUser = () => (dispatch) => {
    authService.logout();
    dispatch(resetUser());
};

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: JSON.parse(localStorage.getItem("user")) || null,
        users: [],
        selectedUser: null,
        isLoading: false,
        isError: false,
        isSuccess: false,
        message: "",
    },
    reducers: {
        resetUser: (state) => {
            state.user = null;
            state.selectedUser = null;
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = "";
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Fetch All Users
            .addCase(fetchAllUsers.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAllUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload.data;
            })
            .addCase(fetchAllUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Fetch User By ID
            .addCase(fetchUserById.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedUser = action.payload;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Delete User Account
            .addCase(deleteUserAccount.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteUserAccount.fulfilled, (state) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = null;
                localStorage.removeItem("user");
                localStorage.removeItem("userToken");
            })
            .addCase(deleteUserAccount.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { resetUser } = authSlice.actions;
export default authSlice.reducer;
