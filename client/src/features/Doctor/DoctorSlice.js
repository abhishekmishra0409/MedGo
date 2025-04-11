import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { doctorService } from "./DoctorService.js";
import { toast } from "react-toastify";

// Fetch all doctors
export const fetchDoctors = createAsyncThunk(
    "doctor/fetchAll",
    async (_, thunkApi) => {
        try {
            return await doctorService.getAllDoctors();
        } catch (error) {
            return thunkApi.rejectWithValue(error?.message || "Failed to fetch doctors");
        }
    }
);

// Fetch a doctor by ID
export const fetchDoctorById = createAsyncThunk(
    "doctor/fetchById",
    async (doctorId, thunkApi) => {
        try {
            return await doctorService.getDoctorById(doctorId);
        } catch (error) {
            return thunkApi.rejectWithValue(error?.message || "Doctor not found");
        }
    }
);

// Doctor login
export const loginDoctor = createAsyncThunk(
    "doctor/login",
    async (loginData, thunkApi) => {
        try {
            return await doctorService.loginDoctor(loginData);
        } catch (error) {
            return thunkApi.rejectWithValue(error?.message || "Invalid login credentials");
        }
    }
);

// Doctor logout
export const logoutDoctor = createAsyncThunk(
    "doctor/logout",
    async (_, thunkApi) => {
        try {
            await doctorService.logoutDoctor();
            return true;
        } catch (error) {
            return thunkApi.rejectWithValue("Logout failed");
        }
    }
);

const initialState = {
    doctors: [],
    doctor: JSON.parse(localStorage.getItem("doctor")) || null,
    isAuthenticated: !!localStorage.getItem("doctorToken"),
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: "",
};

export const doctorSlice = createSlice({
    name: "doctor",
    initialState,
    reducers: {
        setAuthenticated: (state, action) => {
            state.isAuthenticated = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all doctors
            .addCase(fetchDoctors.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchDoctors.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.doctors = action.payload.data;
            })
            .addCase(fetchDoctors.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                toast.error(state.message);
            })

            // Fetch doctor by ID
            .addCase(fetchDoctorById.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchDoctorById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.doctor = action.payload.data;
            })
            .addCase(fetchDoctorById.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                toast.error(state.message);
            })

            // Doctor login
            .addCase(loginDoctor.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(loginDoctor.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.isSuccess = true;
                state.doctor = action.payload;
                state.isAuthenticated = true;
                toast.success("Login successful!");
            })
            .addCase(loginDoctor.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.isSuccess = false;
                state.message = action.payload;
                state.isAuthenticated = false;
                toast.error(state.message);
            })

            // Doctor logout
            .addCase(logoutDoctor.fulfilled, (state) => {
                state.doctor = null;
                state.isAuthenticated = false;
                state.isSuccess = false;
                state.isError = false;
                state.isLoading = false;
                toast.success("Logged out successfully.");
            })
            .addCase(logoutDoctor.rejected, (state, action) => {
                state.isError = true;
                state.message = action.payload;
                toast.error(state.message);
            });
    },
});

export const { setAuthenticated } = doctorSlice.actions;
export default doctorSlice.reducer;
