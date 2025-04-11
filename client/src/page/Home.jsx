import HeroSection from "../component/Home/HeroSection.jsx";
import DoctorCard from "../component/Home/DoctorCardSm.jsx";
import ProductCard from "../component/Common/PoductCard.jsx";
import DepartmentCard from "../component/Common/DepartmentCard.jsx";
import BlogCard from "../component/Common/BlogCard.jsx";

import {useDispatch, useSelector} from "react-redux";
import { fetchAllProducts } from "../features/Product/ProductSlice.js";
import { fetchAllBlogs } from "../features/blog/blogSlice";

import React, {useEffect} from "react";

const Home = () => {
    const dispatch = useDispatch();

    const { products, isLoading } = useSelector((state) => state.products);
    const { blogs } = useSelector((state) => state.blogs);


    // console.log(blogs)
    // console.log(products)
    useEffect(() => {
        dispatch(fetchAllProducts());
        dispatch(fetchAllBlogs());
    }, [dispatch]);

    // console.log(products)

    if (isLoading) {
        return (
            <div className="container mx-auto px-6 py-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
            </div>
        );
    }

    // Ensure products and blogs are arrays before mapping
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

            {/* Info Cards Section */}
            <div className="relative">
                <section className="absolute -top-35 left-1/2 transform -translate-x-1/2 w-full px-6">
                    <div className={"grid grid-cols-1 md:grid-cols-3 gap-6 px-28 py-10"}>
                        <div
                            className="max-w-sm bg-gradient-to-r from-teal-400 to-teal-600 text-white p-6 rounded-lg shadow-lg relative">
                            {/* <p className="text-sm opacity-80">Donec luctus</p> */}
                            <h2 className="text-xl font-bold mt-1">Emergency Cases</h2>

                            <ul className="mt-4 space-y-2 text-sm">
                                <li className="flex justify-between">
                                    <span>Quick Response Time Focus</span>
                                    {/* <span>8.00 - 20.00</span> */}
                                </li>
                                <li className="flex justify-between">
                                    <span>24/7 Availability</span>
                                    {/* <span>9.00 - 18.30</span> */}
                                </li>
                                <li className="flex justify-between">
                                    <span> Ambulance & Critical Care Timing</span>
                                    {/* <span>9.00 - 15.00</span> */}
                                </li>
                            </ul>

                            <div
                                className="mt-6 text-sm font-semibold flex items-center space-x-2 cursor-pointer hover:underline">
                                <span>LEARN MORE</span>
                                <span>&rarr;</span>
                            </div>

                            {/* Clock Icon in Background */}
                            <div className="absolute bottom-4 right-4 opacity-20">
                                <img src="./Cases.svg" alt="Case" />
                            </div>
                        </div>
                        <div
                            className="max-w-sm bg-gradient-to-r from-teal-400 to-teal-600 text-white p-6 rounded-lg shadow-lg relative">
                            {/* <p className="text-sm opacity-80">Donec luctus</p> */}
                            <h2 className="text-xl font-bold mt-1">Doctors Timetable</h2>

                            <ul className="mt-4 space-y-2 text-sm">
                                <li className="flex justify-between">
                                    <span>General Consultation</span>
                                    <span>9:00 AM - 9:00 PM</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Specialist Doctors</span>
                                    <span>10:00 AM - 6:00 PM </span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Emergency Services</span>
                                    <span>24/7 Available</span>
                                </li>
                            </ul>

                            <div
                                className="mt-6 text-sm font-semibold flex items-center space-x-2 cursor-pointer hover:underline">
                                <span>LEARN MORE</span>
                                <span>&rarr;</span>
                            </div>

                            {/* Clock Icon in Background */}
                            <div className="absolute bottom-4 right-4 opacity-20">
                                <img src="./Record.svg" alt="Record" />
                            </div>
                        </div>
                        <div
                            className="max-w-sm bg-gradient-to-r from-teal-400 to-teal-600 text-white p-6 rounded-lg shadow-lg relative">
                            {/* <p className="text-sm opacity-80">Donec luctus</p> */}
                            <h2 className="text-xl font-bold mt-1">Opening Hours</h2>

                            <ul className="mt-4 space-y-2 text-sm">
                                <li className="flex justify-between">
                                    <span>• Monday - Friday</span>
                                    <span>8.00 - 20.00</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>• Saturday</span>
                                    <span>9.00 - 18.30</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>• Monday - Thursday</span>
                                    <span>9.00 - 15.00</span>
                                </li>
                            </ul>

                            <div
                                className="mt-6 text-sm font-semibold flex items-center space-x-2 cursor-pointer hover:underline">
                                <span>LEARN MORE</span>
                                <span>&rarr;</span>
                            </div>

                            {/* Clock Icon in Background */}
                            <div className="absolute bottom-4 right-4 opacity-20">
                                <img src="./watch.svg" alt="Watch" />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <section className="container text-center py-20 bg-gray mt-36 px-32">
                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    We Are Always Ready To Help You & Your Family
                </h2>

                {/* Subtitle */}
                <div className="flex justify-center items-center my-3">
                    <img src={"./arrowdot.png"} alt={"arrow"} />
                </div>

                <p className="text-gray-600 max-w-lg mx-auto">
                We Are Always Ready To Help You & Your Family – Get instant medical assistance, order medicines online, and book appointments with trusted doctors at DawaiLink.
                </p>

                {/* Services */}
                <div className="mt-10 flex flex-col md:flex-row justify-center items-center gap-4 px-8">
                    {/* Emergency Help */}
                    <div className="text-center">
                        <div
                            className="w-20 h-20 border-2 border-gray-700 rounded-full flex items-center justify-center mx-auto">
                            <img src={"./ambulance.svg"} alt={"arrow"} />
                        </div>
                        <h3 className="mt-3 text-lg font-semibold text-gray-900">Emergency Help</h3>
                        <p className="text-gray-600 text-sm">
                        Get instant medical assistance whenever you need it.
                        </p>
                    </div>

                    <div className="w-40 pb-20">
                        <span className="mx-2 text-teal-500 font-bold">--------------</span>
                    </div>

                    {/* Enriched Pharmacy */}
                    <div className="text-center">
                        <div
                            className="w-20 h-20 border-2 border-gray-700 rounded-full flex items-center justify-center mx-auto">
                            <img src={"./pharmacy.svg"} alt={"arrow"} />
                        </div>
                        <h3 className="mt-3 text-lg font-semibold text-gray-900">Enriched Pharmacy</h3>
                        <p className="text-gray-600 text-sm">
                        Order medicines online with doorstep delivery and easy access to prescriptions.
                        </p>
                    </div>

                    <div className="w-40 pb-20">
                        <span className="mx-2 text-teal-500 font-bold">--------------</span>
                    </div>

                    {/* Medical Treatment */}
                    <div className="text-center">
                        <div
                            className="w-20 h-20 border-2 border-gray-700 rounded-full flex items-center justify-center mx-auto">
                            <img src={"./medical.svg"} alt={"arrow"} />
                        </div>
                        <h3 className="mt-3 text-lg font-semibold text-gray-900">Medical Treatment</h3>
                        <p className="text-gray-600 text-sm">
                        Find the best doctors, book appointments, and receive quality care.
                        </p>
                    </div>
                </div>
            </section>

            {/* Specialist Doctors */}
            <section className="bg-cover bg-center py-16 text-center px-28"
                style={{ backgroundImage: "url('/doctorbg.png')" }}>
                <div className="py-12">
                    <h2 className="text-3xl text-white font-semibold">We Have Specialist Doctors to Solve Your
                        Problems</h2>
                    {/* Subtitle */}
                    <div className="flex justify-center items-center my-3">
                        <img src={"./arrowhite.png"} alt={"arrow"} />
                    </div>

                    <p className="text-white max-w-lg mx-auto">
                    We Have Specialist Doctors to Solve Your Problems and Connect with top medical experts, book appointments instantly, and receive the best care with DawaiLink.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6 mt-6">
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
            <section className="py-16 bg-gray-100 px-4 sm:px-8 lg:px-32">
                <div className="container mx-auto text-center">
                    <h2 className="text-2xl font-semibold">Featured Products</h2>
                    <div className="flex flex-wrap justify-center gap-6 mt-6">
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

            {/* Hospital Departments */}
            <section className="py-16 text-center bg-white px-32">
                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Hospital Department
                </h2>

                <p className="text-gray-600 max-w-lg mx-auto my-3">
                DawaiLink connects you with top specialists across various hospital departments for expert medical care.
                </p>

                {/* Subtitle */}
                <div className="flex justify-center items-center my-3">
                    <img src={"./line.png"} alt={"arrow"} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-10 mt-6">
                    <DepartmentCard
                        icon="/oncology_icon.svg"
                        title="Oncology"
                        category="Cancer & Tumors"
                        description="Behind the word mountains, far from the countries Vokalia and Consonantia"
                    />
                    <DepartmentCard
                        icon="/Cardiology_icon.svg"
                        title="Cardiology"
                        category="Heart Care"
                        description="Specialized care for your heart health and cardiovascular system"
                    />
                    <DepartmentCard
                        icon="/Neurology_icon.svg"
                        title="Neurology"
                        category="Brain & Nerves"
                        description="Expert care for neurological disorders and conditions"
                    />
                    <DepartmentCard
                        icon="/Pediatrics_icon.svg"
                        title="Pediatrics"
                        category="Child Care"
                        description="Comprehensive healthcare for infants, children and adolescents"
                    />
                    <DepartmentCard
                        icon="/Dermatology_icon.svg"
                        title="Dermatology"
                        category="Skin Care"
                        description="Diagnosis and treatment of skin conditions and diseases"
                    />
                    <DepartmentCard
                        icon="/Gynecology_icon.svg"
                        title="Gynecology"
                        category="women's reproductive health"
                        description="Gynecology is the medical specialty focused on women's reproductive health, diagnosing and treating conditions related to the uterus, ovaries, and vagina."
                    />
                    <DepartmentCard
                        icon="/Urology_icon.svg"
                        title="Urology"
                        category="Urinary System"
                        description="Urology is the medical specialty that focuses on diagnosing and treating disorders of the urinary system in both men and women, including reproductive organs."
                    />
                    <DepartmentCard
                        icon="/Radiology_icon.svg"
                        title="Radiology"
                        category="Cancer & Tumors"
                        description="Radiology is the medical field specializing in diagnosing and treating diseases using imaging techniques, such as X-rays, CT scans, and MRIs."
                    />

                </div>
            </section>

            {/* Blog Section */}
            <section className="py-16 bg-gradient-to-b from-gray-100 to-white px-28 flex justify-center items-center flex-col">
                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold text-teal-600">
                    Our Blog
                </h2>

                <p className="text-gray-600 max-w-lg mx-auto my-3 text-center">
                Explore expert health tips, medical insights, and wellness advice on DawaiLink’s blog.
                </p>

                <div className="flex flex-wrap justify-center gap-8 mt-6">
                    {recentBlogs.map(blog => (
                        <BlogCard
                            key={blog?._id}
                            id={blog?._id}
                            image={blog?.image || ''}
                            author={blog?.author?.name || 'Anonymous'}
                            date={blog?.date || ''}
                            title={blog?.title || ''}
                            description={blog?.description || ''}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
