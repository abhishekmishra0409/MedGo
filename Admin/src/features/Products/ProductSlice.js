import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { productService } from "./productService";

// Get all products
export const getAllProducts = createAsyncThunk("product/getAll", async (_, thunkAPI) => {
    try {
        return await productService.getAllProducts();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
});

// Get product by ID
export const getProductById = createAsyncThunk("product/getById", async (id, thunkAPI) => {
    try {
        return await productService.getProductById(id);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
});

// Create product
export const createProduct = createAsyncThunk("product/create", async (data, thunkAPI) => {
    try {
        return await productService.createProduct(data);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
});

// Update product
export const updateProduct = createAsyncThunk("product/update", async ({ id, updatedData }, thunkAPI) => {
    try {
        return await productService.updateProduct(id, updatedData);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
});

// Delete product
export const deleteProduct = createAsyncThunk("product/delete", async (id, thunkAPI) => {
    try {
        return await productService.deleteProduct(id);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
});

const initialState = {
    products: [],
    product: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: "",
};

const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {
        resetProductState: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = "";
        },
    },
    extraReducers: (builder) => {
        builder

            // Get all
            .addCase(getAllProducts.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.products = action.payload.data;
                state.isSuccess = true;
            })
            .addCase(getAllProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Get by ID
            .addCase(getProductById.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getProductById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.product = action.payload.data;
                state.isSuccess = true;
            })
            .addCase(getProductById.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            // Create
            .addCase(createProduct.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.isLoading = false;
                state.products.push(action.payload);
                state.isSuccess = true;
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            // Update
            .addCase(updateProduct.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.isLoading = false;
                state.products = state.products.map((prod) =>
                    prod._id === action.payload._id ? action.payload : prod
                );
                state.isSuccess = true;
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            // Delete
            .addCase(deleteProduct.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.isLoading = false;
                state.products = state.products.filter((prod) => prod._id !== action.meta.arg);
                state.isSuccess = true;
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { resetProductState } = productSlice.actions;
export default productSlice.reducer;
