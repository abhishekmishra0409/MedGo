import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    getDoctorAppointments,
    updateAppointmentStatus,
    cancelAppointment,
    completeAppointment
} from "../../features/Appointment/AppointmentSlice.js";
import { toast } from "react-toastify";
import { format } from "date-fns";

const DoctorsAppointments = () => {
    const dispatch = useDispatch();
    const { doctorAppointments, isLoading, isError, message } = useSelector(
        (state) => state.appointment
    );
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [status, setStatus] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");
    const [notes, setNotes] = useState("");
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    useEffect(() => {
        dispatch(getDoctorAppointments());
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

    const getPaymentStatusBadge = (status) => {
        const statusClasses = {
            pending: "bg-yellow-100 text-yellow-800",
            paid: "bg-green-100 text-green-800",
            failed: "bg-red-100 text-red-800",
            refunded: "bg-purple-100 text-purple-800",
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || "bg-gray-100 text-gray-800"}`}>
                {status}
            </span>
        );
    };

    const handleEditClick = (appointment) => {
        setEditingAppointment(appointment);
        setStatus(appointment.status);
        setPaymentStatus(appointment.payment?.status || 'pending');
        setNotes(appointment.notes?.doctorNotes || "");
        setShowUpdateModal(true);
    };

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
    };

    const handlePaymentStatusChange = (e) => {
        setPaymentStatus(e.target.value);
    };

    const handleNotesChange = (e) => {
        setNotes(e.target.value);
    };

    const handleStatusUpdate = () => {
        if (!status) {
            toast.error("Please select a status");
            return;
        }

        const updateData = {
            appointmentId: editingAppointment._id,
            status,
            notes,
            paymentStatus
        };

        let action;
        if (status === 'cancelled') {
            action = cancelAppointment({ appointmentId: editingAppointment._id, notes });
        } else if (status === 'completed') {
            action = completeAppointment({
                appointmentId: editingAppointment._id,
                notes,
                paymentStatus
            });
        } else {
            action = updateAppointmentStatus(updateData);
        }

        dispatch(action)
            .unwrap()
            .then(() => {
                // toast.success("Appointment updated successfully");
                setShowUpdateModal(false);
                setEditingAppointment(null);
                dispatch(getDoctorAppointments());
            })
            .catch((error) => {
                // toast.error(error.message || "Failed to update appointment");
            });
    };

    const handlePatientClick = (patient) => {
        setSelectedPatient(patient);
        setShowPatientModal(true);
    };

    const closePatientModal = () => {
        setShowPatientModal(false);
        setSelectedPatient(null);
    };

    const closeUpdateModal = () => {
        setShowUpdateModal(false);
        setEditingAppointment(null);
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
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

            {doctorAppointments.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">You don't have any appointments yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clinic</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {doctorAppointments.map((appointment) => (
                                <tr key={appointment._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <button
                                            onClick={() => handlePatientClick(appointment.patient)}
                                            className="text-indigo-600 hover:text-indigo-900 hover:underline"
                                        >
                                            {appointment.patient?.username || "N/A"}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatDate(appointment.date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatTime(appointment.timeSlot.start)} - {formatTime(appointment.timeSlot.end)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {appointment.clinic?.name || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {appointment.type === 'in-person' ? 'In-Person' : 'Teleconsultation'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {getStatusBadge(appointment.status)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {getPaymentStatusBadge(appointment.payment?.status || 'pending')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <button
                                            onClick={() => handleEditClick(appointment)}
                                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                                        >
                                            Update
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Patient Details Modal */}
            {showPatientModal && selectedPatient && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
                     style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center border-b p-4">
                            <h3 className="text-xl font-bold text-gray-800">Patient Details</h3>
                            <button
                                onClick={closePatientModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Full Name</p>
                                <p className="text-gray-900">{selectedPatient.username}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Email</p>
                                <p className="text-gray-900">{selectedPatient.email}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Phone</p>
                                <p className="text-gray-900">{selectedPatient.phone}</p>
                            </div>
                            <div className="pt-4">
                                <button
                                    onClick={closePatientModal}
                                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Appointment Modal */}
            {showUpdateModal && editingAppointment && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
                     style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
                        <div className="flex justify-between items-center border-b p-4">
                            <h2 className="text-xl font-bold text-gray-800">Update Appointment</h2>
                            <button
                                onClick={closeUpdateModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Patient</p>
                                    <p className="text-gray-900">{editingAppointment.patient?.username || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Date & Time</p>
                                    <p className="text-gray-900">
                                        {formatDate(editingAppointment.date)} at {formatTime(editingAppointment.timeSlot.start)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Clinic</p>
                                    <p className="text-gray-900">{editingAppointment.clinic?.name || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Type</p>
                                    <p className="text-gray-900">
                                        {editingAppointment.type === 'in-person' ? 'In-Person' : 'Teleconsultation'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Appointment Status
                                    </label>
                                    <select
                                        value={status}
                                        onChange={handleStatusChange}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Payment Status
                                    </label>
                                    <select
                                        value={paymentStatus}
                                        onChange={handlePaymentStatusChange}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                        <option value="failed">Failed</option>
                                        <option value="refunded">Refunded</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Doctor Notes
                                </label>
                                <textarea
                                    rows={4}
                                    value={notes}
                                    onChange={handleNotesChange}
                                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                                    placeholder="Add your notes here..."
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={closeUpdateModal}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleStatusUpdate}
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorsAppointments;