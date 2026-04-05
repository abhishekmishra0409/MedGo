import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllProducts } from "../features/Product/ProductSlice.js";
import SearchFilter from "../component/Common/SearchFilter.jsx";
import ProductCard from "../component/Common/ProductCardModern.jsx";

const ProductLists = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const { products, isLoading } = useSelector((state) => state.products);

    const categories = [...new Set(products.map((product) => product.category).filter(Boolean))];
    const [filteredCategory, setFilteredCategory] = useState(searchParams.get("category") || "");
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [sortOption, setSortOption] = useState("featured");

    useEffect(() => {
        dispatch(
            fetchAllProducts({
                search: searchQuery || undefined,
                category: filteredCategory || undefined,
            })
        );
    }, [dispatch, filteredCategory, searchQuery]);

    const handleSearch = (query) => {
        setSearchQuery(query);
        syncSearchParams(query, filteredCategory);
    };

    const handleFilter = (category) => {
        setFilteredCategory(category);
        syncSearchParams(searchQuery, category);
    };

    const handleClear = () => {
        setSearchQuery("");
        setFilteredCategory("");
        setSortOption("featured");
        setSearchParams(new URLSearchParams());
    };

    const handleSort = (e) => {
        setSortOption(e.target.value);
    };

    const syncSearchParams = (nextSearch, nextCategory) => {
        const params = new URLSearchParams();
        if (nextSearch) {
            params.set("search", nextSearch);
        }
        if (nextCategory) {
            params.set("category", nextCategory);
        }
        setSearchParams(params);
    };

    const filteredProducts = useMemo(
        () =>
            [...(products || [])]
                .filter(Boolean)
                .sort((a, b) => {
                    switch (sortOption) {
                        case "price-low":
                            return a.price - b.price;
                        case "price-high":
                            return b.price - a.price;
                        case "rating":
                            return b.rating - a.rating;
                        case "newest":
                            return Number(b.isNew) - Number(a.isNew);
                        default:
                            return Number(b.isHot) - Number(a.isHot) || b.rating - a.rating;
                    }
                }),
        [products, sortOption]
    );


    return (
        <div className="section-shell space-y-8 py-10">
            <section className="hero-panel">
                <span className="eyebrow">Digital pharmacy</span>
                <h1 className="section-title max-w-3xl">Browse medicines and wellness products with stronger visibility into value.</h1>
                <p className="section-copy max-w-2xl">Filter by category, search by product intent, and sort with clearer prioritization for price, freshness, and relevance.</p>
            </section>

            <section className="grid gap-8 lg:grid-cols-[320px_1fr]">
                <SearchFilter
                    onSearch={handleSearch}
                    onFilter={handleFilter}
                    options={categories}
                    onClear={handleClear}
                    initialSearch={searchQuery}
                    initialFilter={filteredCategory}
                    placeholder="Search products, categories, or use cases"
                    filterLabel="Categories"
                    optionType="category"
                />

                <div className="space-y-6">
                    <div className="section-heading-row">
                        <div>
                            <p className="eyebrow">Results</p>
                            <h2 className="text-2xl font-semibold text-slate-950">Showing {filteredProducts.length} products</h2>
                        </div>
                        <select value={sortOption} onChange={handleSort} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                            <option value="featured">Featured</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="rating">Highest Rating</option>
                            <option value="newest">Newest</option>
                        </select>
                    </div>

                    {isLoading ? (
                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <div key={index} className="h-80 animate-pulse rounded-[30px] bg-white shadow-sm" />
                            ))}
                        </div>
                    ) : filteredProducts.length ? (
                        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            {filteredProducts.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    id={product._id}
                                    image={product.image}
                                    name={product.name}
                                    price={product.price}
                                    originalPrice={product.originalPrice}
                                    isHot={product.isHot}
                                    isNew={product.isNew}
                                    category={product.category}
                                    rating={product.rating}
                                    reviews={product.reviews}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <h3 className="text-2xl font-semibold text-slate-950">No products matched your search.</h3>
                            <p className="max-w-lg text-sm text-slate-600">Adjust the search or clear filters to return to the full catalog.</p>
                            <button onClick={handleClear} className="btn-primary px-5 py-3 text-sm">
                                Reset filters
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default ProductLists;
