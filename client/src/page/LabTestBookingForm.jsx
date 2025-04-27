import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { bookLabTest } from '../features/LabTest/LabtestSlice.js';
import {fetchClinics, fetchAvailableSlots, clearAvailableSlots } from '../features/Clinic/ClinicSlice.js';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const LabTestBookingForm = () => {
    const { testId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Get data from Redux store
    const { clinics, availableSlots, isLoading: clinicLoading } = useSelector((state) => state.clinic);
    const { user } = useSelector((state) => state.auth);

    // Form state
    const [formData, setFormData] = useState({
        testId: testId,
        clinicId: '',
        bookingDate: new Date(),
        timeSlot: { start: '', end: '' },
        notes: { patientNotes: '' }
    });
    // Fetch clinics on components mount
    useEffect(() => {
        dispatch(fetchClinics());
    }, [dispatch]);

    // Fetch available slots when clinic or date changes
    useEffect(() => {
        if (formData.clinicId && formData.bookingDate) {
            const dateStr = formData.bookingDate.toISOString().split('T')[0];
            dispatch(fetchAvailableSlots({
                clinicId: formData.clinicId,
                date: dateStr
            }));
        } else {
            dispatch(clearAvailableSlots());
        }
    }, [formData.clinicId, formData.bookingDate, dispatch]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.clinicId) {
            toast.error('Please select a clinic');
            return;
        }

        if (!formData.timeSlot.start) {
            toast.error('Please select a time slot');
            return;
        }

        const bookingData = {
            testId: formData.testId,
            clinicId: formData.clinicId,
            bookingDate: formData.bookingDate.toISOString().split('T')[0],
            timeSlot: formData.timeSlot,
            notes: formData.notes
        };

        try {
            await dispatch(bookLabTest(bookingData)).unwrap();
            // toast.success('Lab test booked successfully!');
            navigate('/my-bookings');
        } catch (error) {
            // toast.error(error.message || 'Failed to book test');
        }
    };

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'clinicId') {
            setFormData({
                ...formData,
                clinicId: value,
                timeSlot: { start: '', end: '' }
            });
        } else if (name === 'timeSlot') {
            const selectedSlot = availableSlots.find(slot => slot.start === value);
            setFormData({ ...formData, timeSlot: selectedSlot });
        } else if (name === 'patientNotes') {
            setFormData({
                ...formData,
                notes: { ...formData.notes, patientNotes: value }
            });
        }
    };

    // Handle date change
    const handleDateChange = (date) => {
        setFormData({
            ...formData,
            bookingDate: date,
            timeSlot: { start: '', end: '' }
        });
    };

    // Filter out past time slots for the current day
    const getAvailableTimeSlots = () => {
        if (!availableSlots || availableSlots.length === 0) return [];

        const today = new Date();
        const isToday = formData.bookingDate.toDateString() === today.toDateString();

        if (!isToday) return availableSlots;

        const currentHour = today.getHours();
        const currentMinute = today.getMinutes();

        return availableSlots.filter(slot => {
            const [hour, minute] = slot.start.split(':').map(Number);
            return hour > currentHour || (hour === currentHour && minute > currentMinute);
        });
    };

    const filteredSlots = getAvailableTimeSlots();

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Book Lab Test</h2>

            <form onSubmit={handleSubmit}>
                {/* Clinic Selection */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="clinicId">
                        Select Clinic
                    </label>
                    {clinicLoading ? (
                        <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
                    ) : (
                        <select
                            id="clinicId"
                            name="clinicId"
                            value={formData.clinicId}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                            required
                        >
                            <option value="">-- Select a clinic --</option>
                            {clinics.map((clinic) => (
                                <option key={clinic._id} value={clinic._id}>
                                    {clinic.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Date Picker */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2">
                        Booking Date
                    </label>
                    <DatePicker
                        selected={formData.bookingDate}
                        onChange={handleDateChange}
                        minDate={new Date()}
                        filterDate={(date) => {
                            // Only allow weekdays (Monday to Friday)
                            const day = date.getDay();
                            return day !== 0 && day !== 6;
                        }}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                    />
                </div>

                {/* Time Slot Selection */}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="timeSlot">
                        Time Slot {formData.clinicId && filteredSlots.length === 0 && (
                        <span className="text-sm text-red-500 ml-2">No available slots for this date</span>
                    )}
                    </label>
                    {formData.clinicId ? (
                        filteredSlots.length > 0 ? (
                            <select
                                id="timeSlot"
                                name="timeSlot"
                                value={formData.timeSlot.start}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                                required
                                disabled={filteredSlots.length === 0}
                            >
                                <option value="">-- Select a time slot --</option>
                                {filteredSlots.map((slot, index) => (
                                    <option key={index} value={slot.start}>
                                        {slot.start} - {slot.end}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <div className="text-sm text-gray-500 p-2 bg-gray-100 rounded">
                                No available time slots for the selected date. Please choose another date.
                            </div>
                        )
                    ) : (
                        <div className="text-sm text-gray-500 p-2 bg-gray-100 rounded">
                            Please select a clinic first to see available time slots
                        </div>
                    )}
                </div>

                {/* Patient Notes */}
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2" htmlFor="patientNotes">
                        Additional Notes (Optional)
                    </label>
                    <textarea
                        id="patientNotes"
                        name="patientNotes"
                        value={formData.notes.patientNotes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Any special instructions or notes..."
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-teal-600 text-white py-2 px-4 rounded hover:bg-teal-700 transition duration-200 disabled:opacity-50"
                    disabled={!formData.clinicId || !formData.timeSlot.start || clinicLoading}
                >
                    {clinicLoading ? 'Processing...' : 'Confirm Booking'}
                </button>
            </form>
        </div>
    );
};

export default LabTestBookingForm;