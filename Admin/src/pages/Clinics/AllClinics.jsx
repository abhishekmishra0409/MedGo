import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2, Clock, Edit3, Mail, MapPin, Plus, Trash2, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { EmptyState, PageHeader, SearchInput, StatusPill } from "../../components/AdminUI.jsx";
import { addDoctorToClinic, createClinic, getClinics, removeDoctorFromClinic, resetClinicState, updateClinic } from "../../features/Clinics/ClinicSlice";
import { getAllDoctors } from "../../features/Doctors/DoctorSlice";
import ClinicModal from "./ClinicModal";

const formatTime = (time) => {
    if (!time) return "Closed";
    const [hours, minutes] = time.split(":");
    const hour = Number(hours);
    if (Number.isNaN(hour)) return time;
    return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
};

const ClinicPage = () => {
    const dispatch = useDispatch();
    const { clinics = [], isLoading: isClinicLoading, isError: isClinicError, isSuccess: isClinicSuccess, message: clinicMessage } = useSelector((state) => state.clinic);
    const { doctors: allDoctors = [], isLoading: isDoctorLoading } = useSelector((state) => state.doctor);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [expandedClinic, setExpandedClinic] = useState(null);
    const [showAddDoctor, setShowAddDoctor] = useState(null);

    useEffect(() => {
        dispatch(getClinics());
        dispatch(getAllDoctors());
        return () => dispatch(resetClinicState());
    }, [dispatch]);

    useEffect(() => {
        if (isClinicError) toast.error(clinicMessage);
        if (isClinicSuccess && clinicMessage) toast.success(clinicMessage);
    }, [isClinicError, isClinicSuccess, clinicMessage]);

    const filteredClinics = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return clinics.filter((clinic) =>
            !query ||
            (clinic.name || "").toLowerCase().includes(query) ||
            (clinic.address?.city || "").toLowerCase().includes(query) ||
            (clinic.contact?.email || "").toLowerCase().includes(query) ||
            (clinic.contact?.phone || "").toLowerCase().includes(query)
        );
    }, [clinics, searchTerm]);

    const handleSubmitClinic = async ({ id, clinicData }) => {
        try {
            if (id) {
                await dispatch(updateClinic({ id, clinicData })).unwrap();
                toast.success("Clinic updated successfully");
            } else {
                await dispatch(createClinic(clinicData)).unwrap();
                toast.success("Clinic registered successfully");
            }
            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.message || "Failed to save clinic");
        }
    };

    const handleAddDoctor = async (clinicId, doctorId) => {
        if (!doctorId) return;
        try {
            await dispatch(addDoctorToClinic({ clinicId, doctorData: { doctorId } })).unwrap();
            setShowAddDoctor(null);
            toast.success("Doctor added successfully");
        } catch (error) {
            toast.error(error.message || "Failed to add doctor");
        }
    };

    const handleRemoveDoctor = async (clinicId, doctorId) => {
        if (!window.confirm("Are you sure you want to remove this doctor from the clinic?")) return;
        try {
            await dispatch(removeDoctorFromClinic({ clinicId, doctorId })).unwrap();
            toast.success("Doctor removed successfully");
        } catch (error) {
            toast.error(error.message || "Failed to remove doctor");
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Clinics"
                title="Clinics management"
                description="Manage clinic profiles, access codes, assigned doctors, hours, and appointment settings."
                action={(
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedClinic(null);
                            setIsModalOpen(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
                    >
                        <Plus className="h-4 w-4" />
                        Add clinic
                    </button>
                )}
            />

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search clinics by name, city, email, or phone..." />

                {isClinicLoading ? (
                    <div className="mt-5 grid gap-4">
                        {[1, 2, 3].map((item) => <div key={item} className="h-52 animate-pulse rounded-3xl bg-slate-100" />)}
                    </div>
                ) : filteredClinics.length ? (
                    <div className="mt-5 space-y-4">
                        {filteredClinics.map((clinic) => {
                            const expanded = expandedClinic === clinic._id;
                            const assignableDoctors = allDoctors
                                .filter((doctor) => doctor.approvalStatus === "approved")
                                .filter((doctor) => !clinic.doctors?.some((assigned) => assigned._id === doctor._id));

                            return (
                                <article key={clinic._id} className="rounded-3xl border border-slate-200 bg-white p-4 transition hover:border-teal-200 hover:shadow-sm">
                                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
                                        <div className="flex min-w-0 gap-4">
                                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-teal-50 text-teal-700">
                                                <Building2 className="h-8 w-8" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="text-xl font-bold text-slate-950">{clinic.name || "Unnamed clinic"}</h2>
                                                    <StatusPill tone={clinic.isActive ? "emerald" : "amber"}>{clinic.isActive ? "Active" : "Pending activation"}</StatusPill>
                                                </div>
                                                <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                                                    <MapPin className="h-4 w-4 text-teal-700" />
                                                    {[clinic.address?.street, clinic.address?.city, clinic.address?.state].filter(Boolean).join(", ") || "Address unavailable"}
                                                </p>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {clinic.owner?.name ? <StatusPill tone="teal">Owner: {clinic.owner.name}</StatusPill> : null}
                                                    {clinic.accessCode ? <StatusPill tone="slate">Access code: {clinic.accessCode}</StatusPill> : null}
                                                </div>
                                                <div className="mt-3 grid gap-2 text-sm text-slate-600">
                                                    <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-teal-700" />{clinic.contact?.email || "Email unavailable"}</p>
                                                    <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-teal-700" />{formatTime(clinic.operatingHours?.weekdays?.open)} - {formatTime(clinic.operatingHours?.weekdays?.close)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap justify-start gap-2 xl:justify-end">
                                            <button type="button" onClick={() => setExpandedClinic(expanded ? null : clinic._id)} className="rounded-2xl border border-teal-200 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50">
                                                {expanded ? "Hide details" : "View details"}
                                            </button>
                                            <button type="button" onClick={() => { setSelectedClinic(clinic); setIsModalOpen(true); }} className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-200 text-teal-700 hover:bg-teal-50" aria-label="Edit clinic">
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {expanded ? (
                                        <div className="mt-5 space-y-4 border-t border-slate-200 pt-5">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <DetailBlock title="Operating hours" rows={[
                                                    ["Weekdays", `${formatTime(clinic.operatingHours?.weekdays?.open)} - ${formatTime(clinic.operatingHours?.weekdays?.close)}`],
                                                    ["Weekends", clinic.operatingHours?.weekends?.open ? `${formatTime(clinic.operatingHours.weekends.open)} - ${formatTime(clinic.operatingHours.weekends.close)}` : "Closed"],
                                                ]} />
                                                <DetailBlock title="Appointment settings" rows={[
                                                    ["Slot duration", `${clinic.appointmentSettings?.slotDuration || "N/A"} minutes`],
                                                    ["Max daily appointments", clinic.appointmentSettings?.maxDailyAppointments || "N/A"],
                                                ]} />
                                            </div>

                                            {clinic.facilities?.length ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {clinic.facilities.map((facility) => <StatusPill key={facility} tone="emerald">{facility}</StatusPill>)}
                                                </div>
                                            ) : null}

                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                                    <h3 className="text-sm font-bold text-slate-950">Doctors ({clinic.doctors?.length || 0})</h3>
                                                    <button type="button" onClick={() => setShowAddDoctor(showAddDoctor === clinic._id ? null : clinic._id)} className="rounded-2xl border border-teal-200 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-white">
                                                        {showAddDoctor === clinic._id ? "Cancel" : "Add doctor"}
                                                    </button>
                                                </div>

                                                {showAddDoctor === clinic._id ? (
                                                    <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                                        {isDoctorLoading ? <p className="text-sm text-slate-500">Loading doctors...</p> : assignableDoctors.length ? assignableDoctors.map((doctor) => (
                                                            <button key={doctor._id} type="button" onClick={() => handleAddDoctor(clinic._id, doctor._id)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm hover:border-teal-200">
                                                                <span className="font-semibold text-slate-950">{doctor.name}</span>
                                                                <span className="mt-1 block text-xs text-slate-500">{doctor.specialty}</span>
                                                            </button>
                                                        )) : <p className="text-sm text-slate-500">No available approved doctors.</p>}
                                                    </div>
                                                ) : null}

                                                {clinic.doctors?.length ? (
                                                    <div className="grid gap-3 md:grid-cols-2">
                                                        {clinic.doctors.map((doctor) => (
                                                            <div key={doctor._id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3">
                                                                <div className="flex min-w-0 items-center gap-3">
                                                                    {doctor.image ? <img src={doctor.image} alt={doctor.name} className="h-10 w-10 rounded-full object-cover" /> : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 text-teal-700"><UserRound className="h-5 w-5" /></div>}
                                                                    <div className="min-w-0">
                                                                        <p className="truncate text-sm font-semibold text-slate-950">{doctor.name}</p>
                                                                        <p className="truncate text-xs text-slate-500">{doctor.specialty}</p>
                                                                    </div>
                                                                </div>
                                                                <button type="button" onClick={() => handleRemoveDoctor(clinic._id, doctor._id)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 text-rose-600 hover:bg-rose-50" aria-label="Remove doctor">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : <p className="text-sm text-slate-500">No doctors assigned yet.</p>}
                                            </div>
                                        </div>
                                    ) : null}
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-5">
                        <EmptyState icon={<Building2 className="h-7 w-7" />} title="No clinics found" description="Try another search or add a clinic." />
                    </div>
                )}
            </section>

            <ClinicModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} clinic={selectedClinic} onSubmit={handleSubmitClinic} isLoading={isClinicLoading} />
        </div>
    );
};

const DetailBlock = ({ title, rows }) => (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-bold text-slate-950">{title}</h3>
        <div className="mt-3 space-y-2">
            {rows.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-semibold text-slate-950">{value}</span>
                </div>
            ))}
        </div>
    </div>
);

export default ClinicPage;
