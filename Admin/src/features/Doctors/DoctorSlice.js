import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { doctorService } from "./doctorService";

const initialState = {
    doctors: [],
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: ""
};

// Get all doctors
export const getAllDoctors = createAsyncThunk("doctor/getAll", async (_, thunkAPI) => {
    try {
        return await doctorService.getAllDoctors();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message || "Failed to fetch doctors");
    }
});

// Create doctor
export const createDoctor = createAsyncThunk("doctor/create", async (doctorData, thunkAPI) => {
    try {
        return await doctorService.createDoctor(doctorData);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message || "Failed to create doctor");
    }
});

// Update doctor
export const updateDoctor = createAsyncThunk("doctor/update", async ({ id, updatedData }, thunkAPI) => {
    try {
        return await doctorService.updateDoctor({ id, updatedData });
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message || "Failed to update doctor");
    }
});

// Delete doctor
export const deleteDoctor = createAsyncThunk("doctor/delete", async (id, thunkAPI) => {
    try {
        return await doctorService.deleteDoctor(id);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message || "Failed to delete doctor");
    }
});

const doctorSlice = createSlice({
    name: "doctor",
    initialState,
    reducers: {
        resetDoctorState: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = "";
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllDoctors.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllDoctors.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.doctors = action.payload.data;
            })
            .addCase(getAllDoctors.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            .addCase(createDoctor.fulfilled, (state, action) => {
                state.isSuccess = true;
                state.doctors.push(action.payload.data);
            })
            .addCase(createDoctor.rejected, (state, action) => {
                state.isError = true;
                state.message = action.payload;
            })

            .addCase(updateDoctor.fulfilled, (state, action) => {
                state.isSuccess = true;
                state.doctors = state.doctors.map(doc => doc._id === action.payload.data._id ? action.payload.data : doc);
            })
            .addCase(updateDoctor.rejected, (state, action) => {
                state.isError = true;
                state.message = action.payload;
            })

            .addCase(deleteDoctor.fulfilled, (state, action) => {
                state.isSuccess = true;
                state.doctors = state.doctors.filter(doc => doc._id !== action.meta.arg);
            })
            .addCase(deleteDoctor.rejected, (state, action) => {
                state.isError = true;
                state.message = action.payload;
            });
    }
});

export const { resetDoctorState } = doctorSlice.actions;
export default doctorSlice.reducer;
