import HeroSection from "../component/Home/HeroSection.jsx";
import DoctorCard from "../component/Home/DoctorCardSm.jsx";
import ProductCard from "../component/Common/PoductCard.jsx";
import DepartmentCard from "../component/Common/DepartmentCard.jsx";
import BlogCard from "../component/Common/BlogCard.jsx";

import { useDispatch, useSelector } from "react-redux";
import { fetchAllProducts } from "../features/Product/ProductSlice.js";
import { fetchAllBlogs } from "../features/blog/blogSlice";

import React, { useEffect } from "react";

const Home = () => {
    const dispatch = useDispatch();

    const { products, isLoading } = useSelector((state) => state.products);
    const { blogs } = useSelector((state) => state.blogs);

    useEffect(() => {
        dispatch(fetchAllProducts());
        dispatch(fetchAllBlogs());
    }, [dispatch]);

    if (isLoading) {
        return (
            <div className="container mx-auto px-6 py-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
            </div>
        );
    }

    const featuredProducts = Array.isArray(products)
        ? products.filter(product => product?.isHot).slice(0, 4)
        : [];

    const recentBlogs = Array.isArray(blogs)
        ? blogs.slice(0, 3)
        : [];

    return (
        <div className="bg-gray-100">

            {/* Hero Section */}
            <HeroSection />

            {/* Info Cards Section - Fixed positioning and spacing */}
            <div className="relative mt-0 mb-20 md:mb-0">
                <section className="container mx-auto px-4 sm:px-6 lg:px-28">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-6 md:px-8 py-6 sm:py-10 -mt-20 md:-mt-32">
                        <div className="bg-gradient-to-r from-teal-400 to-teal-600 text-white p-4 sm:p-6 rounded-lg shadow-lg relative">
                            <h2 className="text-lg sm:text-xl font-bold mt-1">Emergency Cases</h2>
                            <ul className="mt-3 sm:mt-4 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                                <li className="flex justify-between">
                                    <span>Quick Response Time Focus</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>24/7 Availability</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Ambulance & Critical Care</span>
                                </li>
                            </ul>
                            <div className="mt-4 sm:mt-6 text-xs sm:text-sm font-semibold flex items-center space-x-1 sm:space-x-2 cursor-pointer hover:underline">
                                <span>LEARN MORE</span>
                                <span>&rarr;</span>
                            </div>
                            <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 opacity-20 w-8 h-8 sm:w-10 sm:h-10">
                                <img src="./Cases.svg" alt="Case" className="w-full h-full" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-teal-400 to-teal-600 text-white p-4 sm:p-6 rounded-lg shadow-lg relative">
                            <h2 className="text-lg sm:text-xl font-bold mt-1">Doctors Timetable</h2>
                            <ul className="mt-3 sm:mt-4 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                                <li className="flex justify-between">
                                    <span>General Consultation</span>
                                    <span>9-9 PM</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Specialist Doctors</span>
                                    <span>10-6 PM</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Emergency Services</span>
                                    <span>24/7</span>
                                </li>
                            </ul>
                            <div className="mt-4 sm:mt-6 text-xs sm:text-sm font-semibold flex items-center space-x-1 sm:space-x-2 cursor-pointer hover:underline">
                                <span>LEARN MORE</span>
                                <span>&rarr;</span>
                            </div>
                            <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 opacity-20 w-8 h-8 sm:w-10 sm:h-10">
                                <img src="./Record.svg" alt="Record" className="w-full h-full" />
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-teal-400 to-teal-600 text-white p-4 sm:p-6 rounded-lg shadow-lg relative">
                            <h2 className="text-lg sm:text-xl font-bold mt-1">Opening Hours</h2>
                            <ul className="mt-3 sm:mt-4 space-y-1 sm:space-y-2 text-xs sm:text-sm">
                                <li className="flex justify-between">
                                    <span>Mon-Fri</span>
                                    <span>8-8 PM</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Saturday</span>
                                    <span>9-6:30 PM</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Mon-Thu</span>
                                    <span>9-3 PM</span>
                                </li>
                            </ul>
                            <div className="mt-4 sm:mt-6 text-xs sm:text-sm font-semibold flex items-center space-x-1 sm:space-x-2 cursor-pointer hover:underline">
                                <span>LEARN MORE</span>
                                <span>&rarr;</span>
                            </div>
                            <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 opacity-20 w-8 h-8 sm:w-10 sm:h-10">
                                <img src="./watch.svg" alt="Watch" className="w-full h-full" />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* Services Section - Adjusted spacing to prevent overlap */}
            <section className="container mx-auto text-center pt-0 pb-16 bg-gray-100 px-4 sm:px-6 lg:px-28">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                    We Are Always Ready To Help
                </h2>

                <div className="flex justify-center items-center my-3">
                    <img src="./arrowdot.png" alt="arrow" className="w-16 sm:w-20" />
                </div>

                <p className="text-gray-600 text-sm sm:text-base max-w-lg mx-auto">
                    Get instant medical assistance, order medicines online, and book appointments.
                </p>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 px-4">
                    <div className="text-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-gray-700 rounded-full flex items-center justify-center mx-auto">
                            <img src="./ambulance.svg" alt="ambulance" className="w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                        <h3 className="mt-2 sm:mt-3 text-base sm:text-lg font-semibold">Emergency Help</h3>
                        <p className="text-gray-600 text-xs sm:text-sm">
                            Get instant medical assistance
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-gray-700 rounded-full flex items-center justify-center mx-auto">
                            <img src="./pharmacy.svg" alt="pharmacy" className="w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                        <h3 className="mt-2 sm:mt-3 text-base sm:text-lg font-semibold">Pharmacy</h3>
                        <p className="text-gray-600 text-xs sm:text-sm">
                            Order medicines online
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-gray-700 rounded-full flex items-center justify-center mx-auto">
                            <img src="./medical.svg" alt="medical" className="w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                        <h3 className="mt-2 sm:mt-3 text-base sm:text-lg font-semibold">Treatment</h3>
                        <p className="text-gray-600 text-xs sm:text-sm">
                            Find the best doctors
                        </p>
                    </div>
                </div>
            </section>

            {/* Specialist Doctors */}
            <section className="bg-cover bg-center py-10 sm:py-16 text-center px-4 sm:px-6 lg:px-28"
                     style={{ backgroundImage: "url('/doctorbg.png')" }}>
                <div className="container mx-auto py-8 sm:py-12">
                    <h2 className="text-xl sm:text-2xl md:text-3xl text-white font-semibold">Specialist Doctors</h2>
                    <div className="flex justify-center items-center my-3">
                        <img src="./arrowhite.png" alt="arrow" className="w-16 sm:w-20" />
                    </div>
                    <p className="text-white text-sm sm:text-base max-w-lg mx-auto">
                        Connect with top medical experts and receive the best care.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6">
                        <DoctorCard
                            image="/doctor.png"
                            name="Dr. Collis Molate"
                            specialty="Neurosurgeon"
                        />
                        <DoctorCard
                            image="/doctor1.png"
                            name="Dr. Sarah Taylor"
                            specialty="Neurosurgeon"
                        />
                        <DoctorCard
                            image="/doctor2.png"
                            name="Dr. Michael Chen"
                            specialty="Cardiologist"
                        />
                        <DoctorCard
                            image="/doctor3.png"
                            name="Dr. Peter England"
                            specialty="Pediatrician"
                        />
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-10 sm:py-16 bg-gray-100 px-4 sm:px-6 lg:px-28">
                <div className="container mx-auto text-center">
                    <h2 className="text-xl sm:text-2xl font-semibold">Featured Products</h2>
                    <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6">
                        {featuredProducts.map(product => (
                            <ProductCard
                                key={product?._id}
                                id={product?._id}
                                image={product?.image || ''}
                                name={product?.name || ''}
                                price={product?.price || 0}
                                originalPrice={product?.originalPrice || 0}
                                isHot={product?.isHot || false}
                                isNew={product?.isNew || false}
                                rating={product?.rating || 0}
                                reviews={product?.reviews || 0}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Hospital Departments - Improved centered and responsive grid */}
            <section className="py-10 sm:py-16 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-28">
                    <div className="text-center">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Hospital Department
                        </h2>
                        <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto mb-6">
                            Connect with top specialists across various departments.
                        </p>
                        <div className="flex justify-center mb-8">
                            <img src="./line.png" alt="line" className="w-20" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        <div className="flex justify-center">
                            <DepartmentCard
                                icon="/oncology_icon.svg"
                                title="Oncology"
                                category="Cancer & Tumors"
                                description="Behind the word mountains, far from the countries Vokalia and Consonantia"
                            />
                        </div>
                        <div className="flex justify-center">
                            <DepartmentCard
                                icon="/Cardiology_icon.svg"
                                title="Cardiology"
                                category="Heart Care"
                                description="Specialized care for your heart health and cardiovascular system"
                            />
                        </div>
                        <div className="flex justify-center">
                            <DepartmentCard
                                icon="/Neurology_icon.svg"
                                title="Neurology"
                                category="Brain & Nerves"
                                description="Expert care for neurological disorders and conditions"
                            />
                        </div>
                        <div className="flex justify-center">
                            <DepartmentCard
                                icon="/Pediatrics_icon.svg"
                                title="Pediatrics"
                                category="Child Care"
                                description="Comprehensive healthcare for infants, children and adolescents"
                            />
                        </div>
                        <div className="flex justify-center">
                            <DepartmentCard
                                icon="/Dermatology_icon.svg"
                                title="Dermatology"
                                category="Skin Care"
                                description="Diagnosis and treatment of skin conditions and diseases"
                            />
                        </div>
                        <div className="flex justify-center">
                            <DepartmentCard
                                icon="/Gynecology_icon.svg"
                                title="Gynecology"
                                category="women's reproductive health"
                                description="Gynecology is the medical specialty focused on women's reproductive health, diagnosing and treating conditions related to the uterus, ovaries, and vagina."
                            />
                        </div>
                        <div className="flex justify-center">
                            <DepartmentCard
                                icon="/Urology_icon.svg"
                                title="Urology"
                                category="Urinary System"
                                description="Urology is the medical specialty that focuses on diagnosing and treating disorders of the urinary system in both men and women, including reproductive organs."
                            />
                        </div>
                        <div className="flex justify-center">
                            <DepartmentCard
                                icon="/Radiology_icon.svg"
                                title="Radiology"
                                category="Cancer & Tumors"
                                description="Radiology is the medical field specializing in diagnosing and treating diseases using imaging techniques, such as X-rays, CT scans, and MRIs."
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Blog Section */}
            <section className="py-10 sm:py-16 bg-gradient-to-b from-gray-100 to-white px-4 sm:px-6 lg:px-28">
                <div className="container mx-auto flex justify-center items-center flex-col">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-teal-600">
                        Our Blog
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base max-w-lg mx-auto my-3 text-center">
                        Health tips and medical insights.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mt-6">
                        {recentBlogs.map(blog => (
                            <BlogCard
                                key={blog?._id}
                                id={blog?._id}
                                image={blog?.image || ''}
                                author={blog?.author?.name || 'Anonymous'}
                                date={blog?.date ? new Date(blog.date).toLocaleDateString() : new Date().toLocaleDateString()}
                                title={blog?.title || ''}
                                description={blog?.description || ''}
                            />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;