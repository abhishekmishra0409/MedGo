import React, { useState, useEffect } from 'react';
import BlogCard from "../component/Common/BlogCard.jsx";
import SearchFilter from "../component/Common/SearchFilter.jsx";
import { Blogs } from "../assets/BlogData.js";

function BlogsPage() {
    const [blogs, setBlogs] = useState([]);
    const [filteredBlogs, setFilteredBlogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);

    // Initialize blogs and extract unique categories
    useEffect(() => {
        // Transform the blog data to match BlogCard's expected props
        const formattedBlogs = Blogs.map(blog => ({
            id: blog.id,
            image: blog.image || '/default-blog-image.jpg', // Add default image if not provided
            author: blog.author || 'Anonymous',
            date: blog.date || new Date().toLocaleDateString(),
            title: blog.title,
            description: blog.description || blog.content.substring(0, 100) + '...'
        }));

        setBlogs(formattedBlogs);
        setFilteredBlogs(formattedBlogs);

        // Extract unique categories from all blogs (if available)
        const uniqueCategories = [...new Set(Blogs.map(blog => blog.category || 'Uncategorized'))];
        setCategories(uniqueCategories);
    }, []);

    // Handle search functionality
    const handleSearch = (term) => {
        setSearchTerm(term);
        applyFilters(term, selectedCategories);
    };

    // Handle category filter
    const handleFilter = (selectedOptions) => {
        setSelectedCategories(selectedOptions);
        applyFilters(searchTerm, selectedOptions);
    };

    // Clear all filters
    const handleClear = () => {
        setSearchTerm("");
        setSelectedCategories([]);
        setFilteredBlogs(blogs);
    };

    // Apply both search and category filters
    const applyFilters = (term, categories) => {
        let results = [...blogs];

        // Apply search filter
        if (term) {
            results = results.filter(blog =>
                blog.title.toLowerCase().includes(term.toLowerCase()) ||
                (blog.description && blog.description.toLowerCase().includes(term.toLowerCase()))
            );
        }

        // Apply category filter (if original blog data has categories)
        if (categories.length > 0 && Blogs[0]?.category) {
            results = results.filter(blog => {
                const originalBlog = Blogs.find(b => b.id === blog.id);
                return originalBlog && categories.includes(originalBlog.category);
            });
        }

        setFilteredBlogs(results);
    };

    return (

        <>
            <div className="relative w-full h-[350px] bg-cover bg-center flex items-center justify-center"
                 style={{backgroundImage: "url('/hero_healthcare.png')"}}>
                <div className="">
                    <h1 className="text-4xl font-bold text-gray-900">Find Your Doctor</h1>
                </div>
            </div>
    <div className="container mx-auto px-4 py-8 mt-16">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Search filter column (left) */}
            <div className="col-span-1">
                {categories.length > 0 && (
                        <SearchFilter
                            onSearch={handleSearch}
                            onFilter={handleFilter}
                            options={categories}
                            onClear={handleClear}
                            placeholder="Search blogs..."
                            filterLabel="Category"
                            optionType="category"
                        />
                    )}
                </div>

                {/* Blogs content column (right) */}
                <div className="col-span-1 md:col-span-3">
                    {filteredBlogs.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredBlogs.map(blog => (
                                <BlogCard
                                    id={blog.id}
                                    key={blog.id}
                                    image={blog.image}
                                    author={blog.author}
                                    date={blog.date}
                                    title={blog.title}
                                    description={blog.Description}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No blogs found matching your criteria.</p>
                    )}
                </div>
            </div>
        </div>
        </>

    );
}

export default BlogsPage;