import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { clearAllSessions, clearSession, getStoredSession, persistSession } from "../../utils/session.js";
import { loginUser } from "../User/UserSlice.js";

// Session-only slice — the clinic-owner's actual data (clinic details, roster)
// lives in ClinicSlice. This just tracks who's logged in, mirroring DoctorSlice's
// shape but with no data thunks of its own.

const storedSession = getStoredSession("clinic-owner");

const initialState = {
    owner: storedSession?.profile || null,
    profile: storedSession?.profile || null,
    token: storedSession?.token || "",
    role: storedSession?.role || null,
    isAuthenticated: !!storedSession?.token,
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: "",
};

export const logoutOwner = createAsyncThunk("owner/logout", async () => {
    clearSession("clinic-owner");
    return true;
});

const ownerSlice = createSlice({
    name: "owner",
    initialState,
    reducers: {
        setAuthenticated: (state, action) => {
            state.isAuthenticated = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Shared login endpoint via UserSlice's loginUser thunk — only claims
            // the session when the response role is "clinic-owner". See
            // UserSlice.js and DoctorSlice.js for the matching cases.
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
                state.isSuccess = false;
                state.message = "";
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;

                if (action.payload?.data?.role !== "clinic-owner") {
                    return;
                }

                clearAllSessions();
                const session = persistSession("clinic-owner", action.payload);
                state.isSuccess = true;
                state.owner = session.profile;
                state.profile = session.profile;
                state.token = session.token;
                state.role = session.role;
                state.isAuthenticated = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.isSuccess = false;
                state.message = action.payload;
                state.isAuthenticated = false;
            })

            .addCase(logoutOwner.fulfilled, (state) => {
                state.owner = null;
                state.profile = null;
                state.token = "";
                state.role = null;
                state.isAuthenticated = false;
                state.isSuccess = false;
                state.isError = false;
                state.isLoading = false;
            });
    },
});

export const { setAuthenticated } = ownerSlice.actions;
export default ownerSlice.reducer;
