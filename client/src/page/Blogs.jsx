import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllBlogs } from "../features/Blog/BlogSlice.js";
import BlogCard from "../component/Common/BlogCard.jsx";
import SearchFilter from "../component/Common/SearchFilter.jsx";

function BlogsPage() {
    const dispatch = useDispatch();
    const { blogs, loading, error } = useSelector((state) => state.blogs);

    // Extract unique categories from blog data
    const categories = [...new Set(blogs.map(blog => blog.category))];

    const [filteredBlogs, setFilteredBlogs] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredCategory, setFilteredCategory] = useState("");

    useEffect(() => {
        dispatch(fetchAllBlogs());
    }, [dispatch]);

    useEffect(() => {
        if (blogs.length > 0) {
            const formattedBlogs = blogs.map(blog => ({
                id: blog._id,
                image: blog.image || "/default-blog-image.jpg",
                author: blog.author?.name || "Anonymous",
                date: blog.date ? new Date(blog.date).toLocaleDateString() : new Date().toLocaleDateString(),
                title: blog.title,
                description: blog.description || (blog.content ? blog.content.substring(0, 100) + "..." : "No description available"),
                category: blog.category || "Uncategorized",
            }));
            setFilteredBlogs(formattedBlogs);
        }
    }, [blogs]);

    const handleSearch = (query) => {
        setSearchQuery(query.toLowerCase());
    };

    const handleFilter = (category) => {
        setFilteredCategory(category);
    };

    const handleClear = () => {
        setSearchQuery("");
        setFilteredCategory("");
    };

    // Filter blogs based on search and category
    const filteredResults = filteredBlogs.filter((blog) => {
        const matchesSearch =
            blog.title.toLowerCase().includes(searchQuery) ||
            (blog.description && blog.description.toLowerCase().includes(searchQuery));
        const matchesCategory = filteredCategory ? blog.category === filteredCategory : true;
        return matchesSearch && matchesCategory;
    });

    return (
        <>
            {/* Hero Section */}
            <div
                className="relative w-full h-[200px] sm:h-[250px] md:h-[300px] lg:h-[350px] bg-cover bg-center flex items-center justify-center"
                style={{ backgroundImage: "url('/blog/Blogmain.jpg')" }}
            >
                {/* Optional: Add text overlay if needed */}
                {/* <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white bg-black bg-opacity-50 px-4 py-2 rounded">
                    Blogs
                </h1> */}
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10 mt-8 sm:mt-12 md:mt-16">
                <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                    {/* Left Side - Search & Filter (Full width on mobile, fixed width on desktop) */}
                    <div className="w-full lg:w-72 xl:w-80">
                        <SearchFilter
                            onSearch={handleSearch}
                            onFilter={handleFilter}
                            options={categories}
                            onClear={handleClear}
                            placeholder="Search blogs..."
                            filterLabel="Category"
                            optionType="category"
                            className="sticky top-4" // Makes filter stick on scroll for desktop
                        />
                    </div>

                    {/* Right Side - Blog Cards */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 p-4 rounded-lg">
                                <p className="text-red-500">Error fetching blogs: {error}</p>
                            </div>
                        ) : filteredResults.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6 justify-items-center">
                                {filteredResults.map((blog) => (
                                    <div key={blog.id} className="w-full max-w-xs sm:max-w-none">
                                        <BlogCard
                                            id={blog.id}
                                            image={blog.image}
                                            author={blog.author}
                                            date={blog.date}
                                            title={blog.title}
                                            description={blog.description}
                                            className="h-full"
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center">
                                <h3 className="text-lg sm:text-xl font-medium text-gray-600 mb-2">No blogs found</h3>
                                <p className="text-gray-500 text-sm sm:text-base">
                                    {searchQuery || filteredCategory
                                        ? "Try adjusting your search or filter criteria"
                                        : "Currently no blogs available"}
                                </p>
                                <button
                                    onClick={handleClear}
                                    className="mt-4 px-3 py-1 sm:px-4 sm:py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors text-sm sm:text-base"
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default BlogsPage;