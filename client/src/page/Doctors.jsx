import React, { useState, useEffect } from 'react';
import { FaCalendarCheck, FaUserMd, FaCapsules, FaHospital } from "react-icons/fa";
import { MdHealthAndSafety } from "react-icons/md";
import DepartmentCardLr from "../component/Doctors/DepartmentCardLr.jsx";
import ClinicCard from "../component/Doctors/ClinicCard.jsx";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import { fetchClinics } from '../features/Clinic/ClinicSlice.js';

// Services array
const services = [
    { icon: <FaCalendarCheck />, title: "Book Appointment" },
    { icon: <MdHealthAndSafety />, title: "Book Health Check-Up" },
    { icon: <FaUserMd />, title: "Consult Online" },
    { icon: <FaCapsules />, title: "Buy Medicine" },
    { icon: <FaHospital />, title: "Find Hospital" },
];

// Departments array
const specialties = [
    {
        icon: "/oncology_icon.svg",
        title: "Oncology",
        category: "Cancer & Tumors",
        description: "Behind the word mountains, far from the countries Vokalia and Consonantia"
    },
    {
        icon: "/Cardiology_icon.svg",
        title: "Cardiology",
        category: "Heart Care",
        description: "Specialized care for your heart health and cardiovascular system"
    },
    {
        icon: "/Neurology_icon.svg",
        title: "Neurology",
        category: "Brain & Nerves",
        description: "Expert care for neurological disorders and conditions"
    },
    {
        icon: "/Orthopedics_icon.svg",
        title: "Orthopedics",
        category: "Bones & Joints",
        description: "Treatment for musculoskeletal system injuries and disorders"
    },
    {
        icon: "/Pediatrics_icon.svg",
        title: "Pediatrics",
        category: "Child Care",
        description: "Comprehensive healthcare for infants, children and adolescents"
    },
    {
        icon: "/Dermatology_icon.svg",
        title: "Dermatology",
        category: "Skin Care",
        description: "Diagnosis and treatment of skin conditions and diseases"
    }
];

function Doctors() {
    const [activeTab, setActiveTab] = useState("specialties");
    const [showAllSpecialties, setShowAllSpecialties] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const dispatch = useDispatch();
    const { clinics, isLoading, isError, message } = useSelector((state) => state.clinic);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 640);
        };

        handleResize(); // Set initial value
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (activeTab === "clinic") {
            dispatch(fetchClinics());
        }
    }, [activeTab, dispatch]);

    if (isLoading && activeTab === "clinic") {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    if (isError && activeTab === "clinic") {
        return (
            <div className="text-center py-10 text-red-500">
                {message || "Failed to load clinics"}
            </div>
        );
    }

    // Determine how many specialties to show
    const displayedSpecialties = showAllSpecialties
        ? specialties
        : (isMobile ? specialties.slice(0, 3) : specialties);

    return (
        <>
            {/* Hero Section */}
            <div className="relative w-full h-64 md:h-[450px] bg-cover bg-center flex items-center justify-start px-4 md:px-8 lg:px-16 xl:px-32"
                 style={{ backgroundImage: "url('/hero_healthcare.png')" }}>
                <div className="text-left max-w-md p-4">
                    <p className="text-black text-xs sm:text-sm font-medium mb-1 sm:mb-2">Book Now!</p>
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[2.5rem] font-bold text-black drop-shadow-lg leading-tight">
                        Meet Our Qualified Doctors
                    </h1>
                    <Link to={"/doctorlists"}>
                        <button
                            className="mt-3 sm:mt-4 px-4 py-2 md:px-5 md:py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg shadow-md transition-all text-xs sm:text-sm md:text-base font-medium">
                            Get Appointment
                        </button>
                    </Link>
                </div>
            </div>
            {/* Services Section */}
            <section className="py-8 md:py-10 bg-gray-100 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-28">
                <div className="container mx-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
                        {services.map((service, index) => (
                            <div key={index}
                                 className="bg-white shadow-lg rounded-xl  text-center transition transform hover:scale-105 flex flex-col justify-center items-center py-10">
                                <div className="text-teal-500 text-2xl md:text-3xl mb-2 md:mb-3">{service.icon}</div>
                                <h3 className="text-gray-900 font-medium text-xs sm:text-sm">{service.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tabs Section */}
            <div className="bg-white py-6 md:py-10 px-4 sm:px-6 md:px-8 lg:px-16 xl:px-32">
                {/* Tabs */}
                <div className="flex justify-center border-b border-gray-300">
                    <button
                        className={`py-2 px-4 md:py-3 md:px-6 text-sm md:text-lg font-medium ${activeTab === "specialties" ? "text-teal-500 border-b-2 border-teal-500" : "text-gray-500"}`}
                        onClick={() => setActiveTab("specialties")}
                    >
                        Specialties
                    </button>
                    <button
                        className={`py-2 px-4 md:py-3 md:px-6 text-sm md:text-lg font-medium ${activeTab === "clinic" ? "text-teal-500 border-b-2 border-teal-500" : "text-gray-500"}`}
                        onClick={() => setActiveTab("clinic")}
                    >
                        Clinics
                    </button>
                </div>

                {/* Content */}
                <div className="text-center px-2 sm:px-4 md:px-12 mt-6 md:mt-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                        {activeTab === "specialties"
                            ? "Explore our Medical Specialties"
                            : "Discover our Clinical Services"}
                    </h2>
                    <p className="text-gray-600 mt-2 md:mt-3 text-sm md:text-base">
                        {activeTab === "specialties"
                            ? "Our team of specialized physicians provides expert care across various medical disciplines, using the latest technologies and treatments."
                            : "Our clinical facilities offer comprehensive healthcare services with patient-centered care and modern medical equipment."}
                    </p>
                    <p className="text-gray-600 mt-2 md:mt-4 font-medium text-sm md:text-base">
                        Learn about the world-class healthcare we provide
                    </p>
                </div>
            </div>

            {/* Cards Section */}
            <div className="py-8 md:py-10 bg-gradient-to-b from-gray-100 to-white px-4 sm:px-6 md:px-8 lg:px-16 xl:px-32">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 justify-items-center">
                        {activeTab === "specialties"
                            ? displayedSpecialties.map((department, index) => (
                                <div key={index} className="w-full max-w-xs">
                                    <DepartmentCardLr
                                        icon={department.icon}
                                        title={department.title}
                                        category={department.category}
                                        description={department.description}
                                    />
                                </div>
                            ))
                            : clinics.map((clinic) => (
                                <ClinicCard key={clinic._id} clinic={clinic} />
                            ))
                        }
                    </div>
                    {activeTab === "specialties" && isMobile && !showAllSpecialties && specialties.length > 3 && (
                        <div className="text-center mt-6">
                            <button
                                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all"
                                onClick={() => setShowAllSpecialties(true)}
                            >
                                View All Specialties
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Doctors;