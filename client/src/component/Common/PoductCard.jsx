const ProductCard = ({ image, name, price, isHot }) => {
    return (
        <div className="w-64 bg-white shadow-lg rounded-xl overflow-hidden text-center border border-gray-200 relative">
            {isHot && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    HOT
                </span>
            )}
            <img src={image} alt={name} className="object-contain mx-auto" />
            <div className="my-3">
                <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
                <p className="text-gray-800 font-bold mt-1">${price}</p>
            </div>
        </div>
    );
};

export default ProductCard;
