import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Building2, CheckCircle2, ChevronLeft, ChevronRight, LoaderCircle, Stethoscope, UserRound } from "lucide-react";
import { toast } from "react-toastify";
import AuthShell from "./AuthShell.jsx";
import { AUTH_ROLES, normalizeAuthRole } from "./authConfig.js";
import { registerUser } from "../../features/User/UserSlice.js";
import PasswordInput from "../ui/PasswordInput.jsx";

const createInitialState = () => ({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    doctorProfile: {
        specialty: "",
        qualification: "",
        councilRegistrationNumber: "",
        councilName: "",
        registrationMode: "join-clinic",
        requestedClinicAccessCode: "",
        practiceAddress: { street: "", city: "", state: "", postalCode: "" },
    },
    clinic: {
        name: "",
        address: { street: "", city: "", state: "", postalCode: "", country: "INDIA" },
        contact: { phone: "", email: "" },
    },
});

const accountTypeChoices = [
    {
        role: "user",
        icon: UserRound,
        label: "Patient",
        description: "Book appointments, lab tests, and pharmacy orders.",
    },
    {
        role: "doctor",
        icon: Stethoscope,
        label: "Doctor",
        description: "Practise solo, join a clinic, or start your own.",
    },
    {
        role: "clinic-owner",
        icon: Building2,
        label: "Clinic / hospital",
        description: "Register a facility and manage your doctor roster.",
    },
];

const doctorStepLabels = ["Account", "Credentials", "Practice"];
const ownerStepLabels = ["Account", "Facility"];

const SignupUnified = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const roleParam = searchParams.get("role");
    const hasRole = AUTH_ROLES.includes(roleParam);
    const role = normalizeAuthRole(roleParam);

    const [formData, setFormData] = useState(createInitialState);
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [success, setSuccess] = useState(null);

    const stepLabels = role === "doctor" ? doctorStepLabels : role === "clinic-owner" ? ownerStepLabels : [];

    const selectRole = (nextRole) => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set("role", nextRole);
        setSearchParams(nextParams, { replace: true });
        setStep(1);
        setSuccess(null);
        setErrorMessage("");
        setFormData(createInitialState());
    };

    // Lets someone who picked the wrong account type back out to the step-0
    // chooser instead of being stuck (or having to hand-edit the URL).
    const resetToChooser = () => {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("role");
        setSearchParams(nextParams, { replace: true });
        setStep(1);
        setSuccess(null);
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
            doctorProfile: { ...current.doctorProfile, [name]: value },
        }));
    };

    const updatePracticeAddressField = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({
            ...current,
            doctorProfile: {
                ...current.doctorProfile,
                practiceAddress: { ...current.doctorProfile.practiceAddress, [name]: value },
            },
        }));
    };

    const updateClinic = (updater) => {
        setFormData((current) => ({ ...current, clinic: updater(current.clinic) }));
    };

    const setRegistrationMode = (mode) => {
        setFormData((current) => ({
            ...current,
            doctorProfile: { ...current.doctorProfile, registrationMode: mode },
        }));
    };

    const goToStep = (event, nextStep) => {
        const formEl = event.currentTarget.form;

        if (!formEl.reportValidity()) {
            return;
        }

        if (step === 1 && formData.password !== formData.confirmPassword) {
            toast.warning("Passwords do not match");
            return;
        }

        setStep(nextStep);
    };

    const buildAccountPayload = () => ({
        username: formData.username,
        name: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
    });

    const buildClinicPayload = () => ({
        name: formData.clinic.name,
        address: formData.clinic.address,
        contact: formData.clinic.contact,
    });

    const handlePatientRegistration = async () => {
        await dispatch(registerUser({ ...buildAccountPayload(), role: "user" })).unwrap();
        navigate("/login", { replace: true });
    };

    const handleDoctorRegistration = async () => {
        const profile = formData.doctorProfile;
        const mode = profile.registrationMode;

        const doctorProfile = {
            specialty: profile.specialty,
            qualification: profile.qualification,
            councilRegistrationNumber: profile.councilRegistrationNumber,
            councilName: profile.councilName,
            registrationMode: mode,
        };

        if (mode === "join-clinic") {
            doctorProfile.requestedClinicAccessCode = profile.requestedClinicAccessCode;
        } else if (mode === "solo") {
            doctorProfile.practiceAddress = profile.practiceAddress;
        }

        await dispatch(
            registerUser({
                ...buildAccountPayload(),
                role: "doctor",
                doctorProfile,
                clinic: mode === "create-clinic" ? buildClinicPayload() : undefined,
            })
        ).unwrap();

        setSuccess({ mode });
    };

    const handleOwnerRegistration = async () => {
        await dispatch(
            registerUser({
                ...buildAccountPayload(),
                role: "clinic-owner",
                clinic: buildClinicPayload(),
            })
        ).unwrap();

        setSuccess({ mode: "clinic-owner" });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage("");
        setIsLoading(true);

        try {
            if (role === "doctor") {
                await handleDoctorRegistration();
            } else if (role === "clinic-owner") {
                await handleOwnerRegistration();
            } else {
                await handlePatientRegistration();
            }
        } catch (error) {
            const message = error?.message || error || "Registration failed";
            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!hasRole) {
        return (
            <AuthShell
                role="user"
                mode="choose"
                title="Create your MedGo account"
                description="Pick the account that matches you — the sign-in and dashboard that follow are tailored to it."
                footer={
                    <p className="text-sm text-slate-500">
                        Already have an account?{" "}
                        <Link to="/login" className="auth-link font-semibold">
                            Sign in
                        </Link>
                    </p>
                }
            >
                <div className="grid gap-4">
                    {accountTypeChoices.map((choice) => {
                        const Icon = choice.icon;
                        return (
                            <button
                                key={choice.role}
                                type="button"
                                onClick={() => selectRole(choice.role)}
                                className="auth-choice-card group"
                            >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-base font-semibold text-slate-900">{choice.label}</p>
                                    <p className="mt-1 text-sm leading-7 text-slate-500">{choice.description}</p>
                                </div>
                                <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:text-teal-700" />
                            </button>
                        );
                    })}
                </div>
            </AuthShell>
        );
    }

    // Tailwind's JIT scans source text statically, so the grid-cols class must
    // appear verbatim here rather than be built from a template string.
    const progressGridClass = stepLabels.length === 2 ? "grid gap-2 sm:grid-cols-2" : "grid gap-2 sm:grid-cols-3";

    const progressBar = stepLabels.length ? (
        <div className={progressGridClass}>
            {stepLabels.map((label, index) => {
                const stepNumber = index + 1;
                const active = step === stepNumber;
                const completed = step > stepNumber;

                return (
                    <div
                        key={label}
                        className={`rounded-[22px] border px-4 py-3 text-sm ${
                            active
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
    ) : null;

    const successState = success ? (
        <div className="space-y-5 rounded-[28px] border border-emerald-200 bg-emerald-50/80 p-6">
            <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-600" />
                <div>
                    <p className="text-lg font-semibold text-slate-950">Application received</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                        {success.mode === "clinic-owner"
                            ? "Your facility application was submitted. You can log in now to finish setting up your clinic — it goes live once the platform team approves it."
                            : success.mode === "create-clinic"
                                ? "Your clinic setup request was saved with owner access. You can log in now to finish setting up your clinic and profile — both go live once approved."
                                : success.mode === "join-clinic"
                                    ? "Your clinic join request was saved. You can log in now — the clinic owner and platform team both need to approve you before you're listed."
                                    : "Your application was saved. You can log in now to finish your profile — you'll be listed once the platform team approves you."}
                    </p>
                </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
                <Link to="/login" className="auth-secondary-button">
                    Log in now
                </Link>
                <Link to="/forgot-password" className="btn-primary auth-submit">
                    Reset password
                </Link>
            </div>
        </div>
    ) : null;

    const stepAccount = (
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
                <PasswordInput
                    label="Password"
                    name="password"
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={updateRootField}
                    required
                />
                <PasswordInput
                    label="Confirm password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    value={formData.confirmPassword}
                    onChange={updateRootField}
                    required
                />
            </div>
        </div>
    );

    const stepCredentials = (
        <div className="space-y-4">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
                <p className="text-sm font-semibold text-slate-900">Credentials</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                    This is what admin verifies before approval. Photo, education, biography, and consulting hours are set up from your dashboard afterward.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label className="auth-field">
                        <span>Medical council registration number</span>
                        <input
                            type="text"
                            name="councilRegistrationNumber"
                            value={formData.doctorProfile.councilRegistrationNumber}
                            onChange={updateDoctorField}
                            className="auth-input uppercase"
                            required
                        />
                    </label>
                    <label className="auth-field">
                        <span>Issuing council</span>
                        <input
                            type="text"
                            name="councilName"
                            placeholder="e.g. Maharashtra Medical Council"
                            value={formData.doctorProfile.councilName}
                            onChange={updateDoctorField}
                            className="auth-input"
                            required
                        />
                    </label>
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
        </div>
    );

    const stepPractice = (
        <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
                <button
                    type="button"
                    onClick={() => setRegistrationMode("join-clinic")}
                    className={`auth-choice-card ${formData.doctorProfile.registrationMode === "join-clinic" ? "border-teal-300 bg-teal-50" : ""}`}
                >
                    <div>
                        <p className="font-semibold text-slate-900">Join a clinic</p>
                        <p className="mt-1 text-sm text-slate-500">Use an access code shared by the clinic owner.</p>
                    </div>
                </button>
                <button
                    type="button"
                    onClick={() => setRegistrationMode("create-clinic")}
                    className={`auth-choice-card ${formData.doctorProfile.registrationMode === "create-clinic" ? "border-teal-300 bg-teal-50" : ""}`}
                >
                    <div>
                        <p className="font-semibold text-slate-900">Start your own clinic</p>
                        <p className="mt-1 text-sm text-slate-500">Submit clinic details and become the owner.</p>
                    </div>
                </button>
                <button
                    type="button"
                    onClick={() => setRegistrationMode("solo")}
                    className={`auth-choice-card ${formData.doctorProfile.registrationMode === "solo" ? "border-teal-300 bg-teal-50" : ""}`}
                >
                    <div>
                        <p className="font-semibold text-slate-900">Practise independently</p>
                        <p className="mt-1 text-sm text-slate-500">No clinic — set up your own practice address.</p>
                    </div>
                </button>
            </div>

            {formData.doctorProfile.registrationMode === "join-clinic" ? (
                <>
                    <label className="auth-field">
                        <span>Clinic access code</span>
                        <input
                            type="text"
                            name="requestedClinicAccessCode"
                            value={formData.doctorProfile.requestedClinicAccessCode}
                            onChange={updateDoctorField}
                            className="auth-input uppercase"
                            placeholder="Enter clinic access code"
                            required
                        />
                    </label>
                    <div className="auth-alert auth-alert--info">
                        Your clinic's owner will confirm your place on the roster after the platform verifies your credentials.
                    </div>
                </>
            ) : formData.doctorProfile.registrationMode === "create-clinic" ? (
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
                </div>
            ) : (
                <>
                    <div className="grid gap-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5 sm:grid-cols-2">
                        <label className="auth-field sm:col-span-2">
                            <span>Practice street address</span>
                            <input type="text" name="street" value={formData.doctorProfile.practiceAddress.street} onChange={updatePracticeAddressField} className="auth-input" required />
                        </label>
                        <label className="auth-field">
                            <span>City</span>
                            <input type="text" name="city" value={formData.doctorProfile.practiceAddress.city} onChange={updatePracticeAddressField} className="auth-input" required />
                        </label>
                        <label className="auth-field">
                            <span>State</span>
                            <input type="text" name="state" value={formData.doctorProfile.practiceAddress.state} onChange={updatePracticeAddressField} className="auth-input" required />
                        </label>
                        <label className="auth-field">
                            <span>Postal code</span>
                            <input type="text" name="postalCode" value={formData.doctorProfile.practiceAddress.postalCode} onChange={updatePracticeAddressField} className="auth-input" required />
                        </label>
                    </div>
                    <div className="auth-alert auth-alert--info">
                        Set your consulting hours from the dashboard after approval to start taking bookings.
                    </div>
                </>
            )}
        </div>
    );

    const stepFacility = (
        <div className="space-y-4 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="auth-field">
                    <span>Facility name</span>
                    <input type="text" value={formData.clinic.name} onChange={(event) => updateClinic((clinic) => ({ ...clinic, name: event.target.value }))} className="auth-input" required />
                </label>
                <label className="auth-field">
                    <span>Facility phone</span>
                    <input type="tel" value={formData.clinic.contact.phone} onChange={(event) => updateClinic((clinic) => ({ ...clinic, contact: { ...clinic.contact, phone: event.target.value } }))} className="auth-input" required />
                </label>
            </div>
            <label className="auth-field">
                <span>Facility email</span>
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
        </div>
    );

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
                <PasswordInput
                    label="Password"
                    name="password"
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={updateRootField}
                    required
                />
                <PasswordInput
                    label="Confirm password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    value={formData.confirmPassword}
                    onChange={updateRootField}
                    required
                />
            </div>

            {errorMessage ? <div className="auth-alert auth-alert--error">{errorMessage}</div> : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button type="button" className="auth-secondary-button" onClick={resetToChooser} disabled={isLoading}>
                    <ChevronLeft className="h-4 w-4" />
                    Change account type
                </button>
                <button type="submit" className="btn-primary auth-submit sm:w-auto sm:px-6" disabled={isLoading}>
                    {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    {isLoading ? "Creating account..." : "Create patient account"}
                </button>
            </div>
        </form>
    );

    const wizardSteps = role === "doctor" ? [stepAccount, stepCredentials, stepPractice] : [stepAccount, stepFacility];
    const isLastStep = step === stepLabels.length;

    const wizardForm = (
        <form onSubmit={handleSubmit} className="space-y-5">
            {progressBar}
            {wizardSteps[step - 1]}
            {errorMessage ? <div className="auth-alert auth-alert--error">{errorMessage}</div> : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button
                    type="button"
                    className="auth-secondary-button"
                    onClick={() => (step === 1 ? resetToChooser() : setStep((current) => current - 1))}
                    disabled={isLoading}
                >
                    <ChevronLeft className="h-4 w-4" />
                    {step === 1 ? "Change account type" : "Back"}
                </button>
                {!isLastStep ? (
                    <button type="button" className="btn-primary auth-submit sm:w-auto sm:px-6" onClick={(event) => goToStep(event, step + 1)}>
                        Continue
                        <ChevronRight className="h-4 w-4" />
                    </button>
                ) : (
                    <button type="submit" className="btn-primary auth-submit sm:w-auto sm:px-6" disabled={isLoading}>
                        {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                        {isLoading ? "Submitting application..." : "Submit application"}
                    </button>
                )}
            </div>
        </form>
    );

    return (
        <AuthShell
            role={role}
            mode="signup"
            title={
                role === "doctor"
                    ? "Doctor application"
                    : role === "clinic-owner"
                        ? "Register your clinic or hospital"
                        : "Create your patient account"
            }
            description={
                role === "doctor"
                    ? "Apply once, choose whether you're joining a clinic, starting your own, or practising solo."
                    : role === "clinic-owner"
                        ? "Register your facility, then invite doctors to join once you're approved."
                        : "Create one patient account for appointments, lab tests, and pharmacy orders."
            }
            footer={
                <div className="flex flex-col gap-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <p>Already have an account? <Link to="/login" className="auth-link font-semibold">Sign in</Link></p>
                    <p>Need help later? <Link to="/forgot-password" className="auth-link font-semibold">Password recovery</Link></p>
                </div>
            }
        >
            {success ? successState : role === "user" ? patientForm : wizardForm}
        </AuthShell>
    );
};

export default SignupUnified;
