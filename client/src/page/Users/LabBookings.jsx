import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMyBookings } from '../../features/Labtest/LabtestSlice.js'
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const LabBookings = () => {
    const dispatch = useDispatch();
    const { myBookings, isLoading, isError, message } = useSelector((state) => state.labTest);
    const [activeTab, setActiveTab] = useState('upcoming');
    const [expandedBooking, setExpandedBooking] = useState(null);

    useEffect(() => {
        dispatch(fetchMyBookings());
    }, [dispatch]);

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
    }, [isError, message]);

    const formatDate = (dateString) => {
        return format(new Date(dateString), 'MMMM dd, yyyy');
    };

    const formatTime = (timeString) => {
        return format(new Date(`1970-01-01T${timeString}`), 'h:mm a');
    };

    const forceDownload = (url, filename) => {
        fetch(url)
            .then((res) => res.blob())
            .then((blob) => {
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(blobUrl); // cleanup
            })
            .catch(() => {
                toast.error("Failed to download the report.");
            });
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            booked: 'bg-blue-100 text-blue-800',
            'sample-collected': 'bg-purple-100 text-purple-800',
            processing: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
                {status.replace('-', ' ')}
            </span>
        );
    };

    const getPaymentBadge = (status) => {
        const statusClasses = {
            pending: 'bg-orange-100 text-orange-800',
            paid: 'bg-green-100 text-green-800',
            refunded: 'bg-gray-100 text-gray-800',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
                {status}
            </span>
        );
    };

    const filteredBookings = myBookings?.filter(booking => {
        const now = new Date();
        const bookingDate = new Date(booking.bookingDate);

        if (activeTab === 'upcoming') {
            return booking.status !== 'completed' && booking.status !== 'cancelled' && bookingDate >= now;
        } else if (activeTab === 'past') {
            return booking.status === 'completed' || booking.status === 'cancelled' || bookingDate < now;
        }
        return true;
    });

    const toggleExpand = (id) => {
        setExpandedBooking(expandedBooking === id ? null : id);
    };

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">My Lab Test Bookings</h1>

            {/* Status Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    className={`py-2 px-4 font-medium text-sm ${activeTab === 'upcoming' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    Upcoming Tests
                </button>
                <button
                    className={`py-2 px-4 font-medium text-sm ${activeTab === 'past' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('past')}
                >
                    Past Tests
                </button>
            </div>

            {filteredBookings?.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-500">
                        {activeTab === 'upcoming'
                            ? "You don't have any upcoming lab tests scheduled."
                            : "You don't have any past lab test records."}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredBookings?.map((booking) => (
                        <div key={booking._id} className="bg-white rounded-lg shadow overflow-hidden">
                            <div
                                className="p-4 cursor-pointer flex justify-between items-center"
                                onClick={() => toggleExpand(booking._id)}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="bg-teal-100 text-teal-800 p-3 rounded-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">{booking.test.name}</h3>
                                        <p className="text-sm text-gray-500">
                                            {formatDate(booking.bookingDate)} • {formatTime(booking.timeSlot.start)} - {formatTime(booking.timeSlot.end)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    {getStatusBadge(booking.status)}
                                    {/*{getPaymentBadge(booking.paymentStatus)}*/}
                                    <svg
                                        className={`h-5 w-5 text-gray-400 transform transition-transform ${expandedBooking === booking._id ? 'rotate-180' : ''}`}
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>

                            {expandedBooking === booking._id && (
                                <div className="border-t border-gray-200 p-4 bg-gray-50">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Test Details</h4>
                                            <div className="space-y-2">
                                                <p className="text-sm">
                                                    <span className="font-medium">Test Code:</span> {booking.test.code}
                                                </p>
                                                <p className="text-sm">
                                                    <span className="font-medium">Price:</span> ₹{booking.test.price}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-500 mb-2">Clinic Details</h4>
                                            <div className="space-y-2">
                                                <p className="text-sm">{booking.clinic.name}</p>
                                                <p className="text-sm">
                                                    {booking.clinic.address.street}, {booking.clinic.address.city}, {booking.clinic.address.state} {booking.clinic.address.postalCode}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {booking.status === 'completed' && booking.reportFile && (
                                        <div className="mt-4">
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    forceDownload(booking.reportFile, `lab-report-${booking._id}.pdf`);
                                                }}
                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download Report
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LabBookings;