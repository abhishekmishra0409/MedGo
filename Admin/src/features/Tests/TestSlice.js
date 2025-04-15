import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { testService } from './TestService.js';

export const getAllTests = createAsyncThunk('test/getAll', async (_, thunkAPI) => {
    try {
        return await testService.getAllTests();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message);
    }
});

export const createTest = createAsyncThunk('test/create', async (testData, thunkAPI) => {
    try {
        return await testService.createTest(testData);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message);
    }
});

export const updateTest = createAsyncThunk('test/update', async ({ id, testData }, thunkAPI) => {
    try {
        return await testService.updateTest({ id, testData });
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message);
    }
});

export const deactivateTest = createAsyncThunk('test/deactivate', async (id, thunkAPI) => {
    try {
        return await testService.deactivateTest(id);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message);
    }
});

const testSlice = createSlice({
    name: 'test',
    initialState: {
        tests: [],
        isLoading: false,
        isError: false,
        isSuccess: false,
        message: '',
    },
    reducers: {
        resetTestState: (state) => {
            state.isLoading = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            // getAllTests
            .addCase(getAllTests.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAllTests.fulfilled, (state, action) => {
                state.isLoading = false;
                state.tests = action.payload.data;
                state.isSuccess = true;
            })
            .addCase(getAllTests.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // createTest
            .addCase(createTest.fulfilled, (state,action) => {
                state.isSuccess = true;
                state.tests.push(action.payload.data);
            })
            .addCase(createTest.rejected, (state, action) => {
                state.isError = true;
                state.message = action.payload;
                console.log(action.payload)
            })
            // updateTest
            .addCase(updateTest.fulfilled, (state) => {
                state.isSuccess = true;
            })
            .addCase(updateTest.rejected, (state, action) => {
                state.isError = true;
                state.message = action.payload;
            })
            // deactivateTest
            .addCase(deactivateTest.fulfilled, (state) => {
                state.isSuccess = true;
            })
            .addCase(deactivateTest.rejected, (state, action) => {
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { resetTestState } = testSlice.actions;
export default testSlice.reducer;