import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../features/Order/OrderSlice.js';

const CheckoutPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { cartItems } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);
    const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
    const [isProcessing, setIsProcessing] = useState(false);

    const [shippingAddress, setShippingAddress] = useState({
        firstName: '',
        lastName: '',
        street: '',
        apartment: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        phone: ''
    });

    const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const shippingFee = subtotal > 1000 ? 0 : 50;
    const tax = subtotal * 0.18; // 18% tax
    const total = subtotal + shippingFee + tax;

    useEffect(() => {
        if (!user) {
            navigate('/login?redirect=checkout');
        }
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [user, cartItems, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        const orderData = {
            user: user._id,
            items: cartItems.map(item => ({
                product: item.product._id,
                name: item.product.name,
                image: item.product.image,
                quantity: item.quantity,
                priceAtPurchase: item.product.price
            })),
            subtotal,
            shippingFee,
            tax,
            total,
            shippingAddress,
            paymentMethod,
            paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'completed'
        };

        try {
            const result = await dispatch(createOrder(orderData)).unwrap();
            console.log(result)
            navigate(`/order-confirmation/${result.data._id}`);
        } catch (error) {
            console.error('Order failed:', error);
            alert('Order placement failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container mx-auto px-32 py-8 bg-gradient-to-b from-gray-100 to-white">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Shipping Information */}
                <div className="md:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">First Name*</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={shippingAddress.firstName}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Last Name*</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={shippingAddress.lastName}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Street Address*</label>
                                <input
                                    type="text"
                                    name="street"
                                    value={shippingAddress.street}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">Apartment, Suite, etc. (Optional)</label>
                                <input
                                    type="text"
                                    name="apartment"
                                    value={shippingAddress.apartment}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">City*</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={shippingAddress.city}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">State*</label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={shippingAddress.state}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Pincode*</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={shippingAddress.pincode}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        required
                                        pattern="\d{6}"
                                        title="6-digit pincode"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Country*</label>
                                    <select
                                        name="country"
                                        value={shippingAddress.country}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        required
                                    >
                                        <option value="India">India</option>
                                        <option value="USA">United States</option>
                                        <option value="UK">United Kingdom</option>
                                        {/* Add more countries as needed */}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Phone Number*</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={shippingAddress.phone}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded"
                                        required
                                        pattern="\d{10}"
                                        title="10-digit phone number"
                                    />
                                </div>
                            </div>

                            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                            <div className="space-y-3 mb-6">
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cash_on_delivery"
                                        checked={paymentMethod === 'cash_on_delivery'}
                                        onChange={() => setPaymentMethod('cash_on_delivery')}
                                        className="h-4 w-4"
                                    />
                                    <span>Cash on Delivery</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="credit_card"
                                        checked={paymentMethod === 'credit_card'}
                                        onChange={() => setPaymentMethod('credit_card')}
                                        className="h-4 w-4"
                                    />
                                    <span>Credit Card</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="debit_card"
                                        checked={paymentMethod === 'debit_card'}
                                        onChange={() => setPaymentMethod('debit_card')}
                                        className="h-4 w-4"
                                    />
                                    <span>Debit Card</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="upi"
                                        checked={paymentMethod === 'upi'}
                                        onChange={() => setPaymentMethod('upi')}
                                        className="h-4 w-4"
                                    />
                                    <span>UPI</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="net_banking"
                                        checked={paymentMethod === 'net_banking'}
                                        onChange={() => setPaymentMethod('net_banking')}
                                        className="h-4 w-4"
                                    />
                                    <span>Net Banking</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                            >
                                {isProcessing ? 'Processing...' : 'Place Order'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            {cartItems.map(item => (
                                <div key={item.product._id} className="flex justify-between items-center border-b pb-2">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={item.product.image}
                                            alt={item.product.name}
                                            className="w-12 h-12 object-cover rounded"
                                        />
                                        <div>
                                            <p className="font-medium">{item.product.name}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <p className="font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>₹{shippingFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax (18%)</span>
                                <span>₹{tax.toFixed(2)}</span>
                            </div>
                            <div className="border-t pt-3 mt-3 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;