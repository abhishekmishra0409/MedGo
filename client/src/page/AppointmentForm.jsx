import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { UserRound } from "lucide-react";
import { fetchDoctorById } from "../features/Doctor/DoctorSlice.js";
import { fetchClinicsByDoctor } from "../features/Clinic/ClinicSlice.js";
import { checkAvailability, bookAppointment, resetAppointmentState } from "../features/Appointment/AppointmentSlice.js";
import appointmentService from "../features/Appointment/AppointmentService.js";
import { getSymptom } from "../data/symptoms.js";
import {
    COMMON_CONDITIONS,
    DURATIONS,
    REASON_MIN_LENGTH,
    SEVERITIES,
    buildReasonFromSymptom,
    emptyIntake,
    getIntakeValidationError,
} from "../data/intake.js";
import { buildSlotsForDate, isScheduleApplicable } from "./appointmentSlots.js";
import { toast } from "react-toastify";

// Fallback only — each doctor sets their own consultation length on the
// availability page (doctorProfile.consultationSettings.slotDuration).
const DEFAULT_SLOT_DURATION_MINUTES = 30;



const AppointmentForm = () => {
    const { doctorId } = useParams();
    const [searchParams] = useSearchParams();
    // The guided flow passes the symptom the patient already described, so the
    // reason field starts filled rather than as an empty 10-character minimum.
    const referredSymptom = getSymptom(searchParams.get("symptom"));
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
        reason: buildReasonFromSymptom(referredSymptom),
        intake: emptyIntake(),
    });
    const [timeSlots, setTimeSlots] = useState([]);
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


    const slotDuration = Number(doctor?.consultationSettings?.slotDuration) > 0
        ? Number(doctor.consultationSettings.slotDuration)
        : DEFAULT_SLOT_DURATION_MINUTES;

    const buildTimeSlots = useCallback(
        () => buildSlotsForDate(workingHourOptions, formData.date, slotDuration),
        [formData.date, workingHourOptions, slotDuration]
    );

    const worksOnSelectedDate = useMemo(() => (
        Boolean(formData.date)
        && workingHourOptions.some((option) => option.hours && isScheduleApplicable(option.days, formData.date))
    ), [formData.date, workingHourOptions]);

    useEffect(() => {
        setFormData((prev) => ({ ...prev, timeSlot: { start: "", end: "" } }));

        if (!formData.date) {
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
        setSlotsLoading(true);

        // A native date input fires onChange on every partial keystroke while
        // typing (e.g. 8 separate events for "08282026"), not just the final
        // value. Without this debounce, each one kicked off its own batch of
        // per-slot availability requests — dozens of overlapping calls — and
        // the settle-order race between them could leave timeSlots empty even
        // though every slot was actually available. Waiting for the input to
        // go quiet means only the final, intended date/hour ever gets checked.
        const debounceTimer = setTimeout(() => {
            const filterUnavailableSlots = async () => {
                try {
                    // One call for the whole day. This used to fire a POST per
                    // slot (32+ in parallel for a 15-minute grid), and its
                    // per-slot `catch → null` silently hid slots that were
                    // actually free whenever a single request blipped.
                    const response = await appointmentService.getBookedSlots({
                        doctor: selectedDoctorId,
                        date: formData.date,
                    });

                    const taken = Array.isArray(response?.data) ? response.data : [];
                    const overlaps = (slot) => taken.some((booked) => (
                        slot.start < booked.end && slot.end > booked.start
                    ));

                    if (!isCancelled) {
                        setTimeSlots(generatedSlots.filter((slot) => !overlaps(slot)));
                    }
                } catch {
                    // Show the full grid rather than an empty one: the booking
                    // request itself re-checks availability and will reject a
                    // taken slot with a clear message.
                    if (!isCancelled) {
                        setTimeSlots(generatedSlots);
                    }
                } finally {
                    if (!isCancelled) {
                        setSlotsLoading(false);
                    }
                }
            };

            filterUnavailableSlots();
        }, 400);

        return () => {
            isCancelled = true;
            clearTimeout(debounceTimer);
        };
    }, [formData.date, buildTimeSlots, selectedDoctorId]);

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
            toast.error("Please select date and time slot", { toastId: "appointment-date-slot-required" });
            return;
        }

        if (!selectedDoctorId) {
            toast.error("Doctor information is unavailable. Please refresh and try again.", { toastId: "appointment-doctor-missing" });
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

    const reasonRemaining = Math.max(0, REASON_MIN_LENGTH - formData.reason.trim().length);

    const updateIntake = (field, value) => {
        setFormData((prev) => ({ ...prev, intake: { ...prev.intake, [field]: value } }));
    };

    const toggleCondition = (condition) => {
        setFormData((prev) => {
            const current = prev.intake.existingConditions;
            return {
                ...prev,
                intake: {
                    ...prev.intake,
                    existingConditions: current.includes(condition)
                        ? current.filter((item) => item !== condition)
                        : [...current, condition],
                },
            };
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!formData.date || !formData.timeSlot.start || !formData.timeSlot.end) {
            toast.error("Please select date and time slot before confirming", { toastId: "appointment-confirm-slot-required" });
            setStep(1);
            return;
        }

        const intakeError = getIntakeValidationError(formData.reason, formData.intake);
        if (intakeError) {
            toast.error(intakeError, { toastId: "appointment-intake-required" });
            return;
        }

        if (!selectedDoctorId) {
            toast.error("Doctor information is unavailable. Please refresh and try again.", { toastId: "appointment-doctor-missing" });
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
            reason: formData.reason.trim(),
            intake: formData.intake,
            payment: formData.type === "teleconsultation" ? { amount: 0 } : undefined,
        };

        // A solo doctor takes in-person bookings at their own practiceAddress —
        // the server allows this, so only block when there is neither a clinic
        // nor a practice address to send the patient to.
        const isSoloDoctor = !doctor?.primaryClinic;
        const hasPracticeAddress = Boolean(doctor?.practiceAddress?.city);

        if (formData.type === "in-person" && !primaryClinic?._id && !(isSoloDoctor && hasPracticeAddress)) {
            toast.error("This doctor has not set up in-person consultations yet. Please choose teleconsultation.", { toastId: "appointment-clinic-missing" });
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
        <div className="container mx-auto px-4 py-6 sm:px-6 md:px-10 lg:px-16 xl:px-24 bg-white">
            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Appointment with {doctor.name}</h2>

                    {step === 1 && (
                        <div>
                            {primaryClinic && (
                                <div className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
                                    <h4 className="font-medium text-lg mb-2">{primaryClinic.name}</h4>
                                    <p className="text-gray-600 mb-1">{formatAddress(primaryClinic)}</p>
                                    <p className="text-gray-600 mb-1">{formatOperatingHours(primaryClinic)}</p>
                                    <div className="mt-2">
                                        <span className="text-sm font-medium">Slot duration:</span>
                                        <span className="text-sm text-gray-600 ml-2">{slotDuration} minutes</span>
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

                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time Slot</label>
                                {!workingHourOptions.length ? (
                                    <p className="text-sm text-gray-500">Doctor has not configured working hours yet.</p>
                                ) : formData.date ? (
                                    slotsLoading ? (
                                        <p className="text-sm text-gray-500">Loading available slots...</p>
                                    ) : timeSlots.length > 0 ? (
                                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
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
                                        <p className="text-sm text-gray-500">
                                            {worksOnSelectedDate
                                                ? "Every slot on this date is already booked. Please try another day."
                                                : "The doctor does not consult on this day. Please pick another date."}
                                        </p>
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
                                <div className="flex flex-col gap-3 sm:flex-row sm:space-x-4">
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
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                                    What is the problem? <span className="text-rose-600">*</span>
                                </label>
                                <textarea
                                    id="reason"
                                    name="reason"
                                    rows="3"
                                    className="w-full rounded-md border border-gray-300 p-2 focus-visible:ring-2 focus-visible:ring-teal-500"
                                    placeholder="Describe your symptoms — when they started, what makes them better or worse."
                                    value={formData.reason}
                                    onChange={handleChange}
                                    required
                                />
                                {/* Live count, so the minimum is visible while typing instead of
                                    arriving as a toast after the patient presses Confirm. */}
                                <p className={`mt-1 text-xs ${reasonRemaining > 0 ? "text-amber-700" : "text-gray-500"}`}>
                                    {reasonRemaining > 0
                                        ? `${reasonRemaining} more character${reasonRemaining === 1 ? "" : "s"} needed`
                                        : "Thanks — that's enough detail."}
                                </p>
                            </div>

                            <div className="mb-4 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="intake-duration" className="block text-sm font-medium text-gray-700 mb-1">
                                        How long have you had this? <span className="text-rose-600">*</span>
                                    </label>
                                    <select
                                        id="intake-duration"
                                        value={formData.intake.duration}
                                        onChange={(event) => updateIntake("duration", event.target.value)}
                                        className="w-full rounded-md border border-gray-300 p-2 focus-visible:ring-2 focus-visible:ring-teal-500"
                                    >
                                        <option value="">Select...</option>
                                        {DURATIONS.map((item) => (
                                            <option key={item.value} value={item.value}>{item.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <span className="block text-sm font-medium text-gray-700 mb-1">
                                        How severe is it? <span className="text-rose-600">*</span>
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        {SEVERITIES.map((item) => (
                                            <button
                                                key={item.value}
                                                type="button"
                                                title={item.hint}
                                                aria-pressed={formData.intake.severity === item.value}
                                                onClick={() => updateIntake("severity", item.value)}
                                                className={`rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-teal-500 ${
                                                    formData.intake.severity === item.value
                                                        ? "border-teal-500 bg-teal-50 text-teal-800"
                                                        : "border-gray-300 text-gray-600 hover:border-teal-300"
                                                }`}
                                            >
                                                {item.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <span className="block text-sm font-medium text-gray-700 mb-1">
                                    Do you have any of these? <span className="text-gray-400">(optional)</span>
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {COMMON_CONDITIONS.map((condition) => {
                                        const checked = formData.intake.existingConditions.includes(condition);
                                        return (
                                            <label
                                                key={condition}
                                                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                                                    checked ? "border-teal-500 bg-teal-50 text-teal-800" : "border-gray-300 text-gray-600"
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleCondition(condition)}
                                                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus-visible:ring-2 focus-visible:ring-teal-500"
                                                />
                                                {condition}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mb-4 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="intake-medications" className="block text-sm font-medium text-gray-700 mb-1">
                                        Medicines you are taking <span className="text-gray-400">(optional)</span>
                                    </label>
                                    <input
                                        id="intake-medications"
                                        value={formData.intake.currentMedications}
                                        onChange={(event) => updateIntake("currentMedications", event.target.value)}
                                        placeholder="e.g. Metformin 500mg"
                                        className="w-full rounded-md border border-gray-300 p-2 focus-visible:ring-2 focus-visible:ring-teal-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="intake-allergies" className="block text-sm font-medium text-gray-700 mb-1">
                                        Allergies <span className="text-gray-400">(optional)</span>
                                    </label>
                                    <input
                                        id="intake-allergies"
                                        value={formData.intake.allergies}
                                        onChange={(event) => updateIntake("allergies", event.target.value)}
                                        placeholder="e.g. Penicillin"
                                        className="w-full rounded-md border border-gray-300 p-2 focus-visible:ring-2 focus-visible:ring-teal-500"
                                    />
                                </div>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="intake-previous" className="block text-sm font-medium text-gray-700 mb-1">
                                    Have you already had treatment for this? <span className="text-gray-400">(optional)</span>
                                </label>
                                <input
                                    id="intake-previous"
                                    value={formData.intake.previousTreatment}
                                    onChange={(event) => updateIntake("previousTreatment", event.target.value)}
                                    placeholder="e.g. saw a GP last month, took antibiotics"
                                    className="w-full rounded-md border border-gray-300 p-2 focus-visible:ring-2 focus-visible:ring-teal-500"
                                />
                            </div>

                            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-6">
                                <h4 className="font-medium mb-2">Appointment Summary</h4>
                                <div className="space-y-2">
                                    <p><span className="text-gray-600 font-medium">Date:</span> {formData.date || "Not selected"}</p>
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

                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
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

                <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex flex-col items-center">
                        {doctor.image ? (
                            <img src={doctor.image} alt={doctor.name} className="aspect-square h-auto w-full max-w-80 rounded-lg object-cover" />
                        ) : (
                            <div className="flex aspect-square h-auto w-full max-w-80 items-center justify-center rounded-lg bg-teal-100">
                                <UserRound className="h-24 w-24 text-teal-700" />
                            </div>
                        )}
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
                                <div key={index} className="flex flex-col gap-1 text-gray-600 sm:flex-row sm:justify-between">
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
