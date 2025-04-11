import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllBlogs } from "../features/blog/blogSlice";
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
            <div
                className="relative w-full h-[350px] bg-cover bg-center flex items-center justify-center"
                style={{ backgroundImage: "url('/blog/Blogmain.jpg')" }}
            >
                <h1 className="text-4xl font-bold text-gray-900">Blogs</h1>
            </div>

            <div className="container mx-auto px-4 py-8 mt-16">
                <div className="grid md:grid-cols-4 sm:grid-cols-1 gap-8">
                    {/* Left Side - Search & Filter */}
                    <div className="col-span-1">
                        <SearchFilter
                            onSearch={handleSearch}
                            onFilter={handleFilter}
                            options={categories}
                            onClear={handleClear}
                            placeholder="Search blogs..."
                            filterLabel="Category"
                            optionType="category"
                        />
                    </div>

                    {/* Right Side - Blog Cards */}
                    <div className="col-span-3">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                            </div>
                        ) : error ? (
                            <p className="text-red-500">Error fetching blogs: {error}</p>
                        ) : filteredResults.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredResults.map((blog) => (
                                    <BlogCard
                                        key={blog.id}
                                        id={blog.id}
                                        image={blog.image}
                                        author={blog.author}
                                        date={blog.date}
                                        title={blog.title}
                                        description={blog.description}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-lg p-8 text-center">
                                <h3 className="text-xl font-medium text-gray-600 mb-2">No blogs found</h3>
                                <p className="text-gray-500">
                                    {searchQuery || filteredCategory
                                        ? "Try adjusting your search or filter criteria"
                                        : "Currently no blogs available in this category"}
                                </p>
                                <button
                                    onClick={handleClear}
                                    className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
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

export default BlogsPage;
