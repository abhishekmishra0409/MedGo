import React, { useEffect, useState } from 'react';
import ProductCard from '../component/Common/PoductCard';
import {Link} from "react-router-dom";
import { Products } from '../assets/ProductData.js';

function MedicalStore() {
    const [targetDate] = useState(() => {
        const now = new Date();
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
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
    }, [targetDate]); // Added targetDate as dependency

    // Add default values to prevent undefined errors
    const timerComponents = {
        days: timeLeft.days || 0,
        hours: timeLeft.hours || 0,
        minutes: timeLeft.minutes || 0,
        seconds: timeLeft.seconds || 0
    };

    // Get first 8 products
    const featuredProducts = Products.slice(0, 8);

    return (
        <>
            <div
                className="relative w-full h-[400px] bg-cover bg-center flex items-center justify-start px-32"
                style={{ backgroundImage: "url('./StoreBg.png')" }}
            >
                <div className="text-left max-w-md">
                    <p className="text-gray-600 text-sm">Shop Now!</p>
                    <h1 className="text-4xl font-bold text-gray-900">Biggest Sale</h1>
                    <p className="text-xl text-gray-700">
                        UP to <span className="text-teal-500 font-semibold">25%</span> off
                    </p>
                    <button className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-lg shadow-md hover:bg-teal-600 transition-all">
                        SHOP NOW
                    </button>
                </div>
            </div>

            {/* Product Discount Section */}
            <div className="w-full flex flex-wrap justify-center gap-6 py-16">
                {/* Sanitizer Card */}
                <div className="bg-gray-100 p-8 rounded-lg shadow-md flex items-center space-x-4 w-[400px] bg-cover bg-center"
                    style={{ backgroundImage: "url('./Sanetizerbg.png')" }}>
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-900">Save 20%</h2>
                        <p className="text-lg text-teal-500 font-semibold">On Sanitizer</p>
                        <p className="text-gray-600 text-sm">99.9% Germ Protection</p>
                        <button className="mt-2 px-4 py-2 bg-teal-500 text-white rounded-md shadow-md hover:bg-teal-600 transition-all">
                            SHOP NOW
                        </button>
                    </div>
                </div>

                {/* Masks Card */}
                <div className="bg-gray-100 p-8 rounded-lg shadow-md flex items-end justify-end space-x-4 w-[400px] bg-cover bg-center"
                    style={{ backgroundImage: "url('./Maskgirlbg.png')" }}>
                    <div className="flex flex-col justify-end items-center">
                        <h2 className="text-xl font-bold text-gray-900">15% Off</h2>
                        <p className="text-lg text-teal-500 font-semibold">Protective Masks</p>
                        <p className="text-gray-600 text-sm">Covid Protection</p>
                        <button className="mt-2 px-4 py-2 bg-teal-500 text-white rounded-md shadow-md hover:bg-teal-600 transition-all">
                            SHOP NOW
                        </button>
                    </div>
                </div>
            </div>

            <div className="py-10 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Brands</h2>
                <div className="flex justify-center gap-8">
                    <img src="/client-01.png" alt="Natural" className="h-12" />
                    <img src="/client-02.png" alt="Creative Photo" className="h-12" />
                    <img src="/client-03.png" alt="Hipster" className="h-12" />
                    <img src="/client-04.png" alt="Tech Logo" className="h-12" />
                    <img src="/client-05.png" alt="Idealogist" className="h-12" />
                    <img src="/client-06.png" alt="Maxdino" className="h-12" />
                </div>
            </div>

            <div className="py-10 flex justify-center gap-16 text-center px-32">
                <div className='flex flex-col justify-center items-center'>
                    <img src="./quickshopping.svg" alt="quick Deleivery" />
                    <h3 className="font-bold mt-2">Quick Shipping</h3>
                    <p className="text-gray-600">Our fastest domestic shipping service available 7 days a week!</p>
                </div>
                <div className='flex flex-col justify-center items-center'>
                    <img src="./quickshopping.svg" alt="quick Deleivery" />
                    <h3 className="font-bold mt-2">Secured Payment</h3>
                    <p className="text-gray-600">Payment is secured via Secure Sockets Layer (SSL) 128-bit encryption.</p>
                </div>
                <div className='flex flex-col justify-center items-center'>
                    <img src="./quickshopping.svg" alt="quick Deleivery" />
                    <h3 className="font-bold mt-2">Special Offers</h3>
                    <p className="text-gray-600">Every other day, ranging from special discounts to product bundles!</p>
                </div>
            </div>

            <div className="bg-blue-50 py-30 flex flex-col md:flex-row items-center justify-between px-32 bg-cover bg-center"
                style={{ backgroundImage: "url('./TimerBg.png')" }}>
                <div>
                    <h2 className="text-4xl font-bold text-gray-900">Grade a medical products for sale. Hurry!</h2>
                    <p className="text-lg text-gray-600">Offer ends on</p>
                    <div className="flex gap-4 mt-4">
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold">{timerComponents.days}</h3>
                            <p>Days</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold">{timerComponents.hours}</h3>
                            <p>Hours</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold">{timerComponents.minutes}</h3>
                            <p>Minutes</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md">
                            <h3 className="text-xl font-bold">{timerComponents.seconds}</h3>
                            <p>Seconds</p>
                        </div>
                    </div>
                    <button className="mt-6 bg-black text-white px-6 py-2 rounded-lg">BUY NOW</button>
                </div>
            </div>


            <div className="py-10 text-center px-32">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Products</h2>
                <div className="flex flex-wrap justify-center gap-6 mt-6">
                    {featuredProducts.map((product) => (
                        <ProductCard
                            id={product.id}
                            key={product.id}
                            image={product.image}
                            name={product.name}
                            price={product.price}
                            originalPrice={product.originalPrice}
                            isHot={product.isHot}
                            isNew={product.isNew}
                            rating={product.rating}
                            reviews={product.reviews}
                        />
                    ))}
                </div>

                <Link to={'/productlists'}>
                    <button
                        className="mt-8  px-6 py-2 bg-teal-500 text-white rounded-lg shadow-md hover:bg-teal-600 transition-all">
                        View All Products <span>&rarr;</span>
                    </button>
                </Link>
            </div>


        </>
    );
}

export default MedicalStore;

