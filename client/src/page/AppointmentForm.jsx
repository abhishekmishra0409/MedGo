import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchDoctorById } from "../features/Doctor/DoctorSlice";
import { fetchClinicsByDoctor } from "../features/Clinic/ClinicSlice";
import { checkAvailability, bookAppointment } from "../features/Appointment/AppointmentSlice";
import { toast } from "react-toastify";

const AppointmentForm = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get data from Redux store
    const { doctor, isLoading: doctorLoading } = useSelector((state) => state.doctor);
    const { doctorClinics, isLoading: clinicLoading } = useSelector((state) => state.clinic);

    const {
        isAvailable,
        isLoading: availabilityLoading,
        isSuccess: availabilitySuccess,
        isError: availabilityError,
        message: availabilityMessage
    } = useSelector((state) => state.appointment);

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        date: "",
        timeSlot: { start: "", end: "" },
        type: "in-person",
        reason: ""
    });
    const [timeSlots, setTimeSlots] = useState([]);
    const [selectedDayType, setSelectedDayType] = useState("weekdays");

    useEffect(() => {
        // Fetch doctor and clinics when components mounts
        dispatch(fetchDoctorById(doctorId));
        dispatch(fetchClinicsByDoctor(doctorId));
    }, [dispatch, doctorId]);

    useEffect(() => {
        if (doctorClinics) {
            setFormData(prev => ({...prev, clinic: doctorClinics}));
        }
    }, [doctorClinics]);

    useEffect(() => {
        if (formData.date) {
            const date = new Date(formData.date);
            const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
            setSelectedDayType(dayOfWeek === 0 || dayOfWeek === 6 ? "weekends" : "weekdays");
        }
    }, [formData.date]);

    useEffect(() => {
        if (doctorClinics && formData.date) {
            generateTimeSlots();
        }
    }, [formData.date, doctorClinics, selectedDayType]);

    // Automatically proceed to step 2 when availability is confirmed
    useEffect(() => {
        if (availabilitySuccess && isAvailable) {
            setStep(2);
        }
    }, [availabilitySuccess, isAvailable]);

    const generateTimeSlots = () => {
        if (!doctorClinics || !doctorClinics.operatingHours || !doctorClinics.appointmentSettings) {
            console.log("Clinic data not loaded yet");
            setTimeSlots([]);
            return;
        }

        const slotDuration = doctorClinics.appointmentSettings.slotDuration || 30;
        const operatingHours = doctorClinics.operatingHours[selectedDayType];

        if (!operatingHours || !operatingHours.open || !operatingHours.close) {
            console.log("No operating hours for", selectedDayType);
            setTimeSlots([]);
            return;
        }

        const [openHour, openMinute] = operatingHours.open.split(':').map(Number);
        const [closeHour, closeMinute] = operatingHours.close.split(':').map(Number);

        const startTime = new Date();
        startTime.setHours(openHour, openMinute, 0, 0);

        const endTime = new Date();
        endTime.setHours(closeHour, closeMinute, 0, 0);

        const slots = [];
        let currentTime = new Date(startTime);

        while (currentTime < endTime) {
            const slotStart = new Date(currentTime);
            const slotEnd = new Date(currentTime);
            slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

            if (slotEnd > endTime) break;

            const formatTime = (date) => {
                const hours = date.getHours().toString().padStart(2, '0');
                const minutes = date.getMinutes().toString().padStart(2, '0');
                return `${hours}:${minutes}`;
            };

            slots.push({
                start: formatTime(slotStart),
                end: formatTime(slotEnd),
                display: `${formatTime(slotStart)} - ${formatTime(slotEnd)}`
            });

            currentTime = new Date(slotEnd);
        }

        setTimeSlots(slots);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTimeSlotSelect = (slot) => {
        setFormData(prev => ({
            ...prev,
            timeSlot: {
                start: slot.start,
                end: slot.end
            }
        }));
    };

    const handleCheckAvailability = () => {
        if (!formData.date || !formData.timeSlot.start || !formData.timeSlot.end) {
            toast.error("Please select date and time slot");
            return;
        }

        dispatch(checkAvailability({
            doctor: doctorId,
            date: formData.date,
            timeSlot: {
                start: formData.timeSlot.start,
                end: formData.timeSlot.end
            }
        }));


    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.reason || formData.reason.length < 10) {
            toast.error("Please provide a detailed reason (at least 10 characters)");
            return;
        }

        const appointmentData = {
            doctor: doctorId,
            date: formData.date,
            timeSlot: {
                start: formData.timeSlot.start,
                end: formData.timeSlot.end
            },
            type: formData.type,
            clinic: formData.type === 'in-person' ? doctorClinics?._id : null,
            reason: formData.reason
        };

        console.log(appointmentData)

        dispatch(bookAppointment(appointmentData))
            .unwrap()
            .then(() => {
                // toast.success("Appointment booked successfully!");
                navigate("/user/appointments");
            })
            .catch((error) => {
                // toast.error(error || "Failed to book appointment");
            });
    };

    const formatAddress = (clinic) => {
        if (!clinic) return "";
        const { street, city, state, postalCode } = clinic.address;
        return `${street}, ${city}, ${state} ${postalCode}`;
    };

    const formatOperatingHours = (clinic) => {
        if (!clinic) return "";
        const { weekdays, weekends } = clinic.operatingHours;
        return `Weekdays: ${weekdays.open} - ${weekdays.close} | Weekends: ${weekends.open} - ${weekends.close}`;
    };

    if (doctorLoading || clinicLoading) {
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
        <div className="container mx-auto px-32 py-8 bg-white">
            <div className="grid md:grid-cols-3 gap-8">
                {/* Left - Appointment Form */}
                <div className="md:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Appointment with {doctor.name}</h2>

                    {/* Step 1: Check Availability */}
                    {step === 1 && (
                        <div>
                            {/* Show clinic info at the top */}
                            {doctorClinics && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
                                    <h4 className="font-medium text-lg mb-2">{doctorClinics.name}</h4>
                                    <p className="text-gray-600 mb-1">
                                        <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {formatAddress(doctorClinics)}
                                    </p>
                                    <p className="text-gray-600 mb-1">
                                        <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {formatOperatingHours(doctorClinics)}
                                    </p>
                                    <div className="mt-2">
                                        <span className="text-sm font-medium">Available Slots:</span>
                                        <span className="text-sm text-gray-600 ml-2">
                        {doctorClinics.appointmentSettings.slotDuration} minutes each
                    </span>
                                    </div>
                                </div>
                            )}
                            <h3 className="text-xl font-semibold mb-4">1. Select Date & Time</h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        value={formData.date}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                                    {formData.date ? (
                                        timeSlots.length > 0 ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                {timeSlots.map((slot, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        className={`p-2 border rounded-md text-sm ${
                                                            formData.timeSlot.start === slot.start
                                                                ? 'bg-teal-100 border-teal-500 text-teal-800'
                                                                : 'border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                        onClick={() => handleTimeSlotSelect(slot)}
                                                    >
                                                        {slot.display}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">
                                                No available slots for selected date.
                                                Clinic {selectedDayType === 'weekdays' ? 'weekdays' : 'weekends'} hours: {doctorClinics.operatingHours[selectedDayType]?.open} - {doctorClinics.operatingHours[selectedDayType]?.close}
                                                {/*{console.log(doctorClinics.operatingHours[selectedDayType]?.close - doctorClinics.operatingHours[selectedDayType]?.open)}*/}
                                                {/*{console.log(selectedDayType)}*/}
                                            </p>
                                        )
                                    ) : (
                                        <p className="text-sm text-gray-500">Please select a date first</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                                    onClick={handleCheckAvailability}
                                    disabled={availabilityLoading || !formData.timeSlot.start}
                                >
                                    {availabilityLoading ? "Checking..." : "Check Availability"}
                                </button>
                            </div>

                            {availabilityError && (
                                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                                    {availabilityMessage}
                                </div>
                            )}

                            {availabilitySuccess && !isAvailable && (
                                <div className="mt-4 p-3 bg-yellow-100 text-yellow-700 rounded-md">
                                    This slot is not available. Please choose a different time.
                                </div>
                            )}

                            {availabilitySuccess && isAvailable && (
                                <div className="p-3 bg-green-100 text-green-700 rounded-md mb-4">
                                    Doctor is available at this time! Proceeding to appointment details...
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Fill Appointment Details */}
                    {step === 2 && (
                        <form onSubmit={handleSubmit}>
                            <h3 className="text-xl font-semibold mb-4">2. Appointment Details</h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Type</label>
                                <div className="flex space-x-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="in-person"
                                            checked={formData.type === 'in-person'}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-teal-600"
                                        />
                                        <span className="ml-2">In-Person</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            name="type"
                                            value="teleconsultation"
                                            checked={formData.type === 'teleconsultation'}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-teal-600"
                                        />
                                        <span className="ml-2">Teleconsultation</span>
                                    </label>
                                </div>
                            </div>

                            {formData.type === 'in-person' && doctorClinics?.[0] && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Information</label>
                                    <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                                        <h4 className="font-medium text-lg mb-2">{doctorClinics[0].name}</h4>
                                        <p className="text-gray-600 mb-1">
                                            <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {formatAddress(doctorClinics[0])}
                                        </p>
                                        <p className="text-gray-600 mb-1">
                                            <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {formatOperatingHours(doctorClinics[0])}
                                        </p>
                                        <p className="text-gray-600">
                                            <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            {doctorClinics[0].contact.phone}
                                        </p>
                                        <div className="mt-2">
                                            <span className="text-sm font-medium">Facilities:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {doctorClinics[0].facilities.map((facility, index) => (
                                                    <span key={index} className="bg-white px-2 py-1 rounded-full text-xs border border-gray-200">
                                                        {facility}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Appointment</label>
                                <textarea
                                    name="reason"
                                    rows="3"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    placeholder="Please describe your symptoms or reason for the appointment (minimum 10 characters)"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Minimum 10 characters required</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-6">
                                <h4 className="font-medium mb-2">Appointment Summary</h4>
                                <div className="space-y-2">
                                    <p><span className="text-gray-600 font-medium">Date:</span> {formData.date || "Not selected"}</p>
                                    <p><span className="text-gray-600 font-medium">Time:</span> {formData.timeSlot.start ? `${formData.timeSlot.start} - ${formData.timeSlot.end}` : "Not selected"}</p>
                                    <p>
                                        <span className="text-gray-600 font-medium">Type:</span> {formData.type === 'in-person' ? "In-Person Visit" : "Teleconsultation"}
                                    </p>
                                    {formData.type === 'in-person' && doctorClinics?.[0] && (
                                        <p>
                                            <span className="text-gray-600 font-medium">Location:</span> {doctorClinics[0].name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                                    onClick={() => setStep(1)}
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                                >
                                    Confirm Appointment
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Right - Doctor Profile */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex flex-col items-center">
                        <img src={doctor.image} alt={doctor.name} className="rounded-lg w-80 h-80 object-cover"/>
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

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Specializations</h3>
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

export default AppointmentForm;