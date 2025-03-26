import React, { useEffect, useState } from "react";
import {useNavigate, useParams} from "react-router-dom";
import { Doctors } from "../assets/DoctorData";


const DoctorProfile = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleButtonClick = (e) => {
        navigate(`/appointment/${id}`)
    };

    useEffect(() => {
        // Find doctor by ID
        const foundDoctor = Doctors.find(d => d.id === parseInt(id));
        if (foundDoctor) {
            setDoctor(foundDoctor);
        }
        setLoading(false);
    }, [id]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 sm:px-6 py-8 bg-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="container mx-auto px-4 sm:px-6 py-8 bg-white text-center">
                <h1 className="text-2xl font-bold text-gray-800">Doctor not found</h1>
                <p className="text-gray-600 mt-2">The requested doctor profile does not exist</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 py-8 bg-white">
            <div className="grid md:grid-cols-3 gap-8">
                {/* Left - Doctor Profile Card */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex flex-col items-center">
                        <img
                            src={doctor.image}
                            alt={doctor.name}
                            className="rounded-lg h-64 w-full object-cover"
                        />
                        <h2 className="text-2xl font-bold mt-4 text-gray-800">{doctor.name}</h2>
                        <p className="text-teal-600 text-lg">{doctor.specialty}</p>
                        <p className="text-gray-500 text-sm text-center">{doctor.qualification}</p>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Contact Info</h3>
                        <div className="space-y-2 text-gray-600">
                            <p className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                {doctor.contact.phone}
                            </p>
                            <p className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                {doctor.contact.email}
                            </p>
                            <p className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {doctor.contact.address}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Working Hours</h3>
                        <div className="space-y-2">
                            {doctor.workingHours.map((item, index) => (
                                <div key={index} className="flex justify-between text-gray-600">
                                    <span>{item.days}</span>
                                    <span className="font-medium">{item.hours}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="mt-6 w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                            onClick={handleButtonClick}>
                        Book an Appointment
                    </button>
                </div>

                {/* Right - Doctor Details */}
                <div className="md:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Biography</h2>
                        <div className="space-y-3 text-gray-600">
                            {doctor.biography.map((para, index) => (
                                <p key={index}>{para}</p>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Education</h2>
                        <ul className="space-y-2 text-gray-600">
                            {doctor.education.map((degree, index) => (
                                <li key={index} className="flex items-start">
                                    <svg className="w-5 h-5 text-teal-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>{degree}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Specializations</h2>
                        <div className="flex flex-wrap gap-2">
                            {doctor.specializations?.map((spec, index) => (
                                <span key={index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                                    {spec}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorProfile;