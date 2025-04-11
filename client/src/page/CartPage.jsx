import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    fetchCart,
    updateCartItem,
    removeCartItem,
    clearCart,
} from "../features/Cart/CartSlice.js";

const CART_STORAGE_KEY = 'cartItems';
const COUPON_STORAGE_KEY = 'cartCoupon';

const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cartItems: reduxCartItems, isLoading } = useSelector((state) => state.cart);
    const [coupon, setCoupon] = useState(localStorage.getItem(COUPON_STORAGE_KEY) || "");
    const [discount, setDiscount] = useState(0);
    const [couponMessage, setCouponMessage] = useState("");
    const [localCartItems, setLocalCartItems] = useState([]);

    // Initialize from local storage or Redux
    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
        setLocalCartItems(savedCart.length ? savedCart : reduxCartItems);
        dispatch(fetchCart());
    }, [dispatch]);

    // Sync Redux to local storage
    useEffect(() => {
        if (reduxCartItems?.length > 0) {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(reduxCartItems));
        }
    }, [reduxCartItems]);

    const displayCartItems = localCartItems?.length > 0 ? localCartItems : reduxCartItems;

    // Quantity handlers with optimistic updates
    const updateQty = async (id, qty) => {
        const newQty = Math.max(1, Number(qty));
        const updatedItems = localCartItems.map(item =>
            item.product._id === id ? { ...item, quantity: newQty } : item
        );
        setLocalCartItems(updatedItems);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedItems));
        await dispatch(updateCartItem({ productId: id, updatedData: { quantity: newQty } }));
    };

    const incrementQty = (id, currentQty) => updateQty(id, currentQty + 1);
    const decrementQty = (id, currentQty) => updateQty(id, Math.max(1, currentQty - 1));

    const removeItem = async (id) => {
        const updatedItems = localCartItems.filter(item => item.product._id !== id);
        setLocalCartItems(updatedItems);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedItems));
        await dispatch(removeCartItem(id));
    };

    const emptyCart = async () => {
        if (window.confirm("Are you sure you want to empty your cart?")) {
            setLocalCartItems([]);
            localStorage.removeItem(CART_STORAGE_KEY);
            await dispatch(clearCart());
        }
    };

    // New: Force refresh cart from server
    const refreshCart = () => {
        window.location.reload()
        dispatch(fetchCart());
        setLocalCartItems(reduxCartItems);
    };

    // New: Proceed to checkout
    const proceedToCheckout = () => {
        navigate("/checkout");
    };

    const applyCoupon = () => {
        const validCoupons = { "SAVE10": 10, "SAVE20": 20 };
        if (validCoupons[coupon]) {
            setDiscount(validCoupons[coupon]);
            setCouponMessage(`$${validCoupons[coupon]} discount applied!`);
            localStorage.setItem(COUPON_STORAGE_KEY, coupon);
        } else {
            setDiscount(0);
            setCouponMessage("Invalid coupon code");
        }
    };

    const subtotal = displayCartItems?.reduce((acc, item) =>
        acc + (item?.product?.price * item?.quantity), 0) || 0;
    const total = Math.max(0, subtotal - discount);

    const handleCardClick = (id) => {
        navigate(`/product/${id}`);
    };


    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 bg-gradient-to-b from-gray-100 to-white shadow-lg rounded-lg m-8">
            <h2 className="text-2xl font-bold mb-6">Your Shopping Cart ({displayCartItems?.length || 0})</h2>

            {isLoading ? (
                <p className="text-center">Loading...</p>
            ) : displayCartItems?.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
                    <button
                        className="bg-gradient-to-b from-teal-400 to-teal-600 hover:bg-teal-600 text-white px-6 py-2 rounded transition"
                        onClick={() => navigate("/store")}
                    >
                        Continue Shopping
                    </button>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                            <tr className="border-b">
                                <th className="text-left p-3">Product</th>
                                <th className="p-3 text-right">Price</th>
                                <th className="p-3 text-center">Quantity</th>
                                <th className="p-3 text-right">Subtotal</th>
                                <th className="p-3"></th>
                            </tr>
                            </thead>
                            <tbody>
                            {displayCartItems.map((item) => (
                                <tr key={item.product?._id} className="border-b hover:bg-gray-50">
                                    <td className="p-3 cursor-pointer"
                                        onClick={() => handleCardClick(item.product?._id)}>
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={item.product?.image}
                                                alt={item.product?.name}
                                                className="w-16 h-16 object-contain border rounded"
                                            />
                                            <div>
                                                <p className="font-semibold">{item.product?.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 text-right">${(Number(item.product?.price) || 0).toFixed(2)}</td>
                                    <td className="p-3 text-center">
                                        <div className="flex items-center justify-center">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    decrementQty(item.product?._id, item.quantity);
                                                }}
                                                className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-l border"
                                                aria-label="Decrease quantity"
                                            >
                                                -
                                            </button>
                                            <div className="w-12 p-1 border-t border-b text-center bg-gray-50">
                                                {item.quantity || 1}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    incrementQty(item.product?._id, item.quantity);
                                                }}
                                                className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-r border"
                                                aria-label="Increase quantity"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </td>
                                    <td className="p-3 text-right">${((Number(item.product?.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}</td>
                                    <td className="p-3 text-center">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeItem(item.product?._id);
                                            }}
                                            className="text-red-500 hover:text-red-700 transition cursor-pointer"
                                            aria-label="Remove item"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between mt-6 gap-4">
                        <div className="flex gap-2">
                            <button
                                onClick={emptyCart}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition"
                            >
                                Empty Cart
                            </button>
                            <button
                                onClick={refreshCart}
                                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded transition"
                            >
                                Update Cart
                            </button>
                        </div>
                        <button
                            onClick={() => navigate("/store")}
                            className="bg-gray-800 hover:bg-black text-white px-6 py-2 rounded transition"
                        >
                            Continue Shopping
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                        <div className="border p-4 rounded-lg">
                            <h3 className="font-semibold text-lg mb-3">Coupon Code</h3>
                            <p className="text-sm text-gray-600 mb-3">Enter your coupon code if you have one</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Enter coupon code"
                                    value={coupon}
                                    onChange={(e) => setCoupon(e.target.value)}
                                    className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    onClick={applyCoupon}
                                    className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded transition"
                                >
                                    Apply
                                </button>
                            </div>
                            {couponMessage && (
                                <p className={`mt-2 text-sm ${discount > 0 ? "text-teal-600" : "text-red-600"}`}>
                                    {couponMessage}
                                </p>
                            )}
                        </div>
                        <div className="border p-6 rounded-lg bg-gray-50">
                            <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-teal-600">
                                        <span>Discount:</span>
                                        <span>-${discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg">
                                    <span>Total:</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={proceedToCheckout}
                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg transition-colors mt-4"
                                >
                                    Order Now
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;