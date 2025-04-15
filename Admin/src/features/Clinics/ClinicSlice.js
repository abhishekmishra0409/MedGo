import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { clinicService } from "./ClinicService.js";

const initialState = {
    clinics: [],
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: "",
};

// Thunks
export const getClinics = createAsyncThunk("clinic/getAll", async (_, thunkAPI) => {
    try {
        return await clinicService.getClinics();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message || "Failed to fetch clinics");
    }
});

export const createClinic = createAsyncThunk("clinic/create", async (clinicData, thunkAPI) => {
    try {
        return await clinicService.createClinic(clinicData);
    } catch (error) {
        console.log(error)
        return thunkAPI.rejectWithValue(error.message || "Failed to create clinic");
    }
});

export const updateClinic = createAsyncThunk("clinic/update", async ({ id, clinicData }, thunkAPI) => {
    try {
        return await clinicService.updateClinic({ id, clinicData });
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message || "Failed to update clinic");
    }
});

export const addDoctorToClinic = createAsyncThunk("clinic/addDoctor", async ({ clinicId, doctorData }, thunkAPI) => {
    try {
        return await clinicService.addDoctorToClinic({ clinicId, doctorData });
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message || "Failed to add doctor to clinic");
    }
});

export const removeDoctorFromClinic = createAsyncThunk(
    "clinic/removeDoctor",
    async ({ clinicId, doctorId }, thunkAPI) => {
        try {
            return await clinicService.removeDoctorFromClinic(clinicId, doctorId);
        } catch (error) {
            return thunkAPI.rejectWithValue(error.message || "Failed to remove doctor from clinic");
        }
    }
);

// Slice
const clinicSlice = createSlice({
    name: "clinic",
    initialState,
    reducers: {
        resetClinicState: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = "";
        }
    },
    extraReducers: (builder) => {
        builder
            // Get all clinics
            .addCase(getClinics.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getClinics.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.clinics = action.payload.data;
            })
            .addCase(getClinics.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            // Create clinic
            .addCase(createClinic.fulfilled, (state, action) => {
                state.isSuccess = true;
                state.clinics.push(action.payload.data);
            })
            .addCase(createClinic.rejected, (state, action) => {
                state.isError = true;
                state.message = action.payload;
            })

            // Update clinic
            .addCase(updateClinic.fulfilled, (state, action) => {
                state.isSuccess = true;
                state.clinics = state.clinics.map(clinic =>
                    clinic._id === action.payload.data._id ? action.payload.data : clinic
                );
            })
            .addCase(updateClinic.rejected, (state, action) => {
                state.isError = true;
                state.message = action.payload;
            })

            // Add doctor to clinic
            .addCase(addDoctorToClinic.fulfilled, (state, action) => {
                state.isSuccess = true;
            })
            .addCase(addDoctorToClinic.rejected, (state, action) => {
                state.isError = true;
                state.message = action.payload;
            })

            // Remove doctor from clinic
            .addCase(removeDoctorFromClinic.fulfilled, (state) => {
                state.isSuccess = true;
            })
            .addCase(removeDoctorFromClinic.rejected, (state, action) => {
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { resetClinicState } = clinicSlice.actions;
export default clinicSlice.reducer;
