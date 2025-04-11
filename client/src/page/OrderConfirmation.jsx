import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearCart } from '../features/Cart/CartSlice.js';


const CART_STORAGE_KEY = 'cartItems';
const COUPON_STORAGE_KEY = 'cartCoupon';

const OrderConfirmation = () => {
    const { orderId } = useParams();
    const dispatch = useDispatch();

    useEffect(() => {
        // Clear cart when order is confirmed
        localStorage.removeItem(CART_STORAGE_KEY);
        localStorage.removeItem(COUPON_STORAGE_KEY);
        dispatch(clearCart());
    }, [dispatch]);

    return (
        <div className="container mx-auto px-4 py-12 text-center">
            <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h1 className="text-2xl font-bold mb-4">Order Confirmed!</h1>
                <p className="text-gray-600 mb-6">Thank you for your purchase. Your order has been received and is being processed.</p>
                <p className="font-medium mb-6">Order ID: <span className="text-blue-600">{orderId}</span></p>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-gray-600">We've sent a confirmation email with your order details.</p>
                </div>
                <button
                    onClick={() => window.location.href = '/orders'}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded transition"
                >
                    View Your Orders
                </button>
            </div>
        </div>
    );
};

export default OrderConfirmation;