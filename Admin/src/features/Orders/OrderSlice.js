import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { orderAdminService } from "./OrderService.js";

const initialState = {
    orders: [],
    totalOrders: 0,
    pages: 1,
    currentPage: 1,
    statusOrders: [],
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: ""
};

// Get all orders
export const getAllOrders = createAsyncThunk("orders/getAll", async ({ page, limit }, thunkAPI) => {
    try {
        return await orderAdminService.getAllOrders(page, limit);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message || "Failed to fetch orders");
    }
});

// Get orders by status
export const getOrdersByStatus = createAsyncThunk("orders/getByStatus", async (status, thunkAPI) => {
    try {
        return await orderAdminService.getOrdersByStatus(status);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message || "Failed to fetch orders by status");
    }
});

// Update order status
export const updateOrderStatus = createAsyncThunk("orders/updateStatus", async ({ orderId, status }, thunkAPI) => {
    try {
        return await orderAdminService.updateOrderStatus({ orderId, status });
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message || "Failed to update order status");
    }
});

const orderAdminSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        resetOrderAdminState: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = "";
        }
    },
    extraReducers: (builder) => {
        builder
            // Get all orders
            .addCase(getAllOrders.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllOrders.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.orders = action.payload.orders;
                state.totalOrders = action.payload.total;
                state.pages = action.payload.pages;
                state.currentPage = action.payload.currentPage;
            })
            .addCase(getAllOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            // Get orders by status
            .addCase(getOrdersByStatus.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getOrdersByStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.statusOrders = action.payload.orders;
            })
            .addCase(getOrdersByStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            // Update order status
            .addCase(updateOrderStatus.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.message = "Order status updated successfully";
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { resetOrderAdminState } = orderAdminSlice.actions;
export default orderAdminSlice.reducer;
