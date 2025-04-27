import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getMyAppointments } from "../../features/Appointment/AppointmentSlice.js";
import { toast } from "react-toastify";
import { format, isAfter, isBefore } from "date-fns";

const Appointments = () => {
    const dispatch = useDispatch();
    const { myAppointments, isLoading, isError, message } = useSelector(
        (state) => state.appointment
    );
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [activeTab, setActiveTab] = useState("upcoming");

    // console.log(myAppointments)

    useEffect(() => {
        dispatch(getMyAppointments());
    }, [dispatch]);

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
    }, [isError, message]);

    const formatDate = (dateString) => {
        return format(new Date(dateString), "MMMM dd, yyyy");
    };

    const formatTime = (timeString) => {
        return format(new Date(`1970-01-01T${timeString}`), "h:mm a");
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            pending: "bg-yellow-100 text-yellow-800",
            confirmed: "bg-blue-100 text-blue-800",
            completed: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800",
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || "bg-gray-100 text-gray-800"}`}>
                {status}
            </span>
        );
    };

    const openAppointmentDetails = (appointment) => {
        setSelectedAppointment(appointment);
    };

    const openClinicDetails = (clinic) => {
        setSelectedClinic(clinic);
    };

    const closeModal = () => {
        setSelectedAppointment(null);
        setSelectedClinic(null);
    };

    // Filter appointments based on active tab
    const filteredAppointments = [...myAppointments]
        .sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        }).filter((appointment) => {
        const now = new Date();
        const appointmentDate = new Date(appointment.date);

        if (activeTab === "upcoming") {
            return isAfter(appointmentDate, now) || isToday(appointmentDate);
        } else {
            return isBefore(appointmentDate, now) && !isToday(appointmentDate);
        }
    });

    function isToday(date) {
        return format(new Date(date), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
    }

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Appointments</h2>
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Your Appointments</h2>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-4">
                <button
                    className={`py-2 px-4 font-medium text-sm ${activeTab === "upcoming" ? "text-teal-600 border-b-2 border-teal-600" : "text-gray-500"}`}
                    onClick={() => setActiveTab("upcoming")}
                >
                    Upcoming
                </button>
                <button
                    className={`py-2 px-4 font-medium text-sm ${activeTab === "past" ? "text-teal-600 border-b-2 border-teal-600" : "text-gray-500"}`}
                    onClick={() => setActiveTab("past")}
                >
                    Past
                </button>
            </div>

            {filteredAppointments.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">
                        {activeTab === "upcoming"
                            ? "You don't have any upcoming appointments."
                            : "You don't have any past appointments."}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clinic</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {filteredAppointments.map((appointment) => (
                                <tr
                                    key={appointment._id}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() => openAppointmentDetails(appointment)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(appointment.date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatTime(appointment.timeSlot.start)} - {formatTime(appointment.timeSlot.end)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center">
                                            {appointment.doctor?.image && (
                                                <img
                                                    src={appointment.doctor.image}
                                                    alt={appointment.doctor.name}
                                                    className="w-8 h-8 rounded-full mr-2"
                                                />
                                            )}
                                            {appointment.doctor?.name || "N/A"}
                                        </div>
                                    </td>
                                    <td
                                        className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openClinicDetails(appointment.clinic);
                                        }}
                                    >
                                        {appointment.clinic?.name || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {appointment.type === 'in-person' ? 'In-Person' : 'Teleconsultation'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {getStatusBadge(appointment.status)}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Appointment Details Modal */}
            {selectedAppointment && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{backgroundColor: 'rgba(61,61,61,0.8)'}}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b p-4">
                            <h2 className="text-xl font-bold text-gray-800">Appointment Details</h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Date</p>
                                    <p className="text-gray-900">{formatDate(selectedAppointment.date)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Time Slot</p>
                                    <p className="text-gray-900">
                                        {formatTime(selectedAppointment.timeSlot.start)} - {formatTime(selectedAppointment.timeSlot.end)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <p className="text-gray-900">{getStatusBadge(selectedAppointment.status)}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Appointment Type</p>
                                    <p className="text-gray-900">
                                        {selectedAppointment.type === 'in-person' ? 'In-Person' : 'Teleconsultation'}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-medium text-gray-700 mb-2">Doctor Information</h3>
                                <div className="flex items-center space-x-4">
                                    {selectedAppointment.doctor?.image && (
                                        <img
                                            src={selectedAppointment.doctor.image}
                                            alt={selectedAppointment.doctor.name}
                                            className="w-16 h-16 rounded-full"
                                        />
                                    )}
                                    <div>
                                        <p className="font-medium">{selectedAppointment.doctor?.name}</p>
                                        <p className="text-gray-600">{selectedAppointment.doctor?.specialty}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-medium text-gray-700 mb-2">Clinic Information</h3>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium">{selectedAppointment.clinic?.name}</p>
                                        <p className="text-gray-600">
                                            {selectedAppointment.clinic?.address.street}, {selectedAppointment.clinic?.address.city}<br />
                                            {selectedAppointment.clinic?.address.state}, {selectedAppointment.clinic?.address.postalCode}<br />
                                            {selectedAppointment.clinic?.address.country}
                                        </p>
                                        <p className="text-gray-600 mt-2">
                                            <span className="font-medium">Contact:</span> {selectedAppointment.clinic?.contact.phone} | {selectedAppointment.clinic?.contact.email}
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openClinicDetails(selectedAppointment.clinic);
                                        }}
                                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                                    >
                                        View Full Details
                                    </button>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-medium text-gray-700 mb-2">Reason for Visit</h3>
                                <p className="text-gray-900">{selectedAppointment.reason}</p>
                            </div>

                            {selectedAppointment.notes?.doctorNotes && (
                                <div className="border-t pt-4">
                                    <h3 className="font-medium text-gray-700 mb-2">Doctor's Notes</h3>
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="text-gray-900">{selectedAppointment.notes.doctorNotes}</p>
                                    </div>
                                </div>
                            )}

                            <div className="border-t pt-4">
                                <h3 className="font-medium text-gray-700 mb-2">Payment Status</h3>
                                <p className="text-gray-900 capitalize">
                                    {selectedAppointment.payment?.status || 'Not specified'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Clinic Details Modal */}
            {selectedClinic && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{backgroundColor: 'rgba(61,61,61,0.8)'}}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b p-4">
                            <h2 className="text-xl font-bold text-gray-800">Clinic Details</h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-800">{selectedClinic.name}</h3>
                                    <div className="mt-2 space-y-2">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Address</p>
                                            <p className="text-gray-900">
                                                {selectedClinic.address.street}, {selectedClinic.address.city}<br />
                                                {selectedClinic.address.state}, {selectedClinic.address.postalCode}<br />
                                                {selectedClinic.address.country}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Contact</p>
                                            <p className="text-gray-900">
                                                Phone: {selectedClinic.contact.phone}<br />
                                                Email: {selectedClinic.contact.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-medium text-gray-700 mb-2">Operating Hours</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Weekdays</p>
                                        <p className="text-gray-900">
                                            {formatTime(selectedClinic.operatingHours.weekdays.open)} - {formatTime(selectedClinic.operatingHours.weekdays.close)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Weekends</p>
                                        <p className="text-gray-900">
                                            {formatTime(selectedClinic.operatingHours.weekends.open)} - {formatTime(selectedClinic.operatingHours.weekends.close)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Appointments;