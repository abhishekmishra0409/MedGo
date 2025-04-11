import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

const LabCard = ({ test }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleBookClick = () => {
        if (!test._id) {
            toast.error("Test information is incomplete");
            return;
        }
        navigate(`/book-lab-test/${test._id}`);
    };

    return (
        <div className="w-92 mx-auto p-4 border rounded-lg shadow-lg bg-white text-center hover:shadow-xl transition-shadow duration-300 relative">
            {/* Active Badge */}
            {test?.isActive && (
                <div className="absolute -mt-3 -mr-3 right-0 top-0 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Active
                </div>
            )}

            {/* Popular Badge */}
            {test?.isPopular && (
                <div className="absolute -mt-3 -ml-3 left-0 top-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    Popular
                </div>
            )}

            <h2 className="text-lg font-semibold text-gray-800">{test.name}</h2>
            <p className="text-sm text-gray-600">Code: {test.code}</p>
            <p className="text-sm text-gray-600 mt-2">{test.description}</p>

            <span className="mt-2 inline-block bg-teal-100 text-blue-700 text-xs px-2 py-1 rounded">
                {test.category?.toUpperCase()}
            </span>

            {/* Price Section */}
            <div className="mt-3">
                {test.discount ? (
                    <>
                        <span className="text-xl font-bold text-gray-800">
                            ₹{test.price - (test.price * test.discount) / 100}
                        </span>
                        <span className="ml-2 text-sm text-gray-500 line-through">
                            ₹{test.price}
                        </span>
                        <span className="ml-2 text-sm text-green-600">
                            {test.discount}% OFF
                        </span>
                    </>
                ) : (
                    <p className="text-xl font-bold text-gray-800">₹{test.price}</p>
                )}
            </div>

            {/* Report Time */}
            <p className="mt-2 text-sm text-gray-700">
                <strong>Report Time:</strong> {test.reportTime || '24'} hours
            </p>

            {/* Preparation Instructions */}
            <p className="mt-2 text-sm text-gray-700">
                <strong>Preparation:</strong> {test.preparationInstructions || 'No special preparation required'}
            </p>

            {/* Book Appointment Button */}
            <div className="mt-4">
                <button
                    onClick={handleBookClick}
                    className="w-full text-teal-600 border-2 border-teal-600 px-6 py-3 rounded-lg shadow-md hover:bg-teal-600 hover:text-white transition"
                >
                    Book an Appointment
                </button>
            </div>
        </div>
    );
};

export default LabCard;