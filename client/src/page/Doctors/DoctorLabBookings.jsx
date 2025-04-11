import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchClinicsByDoctor } from '../../features/Clinic/clinicSlice';
import { fetchClinicBookings, updateLabTestStatus, uploadLabTestReport } from '../../features/LabTest/labTestSlice';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const DoctorLabBookings = () => {
    const doctor = localStorage.getItem("doctor") ? JSON.parse(localStorage.getItem("doctor")) : null;
    const doctorId = doctor?._id;
    const dispatch = useDispatch();
    const { doctorClinics, isLoading: clinicLoading } = useSelector((state) => state.clinic);
    const { clinicBookings, isLoading: labTestLoading } = useSelector((state) => state.labTest);

    const [selectedBooking, setSelectedBooking] = useState(null);
    const [statusUpdate, setStatusUpdate] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [uploadingReport, setUploadingReport] = useState(null);

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

    // Fetch doctor's clinics on components mount
    useEffect(() => {
        if (doctorId) {
            dispatch(fetchClinicsByDoctor(doctorId));
        }
    }, [dispatch, doctorId]);

    // Fetch clinic bookings when doctorClinics changes
    useEffect(() => {
        const clinicId = doctorClinics._id;
        if (clinicId) {
            dispatch(fetchClinicBookings(clinicId));
        }
    }, [doctorClinics, dispatch]);

    const handleStatusUpdate = (bookingId) => {
        if (!statusUpdate) {
            toast.error('Please select a status');
            return;
        }

        dispatch(updateLabTestStatus({ bookingId, status: statusUpdate }))
            .unwrap()
            .then(() => {
                setSelectedBooking(null);
                setStatusUpdate('');
                if (doctorClinics && doctorClinics.length > 0) {
                    dispatch(fetchClinicBookings(doctorClinics[0]._id));
                }
            })
            .catch((error) => {
                toast.error(error || 'Failed to update status');
            });
    };

    const handleFileUpload = (bookingId, e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type === 'application/pdf') {
                setUploadingReport(bookingId);
                dispatch(uploadLabTestReport({ bookingId, file }))
                    .unwrap()
                    .then(() => {
                        toast.success('Report uploaded successfully');
                        if (doctorClinics && doctorClinics.length > 0) {
                            dispatch(fetchClinicBookings(doctorClinics[0]._id));
                        }
                    })
                    .catch((error) => {
                        toast.error(error || 'Failed to upload report');
                    })
                    .finally(() => setUploadingReport(null));
            } else {
                toast.error('Please upload a PDF file');
            }
        }
    };

    const formatDate = (dateString) => {
        return format(new Date(dateString), 'MMMM dd, yyyy');
    };

    const formatTime = (timeString) => {
        return format(new Date(`1970-01-01T${timeString}`), 'h:mm a');
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
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
                {status.replace('-', ' ')}
            </span>
        );
    };

    const formatAddress = (clinic) => {
        if (!clinic) return "";
        const { street, city, state, postalCode } = clinic?.address || {};
        return `${street}, ${city}, ${state} ${postalCode}`;
    };

    const formatOperatingHours = (clinic) => {
        if (!clinic) return "";
        const { weekdays, weekends } = clinic.operatingHours || {};
        return `Weekdays: ${weekdays?.open || ''} - ${weekdays?.close || ''} | Weekends: ${weekends?.open || ''} - ${weekends?.close || ''}`;
    };

    if (clinicLoading || labTestLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    const currentClinic = doctorClinics;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Lab Test Bookings</h1>

            {/* Clinic Information */}
            {currentClinic && (
                <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
                    <h4 className="font-medium text-lg mb-2">{currentClinic.name}</h4>
                    <p className="text-gray-600 mb-1">
                        <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        {formatAddress(currentClinic)}
                    </p>
                    <p className="text-gray-600 mb-1">
                        <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {formatOperatingHours(currentClinic)}
                    </p>
                    <div className="mt-2">
                        <span className="text-sm font-medium">Available Slots:</span>
                        <span className="text-sm text-gray-600 ml-2">
                            {currentClinic.appointmentSettings?.slotDuration || 'N/A'} minutes each
                        </span>
                    </div>
                </div>
            )}

            {/* Bookings List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {clinicBookings?.length > 0 ? (
                            clinicBookings.map((booking) => (
                                <tr key={booking._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <button
                                            onClick={() => setSelectedPatient(booking.patient)}
                                            className="text-teal-600 hover:text-teal-800 hover:underline"
                                        >
                                            {booking.patient?.username || 'N/A'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {booking.test?.name || 'N/A'} ({booking.test?.code || 'N/A'})
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {booking.bookingDate ? formatDate(booking.bookingDate) : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {booking.timeSlot?.start ? `${formatTime(booking.timeSlot.start)} - ${formatTime(booking.timeSlot.end)}` : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {booking.status ? getStatusBadge(booking.status) : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {booking.reportFile ? (
                                            <a
                                                href="#"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    forceDownload(booking.reportFile, `lab-report-${booking._id}.pdf`);
                                                }}
                                                className="text-teal-600 hover:text-teal-900 hover:underline"
                                            >
                                                Download
                                            </a>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {booking.status === 'processing' ? (
                                            <label className="cursor-pointer text-teal-600 hover:text-teal-900 inline-flex items-center">
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    className="hidden"
                                                    onChange={(e) => handleFileUpload(booking._id, e)}
                                                />
                                                Upload
                                                {uploadingReport === booking._id && (
                                                    <span className="ml-2 text-xs text-gray-500">Uploading...</span>
                                                )}
                                            </label>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setSelectedBooking(booking);
                                                    setStatusUpdate(booking.status);
                                                }}
                                                className="text-teal-600 hover:text-teal-900"
                                            >
                                                Update Status
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No lab test bookings found for this clinic
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Status Update Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
                     style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center border-b p-4">
                            <h2 className="text-xl font-bold text-gray-800">Update Booking Status</h2>
                            <button
                                onClick={() => {
                                    setSelectedBooking(null);
                                    setStatusUpdate('');
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Patient</p>
                                    <p className="text-gray-900">{selectedBooking.patient?.username || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Test</p>
                                    <p className="text-gray-900">
                                        {selectedBooking.test?.name || 'N/A'} ({selectedBooking.test?.code || 'N/A'})
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Date & Time</p>
                                    <p className="text-gray-900">
                                        {selectedBooking.bookingDate ? formatDate(selectedBooking.bookingDate) : 'N/A'} at {selectedBooking.timeSlot?.start ? formatTime(selectedBooking.timeSlot.start) : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        id="status"
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        value={statusUpdate}
                                        onChange={(e) => setStatusUpdate(e.target.value)}
                                    >
                                        <option value="booked">Booked</option>
                                        <option value="sample-collected">Sample Collected</option>
                                        <option value="processing">Processing</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                {selectedBooking.reportFile && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Report</p>
                                        <a
                                            href={selectedBooking.reportFile}
                                            download={`lab-report-${selectedBooking._id}.pdf`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                window.open(selectedBooking.reportFile, '_blank');
                                            }}
                                            className="text-teal-600 hover:text-teal-900 hover:underline"
                                        >
                                            View Report
                                        </a>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => {
                                        setSelectedBooking(null);
                                        setStatusUpdate('');
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(selectedBooking._id)}
                                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                                >
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Patient Detail Modal */}
            {selectedPatient && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
                     style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center border-b p-4">
                            <h2 className="text-xl font-bold text-gray-800">Patient Details</h2>
                            <button
                                onClick={() => setSelectedPatient(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                          d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Name</p>
                                    <p className="text-gray-900">{selectedPatient.username || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p className="text-gray-900">{selectedPatient.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Phone</p>
                                    <p className="text-gray-900">{selectedPatient.phone || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={() => setSelectedPatient(null)}
                                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorLabBookings;