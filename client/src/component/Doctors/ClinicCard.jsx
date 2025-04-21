import React from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaCalendarAlt, FaClinicMedical } from 'react-icons/fa';

const ClinicCard = ({ clinic }) => {

    return (
        <div className="w-96 bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
            <div className="p-6">
                <div className="flex items-center mb-4">
                    <FaClinicMedical className="text-teal-500 text-2xl mr-3" />
                    <h3 className="text-xl font-bold text-gray-800">{clinic.name}</h3>
                </div>

                {/* Facilities */}
                <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                        {clinic.facilities.map((facility, index) => (
                            <span key={index} className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded">
                                {facility}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Address */}
                <div className="flex items-start mb-3">
                    <FaMapMarkerAlt className="text-teal-500 mt-1 mr-2" />
                    <div>
                        <p className="text-gray-700">{clinic.address.street}</p>
                        <p className="text-gray-700">{clinic.address.city}, {clinic.address.state} {clinic.address.postalCode}</p>
                        <p className="text-gray-700">{clinic.address.country}</p>
                    </div>
                </div>

                {/* Contact */}
                <div className="flex items-center mb-3">
                    <FaPhone className="text-teal-500 mr-2" />
                    <p className="text-gray-700">{clinic.contact.phone}</p>
                </div>

                <div className="flex items-center mb-4">
                    <FaEnvelope className="text-teal-500 mr-2" />
                    <p className="text-gray-700">{clinic.contact.email}</p>
                </div>

                {/* Hours */}
                <div className="mb-5">
                    <div className="flex items-start">
                        <FaClock className="text-teal-500 mt-1 mr-2" />
                        <div>
                            <p className="font-medium text-gray-800">Operating Hours:</p>
                            <p className="text-gray-700">Weekdays: {clinic.operatingHours.weekdays.open} - {clinic.operatingHours.weekdays.close}</p>
                            <p className="text-gray-700">Weekends: {clinic.operatingHours.weekends.open} - {clinic.operatingHours.weekends.close}</p>
                        </div>
                    </div>
                </div>

                {/* Appointment Button */}
                <Link
                    to={`/appointment/${clinic?.doctors[0]._id}`}
                    className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                >
                    <FaCalendarAlt className="mr-2" />
                    Book Appointment
                </Link>
            </div>
        </div>
    );
};

export default ClinicCard;