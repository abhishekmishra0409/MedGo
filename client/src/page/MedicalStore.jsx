import React, { useEffect, useState } from 'react';
import ProductCard from '../component/Common/PoductCard.jsx';
import { Link } from "react-router-dom";
import { fetchAllProducts } from "../features/Product/ProductSlice.js";
import { useDispatch, useSelector } from "react-redux";

function MedicalStore() {
    const dispatch = useDispatch();
    const { products, isLoading } = useSelector((state) => state.products);

    useEffect(() => {
        dispatch(fetchAllProducts());
    }, [dispatch]);

    const [targetDate] = useState(() => {
        const now = new Date();
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    });

    const calculateTimeLeft = () => {
        const now = new Date();
        const difference = targetDate - now;
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [targetDate]);

    const timerComponents = {
        days: timeLeft.days || 0,
        hours: timeLeft.hours || 0,
        minutes: timeLeft.minutes || 0,
        seconds: timeLeft.seconds || 0
    };

    const featuredProducts = products.slice(0, 8);

    return (
        <>
            {/* Hero Section */}
            <div
                className="relative w-full h-[300px] md:h-[400px] bg-cover bg-center flex items-center justify-start px-4 sm:px-8 md:px-16 lg:px-32"
                style={{ backgroundImage: "url('./StoreBg.png')" }}
            >
                <div className="text-left max-w-md">
                    <p className="text-gray-600 text-sm">Shop Now!</p>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Biggest Sale</h1>
                    <p className="text-lg md:text-xl text-gray-700">
                        UP to <span className="text-teal-500 font-semibold">25%</span> off
                    </p>
                    <Link to={"/productlists"}>
                        <button className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-lg shadow-md hover:bg-teal-600 transition-all">
                            SHOP NOW
                        </button>
                    </Link>
                </div>
            </div>

            {/* Product Discount Section */}
            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 py-8 md:py-16 px-4">
                {/* Sanitizer Card */}
                <div className="bg-gray-100 p-6 md:p-8 rounded-lg shadow-md flex items-center space-x-4 w-full md:w-[400px] h-[200px] bg-cover bg-center"
                     style={{ backgroundImage: "url('./Sanetizerbg.png')" }}>
                    <div className="flex-1">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900">Save 20%</h2>
                        <p className="text-base md:text-lg text-teal-500 font-semibold">On Sanitizer</p>
                        <p className="text-gray-600 text-xs md:text-sm">99.9% Germ Protection</p>
                        <Link to={"/productlists"}>
                            <button className="mt-2 px-3 py-1 md:px-4 md:py-2 bg-teal-500 text-white rounded-md shadow-md hover:bg-teal-600 transition-all text-sm md:text-base">
                                SHOP NOW
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Masks Card */}
                <div className="bg-gray-100 p-6 md:p-8 rounded-lg shadow-md flex items-end justify-end space-x-4 w-full md:w-[400px] h-[200px] bg-cover bg-center"
                     style={{ backgroundImage: "url('./Maskgirlbg.png')" }}>
                    <div className="flex flex-col justify-end items-center">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900">15% Off</h2>
                        <p className="text-base md:text-lg text-teal-500 font-semibold">Protective Masks</p>
                        <p className="text-gray-600 text-xs md:text-sm">Covid Protection</p>
                        <Link to={"/productlists"}>
                            <button className="mt-2 px-3 py-1 md:px-4 md:py-2 bg-teal-500 text-white rounded-md shadow-md hover:bg-teal-600 transition-all text-sm md:text-base">
                                SHOP NOW
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Brands Section */}
            <div className="py-8 md:py-10 text-center px-4">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Shop by Brands</h2>
                <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                    <img src="/client-01.png" alt="Natural" className="h-8 md:h-12" />
                    <img src="/client-02.png" alt="Creative Photo" className="h-8 md:h-12" />
                    <img src="/client-03.png" alt="Hipster" className="h-8 md:h-12" />
                    <img src="/client-04.png" alt="Tech Logo" className="h-8 md:h-12" />
                    <img src="/client-05.png" alt="Idealogist" className="h-8 md:h-12" />
                    <img src="/client-06.png" alt="Maxdino" className="h-8 md:h-12" />
                </div>
            </div>

            {/* Features Section */}
            <div className="py-8 md:py-10 flex flex-col md:flex-row justify-center gap-8 md:gap-16 text-center px-4 sm:px-8 lg:px-16 xl:px-32">
                <div className='flex flex-col justify-center items-center mb-6 md:mb-0'>
                    <img src="./quickshopping.svg" alt="quick Deleivery" className="w-12 h-12 md:w-16 md:h-16" />
                    <h3 className="font-bold mt-2 text-lg">Quick Shipping</h3>
                    <p className="text-gray-600 text-sm md:text-base">Our fastest domestic shipping service available 7 days a week!</p>
                </div>
                <div className='flex flex-col justify-center items-center mb-6 md:mb-0'>
                    <img src="./quickshopping.svg" alt="quick Deleivery" className="w-12 h-12 md:w-16 md:h-16" />
                    <h3 className="font-bold mt-2 text-lg">Secured Payment</h3>
                    <p className="text-gray-600 text-sm md:text-base">Payment is secured via Secure Sockets Layer (SSL) 128-bit encryption.</p>
                </div>
                <div className='flex flex-col justify-center items-center'>
                    <img src="./quickshopping.svg" alt="quick Deleivery" className="w-12 h-12 md:w-16 md:h-16" />
                    <h3 className="font-bold mt-2 text-lg">Special Offers</h3>
                    <p className="text-gray-600 text-sm md:text-base">Every other day, ranging from special discounts to product bundles!</p>
                </div>
            </div>

            {/* Timer Section */}
            <div className="bg-blue-50 py-8 md:py-16 flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 lg:px-16 xl:px-32 bg-cover bg-center"
                 style={{ backgroundImage: "url('./TimerBg.png')" }}>
                <div className="text-center md:text-left mb-6 md:mb-0">
                    <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900">
                        Grade A medical products for sale. Limited time offer!
                    </h2>
                    <p className="text-base md:text-lg text-gray-600">Offer ends on</p>
                    <div className="flex justify-center md:justify-start gap-2 md:gap-4 mt-4">
                        <div className="bg-white p-2 md:p-4 rounded-lg shadow-md">
                            <h3 className="text-lg md:text-xl font-bold">{timerComponents.days}</h3>
                            <p className="text-xs md:text-sm">Days</p>
                        </div>
                        <div className="bg-white p-2 md:p-4 rounded-lg shadow-md">
                            <h3 className="text-lg md:text-xl font-bold">{timerComponents.hours}</h3>
                            <p className="text-xs md:text-sm">Hours</p>
                        </div>
                        <div className="bg-white p-2 md:p-4 rounded-lg shadow-md">
                            <h3 className="text-lg md:text-xl font-bold">{timerComponents.minutes}</h3>
                            <p className="text-xs md:text-sm">Minutes</p>
                        </div>
                        <div className="bg-white p-2 md:p-4 rounded-lg shadow-md">
                            <h3 className="text-lg md:text-xl font-bold">{timerComponents.seconds}</h3>
                            <p className="text-xs md:text-sm">Seconds</p>
                        </div>
                    </div>
                    <Link to={"/productlists"}>
                        <button className="mt-4 md:mt-6 bg-black text-white px-4 py-1 md:px-6 md:py-2 rounded-lg text-sm md:text-base">BUY NOW</button>
                    </Link>
                </div>
            </div>

            {/* Featured Products Section */}
            <div className="py-8 md:py-10 text-center px-4 sm:px-8 lg:px-16 xl:px-32">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Featured products</h2>

                {/* Improved responsive grid container */}
                <div className="flex justify-center">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 w-full max-w-screen-2xl">
                        {featuredProducts.map((product) => (
                            <div key={product._id} className="flex justify-center">
                                <ProductCard
                                    id={product._id}
                                    image={product.image}
                                    name={product.name}
                                    price={product.price}
                                    originalPrice={product.originalPrice}
                                    isHot={product.isHot}
                                    isNew={product.isNew}
                                    rating={product.rating}
                                    reviews={product.reviews}
                                    className="w-full max-w-xs" // Add responsive max-width
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <Link to={'/productlists'}>
                    <button className="mt-6 md:mt-8 px-4 py-1 md:px-6 md:py-2 bg-teal-500 text-white rounded-lg shadow-md hover:bg-teal-600 transition-all text-sm md:text-base">
                        View All products <span>&rarr;</span>
                    </button>
                </Link>
            </div>
        </>
    );
}

export default MedicalStore;