import React from 'react';
import { FaCalendarCheck, FaUserMd, FaCapsules, FaHospital } from "react-icons/fa";
import { MdHealthAndSafety } from "react-icons/md";
import DepartmentCardLr from "../component/Doctors/DepartmentCardLr.jsx";
import TabsSection from "../component/Doctors/TabsSection.jsx";
import DoctorCard from "../component/Common/DoctorCard.jsx";

const services = [
    { icon: <FaCalendarCheck />, title: "Book Appointment" },
    { icon: <MdHealthAndSafety />, title: "Book Health Check-Up" },
    { icon: <FaUserMd />, title: "Consult Online" },
    { icon: <FaCapsules />, title: "Buy Medicine" },
    { icon: <FaHospital />, title: "Find Hospital" },
];




function Doctors() {
    return (
        <>

            <div className="relative w-full h-[450px] bg-cover bg-center flex items-center"
                 style={{backgroundImage: "url('/hero_healthcare.png')"}}>
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

            <div className="py-10 bg-gray-100 px-28">
                <div className="container mx-auto px-4 flex flex-wrap justify-center gap-6 ">
                    <DepartmentCardLr
                        icon="/oncology_icon.svg"
                        title="Oncology"
                        category="Cancer & Tumors"
                        description="Behind the word mountains, far from the countries Vokalia and Consonantia"
                    />
                    <DepartmentCardLr
                        icon="/oncology_icon.svg"
                        title="Oncology"
                        category="Cancer & Tumors"
                        description="Behind the word mountains, far from the countries Vokalia and Consonantia"
                    />
                    <DepartmentCardLr
                        icon="/oncology_icon.svg"
                        title="Oncology"
                        category="Cancer & Tumors"
                        description="Behind the word mountains, far from the countries Vokalia and Consonantia"
                    />
                    <DepartmentCardLr
                        icon="/oncology_icon.svg"
                        title="Oncology"
                        category="Cancer & Tumors"
                        description="Behind the word mountains, far from the countries Vokalia and Consonantia"
                    />
                    <DepartmentCardLr
                        icon="/oncology_icon.svg"
                        title="Oncology"
                        category="Cancer & Tumors"
                        description="Behind the word mountains, far from the countries Vokalia and Consonantia"
                    />
                    <DepartmentCardLr
                        icon="/oncology_icon.svg"
                        title="Oncology"
                        category="Cancer & Tumors"
                        description="Behind the word mountains, far from the countries Vokalia and Consonantia"
                    />
                </div>
            </div>

        </>
    );
}

export default Doctors;