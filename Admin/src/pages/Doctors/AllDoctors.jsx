import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BookOpen, CalendarDays, Clock, Edit3, GraduationCap, Mail, MapPin, Phone, Plus, Stethoscope, Trash2, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { EmptyState, PageHeader, SearchInput, SegmentedControl, StatusPill } from "../../components/AdminUI.jsx";
import { createDoctor, deleteDoctor, getAllDoctors, resetDoctorState, updateDoctor, updateDoctorApproval } from "../../features/Doctors/DoctorSlice.js";
import DoctorModal from "./DoctorFormModal.jsx";

const APPROVAL_STATUSES = ["pending", "approved", "rejected"];
const statusOptions = [
    { value: "all", label: "All" },
    ...APPROVAL_STATUSES.map((status) => ({ value: status, label: status })),
];

const statusTone = (status) => {
    if (status === "approved") return "emerald";
    if (status === "rejected") return "rose";
    return "amber";
};

const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) return "Not available";
    return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const DoctorsPage = () => {
    const dispatch = useDispatch();
    const { doctors = [], isLoading, isError, isSuccess, message } = useSelector((state) => state.doctor);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [expandedDoctor, setExpandedDoctor] = useState(null);

    useEffect(() => {
        dispatch(getAllDoctors());
        return () => dispatch(resetDoctorState());
    }, [dispatch]);

    useEffect(() => {
        if (isError) toast.error(message);
        if (isSuccess && message) toast.success(message);
    }, [isError, isSuccess, message]);

    const filteredDoctors = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return doctors.filter((doctor) => {
            const status = doctor.approvalStatus || "approved";
            const matchesStatus = statusFilter === "all" || status === statusFilter;
            const matchesSearch =
                !query ||
                (doctor.name || "").toLowerCase().includes(query) ||
                (doctor.specialty || "").toLowerCase().includes(query) ||
                (doctor.contact?.email || "").toLowerCase().includes(query) ||
                (doctor.contact?.phone || "").toLowerCase().includes(query);

            return matchesStatus && matchesSearch;
        });
    }, [doctors, searchTerm, statusFilter]);

    const handleDelete = (id) => {
        if (!window.confirm("Are you sure you want to delete this doctor?")) return;
        dispatch(deleteDoctor(id));
        toast.success("Doctor deleted successfully");
    };

    const handleSubmitDoctor = async ({ id, updatedData }) => {
        try {
            if (id) {
                await dispatch(updateDoctor({ id, updatedData })).unwrap();
                toast.success("Doctor updated successfully");
            } else {
                await dispatch(createDoctor({ ...updatedData, password: "123456" })).unwrap();
                toast.success("Doctor created successfully");
            }
            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.message || "Failed to save doctor");
        }
    };

    const handleApproval = async (doctorId, approvalStatus) => {
        try {
            await dispatch(updateDoctorApproval({ id: doctorId, approvalStatus })).unwrap();
            toast.success(`Doctor ${approvalStatus} successfully`);
        } catch (error) {
            toast.error(error.message || "Failed to update approval");
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Doctors"
                title="Doctors management"
                description="Approve doctor access, edit professional profiles, and review booking-facing details."
                action={(
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedDoctor(null);
                            setIsModalOpen(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
                    >
                        <Plus className="h-4 w-4" />
                        Add doctor
                    </button>
                )}
            />

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                    <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search doctors by name, specialty, email, or phone..." />
                    <SegmentedControl options={statusOptions} value={statusFilter} onChange={setStatusFilter} />
                </div>

                {isLoading ? (
                    <div className="mt-5 grid gap-4">
                        {[1, 2, 3].map((item) => <div key={item} className="h-52 animate-pulse rounded-3xl bg-slate-100" />)}
                    </div>
                ) : filteredDoctors.length ? (
                    <div className="mt-5 space-y-4">
                        {filteredDoctors.map((doctor) => {
                            const status = doctor.approvalStatus || "approved";
                            const expanded = expandedDoctor === doctor._id;

                            return (
                                <article key={doctor._id} className="rounded-3xl border border-slate-200 bg-white p-4 transition hover:border-teal-200 hover:shadow-sm">
                                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
                                        <div className="flex min-w-0 gap-4">
                                            {doctor.image ? (
                                                <img className="h-20 w-20 shrink-0 rounded-3xl object-cover" src={doctor.image} alt={doctor.name || "Doctor"} />
                                            ) : (
                                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-teal-50 text-teal-700">
                                                    <UserRound className="h-9 w-9" />
                                                </div>
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="text-xl font-bold text-slate-950">{doctor.name || "Unnamed doctor"}</h2>
                                                    <StatusPill tone="teal">{doctor.specialty || "Specialty N/A"}</StatusPill>
                                                    <StatusPill tone={statusTone(status)}>{status}</StatusPill>
                                                </div>
                                                <p className="mt-1 text-sm text-slate-500">{doctor.qualification || "Qualification not provided"}</p>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {(doctor.specializations || []).map((spec) => (
                                                        <span key={spec} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{spec}</span>
                                                    ))}
                                                </div>
                                                <div className="mt-3 grid gap-2 text-sm text-slate-600">
                                                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-teal-700" />{doctor.contact?.phone || "Phone unavailable"}</p>
                                                    <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-teal-700" />{doctor.contact?.email || "Email unavailable"}</p>
                                                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-teal-700" />{doctor.contact?.address || "Address unavailable"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex flex-wrap justify-start gap-2 xl:justify-end">
                                                {APPROVAL_STATUSES.map((option) => (
                                                    <button
                                                        key={option}
                                                        type="button"
                                                        onClick={() => handleApproval(doctor._id, option)}
                                                        disabled={status === option}
                                                        className={`rounded-2xl border px-3 py-2 text-xs font-semibold capitalize ${
                                                            status === option
                                                                ? "border-teal-200 bg-teal-50 text-teal-800"
                                                                : "border-slate-200 text-slate-600 hover:border-teal-200"
                                                        }`}
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="flex flex-wrap items-center justify-start gap-2 xl:justify-end">
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                                                    <CalendarDays className="h-4 w-4 text-teal-700" />
                                                    Joined {formatDate(doctor.createdAt)}
                                                </span>
                                                <button type="button" onClick={() => setExpandedDoctor(expanded ? null : doctor._id)} className="rounded-2xl border border-teal-200 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50">
                                                    {expanded ? "Hide details" : "View profile"}
                                                </button>
                                                <button type="button" onClick={() => { setSelectedDoctor(doctor); setIsModalOpen(true); }} className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal-200 text-teal-700 hover:bg-teal-50" aria-label="Edit doctor">
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button type="button" onClick={() => handleDelete(doctor._id)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-100 text-rose-600 hover:bg-rose-50" aria-label="Delete doctor">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {expanded ? (
                                        <div className="mt-5 grid gap-4 border-t border-slate-200 pt-5 md:grid-cols-2">
                                            <DetailBlock title="Working hours" icon={<Clock className="h-4 w-4 text-teal-700" />} items={(doctor.workingHours || []).map((item) => `${item.days}: ${item.hours}`)} />
                                            <DetailBlock title="Education" icon={<GraduationCap className="h-4 w-4 text-teal-700" />} items={doctor.education || []} />
                                            <DetailBlock title="Biography" icon={<BookOpen className="h-4 w-4 text-teal-700" />} items={doctor.biography || []} wide />
                                        </div>
                                    ) : null}
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-5">
                        <EmptyState icon={<Stethoscope className="h-7 w-7" />} title="No doctors found" description="Try another search or approval filter." />
                    </div>
                )}
            </section>

            <DoctorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                doctor={selectedDoctor}
                onSubmit={handleSubmitDoctor}
                isLoading={isLoading}
            />
        </div>
    );
};

const DetailBlock = ({ title, icon, items, wide = false }) => (
    <div className={`rounded-2xl border border-slate-200 bg-slate-50 p-4 ${wide ? "md:col-span-2" : ""}`}>
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-950">{icon}{title}</h3>
        {items.length ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {items.map((item, index) => <li key={`${item}-${index}`} className="rounded-xl bg-white px-3 py-2">{item}</li>)}
            </ul>
        ) : (
            <p className="mt-3 text-sm text-slate-500">Not provided</p>
        )}
    </div>
);

export default DoctorsPage;
