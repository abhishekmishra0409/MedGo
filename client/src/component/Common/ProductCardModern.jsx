import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ArrowRight, ShoppingBag, Star } from "lucide-react";
import { addCartItem } from "../../features/Cart/CartSlice.js";

const ProductCardModern = ({ id, image, name, price, originalPrice, isHot, isNew, rating, reviews, category }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const hasDiscount = originalPrice && originalPrice > price;

    const handleProductClick = () => {
        navigate(`/product/${id}`);
    };

    const handleAddToCart = (event) => {
        event.stopPropagation();
        dispatch(
            addCartItem({
                productId: id,
                name,
                price,
                image,
                quantity: 1,
            })
        );
    };

    return (
        <div className="group relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl" onClick={handleProductClick}>
            <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
                {isHot && <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">Hot</span>}
                {isNew && <span className="rounded-full bg-teal-500 px-3 py-1 text-xs font-semibold text-white">New</span>}
            </div>

            <div className="flex h-72 items-center justify-center bg-[linear-gradient(180deg,#f8fbff_0%,#eef8f6_100%)] p-6">
                <img src={image} alt={name} className="max-h-full object-contain transition-transform duration-300 group-hover:scale-105" />
            </div>

            <div className="space-y-4 p-5">
                <div>
                    {category && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">{category}</p>}
                    <h3 className="mt-2 text-lg font-semibold text-slate-950 line-clamp-2">{name}</h3>
                </div>

                {rating ? (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                            <Star className="h-4 w-4 fill-current" />
                            <span>{Number(rating).toFixed(1)}</span>
                        </div>
                        <span>{reviews || 0} reviews</span>
                    </div>
                ) : null}

                <div>
                    {hasDiscount ? (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-2xl font-semibold text-slate-950">Rs. {price}</span>
                            <span className="text-sm text-slate-400 line-through">Rs. {originalPrice}</span>
                            <span className="text-xs font-semibold text-rose-600">
                                {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
                            </span>
                        </div>
                    ) : (
                        <span className="text-2xl font-semibold text-slate-950">Rs. {price}</span>
                    )}
                </div>

                <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-600 py-3 text-sm font-semibold text-white transition hover:bg-teal-700" onClick={handleAddToCart}>
                    <ShoppingBag className="h-4 w-4" />
                    Add to cart
                    <ArrowRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default ProductCardModern;
