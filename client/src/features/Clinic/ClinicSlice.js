import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import clinicService from "./ClinicService.js";
import { toast } from "react-toastify";

// Initial State
const initialState = {
    clinics: [],
    selectedClinic: null,
    availableSlots: [],
    doctorClinics: [],
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: "",
};

// Fetch All Clinics
export const fetchClinics = createAsyncThunk("clinic/fetchClinics", async (_, thunkAPI) => {
    try {
        return await clinicService.getClinics();
    } catch (error) {
        return thunkAPI.rejectWithValue(error || "Failed to fetch clinics");
    }
});

// Fetch Single Clinic
export const fetchClinic = createAsyncThunk("clinic/fetchClinic", async (clinicId, thunkAPI) => {
    try {
        return await clinicService.getClinic(clinicId);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch clinic details");
    }
});

// Fetch Available Slots for a Clinic on Specific Date
export const fetchAvailableSlots = createAsyncThunk(
    "clinic/fetchAvailableSlots",
    async ({ clinicId, date }, thunkAPI) => {
        try {
            return await clinicService.getAvailableSlots({ clinicId, date });
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Failed to fetch available slots"
            );
        }
    }
);

// Fetch Clinics by Doctor ID
export const fetchClinicsByDoctor = createAsyncThunk(
    "clinic/fetchClinicsByDoctor",
    async (doctorId, thunkAPI) => {
        try {
            return await clinicService.getClinicByDoctor(doctorId);
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Failed to fetch clinics for doctor"
            );
        }
    }
);

// Clinic Slice
const clinicSlice = createSlice({
    name: "clinic",
    initialState,
    reducers: {
        resetClinicState: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = "";
        },
        clearAvailableSlots: (state) => {
            state.availableSlots = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Clinics
            .addCase(fetchClinics.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchClinics.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.clinics = action.payload.data;
            })
            .addCase(fetchClinics.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                toast.error(state.message);
            })

            // Fetch Single Clinic
            .addCase(fetchClinic.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchClinic.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.selectedClinic = action.payload.data;
            })
            .addCase(fetchClinic.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                toast.error(state.message);
            })

            // Fetch Available Slots for Clinic
            .addCase(fetchAvailableSlots.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.availableSlots = action.payload.data || [];
            })
            .addCase(fetchAvailableSlots.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.availableSlots = [];
                toast.error(state.message);
            })

            // Fetch Clinics by Doctor ID
            .addCase(fetchClinicsByDoctor.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchClinicsByDoctor.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.doctorClinics = action.payload.data;
            })
            .addCase(fetchClinicsByDoctor.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                toast.error(state.message);
            });
    },
});

export const { resetClinicState, clearAvailableSlots } = clinicSlice.actions;
export default clinicSlice.reducer;