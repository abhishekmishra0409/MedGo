import { useNavigate } from 'react-router-dom';

const ProductCard = ({
                         id,
                         image,
                         name,
                         price,
                         originalPrice,
                         isHot,
                         isNew,
                         rating,
                         reviews,
                         category
                     }) => {
    const navigate = useNavigate();
    const hasDiscount = originalPrice && originalPrice > price;

    const handleProductClick = () => {
        navigate(`/product/${id}`);
        // console.log(id)
    };

    return (
        <div
            className="w-64 bg-white rounded-xl overflow-hidden text-center border border-gray-200 hover:shadow-lg transition-shadow duration-300 relative group cursor-pointer"
            onClick={handleProductClick}
        >
            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col space-y-2">
                {isHot && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            HOT
          </span>
                )}
                {isNew && (
                    <span className="bg-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            NEW
          </span>
                )}
            </div>

            {/* Product Image */}
            <div className=" w-64 h-80 flex items-center justify-center  bg-gray-50">
                <img
                    src={image}
                    alt={name}
                    className="object-contain h-full mx-auto transition-transform group-hover:scale-105 duration-300"
                />
            </div>

            {/* Product Info */}
            <div className="p-4">
                {category && (
                    <p className="text-xs text-teal-600 font-medium mb-1">{category}</p>
                )}
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 h-14 flex items-center justify-center">
                    {name}
                </h3>

                {/* Rating */}
                {rating && (
                    <div className="flex items-center justify-center mt-2">
                        {[...Array(5)].map((_, i) => (
                            <svg
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                        {reviews && (
                            <span className="text-xs text-gray-500 ml-1">({reviews})</span>
                        )}
                    </div>
                )}

                {/* Price */}
                <div className="mt-3">
                    {hasDiscount ? (
                        <div className="flex justify-center items-center space-x-2">
                            <span className="text-gray-800 font-bold text-lg">${price}</span>
                            <span className="text-gray-500 line-through text-sm">${originalPrice}</span>
                            <span className="text-red-500 text-xs font-bold">
                {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
              </span>
                        </div>
                    ) : (
                        <span className="text-gray-800 font-bold text-lg">${price}</span>
                    )}
                </div>

                {/* Add to Cart Button - Prevent event bubbling */}
                <button
                    className="mt-4 w-full bg-teal-500 hover:bg-teal-600 text-white py-2 rounded-lg font-medium transition-colors duration-300 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation();
                        // Add to cart logic here
                    }}
                >
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default ProductCard;