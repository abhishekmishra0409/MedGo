import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// import { Products } from "../assets/ProductData.js";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById } from "../features/Product/ProductSlice.js";


const SingleProduct = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const {product,loading, error}  = useSelector((state) => state.products);
    const [selectedImage, setSelectedImage] = useState(0);

    // console.log(product)

    useEffect(() => {
        if (id) {
            dispatch(fetchProductById(id));
        }
    }, [dispatch, id]);

    if (loading) {
        return (
            <div className="container mx-auto px-6 py-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container mx-auto px-4 sm:px-32 py-8 text-center">
                <h1 className="text-2xl">Product not found</h1>
                <p className="text-gray-400 mt-2">
                    {error || "The requested product does not exist"}
                </p>
            </div>
        );
    }

    const renderRatingStars = () => {
        const fullStars = Math.floor(product.rating);
        const hasHalfStar = product.rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <>
                {[...Array(fullStars)].map((_, i) => (
                    <svg
                        key={`full-${i}`}
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}

                {hasHalfStar && (
                    <svg
                        key="half"
                        className="w-5 h-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <defs>
                            <linearGradient id="half-star" x1="0" x2="100%" y1="0" y2="0">
                                <stop offset="50%" stopColor="currentColor" />
                                <stop offset="50%" stopColor="#D1D5DB" />
                            </linearGradient>
                        </defs>
                        <path fill="url(#half-star)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                )}

                {[...Array(emptyStars)].map((_, i) => (
                    <svg
                        key={`empty-${i}`}
                        className="w-5 h-5 text-gray-300"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}

                {product.reviews && (
                    <span className="text-sm text-gray-500 ml-1">({product.reviews} reviews)</span>
                )}
            </>
        );
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8">
            {/* Product Section */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Left - Product Images */}
                <div>
                    <div className="w-full h-96 bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                        <img
                            src={product.images[selectedImage]}
                            alt={product.name}
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/placeholder-product.png";
                            }}
                        />
                    </div>
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                        {product.images.map((img, index) => (
                            <button
                                key={index}
                                className={`flex-shrink-0 w-16 h-16 rounded-lg cursor-pointer border-2 ${selectedImage === index ? 'border-teal-500' : 'border-transparent'} bg-gray-100 p-1`}
                                onClick={() => setSelectedImage(index)}
                                aria-label={`View image ${index + 1}`}
                            >
                                <img
                                    src={img}
                                    alt={`Thumbnail ${index}`}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/placeholder-thumbnail.png";
                                    }}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right - Product Details */}
                <div className="text-gray-800">
                    <h1 className="text-3xl font-bold">{product.name}</h1>
                    {product.sku && <p className="text-sm text-teal-600 mt-1">SKU: {product.sku}</p>}

                    <div className="flex items-center mt-4">
                        {renderRatingStars()}
                    </div>

                    <div className="mt-4">
                        {product.originalPrice && product.originalPrice > product.price ? (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                                <span className="text-gray-500 line-through">${product.originalPrice.toFixed(2)}</span>
                                <span className="text-red-500 font-medium">
                                    {Math.round(((product.originalPrice - product.price) / product.originalPrice * 100))}% OFF
                                </span>
                            </div>
                        ) : (
                            <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                        )}
                    </div>

                    <p className="mt-4 text-gray-600">{product.description}</p>

                    <button
                        className="mt-6 bg-teal-600 hover:bg-teal-700 px-6 py-3 rounded-lg text-white font-medium transition-colors w-full md:w-auto"
                        aria-label="Add to cart"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>

            {/* Description Section */}
            {product.description || product.benefits || product.dosage ? (
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-4">Product Details</h2>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                        {product.description && (
                            <>
                                <h3 className="text-lg font-medium mb-2">Description:</h3>
                                <p className="text-gray-600 mb-4">{product.description}</p>
                            </>
                        )}
                        {product.benefits?.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-lg font-medium mb-2">Key Benefits:</h3>
                                <ul className="list-disc pl-5 space-y-1">
                                    {product.benefits.map((benefit, i) => (
                                        <li key={i} className="text-gray-600">{benefit}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {product.dosage && (
                            <div className="mt-4">
                                <h3 className="text-lg font-medium mb-2">Dosage:</h3>
                                <p className="text-gray-600">{product.dosage}</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default SingleProduct;