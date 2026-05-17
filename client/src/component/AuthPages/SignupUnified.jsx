import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { toast } from "react-toastify";
import AuthShell from "./AuthShell.jsx";
import { normalizeAuthRole } from "./authConfig.js";
import { authService } from "../../features/User/UserService.js";

const createInitialState = () => ({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    doctorProfile: {
        specialty: "",
        qualification: "",
        image: "",
        contactEmail: "",
        address: "",
        educationText: "",
        biographyText: "",
        specializationsText: "",
        weekdayDays: "Monday - Friday",
        weekdayOpen: "",
        weekdayClose: "",
        weekendDays: "Saturday",
        weekendOpen: "",
        weekendClose: "",
        registrationMode: "join-clinic",
        requestedClinicAccessCode: "",
    },
    clinic: {
        name: "",
        address: {
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "INDIA",
        },
        contact: {
            phone: "",
            email: "",
        },
        operatingHours: {
            weekdays: { open: "09:00", close: "18:00" },
            weekends: { open: "", close: "" },
        },
        appointmentSettings: {
            slotDuration: 30,
            maxDailyAppointments: 20,
        },
        facilitiesText: "",
    },
});

const splitLines = (value) =>
    value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);

const splitCommaValues = (value) =>
    value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

const timeToMinutes = (value = "") => {
    const [hours, minutes] = value.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return null;
    }

    return hours * 60 + minutes;
};

const isValidTimeRange = (open, close) => {
    const openMinutes = timeToMinutes(open);
    const closeMinutes = timeToMinutes(close);

    return openMinutes !== null && closeMinutes !== null && closeMinutes > openMinutes;
};

const formatTimeRange = (open, close) => `${open} - ${close}`;

const SignupUnified = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const role = normalizeAuthRole(searchParams.get("role"));
    const [formData, setFormData] = useState(createInitialState);
    const [doctorStep, setDoctorStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [doctorSuccess, setDoctorSuccess] = useState(null);

    const doctorStepLabels = useMemo(() => ["Account", "Clinical profile", "Availability", "Clinic access"], []);

    const handleRoleChange = (nextRole) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("role", normalizeAuthRole(nextRole));
        setSearchParams(nextParams, { replace: true });
        setDoctorStep(1);
        setDoctorSuccess(null);
        setErrorMessage("");
        setFormData(createInitialState());
    };

    const updateRootField = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const updateDoctorField = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({
            ...current,
            doctorProfile: {
                ...current.doctorProfile,
                [name]: value,
            },
        }));
    };

    const updateClinic = (updater) => {
        setFormData((current) => ({
            ...current,
            clinic: updater(current.clinic),
        }));
    };

    const validateDoctorStep = () => {
        if (doctorStep === 1 && (!formData.username || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword)) {
            toast.warning("Complete the account details first");
            return false;
        }

        if (doctorStep === 2 && (!formData.doctorProfile.specialty || !formData.doctorProfile.qualification)) {
            toast.warning("Add your specialty and qualification before continuing");
            return false;
        }

        if (doctorStep === 3 && !isValidTimeRange(formData.doctorProfile.weekdayOpen, formData.doctorProfile.weekdayClose)) {
            toast.warning("Weekday close time must be after open time");
            return false;
        }

        if (
            doctorStep === 3 &&
            (formData.doctorProfile.weekendOpen || formData.doctorProfile.weekendClose) &&
            !isValidTimeRange(formData.doctorProfile.weekendOpen, formData.doctorProfile.weekendClose)
        ) {
            toast.warning("Weekend close time must be after open time");
            return false;
        }

        return true;
    };

    const handlePatientRegistration = async () => {
        await authService.register({
            username: formData.username,
            name: formData.username,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            role: "user",
        });

        toast.success("Registration successful! Please login.");
        window.location.assign("/login?role=user");
    };

    const handleDoctorRegistration = async () => {
        const profile = formData.doctorProfile;
        const registrationMode = profile.registrationMode;

        if (registrationMode === "join-clinic" && !profile.requestedClinicAccessCode.trim()) {
            throw new Error("Clinic access code is required to join an existing clinic");
        }

        if (!isValidTimeRange(profile.weekdayOpen, profile.weekdayClose)) {
            throw new Error("Weekday close time must be after open time");
        }

        if ((profile.weekendOpen || profile.weekendClose) && !isValidTimeRange(profile.weekendOpen, profile.weekendClose)) {
            throw new Error("Weekend close time must be after open time");
        }

        if (
            registrationMode === "create-clinic" &&
            (!formData.clinic.name ||
                !formData.clinic.address.street ||
                !formData.clinic.address.city ||
                !formData.clinic.address.state ||
                !formData.clinic.address.postalCode ||
                !formData.clinic.contact.phone ||
                !formData.clinic.contact.email)
        ) {
            throw new Error("Complete the clinic setup details to continue");
        }

        await authService.register({
            username: formData.username,
            name: formData.username,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            role: "doctor",
            doctorProfile: {
                specialty: profile.specialty,
                qualification: profile.qualification,
                image: profile.image,
                contactEmail: profile.contactEmail || formData.email,
                address: profile.address,
                registrationMode,
                requestedClinicAccessCode: profile.requestedClinicAccessCode,
                education: splitLines(profile.educationText),
                biography: splitLines(profile.biographyText),
                specializations: splitCommaValues(profile.specializationsText),
                workingHours: [
                    { days: profile.weekdayDays, hours: formatTimeRange(profile.weekdayOpen, profile.weekdayClose) },
                    ...(profile.weekendOpen && profile.weekendClose
                        ? [{ days: profile.weekendDays || "Weekend", hours: formatTimeRange(profile.weekendOpen, profile.weekendClose) }]
                        : []),
                ],
            },
            clinic:
                registrationMode === "create-clinic"
                    ? {
                        ...formData.clinic,
                        facilities: splitCommaValues(formData.clinic.facilitiesText),
                    }
                    : undefined,
        });

        setDoctorSuccess({
            mode: registrationMode,
            message: "Doctor application submitted. Admin approval is required before doctor login becomes active.",
        });
        toast.success("Doctor application submitted");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage("");

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            if (role === "doctor") {
                await handleDoctorRegistration();
            } else {
                await handlePatientRegistration();
            }
        } catch (error) {
            const message = error?.message || error || "Registration failed";
            setErrorMessage(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const patientForm = (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="auth-field">
                    <span>Full name</span>
                    <input type="text" name="username" placeholder="Your full name" value={formData.username} onChange={updateRootField} className="auth-input" required />
                </label>
                <label className="auth-field">
                    <span>Phone number</span>
                    <input type="tel" name="phone" placeholder="Enter phone number" value={formData.phone} onChange={updateRootField} className="auth-input" required />
                </label>
            </div>

            <label className="auth-field">
                <span>Email address</span>
                <input type="email" name="email" autoComplete="email" placeholder="patient@example.com" value={formData.email} onChange={updateRootField} className="auth-input" required />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
                <label className="auth-field">
                    <span>Password</span>
                    <input type="password" name="password" autoComplete="new-password" placeholder="At least 6 characters" value={formData.password} onChange={updateRootField} className="auth-input" required />
                </label>
                <label className="auth-field">
                    <span>Confirm password</span>
                    <input type="password" name="confirmPassword" autoComplete="new-password" placeholder="Repeat your password" value={formData.confirmPassword} onChange={updateRootField} className="auth-input" required />
                </label>
            </div>

            {errorMessage ? <div className="auth-alert auth-alert--error">{errorMessage}</div> : null}

            <button type="submit" className="btn-primary auth-submit" disabled={isLoading}>
                {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                {isLoading ? "Creating account..." : "Create patient account"}
            </button>
        </form>
    );

    const doctorProgress = (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {doctorStepLabels.map((label, index) => {
                const stepNumber = index + 1;
                const active = doctorStep === stepNumber;
                const completed = doctorStep > stepNumber;

                return (
                    <div
                        key={label}
                        className={`rounded-[22px] border px-4 py-3 text-sm ${active
                                ? "border-teal-300 bg-teal-50 text-teal-900"
                                : completed
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                    : "border-slate-200 bg-slate-50 text-slate-500"
                            }`}
                    >
                        <p className="text-xs font-semibold uppercase tracking-[0.18em]">Step {stepNumber}</p>
                        <p className="mt-1 font-semibold">{label}</p>
                    </div>
                );
            })}
        </div>
    );

    const doctorSuccessState = (
        <div className="space-y-5 rounded-[28px] border border-emerald-200 bg-emerald-50/80 p-6">
            <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-600" />
                <div>
                    <p className="text-lg font-semibold text-slate-950">Application received</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{doctorSuccess?.message}</p>
                </div>
            </div>
            <div className="rounded-[22px] border border-emerald-200 bg-white px-4 py-3 text-sm text-slate-600">
                {doctorSuccess?.mode === "create-clinic"
                    ? "Your clinic setup request was saved with owner access. Admin can approve the doctor account and activate the clinic together."
                    : "Your clinic code request was saved. Admin can approve the account and attach you to that clinic."}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                <Link to="/login?role=doctor" className="auth-secondary-button">
                    Doctor login
                </Link>
                <Link to="/forgot-password?role=doctor" className="btn-primary auth-submit">
                    Reset password
                </Link>
            </div>
        </div>
    );

    const doctorStepOne = (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="auth-field">
                    <span>Full name</span>
                    <input type="text" name="username" value={formData.username} onChange={updateRootField} className="auth-input" required />
                </label>
                <label className="auth-field">
                    <span>Phone number</span>
                    <input type="tel" name="phone" value={formData.phone} onChange={updateRootField} className="auth-input" required />
                </label>
            </div>
            <label className="auth-field">
                <span>Email address</span>
                <input type="email" name="email" value={formData.email} onChange={updateRootField} className="auth-input" required />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="auth-field">
                    <span>Password</span>
                    <input type="password" name="password" value={formData.password} onChange={updateRootField} className="auth-input" required />
                </label>
                <label className="auth-field">
                    <span>Confirm password</span>
                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={updateRootField} className="auth-input" required />
                </label>
            </div>
        </div>
    );

    const doctorStepTwo = (
        <div className="space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-sm font-semibold text-slate-900">Approval basics</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">Keep this short now. You can complete the full professional profile after login.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="auth-field">
                        <span>Specialty</span>
                        <input type="text" name="specialty" value={formData.doctorProfile.specialty} onChange={updateDoctorField} className="auth-input" required />
                    </label>
                    <label className="auth-field">
                        <span>Qualification</span>
                        <input type="text" name="qualification" value={formData.doctorProfile.qualification} onChange={updateDoctorField} className="auth-input" required />
                    </label>
                </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">Optional practice contact</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="auth-field">
                        <span>Practice email</span>
                        <input type="email" name="contactEmail" value={formData.doctorProfile.contactEmail} onChange={updateDoctorField} className="auth-input" placeholder="Optional if same as login email" />
                    </label>
                    <label className="auth-field">
                        <span>Practice address</span>
                        <input type="text" name="address" value={formData.doctorProfile.address} onChange={updateDoctorField} className="auth-input" placeholder="Can be completed later" />
                    </label>
                </div>
            </div>
        </div>
    );

    const doctorStepAvailability = (
        <div className="space-y-5">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-sm font-semibold text-slate-900">Regular weekday availability</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">Enter availability times in 24-hour format. The fields stay blank until you choose a value.</p>
                <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
                    <label className="auth-field">
                        <span>Weekday label</span>
                        <input type="text" name="weekdayDays" value={formData.doctorProfile.weekdayDays} onChange={updateDoctorField} className="auth-input" />
                    </label>
                    <label className="auth-field">
                        <span>Weekday open</span>
                        <input type="time" name="weekdayOpen" value={formData.doctorProfile.weekdayOpen} onChange={updateDoctorField} className="auth-input" required />
                    </label>
                    <label className="auth-field">
                        <span>Weekday close</span>
                        <input type="time" name="weekdayClose" value={formData.doctorProfile.weekdayClose} onChange={updateDoctorField} className="auth-input" required />
                    </label>
                </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">Optional weekend availability</p>
                <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
                    <label className="auth-field">
                        <span>Weekend label</span>
                        <input type="text" name="weekendDays" value={formData.doctorProfile.weekendDays} onChange={updateDoctorField} className="auth-input" />
                    </label>
                    <label className="auth-field">
                        <span>Weekend open</span>
                        <input type="time" name="weekendOpen" value={formData.doctorProfile.weekendOpen} onChange={updateDoctorField} className="auth-input" />
                    </label>
                    <label className="auth-field">
                        <span>Weekend close</span>
                        <input type="time" name="weekendClose" value={formData.doctorProfile.weekendClose} onChange={updateDoctorField} className="auth-input" />
                    </label>
                </div>
            </div>

            <div className="rounded-[20px] border border-teal-100 bg-teal-50/70 px-4 py-3 text-sm leading-6 text-teal-900">
                These hours will be saved as your initial doctor availability. You can edit or add more rows later from the doctor dashboard.
            </div>
        </div>
    );

    const doctorStepThree = (
        <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
                <button
                    type="button"
                    onClick={() => setFormData((current) => ({ ...current, doctorProfile: { ...current.doctorProfile, registrationMode: "join-clinic" } }))}
                    className={`auth-choice-card ${formData.doctorProfile.registrationMode === "join-clinic" ? "border-teal-300 bg-teal-50" : ""}`}
                >
                    <div>
                        <p className="font-semibold text-slate-900">Join an existing clinic</p>
                        <p className="mt-1 text-sm text-slate-500">Use the clinic access code shared by the clinic owner or admin.</p>
                    </div>
                </button>
                <button
                    type="button"
                    onClick={() => setFormData((current) => ({ ...current, doctorProfile: { ...current.doctorProfile, registrationMode: "create-clinic" } }))}
                    className={`auth-choice-card ${formData.doctorProfile.registrationMode === "create-clinic" ? "border-teal-300 bg-teal-50" : ""}`}
                >
                    <div>
                        <p className="font-semibold text-slate-900">Start your own clinic</p>
                        <p className="mt-1 text-sm text-slate-500">Submit clinic information now and become the owner after approval.</p>
                    </div>
                </button>
            </div>

            {formData.doctorProfile.registrationMode === "join-clinic" ? (
                <label className="auth-field">
                    <span>Clinic access code</span>
                    <input type="text" name="requestedClinicAccessCode" value={formData.doctorProfile.requestedClinicAccessCode} onChange={updateDoctorField} className="auth-input uppercase" placeholder="Enter clinic access code" required />
                </label>
            ) : (
                <div className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="auth-field">
                            <span>Clinic name</span>
                            <input type="text" value={formData.clinic.name} onChange={(event) => updateClinic((clinic) => ({ ...clinic, name: event.target.value }))} className="auth-input" required />
                        </label>
                        <label className="auth-field">
                            <span>Clinic phone</span>
                            <input type="tel" value={formData.clinic.contact.phone} onChange={(event) => updateClinic((clinic) => ({ ...clinic, contact: { ...clinic.contact, phone: event.target.value } }))} className="auth-input" required />
                        </label>
                    </div>
                    <label className="auth-field">
                        <span>Clinic email</span>
                        <input type="email" value={formData.clinic.contact.email} onChange={(event) => updateClinic((clinic) => ({ ...clinic, contact: { ...clinic.contact, email: event.target.value } }))} className="auth-input" required />
                    </label>
                    <label className="auth-field">
                        <span>Street address</span>
                        <input type="text" value={formData.clinic.address.street} onChange={(event) => updateClinic((clinic) => ({ ...clinic, address: { ...clinic.address, street: event.target.value } }))} className="auth-input" required />
                    </label>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="auth-field">
                            <span>City</span>
                            <input type="text" value={formData.clinic.address.city} onChange={(event) => updateClinic((clinic) => ({ ...clinic, address: { ...clinic.address, city: event.target.value } }))} className="auth-input" required />
                        </label>
                        <label className="auth-field">
                            <span>State</span>
                            <input type="text" value={formData.clinic.address.state} onChange={(event) => updateClinic((clinic) => ({ ...clinic, address: { ...clinic.address, state: event.target.value } }))} className="auth-input" required />
                        </label>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="auth-field">
                            <span>Postal code</span>
                            <input type="text" value={formData.clinic.address.postalCode} onChange={(event) => updateClinic((clinic) => ({ ...clinic, address: { ...clinic.address, postalCode: event.target.value } }))} className="auth-input" required />
                        </label>
                        <label className="auth-field">
                            <span>Country</span>
                            <input type="text" value={formData.clinic.address.country} onChange={(event) => updateClinic((clinic) => ({ ...clinic, address: { ...clinic.address, country: event.target.value } }))} className="auth-input" required />
                        </label>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="auth-field">
                            <span>Weekday open</span>
                            <input type="time" value={formData.clinic.operatingHours.weekdays.open} onChange={(event) => updateClinic((clinic) => ({ ...clinic, operatingHours: { ...clinic.operatingHours, weekdays: { ...clinic.operatingHours.weekdays, open: event.target.value } } }))} className="auth-input" required />
                        </label>
                        <label className="auth-field">
                            <span>Weekday close</span>
                            <input type="time" value={formData.clinic.operatingHours.weekdays.close} onChange={(event) => updateClinic((clinic) => ({ ...clinic, operatingHours: { ...clinic.operatingHours, weekdays: { ...clinic.operatingHours.weekdays, close: event.target.value } } }))} className="auth-input" required />
                        </label>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="auth-field">
                            <span>Weekend open</span>
                            <input type="time" value={formData.clinic.operatingHours.weekends.open} onChange={(event) => updateClinic((clinic) => ({ ...clinic, operatingHours: { ...clinic.operatingHours, weekends: { ...clinic.operatingHours.weekends, open: event.target.value } } }))} className="auth-input" />
                        </label>
                        <label className="auth-field">
                            <span>Weekend close</span>
                            <input type="time" value={formData.clinic.operatingHours.weekends.close} onChange={(event) => updateClinic((clinic) => ({ ...clinic, operatingHours: { ...clinic.operatingHours, weekends: { ...clinic.operatingHours.weekends, close: event.target.value } } }))} className="auth-input" />
                        </label>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="auth-field">
                            <span>Slot duration</span>
                            <select value={formData.clinic.appointmentSettings.slotDuration} onChange={(event) => updateClinic((clinic) => ({ ...clinic, appointmentSettings: { ...clinic.appointmentSettings, slotDuration: Number(event.target.value) } }))} className="auth-input">
                                <option value={15}>15 minutes</option>
                                <option value={30}>30 minutes</option>
                                <option value={45}>45 minutes</option>
                                <option value={60}>60 minutes</option>
                            </select>
                        </label>
                        <label className="auth-field">
                            <span>Max daily appointments</span>
                            <input type="number" min="1" value={formData.clinic.appointmentSettings.maxDailyAppointments} onChange={(event) => updateClinic((clinic) => ({ ...clinic, appointmentSettings: { ...clinic.appointmentSettings, maxDailyAppointments: Number(event.target.value) } }))} className="auth-input" />
                        </label>
                    </div>
                    <label className="auth-field">
                        <span>Facilities</span>
                        <input type="text" value={formData.clinic.facilitiesText} onChange={(event) => updateClinic((clinic) => ({ ...clinic, facilitiesText: event.target.value }))} className="auth-input" placeholder="Comma separated facilities" />
                    </label>
                </div>
            )}
        </div>
    );

    return (
        <AuthShell
            role={role}
            mode="signup"
            onRoleChange={handleRoleChange}
            title={role === "doctor" ? "Doctor onboarding application" : "Create your patient account"}
            description={
                role === "doctor"
                    ? "Apply once, choose whether you are joining a clinic or starting your own, and let admin approval activate the doctor workspace."
                    : "Create one patient account for appointments, lab tests, and pharmacy orders."
            }
            footer={
                <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>Already have an account? <Link to={`/login?role=${role}`} className="auth-link font-semibold">Sign in</Link></p>
                    <p>Need help later? <Link to={`/forgot-password?role=${role}`} className="auth-link font-semibold">Password recovery</Link></p>
                </div>
            }
        >
            {role === "doctor" ? (
                doctorSuccess ? (
                    doctorSuccessState
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {doctorProgress}
                        {doctorStep === 1 ? doctorStepOne : null}
                        {doctorStep === 2 ? doctorStepTwo : null}
                        {doctorStep === 3 ? doctorStepAvailability : null}
                        {doctorStep === 4 ? doctorStepThree : null}
                        {errorMessage ? <div className="auth-alert auth-alert--error">{errorMessage}</div> : null}
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                            <button type="button" className="auth-secondary-button" onClick={() => setDoctorStep((current) => Math.max(current - 1, 1))} disabled={doctorStep === 1 || isLoading}>
                                <ChevronLeft className="h-4 w-4" />
                                Back
                            </button>
                            {doctorStep < doctorStepLabels.length ? (
                                <button type="button" className="btn-primary auth-submit sm:w-auto sm:px-6" onClick={() => validateDoctorStep() && setDoctorStep((current) => Math.min(current + 1, doctorStepLabels.length))}>
                                    Continue
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            ) : (
                                <button type="submit" className="btn-primary auth-submit sm:w-auto sm:px-6" disabled={isLoading}>
                                    {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                                    {isLoading ? "Submitting application..." : "Submit doctor application"}
                                </button>
                            )}
                        </div>
                    </form>
                )
            ) : (
                patientForm
            )}
        </AuthShell>
    );
};

export default SignupUnified;
