import React from "react";
import { useParams } from "react-router-dom";
import { Blogs } from "../assets/BlogData.js";
import { FaRegCalendarAlt } from "react-icons/fa";
import { BsPerson } from "react-icons/bs";

const BlogDetail = () => {
    const { id } = useParams();

    // Find the blog with matching ID
    const blogData = Blogs.find(blog => blog.id.toString() === id);

    // If blog not found, show error message
    if (!blogData) {
        return (
            <div className="max-w-3xl mx-auto p-6 text-center">
                <h1 className="text-2xl font-bold text-red-500">Blog Not Found</h1>
                <p className="text-gray-600 mt-2">The requested blog post does not exist.</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
            {/* Blog Image with fallback */}
            {blogData.image && (
                <img
                    src={blogData.image}
                    alt={blogData.title}
                    className="w-full h-64 object-cover rounded-lg"
                />
            )}

            {/* Blog Title */}
            <h1 className="text-2xl md:text-3xl font-bold mt-4">{blogData.title}</h1>

            {/* Blog Metadata */}
            <div className="flex flex-wrap items-center text-gray-600 text-sm mt-2 gap-2">
                {blogData.author && (
                    <span className="flex items-center">
                    <BsPerson className="mr-1 text-teal-400" />
                        <span className="font-semibold ml-1">{blogData.author}</span>
                    </span>
                )}
                {blogData.date && (
                    <span className="flex items-center">
                        {blogData.author && '|'}
                        <FaRegCalendarAlt className="mx-1 text-teal-400" />
                        {blogData.date}
                    </span>
                )}
                {blogData.category && (
                    <span className="text-teal-500">
                        {blogData.author || blogData.date ? '|' : ''} {blogData.category}
                    </span>
                )}
            </div>

            {/* Blog Description */}
            {blogData.Description && (
                <p className="text-gray-700 mt-4 text-lg italic">{blogData.Description}</p>
            )}

            {/* Blog Content */}
            {blogData.content && (
                <div className="text-gray-800 mt-4 space-y-4">
                    {blogData.content.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                </div>
            )}

            {/*/!* Book Appointment Button *!/*/}
            {/*<button className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition duration-300">*/}
            {/*    Book an Appointment*/}
            {/*</button>*/}

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