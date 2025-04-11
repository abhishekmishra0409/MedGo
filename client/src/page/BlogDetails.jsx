import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaRegCalendarAlt } from "react-icons/fa";
import { BsPerson } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlogById } from "../features/blog/blogSlice";

const BlogDetail = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    const { blog, loading, error } = useSelector((state) => state.blogs);

    useEffect(() => {
        dispatch(fetchBlogById(id));
    }, [dispatch, id]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 py-8 bg-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className="max-w-3xl mx-auto p-6 text-center">
                <h1 className="text-2xl font-bold text-red-500">Blog Not Found</h1>
                <p className="text-gray-600 mt-2">
                    {error || "The requested blog post does not exist."}
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            {/* Blog Image */}
            {blog.image && (
                <img
                    src={blog.image}
                    alt={blog.title}
                    className="w-full h-64 object-cover rounded-lg"
                />
            )}

            {/* Blog Title */}
            <h1 className="text-2xl md:text-3xl font-bold mt-4">{blog.title}</h1>

            {/* Blog Metadata */}
            <div className="flex flex-wrap items-center text-gray-600 text-sm mt-2 gap-2">
                {blog.author && (
                    <span className="flex items-center">
                        <BsPerson className="mr-1 text-teal-400" />
                        <span className="font-semibold ml-1">{blog.author?.name}</span>
                    </span>
                )}
                {blog.date && (
                    <span className="flex items-center">
                        {blog.author?.name && " | "}
                        <FaRegCalendarAlt className="mx-1 text-teal-400" />
                        {blog.date ? new Date(blog.date).toLocaleDateString() : new Date().toLocaleDateString()}
                    </span>
                )}
                {blog.category && (
                    <span className="text-teal-500">
                        {blog.author?.name || blog.date ? " | " : ""} {blog.category}
                    </span>
                )}
            </div>

            {/* Blog Description */}
            {blog?.Description && (
                <p className="text-gray-700 mt-4 text-lg italic">{blog.Description}</p>
            )}

            {/* Blog Content */}
            {blog?.content && (
                <div className="text-gray-800 mt-4 space-y-4">
                    {blog.content.split("\n").map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
            )}

            {/* Social Share Icons */}
            <div className="mt-6 flex flex-wrap gap-3">
                <button className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition duration-300">
                    Facebook
                </button>
                <button className="px-3 py-2 bg-sky-400 hover:bg-sky-500 text-white rounded transition duration-300">
                    Twitter
                </button>
                <button className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition duration-300">
                    Pinterest
                </button>
            </div>
        </div>
    );
};

export default BlogDetail;
