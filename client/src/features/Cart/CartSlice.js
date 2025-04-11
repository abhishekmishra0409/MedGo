import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import cartService from "./CartService.js";
import {toast} from "react-toastify";

// Initial state
const initialState = {
    cartItems: [],
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: "",
};

// Fetch Cart Items
export const fetchCart = createAsyncThunk("cart/getCart", async ( thunkAPI) => {
    try {
        return await cartService.getCart();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch cart");
    }
});

// Add Item to Cart
export const addCartItem = createAsyncThunk("cart/addCartItem", async ( productData , thunkAPI) => {
    try {
        return await cartService.addToCart(productData);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to add item");
    }
});

// Update Cart Item
export const updateCartItem = createAsyncThunk("cart/updateCartItem", async ({ productId, updatedData }, thunkAPI) => {
    try {
        return await cartService.updateCartItem({ productId, updatedData });
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to update item");
    }
});

// Remove Item from Cart
export const removeCartItem = createAsyncThunk("cart/removeCartItem", async (productId, thunkAPI) => {
    try {
        return await cartService.removeFromCart(productId);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to remove item");
    }
});

// Clear Cart
export const clearCart = createAsyncThunk("cart/clearCart", async ( thunkAPI) => {
    try {
        return await cartService.clearCart();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to clear cart");
    }
});

// Cart Slice
const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        resetCartState: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = "";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                // state.cartItems = Array.isArray(action.payload?.data) ? action.payload.data : [];
                state.cartItems = action.payload.data.items;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(addCartItem.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(addCartItem.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.cartItems.push(action.payload);
                toast.success("Product added successfully.");
            })
            .addCase(addCartItem.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(updateCartItem.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateCartItem.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                const index = state.cartItems.findIndex(item => item._id === action.payload._id);
                if (index !== -1) {
                    state.cartItems[index] = action.payload;
                }
            })
            .addCase(updateCartItem.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(removeCartItem.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(removeCartItem.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.cartItems = state.cartItems.filter(item => item._id !== action.meta.arg.productId);
            })
            .addCase(removeCartItem.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(clearCart.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(clearCart.fulfilled, (state) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.cartItems = [];
            })
            .addCase(clearCart.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { resetCartState } = cartSlice.actions;
export default cartSlice.reducer;
