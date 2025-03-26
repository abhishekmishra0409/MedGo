import React, { useState } from "react";

const initialCart = [
    {
        id: 1,
        name: "Thermometers",
        sku: "290397",
        price: 61.0,
        qty: 1,
        image: "./cart-thumb01.png",
    },
    {
        id: 2,
        name: "Weight Loss Measuring",
        sku: "290392",
        price: 115.0,
        qty: 1,
        image: "./cart-thumb02.png",
    },
    {
        id: 3,
        name: "Hand Gloves",
        sku: "290347",
        price: 24.0,
        qty: 1,
        image: "./cart-thumb03.png",
    },
];

const CartPage = () => {
    const [cart, setCart] = useState(initialCart);
    const [coupon, setCoupon] = useState("");
    const [discount, setDiscount] = useState(0);
    const [couponMessage, setCouponMessage] = useState("");

    const updateQty = (id, qty) => {
        const newQty = Math.max(1, Number(qty)); // Ensure quantity is at least 1
        setCart(
            cart.map((item) =>
                item.id === id ? { ...item, qty: newQty } : item
            )
        );
    };

    const removeItem = (id) => {
        setCart(cart.filter((item) => item.id !== id));
    };

    const emptyCart = () => {
        if (window.confirm("Are you sure you want to empty your cart?")) {
            setCart([]);
        }
    };

    const applyCoupon = () => {
        // Simple coupon logic - in a real app, this would validate with backend
        const validCoupons = {
            "SAVE10": 10,
            "SAVE20": 20,
            "FREESHIP": 0
        };

        if (validCoupons[coupon]) {
            setDiscount(validCoupons[coupon]);
            setCouponMessage(`$${validCoupons[coupon]} discount applied!`);
        } else {
            setDiscount(0);
            setCouponMessage("Invalid coupon code");
        }
    };

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    const total = subtotal - discount;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Your Shopping Cart ({cart.length})</h2>

            {cart.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition">
                        Continue Shopping
                    </button>
                </div>
            ) : (
                <>
                    {/* Cart Table */}
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
                            {cart.map((item) => (
                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-16 h-16 object-contain border rounded"
                                            />
                                            <div>
                                                <p className="font-semibold">{item.name}</p>
                                                <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 text-right">${item.price.toFixed(2)}</td>
                                    <td className="p-3 text-center">
                                        <input
                                            type="number"
                                            value={item.qty}
                                            min="1"
                                            onChange={(e) => updateQty(item.id, e.target.value)}
                                            className="w-16 p-2 border rounded text-center"
                                        />
                                    </td>
                                    <td className="p-3 text-right">${(item.price * item.qty).toFixed(2)}</td>
                                    <td className="p-3 text-center">
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-red-500 hover:text-red-700 transition"
                                            aria-label="Remove item"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row justify-between mt-6 gap-4">
                        <div className="flex gap-4">
                            <button
                                onClick={emptyCart}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition"
                            >
                                Empty Cart
                            </button>
                            <button className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded transition">
                                Update Cart
                            </button>
                        </div>
                        <button className="bg-gray-800 hover:bg-black text-white px-6 py-2 rounded transition">
                            Continue Shopping
                        </button>
                    </div>

                    {/* Coupon and Checkout */}
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
                                <p className={`mt-2 text-sm ${discount > 0 ? 'text-teal-600' : 'text-red-600'}`}>
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
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount:</span>
                                        <span>-${discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Shipping:</span>
                                    <span className="text-teal-600">FREE</span>
                                </div>
                                <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg">
                                    <span>Total:</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                            <button className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg mt-6 transition font-medium">
                                Proceed to Checkout
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPage;