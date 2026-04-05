import axios from "axios";
import { buildApiUrl } from "../../utils/baseURL.js";
import doctorConfig from "../../utils/doctorConfig.js";

const getAllBlogs = async () => {
    const response = await axios.get(buildApiUrl("blogs"));
    return response.data;
};

const getBlogById = async (id) => {
    const response = await axios.get(buildApiUrl(`blogs/${id}`));
    return response.data;
};

const getMyBlogs = async () => {
    const response = await axios.get(buildApiUrl("blogs/me/blogs"), doctorConfig());
    return response.data;
};

const createBlog = async (blogData) => {
    const response = await axios.post(buildApiUrl("blogs"), blogData, doctorConfig());
    return response.data;
};

const updateBlog = async (id, blogData) => {
    const response = await axios.put(buildApiUrl(`blogs/${id}`), blogData, doctorConfig());
    return response.data;
};

const deleteBlog = async (id) => {
    const response = await axios.delete(buildApiUrl(`blogs/${id}`), doctorConfig());
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
