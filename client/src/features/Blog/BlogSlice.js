import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import blogService from "./BlogService.js";

// Initial state
const initialState = {
    blogs: [],
    myBlogs: [],
    blog: null,
    loading: false,
    error: null,
};

// Async Thunks

// Fetch all blogs
export const fetchAllBlogs = createAsyncThunk("blogs/fetchAll", async (_, thunkAPI) => {
    try {
        return await blogService.getAllBlogs();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Something went wrong");
    }
});

// Fetch a single blog
export const fetchBlogById = createAsyncThunk("blogs/fetchById", async (id, thunkAPI) => {
    try {
        return await blogService.getBlogById(id);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Something went wrong");
    }
});

// Fetch blogs for logged-in doctor
export const fetchMyBlogs = createAsyncThunk("blogs/fetchMyBlogs", async ( thunkAPI) => {
    try {
        return await blogService.getMyBlogs();
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Something went wrong");
    }
});

// Create a new blog
export const createNewBlog = createAsyncThunk("blogs/create", async ( blogData , thunkAPI) => {
    try {
        return await blogService.createBlog(blogData);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to create blog");
    }
});

// Update a blog
export const updateBlog = createAsyncThunk("blogs/update", async ({ id, blogData }, thunkAPI) => {
    try {
        return await blogService.updateBlog(id, blogData);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to update blog");
    }
});

// Delete a blog
export const deleteBlog = createAsyncThunk("blogs/delete", async (id , thunkAPI) => {
    try {
        return await blogService.deleteBlog(id);
    } catch (error) {
        return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to delete blog");
    }
});

// Blog Slice
const blogSlice = createSlice({
    name: "blogs",
    initialState,
    reducers: {
        resetBlogState: (state) => {
            state.blog = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all blogs
            .addCase(fetchAllBlogs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllBlogs.fulfilled, (state, action) => {
                state.loading = false;
                state.blogs = action.payload.data;
            })
            .addCase(fetchAllBlogs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch a single blog
            .addCase(fetchBlogById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBlogById.fulfilled, (state, action) => {
                state.loading = false;
                state.blog = action.payload.data;
            })
            .addCase(fetchBlogById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch user's blogs
            .addCase(fetchMyBlogs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyBlogs.fulfilled, (state, action) => {
                state.loading = false;
                state.myBlogs = action.payload.data;
            })
            .addCase(fetchMyBlogs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create a blog
            .addCase(createNewBlog.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createNewBlog.fulfilled, (state, action) => {
                state.loading = false;
                state.blogs.push(action.payload);
            })
            .addCase(createNewBlog.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update a blog
            .addCase(updateBlog.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBlog.fulfilled, (state, action) => {
                state.loading = false;
                state.blogs = state.blogs.map((blog) =>
                    blog._id === action.payload._id ? action.payload : blog
                );
            })
            .addCase(updateBlog.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete a blog
            .addCase(deleteBlog.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteBlog.fulfilled, (state, action) => {
                state.loading = false;
                state.blogs = state.blogs.filter((blog) => blog._id !== action.payload.id);
            })
            .addCase(deleteBlog.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetBlogState } = blogSlice.actions;
export default blogSlice.reducer;
