import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import orderService from "./OrderService.js";
import { toast } from "react-toastify";

// Initial state
const initialState = {
    orders: [],
    order: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: "",
};

// Create an Order
export const createOrder = createAsyncThunk("order/create", async (orderData, thunkAPI) => {
    try {
        return await orderService.createOrder(orderData);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to create order");
    }
});

// Get a Single Order
export const getOrderById = createAsyncThunk("order/getOrder", async (orderId, thunkAPI) => {
    try {
        return await orderService.getOrderById(orderId);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch order");
    }
});

// Get User's Orders
export const getMyOrders = createAsyncThunk("order/getMyOrders", async (_, thunkAPI) => {
    try {
        return await orderService.getMyOrders();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch orders");
    }
});

// Order Slice
const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        resetOrderState: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = "";
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Order
            .addCase(createOrder.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.order = action.payload;
                toast.success("Order placed successfully.");
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                toast.error(state.message);
            })

            // Get Order by ID
            .addCase(getOrderById.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getOrderById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.order = action.payload.data;
            })
            .addCase(getOrderById.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            // Get User Orders
            .addCase(getMyOrders.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getMyOrders.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.orders = action.payload.data;
            })
            .addCase(getMyOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
