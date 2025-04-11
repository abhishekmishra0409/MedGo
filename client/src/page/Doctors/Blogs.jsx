import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchMyBlogs,
    createNewBlog,
    updateBlog,
    deleteBlog,
    resetBlogState
} from '../../features/Blog/BlogSlice';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiUpload } from 'react-icons/fi';

const DoctorBlogs = () => {
    const dispatch = useDispatch();
    const { myBlogs, loading, error } = useSelector((state) => state.blogs);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBlog, setCurrentBlog] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        category: '',
        image: null
    });
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        dispatch(fetchMyBlogs());
        return () => {
            dispatch(resetBlogState());
        };
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                image: file
            });

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const openCreateModal = () => {
        setCurrentBlog(null);
        setFormData({
            title: '',
            description: '',
            content: '',
            category: '',
            image: null
        });
        setImagePreview(null);
        setIsModalOpen(true);
    };

    const openEditModal = (blog) => {
        setCurrentBlog(blog);
        setFormData({
            title: blog.title,
            description: blog.description,
            content: blog.content,
            category: blog.category,
            image: null
        });
        setImagePreview(blog.image);
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const blogData = new FormData();
        blogData.append('title', formData.title);
        blogData.append('description', formData.description);
        blogData.append('content', formData.content);
        blogData.append('category', formData.category);
        if (formData.image) {
            blogData.append('image', formData.image);
        }

        if (currentBlog) {
            dispatch(updateBlog({ id: currentBlog._id, blogData }))
                .unwrap()
                .then(() => {
                    toast.success('Blog updated successfully');
                    setIsModalOpen(false);
                });
        } else {
            dispatch(createNewBlog(blogData))
                .unwrap()
                .then(() => {
                    toast.success('Blog created successfully');
                    setIsModalOpen(false);
                });
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this blog?')) {
            dispatch(deleteBlog(id))
                .unwrap()
                .then(() => {
                    toast.success('Blog deleted successfully');
                });
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">My Blogs</h1>
                <button
                    onClick={openCreateModal}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                    <FiPlus className="mr-2" />
                    Create New Blog
                </button>
            </div>

            {loading && !myBlogs.length ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
            ) : myBlogs.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">You haven't written any blogs yet.</p>
                    <button
                        onClick={openCreateModal}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Write Your First Blog
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myBlogs.map((blog) => (
                        <div key={blog._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="h-48 overflow-hidden">
                                <img
                                    src={blog.image}
                                    alt={blog.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-xl font-bold text-gray-800 mb-2">{blog.title}</h2>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => openEditModal(blog)}
                                            className="text-indigo-600 hover:text-indigo-800"
                                            title="Edit"
                                        >
                                            <FiEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(blog._id)}
                                            className="text-red-600 hover:text-red-800"
                                            title="Delete"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                                <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full mb-3">
                                    {blog.category}
                                </span>
                                <p className="text-gray-600 mb-3 line-clamp-2">
                                    {blog.description}
                                </p>
                                <p className="text-gray-500 text-sm">
                                    {new Date(blog.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Blog Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0  flex items-center justify-center z-50 p-4" style={{backgroundColor: 'rgba(61,61,61,0.8)'}}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b p-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                {currentBlog ? 'Edit Blog' : 'Create New Blog'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                                    Title*
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                                    Short Description*
                                </label>
                                <input
                                    type="text"
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                                    Category*
                                </label>
                                <input
                                    type="text"
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
                                    Content*
                                </label>
                                <textarea
                                    id="content"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    rows="8"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                ></textarea>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Blog Image
                                </label>
                                <div className="flex items-center gap-4">
                                    <label className="flex flex-col items-center justify-center w-full max-w-xs px-4 py-6 bg-white text-blue rounded-lg shadow-md tracking-wide border border-blue cursor-pointer hover:bg-blue-100">
                                        <FiUpload className="text-2xl text-gray-600 mb-2" />
                                        <span className="text-sm text-gray-600">
                                            {formData.image ? formData.image.name : 'Choose an image'}
                                        </span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                        />
                                    </label>
                                    {imagePreview && (
                                        <div className="flex-shrink-0">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-24 w-24 object-cover rounded-md border"
                                            />
                                        </div>
                                    )}
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    Recommended size: 800x450px (16:9 aspect ratio)
                                </p>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <span className="flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : currentBlog ? 'Update Blog' : 'Create Blog'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorBlogs;