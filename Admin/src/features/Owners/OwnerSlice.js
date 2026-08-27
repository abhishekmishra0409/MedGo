import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ownerService } from "./OwnerService.js";

const initialState = {
    owners: [],
    isLoading: false,
    isSuccess: false,
    isError: false,
    message: "",
};

export const getAllOwners = createAsyncThunk("owner/getAll", async (_, thunkAPI) => {
    try {
        return await ownerService.getAllOwners();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message || "Failed to fetch clinic owners");
    }
});

export const updateOwnerApproval = createAsyncThunk("owner/updateApproval", async ({ id, approvalStatus, approvalNotes }, thunkAPI) => {
    try {
        return await ownerService.updateOwnerApproval({ id, approvalStatus, approvalNotes });
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message || "Failed to update owner approval");
    }
});

const ownerSlice = createSlice({
    name: "owner",
    initialState,
    reducers: {
        resetOwnerState: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = "";
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllOwners.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllOwners.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.owners = action.payload.data;
            })
            .addCase(getAllOwners.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })

            .addCase(updateOwnerApproval.fulfilled, (state, action) => {
                state.isSuccess = true;
                state.owners = state.owners.map((owner) =>
                    owner._id === action.payload.data._id ? action.payload.data : owner
                );
            })
            .addCase(updateOwnerApproval.rejected, (state, action) => {
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { resetOwnerState } = ownerSlice.actions;
export default ownerSlice.reducer;
