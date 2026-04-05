import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { doctorService } from "./DoctorService.js";
import { toast } from "react-toastify";
import { clearSession, getStoredSession, persistSession } from "../../utils/session.js";

// Fetch all doctors
export const fetchDoctors = createAsyncThunk(
    "doctor/fetchAll",
    async (params = {}, thunkApi) => {
        try {
            return await doctorService.getAllDoctors(params);
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
        } catch {
            return thunkApi.rejectWithValue("Logout failed");
        }
    }
);

export const getDoctorProfile = createAsyncThunk(
    "doctor/getProfile",
    async (_, thunkApi) => {
        try {
            return await doctorService.getMyProfile();
        } catch (error) {
            return thunkApi.rejectWithValue(error?.message || "Failed to load doctor profile");
        }
    }
);

export const updateDoctorProfile = createAsyncThunk(
    "doctor/updateProfile",
    async (profileData, thunkApi) => {
        try {
            return await doctorService.updateMyProfile(profileData);
        } catch (error) {
            return thunkApi.rejectWithValue(error?.message || "Failed to update doctor profile");
        }
    }
);

const storedSession = getStoredSession("doctor");

const initialState = {
    doctors: [],
    doctor: storedSession?.profile || null,
    profile: storedSession?.profile || null,
    token: storedSession?.token || "",
    role: storedSession?.role || null,
    isAuthenticated: !!storedSession?.token,
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
                state.isError = false;
                state.isSuccess = false;
                state.message = "";
            })
            .addCase(loginDoctor.fulfilled, (state, action) => {
                const session = persistSession("doctor", action.payload);
                state.isLoading = false;
                state.isError = false;
                state.isSuccess = true;
                state.doctor = session.profile;
                state.profile = session.profile;
                state.token = session.token;
                state.role = session.role;
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
                clearSession("doctor");
                state.doctor = null;
                state.profile = null;
                state.token = "";
                state.role = null;
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
            })

            // Get logged-in doctor profile
            .addCase(getDoctorProfile.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.message = "";
            })
            .addCase(getDoctorProfile.fulfilled, (state, action) => {
                const session = persistSession("doctor", {
                    token: state.token,
                    data: action.payload.data,
                });
                state.isLoading = false;
                state.isSuccess = true;
                state.profile = session.profile;
                state.doctor = session.profile;
            })
            .addCase(getDoctorProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                toast.error(state.message);
            })

            // Update logged-in doctor profile
            .addCase(updateDoctorProfile.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.message = "";
            })
            .addCase(updateDoctorProfile.fulfilled, (state, action) => {
                const session = persistSession("doctor", {
                    token: state.token,
                    data: action.payload.data,
                });
                state.isLoading = false;
                state.isSuccess = true;
                state.profile = session.profile;
                state.doctor = session.profile;
                toast.success("Profile updated successfully");
            })
            .addCase(updateDoctorProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                toast.error(state.message);
            });
    },
});

export const { setAuthenticated } = doctorSlice.actions;
export default doctorSlice.reducer;
