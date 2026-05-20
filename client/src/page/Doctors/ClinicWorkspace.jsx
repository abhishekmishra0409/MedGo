import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2, Clock, Copy, Mail, MapPin, Phone, Save, Settings, Users } from "lucide-react";
import { fetchMyClinic, updateMyClinic } from "../../features/Clinic/ClinicSlice.js";

const defaultForm = {
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
    isActive: true,
};

const buildForm = (clinicData = {}) => {
    const clinic = clinicData || {};

    return {
    name: clinic.name || "",
    address: {
        ...defaultForm.address,
        ...(clinic.address || {}),
    },
    contact: {
        ...defaultForm.contact,
        ...(clinic.contact || {}),
    },
    operatingHours: {
        weekdays: {
            ...defaultForm.operatingHours.weekdays,
            ...(clinic.operatingHours?.weekdays || {}),
        },
        weekends: {
            ...defaultForm.operatingHours.weekends,
            ...(clinic.operatingHours?.weekends || {}),
        },
    },
    appointmentSettings: {
        ...defaultForm.appointmentSettings,
        ...(clinic.appointmentSettings || {}),
    },
    facilitiesText: (clinic.facilities || []).join(", "),
    isActive: clinic.isActive ?? true,
    };
};

const splitFacilities = (value = "") =>
    value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

const formatAddress = (address = {}) =>
    [address.street, address.city, address.state, address.postalCode, address.country].filter(Boolean).join(", ") || "Not provided";

const StatCard = ({ icon, label, value }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            {icon}
            {label}
        </p>
        <p className="mt-2 break-words text-lg font-semibold text-slate-950">{value || "Not provided"}</p>
    </div>
);

const ClinicWorkspace = () => {
    const dispatch = useDispatch();
    const { myClinic, isLoading } = useSelector((state) => state.clinic);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(defaultForm);

    useEffect(() => {
        dispatch(fetchMyClinic());
    }, [dispatch]);

    useEffect(() => {
        setFormData(buildForm(myClinic));
    }, [myClinic]);

    const facilities = useMemo(() => splitFacilities(formData.facilitiesText), [formData.facilitiesText]);
    const canManage = !!myClinic?.canManage;
    const doctorCount = myClinic?.doctors?.length || 0;

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const updateGroup = (group, field, value) => {
        setFormData((current) => ({
            ...current,
            [group]: {
                ...current[group],
                [field]: value,
            },
        }));
    };

    const updateHours = (period, field, value) => {
        setFormData((current) => ({
            ...current,
            operatingHours: {
                ...current.operatingHours,
                [period]: {
                    ...current.operatingHours[period],
                    [field]: value,
                },
            },
        }));
    };

    const updateSettings = (field, value) => {
        setFormData((current) => ({
            ...current,
            appointmentSettings: {
                ...current.appointmentSettings,
                [field]: Number(value),
            },
        }));
    };

    const handleCopyCode = async () => {
        if (!myClinic?.accessCode) {
            return;
        }

        await navigator.clipboard?.writeText(myClinic.accessCode);
    };

    const handleCancel = () => {
        setFormData(buildForm(myClinic));
        setIsEditing(false);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const result = await dispatch(updateMyClinic({
            name: formData.name,
            address: formData.address,
            contact: formData.contact,
            operatingHours: formData.operatingHours,
            appointmentSettings: formData.appointmentSettings,
            facilities,
            isActive: formData.isActive,
        }));

        if (updateMyClinic.fulfilled.match(result)) {
            setIsEditing(false);
            dispatch(fetchMyClinic());
        }
    };

    if (isLoading && !myClinic) {
        return <div className="w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">Loading clinic details...</div>;
    }

    if (!myClinic) {
        return (
            <div className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Clinic workspace</p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-950">No clinic assigned</h1>
                <p className="mt-2 text-sm leading-6 text-slate-500">This doctor account is not linked to an active clinic yet. Join a clinic with an access code or ask admin to attach your account.</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-5">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="bg-gradient-to-r from-teal-600 to-slate-900 p-5 text-white sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-100">Clinic workspace</p>
                            <h1 className="mt-2 text-3xl font-semibold">{myClinic.name}</h1>
                            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200">{formatAddress(myClinic.address)}</p>
                        </div>
                        <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-100">Access code</p>
                            <div className="mt-2 flex items-center gap-3">
                                <span className="rounded-xl bg-white px-4 py-2 font-mono text-lg font-semibold text-slate-950">{myClinic.accessCode || "Hidden"}</span>
                                {myClinic.accessCode ? (
                                    <button type="button" onClick={handleCopyCode} className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white hover:bg-white/25" aria-label="Copy clinic access code">
                                        <Copy className="h-4 w-4" />
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <StatCard icon={<Phone className="h-4 w-4 text-teal-700" />} label="Phone" value={myClinic.contact?.phone} />
                        <StatCard icon={<Mail className="h-4 w-4 text-teal-700" />} label="Email" value={myClinic.contact?.email} />
                        <StatCard icon={<Users className="h-4 w-4 text-teal-700" />} label="Doctors" value={`${doctorCount} member${doctorCount === 1 ? "" : "s"}`} />
                        <StatCard icon={<Settings className="h-4 w-4 text-teal-700" />} label="Role" value={myClinic.viewerClinicRole || "member"} />
                    </div>

                    {!isEditing ? (
                        <>
                            <div className="grid gap-4 lg:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <Clock className="h-4 w-4 text-teal-700" />
                                        Operating hours
                                    </p>
                                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                                        <p>Weekdays: {myClinic.operatingHours?.weekdays?.open || "--"} - {myClinic.operatingHours?.weekdays?.close || "--"}</p>
                                        <p>Weekends: {myClinic.operatingHours?.weekends?.open || "Closed"} {myClinic.operatingHours?.weekends?.close ? `- ${myClinic.operatingHours.weekends.close}` : ""}</p>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                        <Settings className="h-4 w-4 text-teal-700" />
                                        Appointment settings
                                    </p>
                                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                                        <p>Slot duration: {myClinic.appointmentSettings?.slotDuration || 30} minutes</p>
                                        <p>Max daily appointments: {myClinic.appointmentSettings?.maxDailyAppointments || 20}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                    <Building2 className="h-4 w-4 text-teal-700" />
                                    Facilities
                                </p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {(myClinic.facilities || []).length ? (
                                        myClinic.facilities.map((facility) => (
                                            <span key={facility} className="rounded-xl bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800">{facility}</span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-slate-500">Not provided</span>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                    <Users className="h-4 w-4 text-teal-700" />
                                    Clinic doctors
                                </p>
                                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                    {(myClinic.doctors || []).map((doctor) => (
                                        <div key={doctor._id || doctor.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="font-semibold text-slate-950">{doctor.name || doctor.username}</p>
                                            <p className="mt-1 text-sm text-slate-500">{doctor.specialty || "Doctor"}</p>
                                            <p className="mt-1 text-sm text-slate-500">{doctor.email}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {canManage ? (
                                <button type="button" onClick={() => setIsEditing(true)} className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">
                                    Edit clinic details
                                </button>
                            ) : (
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                    You can view clinic details. Only the clinic owner can edit them.
                                </div>
                            )}
                        </>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid gap-4 lg:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-slate-700">Clinic name</span>
                                    <input name="name" value={formData.name} onChange={handleChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" required />
                                </label>
                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-slate-700">Clinic email</span>
                                    <input type="email" value={formData.contact.email} onChange={(event) => updateGroup("contact", "email", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" required />
                                </label>
                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-slate-700">Clinic phone</span>
                                    <input type="tel" value={formData.contact.phone} onChange={(event) => updateGroup("contact", "phone", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" required />
                                </label>
                                <label className="block">
                                    <span className="mb-1 block text-sm font-semibold text-slate-700">Facilities</span>
                                    <input value={formData.facilitiesText} onChange={(event) => setFormData((current) => ({ ...current, facilitiesText: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" placeholder="Comma separated" />
                                </label>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-sm font-semibold text-slate-900">Address</p>
                                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {Object.entries({ street: "Street", city: "City", state: "State", postalCode: "Postal code", country: "Country" }).map(([field, label]) => (
                                        <label key={field} className="block">
                                            <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
                                            <input value={formData.address[field]} onChange={(event) => updateGroup("address", field, event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" required={field !== "country" ? true : undefined} />
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-2">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-sm font-semibold text-slate-900">Operating hours</p>
                                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                        <label className="block">
                                            <span className="mb-1 block text-sm font-semibold text-slate-700">Weekday open</span>
                                            <input type="time" value={formData.operatingHours.weekdays.open} onChange={(event) => updateHours("weekdays", "open", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" required />
                                        </label>
                                        <label className="block">
                                            <span className="mb-1 block text-sm font-semibold text-slate-700">Weekday close</span>
                                            <input type="time" value={formData.operatingHours.weekdays.close} onChange={(event) => updateHours("weekdays", "close", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" required />
                                        </label>
                                        <label className="block">
                                            <span className="mb-1 block text-sm font-semibold text-slate-700">Weekend open</span>
                                            <input type="time" value={formData.operatingHours.weekends.open} onChange={(event) => updateHours("weekends", "open", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" />
                                        </label>
                                        <label className="block">
                                            <span className="mb-1 block text-sm font-semibold text-slate-700">Weekend close</span>
                                            <input type="time" value={formData.operatingHours.weekends.close} onChange={(event) => updateHours("weekends", "close", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" />
                                        </label>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-sm font-semibold text-slate-900">Appointment settings</p>
                                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <span className="mb-1 block text-sm font-semibold text-slate-700">Slot duration</span>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[15, 30, 45, 60].map((duration) => (
                                                    <button
                                                        key={duration}
                                                        type="button"
                                                        onClick={() => updateSettings("slotDuration", duration)}
                                                        className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                                                            Number(formData.appointmentSettings.slotDuration) === duration
                                                                ? "border-teal-200 bg-teal-50 text-teal-800"
                                                                : "border-slate-200 bg-white text-slate-600 hover:border-teal-200"
                                                        }`}
                                                    >
                                                        {duration} min
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <label className="block">
                                            <span className="mb-1 block text-sm font-semibold text-slate-700">Max daily appointments</span>
                                            <input type="number" min="1" value={formData.appointmentSettings.maxDailyAppointments} onChange={(event) => updateSettings("maxDailyAppointments", event.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100" />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button type="button" onClick={handleCancel} className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-70">
                                    <Save className="h-4 w-4" />
                                    {isLoading ? "Saving..." : "Save clinic"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </section>
        </div>
    );
};

export default ClinicWorkspace;
