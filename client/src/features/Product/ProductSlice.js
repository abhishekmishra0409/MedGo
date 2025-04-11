import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllProducts, getProductById } from "./ProductService.js";

// Fetch all products
export const fetchAllProducts = createAsyncThunk(
    "products/fetchAll",
    async (_, thunkAPI) => {
        try {
            return await getAllProducts();
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch products");
        }
    }
);

// Fetch a single product by ID
export const fetchProductById = createAsyncThunk(
    "products/fetchById",
    async (productId, thunkAPI) => {
        try {
            return await getProductById(productId);
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch product");
        }
    }
);

const productSlice = createSlice({
    name: "products",
    initialState: {
        products:[],
        product: null,
        isLoading: false,
        isError: false,
        errorMessage: "",
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch all products
            .addCase(fetchAllProducts.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.errorMessage = "";
            })
            .addCase(fetchAllProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.products = action.payload.data;
            })
            .addCase(fetchAllProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload;
            })

            // Fetch single product
            .addCase(fetchProductById.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.errorMessage = "";
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.product = action.payload.data;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.errorMessage = action.payload;
            });
    }
});

export default productSlice.reducer;
