import axios from 'axios';
import { base_url } from '../../utils/baseURL';
import config from '../../utils/config.js';

// Get all tests (public)
const getAllTests = async () => {
    const response = await axios.get(`${base_url}tests`);
    return response.data;
};

// Create a new test (admin only)
const createTest = async (testData) => {
    try{
    const response = await axios.post(`${base_url}tests`, testData, config);
    return response.data;
    }
    catch (error) {
        console.log(error)
        throw error.response?.data?.error
    }
};

// Update a test by ID (admin only)
const updateTest = async ({ id, testData }) => {
    const response = await axios.put(`${base_url}tests/${id}`, testData, config);
    console.log(response.data)
    return response.data;
};

// Deactivate a test by ID (admin only)
const deactivateTest = async (id) => {
    const response = await axios.delete(`${base_url}tests/${id}`, config);
    return response.data;
};

export const testService = {
    getAllTests,
    createTest,
    updateTest,
    deactivateTest,
};
