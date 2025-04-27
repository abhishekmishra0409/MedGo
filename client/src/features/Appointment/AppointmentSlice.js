import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import appointmentService from "./AppointmentService.js";
import { toast } from "react-toastify";

// Initial state
const initialState = {
    appointments: [],
    myAppointments: [],
    doctorAppointments: [],
    isLoading: false,
    isError: false,
    isSuccess: false,
    isAvailable: false,
    message: "",
};

// Book an Appointment
export const bookAppointment = createAsyncThunk("appointment/book", async (appointmentData, thunkAPI) => {
    try {
        return await appointmentService.bookAppointment(appointmentData);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to book appointment");
    }
});

// Get User's Appointments (Patients)
export const getMyAppointments = createAsyncThunk("appointment/getMyAppointments", async (_, thunkAPI) => {
    try {
        return await appointmentService.getMyAppointments();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to fetch your appointments");
    }
});

// Get Doctor's Appointments
export const getDoctorAppointments = createAsyncThunk("appointment/getDoctorAppointments", async (_, thunkAPI) => {
    try {
        return await appointmentService.getDoctorAppointments();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to fetch doctor appointments");
    }
});

// Update Appointment Status (With Notes & Payment Status)
export const updateAppointmentStatus = createAsyncThunk("appointment/updateStatus", async ({ appointmentId, status, notes, paymentStatus }, thunkAPI) => {
    try {
        return await appointmentService.updateAppointmentStatus({ appointmentId, status, notes, paymentStatus });
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to update status");
    }
});

// Cancel Appointment (With Notes)
export const cancelAppointment = createAsyncThunk("appointment/cancel", async ({ appointmentId, notes }, thunkAPI) => {
    try {
        return await appointmentService.cancelAppointment({ appointmentId, notes });
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to cancel appointment");
    }
});

// Complete Appointment (With Notes & Payment Status)
export const completeAppointment = createAsyncThunk("appointment/complete", async ({ appointmentId, notes, paymentStatus }, thunkAPI) => {
    try {
        return await appointmentService.completeAppointment({ appointmentId, notes, paymentStatus });
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to complete appointment");
    }
});

// Check Availability
export const checkAvailability = createAsyncThunk("appointment/checkAvailability", async (availabilityData, thunkAPI) => {
    try {
        return await appointmentService.checkAvailability(availabilityData);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.error || "Failed to check availability");
    }
});


// Appointment Slice
const appointmentSlice = createSlice({
    name: "appointment",
    initialState,
    reducers: {
        resetAppointmentState: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.isAvailable = false;
            state.message = "";
        },
    },
    extraReducers: (builder) => {
        builder
            // Book Appointment
            .addCase(bookAppointment.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(bookAppointment.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.myAppointments.push(action.payload);
                toast.success("Appointment booked successfully.");
            })
            .addCase(bookAppointment.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                toast.error(state.message);
            })

            // Get My Appointments
            .addCase(getMyAppointments.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getMyAppointments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.myAppointments = action.payload.data;
            })
            .addCase(getMyAppointments.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            // Get Doctor's Appointments
            .addCase(getDoctorAppointments.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getDoctorAppointments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.doctorAppointments = action.payload.data;
            })
            .addCase(getDoctorAppointments.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            // Update Appointment Status (With Notes & Payment Status)
            .addCase(updateAppointmentStatus.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                toast.success("Appointment status updated.");
            })
            .addCase(updateAppointmentStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            // Cancel Appointment (With Notes)
            .addCase(cancelAppointment.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(cancelAppointment.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                toast.success("Appointment canceled.");
            })
            .addCase(cancelAppointment.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            // Complete Appointment (With Notes & Payment Status)
            .addCase(completeAppointment.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(completeAppointment.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                toast.success("Appointment completed.");
            })
            .addCase(completeAppointment.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            // Check Availability
            .addCase(checkAvailability.pending, (state) => {
                state.isLoading = true;
                state.isAvailable = false;
                state.isSuccess = false;
            })
            .addCase(checkAvailability.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isAvailable = action.payload.available;
                state.message = action.payload.message || "Availability checked";

                if (!action.payload.available) {
                    toast.warning("This time slot is not available");
                }
            })
            .addCase(checkAvailability.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.isAvailable = false;
                state.message = action.payload;
                toast.error(action.payload);
            });
    },
});

export const { resetAppointmentState } = appointmentSlice.actions;
export default appointmentSlice.reducer;
