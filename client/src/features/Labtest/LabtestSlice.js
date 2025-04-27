import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import labTestService from "./LabtestService.js";
import { toast } from "react-toastify";

// Initial State
const initialState = {
    tests: [],
    myBookings: [],
    clinicBookings: [],
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: "",
};

// Fetch All Lab Tests
export const fetchAllTests = createAsyncThunk("labTest/fetchAllTests", async (_, thunkAPI) => {
    try {
        return await labTestService.getAllTests();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch tests");
    }
});

// Book a Lab Test
export const bookLabTest = createAsyncThunk("labTest/bookLabTest", async (testData, thunkAPI) => {
    try {
        return await labTestService.bookTest(testData);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to book test");
    }
});

// Get User's Lab Test Bookings
export const fetchMyBookings = createAsyncThunk("labTest/fetchMyBookings", async (_, thunkAPI) => {
    try {
        return await labTestService.getMyBookings();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch bookings");
    }
});

// Update Lab Test Booking Status (For Clinic Staff)
export const updateLabTestStatus = createAsyncThunk("labTest/updateLabTestStatus", async ({ bookingId, status }, thunkAPI) => {
    try {
        return await labTestService.updateBookingStatus({ bookingId, status });
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to update booking status");
    }
});

// Get All Lab Test Bookings for a Clinic (For Clinic Staff)
export const fetchClinicBookings = createAsyncThunk("labTest/fetchClinicBookings", async (clinicId, thunkAPI) => {
    try {
        return await labTestService.getClinicBookings(clinicId);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch clinic bookings");
    }
});


// report upload
export const uploadLabTestReport = createAsyncThunk(
    "appointment/uploadReport",
    async ({ bookingId, file }, thunkAPI) => {
        try {
            return await labTestService.uploadLabTestReport(bookingId, file);
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.error || "Failed to upload report"
            );
        }
    }
);

// Lab Test Slice
const labTestSlice = createSlice({
    name: "labTest",
    initialState,
    reducers: {
        resetLabTestState: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = "";
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Tests
            .addCase(fetchAllTests.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchAllTests.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.tests = action.payload.data;
            })
            .addCase(fetchAllTests.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                toast.error(state.message);
            })

            // Book Lab Test
            .addCase(bookLabTest.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(bookLabTest.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.myBookings.push(action.payload);
                toast.success("Lab test booked successfully!");
            })
            .addCase(bookLabTest.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                toast.error(state.message);
            })

            // Fetch My Lab Test Bookings
            .addCase(fetchMyBookings.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchMyBookings.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.myBookings = action.payload.data;
            })
            .addCase(fetchMyBookings.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                toast.error(state.message);
            })

            // Update Lab Test Booking Status
            .addCase(updateLabTestStatus.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateLabTestStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                const index = state.clinicBookings.findIndex((b) => b._id === action.payload._id);
                if (index !== -1) {
                    state.clinicBookings[index] = action.payload;
                }
                toast.success("Booking status updated successfully!");
            })
            .addCase(updateLabTestStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                toast.error(state.message);
            })

            // Fetch Clinic Lab Test Bookings
            .addCase(fetchClinicBookings.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchClinicBookings.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.clinicBookings = action.payload.data;
            })
            .addCase(fetchClinicBookings.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                toast.error(state.message);
            })

            // report upload
            .addCase(uploadLabTestReport.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(uploadLabTestReport.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;

                // Update the specific booking with the new report URL
                state.clinicBookings = state.clinicBookings.map(booking =>
                    booking._id === action.payload._id ? action.payload : booking
                );
                toast.success('Report uploaded successfully');
            })
            .addCase(uploadLabTestReport.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                toast.error(action.payload);
            });
    },
});

export const { resetLabTestState } = labTestSlice.actions;
export default labTestSlice.reducer;
