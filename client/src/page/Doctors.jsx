import React from 'react';
import { FaCalendarCheck, FaUserMd, FaCapsules, FaHospital } from "react-icons/fa";
import { MdHealthAndSafety } from "react-icons/md";
import DepartmentCardLr from "../component/Doctors/DepartmentCardLr.jsx";
import TabsSection from "../component/Doctors/TabsSection.jsx";
import DoctorCard from "../component/Common/DoctorCard.jsx";
import {Link} from "react-router-dom";

// Services array
const services = [
    { icon: <FaCalendarCheck />, title: "Book Appointment" },
    { icon: <MdHealthAndSafety />, title: "Book Health Check-Up" },
    { icon: <FaUserMd />, title: "Consult Online" },
    { icon: <FaCapsules />, title: "Buy Medicine" },
    { icon: <FaHospital />, title: "Find Hospital" },
];

// Departments array
const departments = [
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
    return (
        <>
            <div className="relative w-full h-[450px] bg-cover bg-center flex items-center justify-start px-32"
                 style={{backgroundImage: "url('/hero_healthcare.png')"}}>
                <div className="text-left max-w-md">
                    <p className="text-gray-600 text-sm">Book Now!</p>
                    <h1 className="text-4xl font-bold text-gray-900">Meet Our Qualified Doctors</h1>

                    <Link to={"/doctorlists"}>
                        <button
                            className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-lg shadow-md hover:bg-teal-600 transition-all">
                            Book Appointment
                        </button>
                    </Link>
                </div>
            </div>

            <section className="py-10 bg-gray-100 px-28">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap justify-center gap-6 ">
                        {services.map((service, index) => (
                            <div key={index}
                                 className="bg-white shadow-lg rounded-xl py-8 w-48 text-center transition transform hover:scale-105 flex flex-col justify-center items-center">
                                <div className="text-teal-500 text-3xl mb-3">{service.icon}</div>
                                <h3 className="text-gray-900 font-medium text-sm">{service.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <TabsSection/>

            <div className="py-10 bg-gradient-to-b from-gray-100 to-white px-28">
                <div className="container mx-auto px-4 flex flex-wrap justify-center gap-6 ">
                    {departments.map((department, index) => (
                        <DepartmentCardLr
                            key={index}
                            icon={department.icon}
                            title={department.title}
                            category={department.category}
                            description={department.description}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}

export default Doctors;