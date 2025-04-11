import axios from "axios";
import { base_url } from "../../utils/baseURL.js";
import doctorConfig from "../../utils/doctorConfig.js";

// Get all blogs (public)
const getAllBlogs = async () => {
    const response = await axios.get(`${base_url}blogs`);
    return response.data;
};

// Get a single blog (public)
const getBlogById = async (id) => {
    const response = await axios.get(`${base_url}blogs/${id}`);
    return response.data;
};

// Get logged-in doctor's blogs (protected)
const getMyBlogs = async () => {
    const response = await axios.get(`${base_url}blogs/me/blogs`,doctorConfig);
    return response.data;
};

// Create a new blog (protected)
const createBlog = async (blogData) => {
    const response = await axios.post(`${base_url}blogs`, blogData, doctorConfig);
    return response.data;
};

// Update a blog (protected)
const updateBlog = async (id, blogData) => {
    const response = await axios.put(`${base_url}blogs/${id}`, blogData, doctorConfig);
    return response.data;
};

// Delete a blog (protected)
const deleteBlog = async (id) => {
    const response = await axios.delete(`${base_url}blogs/${id}`, doctorConfig);
    return response.data;
};

const blogService = {
    getAllBlogs,
    getBlogById,
    getMyBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
};

export default blogService;
