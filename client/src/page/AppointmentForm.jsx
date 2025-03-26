import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Doctors } from "../assets/DoctorData";

const AppointmentForm = () => {
    const { doctorId } = useParams();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        phone: "",
        email: "",
        dob: "",
        slot: "",
        emergencyContact: "",
        bloodGroup: "",
        age: "",
        gender: "",
        willingToDonate: false,
        allergies: ["", "", ""],
        services: [],
    });

    useEffect(() => {
        // Find doctor by ID
        const foundDoctor = Doctors.find(d => d.id === parseInt(doctorId));
        if (foundDoctor) {
            setDoctor(foundDoctor);
        }
        setLoading(false);
    }, [doctorId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === "checkbox" && name === "services") {
            setFormData((prev) => ({
                ...prev,
                services: checked
                    ? [...prev.services, value]
                    : prev.services.filter((s) => s !== value),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: type === "checkbox" ? checked : value,
            }));
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-6 py-8 bg-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="container mx-auto px-6 py-8 bg-white text-center">
                <h1 className="text-2xl font-bold text-gray-800">Doctor not found</h1>
                <p className="text-gray-600 mt-2">The requested doctor profile does not exist</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-8 bg-white">
            <div className="grid md:grid-cols-3 gap-8">
                {/* Left - Appointment Form */}
                <div className="md:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800">Appointment with {doctor.name}</h2>
                    <p className="text-gray-600">
                        Please fill out the form below to schedule an appointment with {doctor.specialty}.
                    </p>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <input type="text" name="firstName" placeholder="Your First Name"
                               className="p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                               onChange={handleChange}/>
                        <input type="text" name="lastName" placeholder="Your Last Name"
                               className="p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                               onChange={handleChange}/>
                        <input type="text" name="address" placeholder="Full Address"
                               className="p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                               onChange={handleChange}/>
                        <input type="text" name="city" placeholder="City"
                               className="p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                               onChange={handleChange}/>
                        <input type="text" name="phone" placeholder="Your Phone Number"
                               className="p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                               onChange={handleChange}/>
                        <input type="email" name="email" placeholder="Your Email ID"
                               className="p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                               onChange={handleChange}/>
                        <input type="date" name="dob"
                               className="p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                               onChange={handleChange}/>
                        <input type="text" name="slot" placeholder="Select Slot"
                               className="p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                               onChange={handleChange}/>
                    </div>

                    <div className="mt-4 bg-gray-50 p-4 rounded-md border border-gray-200">
                        <h3 className="text-lg font-medium text-gray-800">Emergency Details</h3>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                            <input type="text" name="emergencyContact" placeholder="Contact Person"
                                   className="p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                   onChange={handleChange}/>
                            <input type="text" name="bloodGroup" placeholder="Blood Group"
                                   className="p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                   onChange={handleChange}/>
                            <input type="text" name="age" placeholder="Age"
                                   className="p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
                                   onChange={handleChange}/>
                        </div>
                        <div className="flex items-center mt-3">
                            <input type="checkbox" name="willingToDonate"
                                   className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                   onChange={handleChange}/>
                            <label className="ml-2 text-gray-700">Willing to Donate Blood</label>
                        </div>
                        <div className="flex items-center mt-3">
                            <label className="mr-3 text-gray-700">Select Gender:</label>
                            <div className="flex items-center">
                                <input type="radio" name="gender" value="Male"
                                       className="h-4 w-4 text-teal-600 focus:ring-teal-500" onChange={handleChange}/>
                                <label className="ml-2 mr-4 text-gray-700">Male</label>
                            </div>
                            <div className="flex items-center">
                                <input type="radio" name="gender" value="Female"
                                       className="h-4 w-4 text-teal-600 focus:ring-teal-500" onChange={handleChange}/>
                                <label className="ml-2 text-gray-700">Female</label>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-800">Allergy History</h3>
                            {formData.allergies.map((_, i) => (
                                <input key={i} type="text" placeholder={`Allergy ${i + 1}`}
                                       className="p-2 border border-gray-300 rounded-md mt-2 w-full focus:ring-teal-500 focus:border-teal-500"/>
                            ))}
                        </div>
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-800">Services Needed</h3>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {["Blood pressure check", "RBC count check", "Bone marrow", "Joint lubrication", "Eye sight checkup", "Liver profile"].map((service, i) => (
                                    <div key={i} className="flex items-center">
                                        <input type="checkbox" name="services" value={service}
                                               className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                               onChange={handleChange}/>
                                        <label className="ml-2 text-gray-700">{service}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        className="bg-teal-600 hover:bg-teal-700 px-6 py-3 rounded-lg mt-6 text-white font-medium transition-colors">
                        📩 Book Appointment
                    </button>
                </div>

                {/* Right - Doctor Profile */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <img src={doctor.image} alt={doctor.name} className="rounded-lg w-full h-64 object-cover"/>
                    <h2 className="text-2xl font-bold mt-4 text-gray-800">{doctor.name}</h2>
                    <p className="text-teal-600">{doctor.specialty}</p>

                    <div className="mt-6">
                        <h3 className="text-lg font-bold text-gray-800">Contact Info</h3>
                        <div className="mt-2 space-y-2 text-gray-600">
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
                        <h3 className="text-lg font-bold text-gray-800">Working Hours</h3>
                        <div className="mt-2 space-y-2">
                            {doctor.workingHours.map((item, index) => (
                                <div key={index} className="flex justify-between text-gray-600">
                                    <span>{item.days}</span>
                                    <span className="font-medium">{item.hours}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </button>
                        <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20 4a2 2 0 0 0-2-2h-2V0h-2v2h-2V0h-2v2h-2V0H8v2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4zm-6 14h-4v-2h4v2zm4-4H6V6h12v8z" />
                            </svg>
                        </button>
                        <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12.713l-11.985-9.713h23.97l-11.985 9.713zm0 2.574l-12-9.725v15.438h24v-15.438l-12 9.725z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentForm;