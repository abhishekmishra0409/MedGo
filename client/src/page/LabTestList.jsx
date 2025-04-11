import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAllTests } from "../features/Labtest/LabtestSlice.js";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import LabCard from "../component/Common/LabCard.jsx";

// Sample Health Filter Data
const healthFilters = [
    { name: "Bone", image: "/LabTest/TestList1.png" },
    { name: "Adrenal Gland", image: "/LabTest/TestList2.png" },
    { name: "Liver", image: "/LabTest/TestList3.png" },
    { name: "Pancreas", image: "/LabTest/TestList4.png" },
    { name: "Kidney", image: "/LabTest/TestList5.png" },
    { name: "Thyroid", image: "/LabTest/TestList6.png" },
    { name: "Heart", image: "/LabTest/Testlist7.png" },
    { name: "Myasthenia Gravis", image: "/LabTest/TestList8.png" },
    { name: "Nutritional Disorders", image: "/LabTest/TestList9.png" },
];

const HealthFilter = () => {
    const dispatch = useDispatch();
    const { tests, isLoading, isError, message } = useSelector((state) => state.labTest);

    useEffect(() => {
        dispatch(fetchAllTests());
    }, [dispatch]);

    return (
        <div className="max-w-7xl mx-auto my-6 px-4">
            {/* Health Category Swiper */}
            <Swiper
                slidesPerView={5}
                spaceBetween={15}
                navigation
                modules={[Navigation]}
                breakpoints={{
                    320: { slidesPerView: 2, spaceBetween: 10 },
                    640: { slidesPerView: 3, spaceBetween: 15 },
                    1024: { slidesPerView: 5, spaceBetween: 20 },
                }}
                className="relative"
            >
                {healthFilters.map((item, index) => (
                    <SwiperSlide key={index} className="w-auto flex justify-center px-12">
                        <div className="p-4 bg-white border rounded-lg shadow-md text-center w-32 flex flex-col items-center">
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-contain" />
                            <p className="text-sm mt-2">{item.name}</p>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Lab Tests Section */}
            <div className="my-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                    // Skeleton Loaders
                    [...Array(6)].map((_, index) => (
                        <div key={index} className="max-w-sm mx-auto p-4 border rounded-lg shadow-lg bg-white text-center h-64 animate-pulse"></div>
                    ))
                ) : isError ? (
                    // Error Message
                    <div className="text-center w-full py-8">
                        <p className="text-red-500">{message}</p>
                    </div>
                ) : (
                    // Render Tests
                    tests.map((test) => <LabCard key={test._id} test={test} />)
                )}
            </div>
        </div>
    );
};

export default HealthFilter;
