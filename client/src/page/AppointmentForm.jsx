import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchDoctorById } from "../features/Doctor/DoctorSlice.js";
import { fetchClinicsByDoctor } from "../features/Clinic/ClinicSlice.js";
import { checkAvailability, bookAppointment, resetAppointmentState } from "../features/Appointment/AppointmentSlice.js";
import appointmentService from "../features/Appointment/AppointmentService.js";
import { toast } from "react-toastify";

const SLOT_DURATION_MINUTES = 30;
const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const parseTimeToMinutes = (value = "") => {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
        const hours = Number(match24[1]);
        const minutes = Number(match24[2]);
        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
            return hours * 60 + minutes;
        }
        return null;
    }

    const match12 = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
    if (match12) {
        let hours = Number(match12[1]);
        const minutes = Number(match12[2] || "0");
        const meridian = match12[3].toLowerCase();

        if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
            return null;
        }

        if (hours === 12) hours = 0;
        if (meridian === "pm") hours += 12;
        return hours * 60 + minutes;
    }

    return null;
};

const parseTimeRange = (range = "") => {
    const normalized = range.replace(/\s+to\s+/i, "-");
    const [startRaw, endRaw] = normalized.split("-").map((part) => part?.trim() || "");
    if (!startRaw || !endRaw) return null;

    const start = parseTimeToMinutes(startRaw);
    const end = parseTimeToMinutes(endRaw);

    if (start === null || end === null || end <= start) {
        return null;
    }

    return { start, end };
};

const formatMinutes24 = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60)
        .toString()
        .padStart(2, "0");
    const minutes = (totalMinutes % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
};

const formatMinutes12 = (totalMinutes) => {
    const rawHours = Math.floor(totalMinutes / 60);
    const minutes = (totalMinutes % 60).toString().padStart(2, "0");
    const suffix = rawHours >= 12 ? "PM" : "AM";
    const hours12 = rawHours % 12 || 12;
    return `${hours12}:${minutes} ${suffix}`;
};

const deriveDayIndexes = (daysLabel = "") => {
    const normalized = daysLabel.toLowerCase();

    if (normalized.includes("everyday") || normalized.includes("all days") || normalized.includes("daily")) {
        return [0, 1, 2, 3, 4, 5, 6];
    }

    if (normalized.includes("weekday")) {
        return [1, 2, 3, 4, 5];
    }

    if (normalized.includes("weekend")) {
        return [0, 6];
    }

    const matchedDays = [];
    DAY_NAMES.forEach((dayName, index) => {
        if (normalized.includes(dayName)) {
            matchedDays.push(index);
        }
    });

    if (!matchedDays.length) {
        return [0, 1, 2, 3, 4, 5, 6];
    }

    if (matchedDays.length >= 2 && normalized.includes("-")) {
        const [startDay, endDay] = [matchedDays[0], matchedDays[1]];
        const dayIndexes = [];
        let cursor = startDay;
        dayIndexes.push(cursor);

        while (cursor !== endDay) {
            cursor = (cursor + 1) % 7;
            dayIndexes.push(cursor);
            if (dayIndexes.length > 7) break;
        }

        return [...new Set(dayIndexes)];
    }

    return [...new Set(matchedDays)];
};

const isScheduleApplicable = (daysLabel, dateString) => {
    if (!dateString) return true;

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return false;

    return deriveDayIndexes(daysLabel).includes(date.getDay());
};

const AppointmentForm = () => {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { doctor, isLoading: doctorLoading } = useSelector((state) => state.doctor);
    const { doctorClinics, isLoading: clinicLoading } = useSelector((state) => state.clinic);

    const {
        isAvailable,
        isLoading: availabilityLoading,
        isSuccess: availabilitySuccess,
        isError: availabilityError,
        message: availabilityMessage,
    } = useSelector((state) => state.appointment);

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        date: "",
        timeSlot: { start: "", end: "" },
        type: "in-person",
        reason: "",
    });
    const [timeSlots, setTimeSlots] = useState([]);
    const [selectedWorkingHourKey, setSelectedWorkingHourKey] = useState("");
    const [slotsLoading, setSlotsLoading] = useState(false);

    const clinicList = Array.isArray(doctorClinics) ? doctorClinics : doctorClinics ? [doctorClinics] : [];
    const primaryClinic = clinicList[0] || null;
    const selectedDoctorId = doctor?._id || doctorId;

    const workingHourOptions = useMemo(
        () =>
            (doctor?.workingHours || []).map((slot, index) => ({
                key: `${index}`,
                days: slot.days || "",
                hours: slot.hours || "",
                label: `${slot.days || "Working days"} | ${slot.hours || "Hours not set"}`,
            })),
        [doctor?.workingHours]
    );

    useEffect(() => {
        dispatch(resetAppointmentState());
        dispatch(fetchDoctorById(doctorId));
        dispatch(fetchClinicsByDoctor(doctorId));
    }, [dispatch, doctorId]);

    useEffect(() => {
        if (!workingHourOptions.length) {
            setSelectedWorkingHourKey("");
            return;
        }

        const matchingOption = workingHourOptions.find((option) => isScheduleApplicable(option.days, formData.date));
        setSelectedWorkingHourKey(matchingOption?.key || workingHourOptions[0].key);
    }, [workingHourOptions, formData.date]);

    const buildTimeSlots = useCallback(() => {
        const selectedSchedule = workingHourOptions.find((option) => option.key === selectedWorkingHourKey);
        if (!selectedSchedule?.hours) {
            return [];
        }

        const parsedRange = parseTimeRange(selectedSchedule.hours);
        if (!parsedRange) {
            return [];
        }

        const slots = [];
        let cursor = parsedRange.start;

        while (cursor + SLOT_DURATION_MINUTES <= parsedRange.end) {
            const slotStart = cursor;
            const slotEnd = cursor + SLOT_DURATION_MINUTES;

            slots.push({
                start: formatMinutes24(slotStart),
                end: formatMinutes24(slotEnd),
                display: `${formatMinutes12(slotStart)} - ${formatMinutes12(slotEnd)}`,
            });

            cursor = slotEnd;
        }

        return slots;
    }, [selectedWorkingHourKey, workingHourOptions]);

    useEffect(() => {
        setFormData((prev) => ({ ...prev, timeSlot: { start: "", end: "" } }));

        if (!formData.date || !selectedWorkingHourKey) {
            setTimeSlots([]);
            setSlotsLoading(false);
            return;
        }

        const generatedSlots = buildTimeSlots();
        if (!generatedSlots.length) {
            setTimeSlots([]);
            setSlotsLoading(false);
            return;
        }

        if (!selectedDoctorId) {
            setTimeSlots(generatedSlots);
            setSlotsLoading(false);
            return;
        }

        let isCancelled = false;

        const filterUnavailableSlots = async () => {
            setSlotsLoading(true);
            try {
                const slotResults = await Promise.all(
                    generatedSlots.map(async (slot) => {
                        try {
                            const response = await appointmentService.checkAvailability({
                                doctor: selectedDoctorId,
                                date: formData.date,
                                timeSlot: { start: slot.start, end: slot.end },
                            });

                            return response?.available ? slot : null;
                        } catch {
                            return null;
                        }
                    })
                );

                if (!isCancelled) {
                    setTimeSlots(slotResults.filter(Boolean));
                }
            } finally {
                if (!isCancelled) {
                    setSlotsLoading(false);
                }
            }
        };

        filterUnavailableSlots();

        return () => {
            isCancelled = true;
        };
    }, [formData.date, selectedWorkingHourKey, buildTimeSlots, selectedDoctorId]);

    useEffect(() => {
        if (availabilitySuccess && isAvailable) {
            setStep(2);
        }
    }, [availabilitySuccess, isAvailable]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleTimeSlotSelect = (slot) => {
        setFormData((prev) => ({
            ...prev,
            timeSlot: {
                start: slot.start,
                end: slot.end,
            },
        }));
    };

    const handleCheckAvailability = () => {
        if (!formData.date || !formData.timeSlot.start || !formData.timeSlot.end) {
            toast.error("Please select date and time slot");
            return;
        }

        if (!selectedDoctorId) {
            toast.error("Doctor information is unavailable. Please refresh and try again.");
            return;
        }

        dispatch(
            checkAvailability({
                doctor: selectedDoctorId,
                date: formData.date,
                timeSlot: {
                    start: formData.timeSlot.start,
                    end: formData.timeSlot.end,
                },
            })
        );
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!formData.date || !formData.timeSlot.start || !formData.timeSlot.end) {
            toast.error("Please select date and time slot before confirming");
            setStep(1);
            return;
        }

        if (!formData.reason || formData.reason.length < 10) {
            toast.error("Please provide a detailed reason (at least 10 characters)");
            return;
        }

        if (!selectedDoctorId) {
            toast.error("Doctor information is unavailable. Please refresh and try again.");
            return;
        }

        const appointmentData = {
            doctor: selectedDoctorId,
            date: formData.date,
            timeSlot: {
                start: formData.timeSlot.start,
                end: formData.timeSlot.end,
            },
            type: formData.type,
            clinic: formData.type === "in-person" ? primaryClinic?._id : null,
            reason: formData.reason,
            payment: formData.type === "teleconsultation" ? { amount: 0 } : undefined,
        };

        if (formData.type === "in-person" && !primaryClinic?._id) {
            toast.error("No clinic is assigned for in-person appointment. Please choose teleconsultation.");
            return;
        }

        dispatch(bookAppointment(appointmentData))
            .unwrap()
            .then(() => {
                navigate("/user/appointments");
            })
            .catch(() => null);
    };

    const formatAddress = (clinic) => {
        if (!clinic) return "";
        const { street = "", city = "", state = "", postalCode = "" } = clinic.address || {};
        return `${street}, ${city}, ${state} ${postalCode}`;
    };

    const formatOperatingHours = (clinic) => {
        if (!clinic) return "";
        const { weekdays = {}, weekends = {} } = clinic.operatingHours || {};
        const weekdayText = weekdays.open && weekdays.close ? `${weekdays.open} - ${weekdays.close}` : "Closed";
        const weekendText = weekends.open && weekends.close ? `${weekends.open} - ${weekends.close}` : "Closed";
        return `Weekdays: ${weekdayText} | Weekends: ${weekendText}`;
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
        <div className="container mx-auto px-6 md:px-16 lg:px-24 xl:px-32 py-8 bg-white">
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Appointment with {doctor.name}</h2>

                    {step === 1 && (
                        <div>
                            {primaryClinic && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
                                    <h4 className="font-medium text-lg mb-2">{primaryClinic.name}</h4>
                                    <p className="text-gray-600 mb-1">{formatAddress(primaryClinic)}</p>
                                    <p className="text-gray-600 mb-1">{formatOperatingHours(primaryClinic)}</p>
                                    <div className="mt-2">
                                        <span className="text-sm font-medium">Slot duration:</span>
                                        <span className="text-sm text-gray-600 ml-2">{SLOT_DURATION_MINUTES} minutes</span>
                                    </div>
                                </div>
                            )}

                            <h3 className="text-xl font-semibold mb-4">1. Select Date, Working Hour & Time Slot</h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        min={new Date().toISOString().split("T")[0]}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        value={formData.date}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Working Hour</label>
                                    <select
                                        value={selectedWorkingHourKey}
                                        onChange={(event) => setSelectedWorkingHourKey(event.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        disabled={!workingHourOptions.length}
                                    >
                                        {!workingHourOptions.length ? <option value="">No working hours configured</option> : null}
                                        {workingHourOptions.map((option) => (
                                            <option key={option.key} value={option.key}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                                {!workingHourOptions.length ? (
                                    <p className="text-sm text-gray-500">Doctor has not configured working hours yet.</p>
                                ) : formData.date ? (
                                    slotsLoading ? (
                                        <p className="text-sm text-gray-500">Loading available slots...</p>
                                    ) : timeSlots.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            {timeSlots.map((slot, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    className={`p-2 border rounded-md text-sm ${formData.timeSlot.start === slot.start
                                                        ? "bg-teal-100 border-teal-500 text-teal-800"
                                                        : "border-gray-300 hover:bg-gray-50"
                                                        }`}
                                                    onClick={() => handleTimeSlotSelect(slot)}
                                                >
                                                    {slot.display}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No available slots for the selected working hour on this date.</p>
                                    )
                                ) : (
                                    <p className="text-sm text-gray-500">Please select a date first</p>
                                )}
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

                            {availabilityError && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">{availabilityMessage}</div>}

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
                                            checked={formData.type === "in-person"}
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
                                            checked={formData.type === "teleconsultation"}
                                            onChange={handleChange}
                                            className="h-4 w-4 text-teal-600"
                                        />
                                        <span className="ml-2">Teleconsultation</span>
                                    </label>
                                </div>
                            </div>

                            {formData.type === "in-person" && primaryClinic && (
                                <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                                    <h4 className="font-medium text-lg mb-2">{primaryClinic.name}</h4>
                                    <p className="text-gray-600">{formatAddress(primaryClinic)}</p>
                                    <p className="text-gray-600 mt-1">{primaryClinic.contact?.phone || "Not provided"}</p>
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
                                    <p>
                                        <span className="text-gray-600 font-medium">Working Hour:</span>{" "}
                                        {workingHourOptions.find((option) => option.key === selectedWorkingHourKey)?.label || "Not selected"}
                                    </p>
                                    <p>
                                        <span className="text-gray-600 font-medium">Time:</span>{" "}
                                        {formData.timeSlot.start ? `${formData.timeSlot.start} - ${formData.timeSlot.end}` : "Not selected"}
                                    </p>
                                    <p>
                                        <span className="text-gray-600 font-medium">Type:</span>{" "}
                                        {formData.type === "in-person" ? "In-Person Visit" : "Teleconsultation"}
                                    </p>
                                    {formData.type === "in-person" && primaryClinic ? (
                                        <p><span className="text-gray-600 font-medium">Location:</span> {primaryClinic.name}</p>
                                    ) : null}
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
                                <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700">
                                    Confirm Appointment
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex flex-col items-center">
                        <img src={doctor.image} alt={doctor.name} className="rounded-lg w-80 h-80 object-cover" />
                        <h2 className="text-2xl font-bold mt-4 text-gray-800">{doctor.name}</h2>
                        <p className="text-teal-600 text-lg">{doctor.specialty || "Specialist"}</p>
                        <p className="text-gray-500 text-sm text-center">{doctor.qualification || "Qualification not added"}</p>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Contact Info</h3>
                        <div className="space-y-2 text-gray-600">
                            <p>{doctor.contact?.phone || "Not provided"}</p>
                            <p>{doctor.contact?.email || "Not provided"}</p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Working Hours</h3>
                        <div className="space-y-2">
                            {(doctor.workingHours || []).map((item, index) => (
                                <div key={index} className="flex justify-between text-gray-600">
                                    <span>{item.days}</span>
                                    <span className="font-medium">{item.hours}</span>
                                </div>
                            ))}
                            {!doctor.workingHours?.length ? <p className="text-sm text-gray-500">Working hours not available.</p> : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentForm;
