import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Building2, Hospital, Mail, MapPin, Phone } from "lucide-react";
import toast from "react-hot-toast";
import { EmptyState, PageHeader, SearchInput, SegmentedControl, StatusPill } from "../../components/AdminUI.jsx";
import { getAllOwners, resetOwnerState, updateOwnerApproval } from "../../features/Owners/OwnerSlice.js";
import { getClinics } from "../../features/Clinics/ClinicSlice.js";

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

const AllOwners = () => {
    const dispatch = useDispatch();
    const { owners = [], isLoading, isError, isSuccess, message } = useSelector((state) => state.owner);
    const { clinics = [] } = useSelector((state) => state.clinic);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        dispatch(getAllOwners());
        dispatch(getClinics());
        return () => dispatch(resetOwnerState());
    }, [dispatch]);

    useEffect(() => {
        if (isError) toast.error(message);
        if (isSuccess && message) toast.success(message);
    }, [isError, isSuccess, message]);

    const clinicByOwnerId = useMemo(() => {
        const map = new Map();
        clinics.forEach((clinic) => {
            const ownerId = clinic.owner?._id || clinic.owner;
            if (ownerId) map.set(String(ownerId), clinic);
        });
        return map;
    }, [clinics]);

    const filteredOwners = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        return owners.filter((owner) => {
            const status = owner.ownerProfile?.approvalStatus || "pending";
            const matchesStatus = statusFilter === "all" || status === statusFilter;
            const matchesSearch =
                !query ||
                (owner.name || "").toLowerCase().includes(query) ||
                (owner.email || "").toLowerCase().includes(query) ||
                (owner.phone || "").toLowerCase().includes(query);

            return matchesStatus && matchesSearch;
        });
    }, [owners, searchTerm, statusFilter]);

    const handleApproval = async (ownerId, approvalStatus) => {
        try {
            await dispatch(updateOwnerApproval({ id: ownerId, approvalStatus })).unwrap();
            toast.success(`Clinic owner ${approvalStatus} successfully`);
        } catch (error) {
            toast.error(error.message || "Failed to update approval");
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Clinic owners"
                title="Clinic & hospital owners"
                description="Approve non-doctor facility owners before their clinic goes live and they can manage a doctor roster."
            />

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                    <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search owners by name, email, or phone..." />
                    <SegmentedControl options={statusOptions} value={statusFilter} onChange={setStatusFilter} />
                </div>

                {isLoading ? (
                    <div className="mt-5 grid gap-4">
                        {[1, 2, 3].map((item) => <div key={item} className="h-40 animate-pulse rounded-3xl bg-slate-100" />)}
                    </div>
                ) : filteredOwners.length ? (
                    <div className="mt-5 space-y-4">
                        {filteredOwners.map((owner) => {
                            const status = owner.ownerProfile?.approvalStatus || "pending";
                            const clinic = clinicByOwnerId.get(String(owner._id));

                            return (
                                <article key={owner._id} className="rounded-3xl border border-slate-200 bg-white p-4 transition hover:border-teal-200 hover:shadow-sm">
                                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
                                        <div className="flex min-w-0 gap-4">
                                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-teal-50 text-teal-700">
                                                <Hospital className="h-8 w-8" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h2 className="text-xl font-bold text-slate-950">{owner.name || owner.username || "Unnamed owner"}</h2>
                                                    <StatusPill tone={statusTone(status)}>{status}</StatusPill>
                                                </div>
                                                <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                                                    <Building2 className="h-4 w-4 text-teal-700" />
                                                    {clinic ? clinic.name : "No facility linked yet"}
                                                </p>
                                                <div className="mt-3 grid gap-2 text-sm text-slate-600">
                                                    <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-teal-700" />{owner.phone || "Phone unavailable"}</p>
                                                    <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-teal-700" />{owner.email || "Email unavailable"}</p>
                                                    {clinic ? (
                                                        <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-teal-700" />
                                                            {[clinic.address?.street, clinic.address?.city, clinic.address?.state].filter(Boolean).join(", ") || "Address unavailable"}
                                                        </p>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex flex-wrap justify-start gap-2 xl:justify-end">
                                                {APPROVAL_STATUSES.map((option) => (
                                                    <button
                                                        key={option}
                                                        type="button"
                                                        onClick={() => handleApproval(owner._id, option)}
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
                                            <p className="text-right text-xs font-semibold text-slate-500 xl:text-right">
                                                Joined {formatDate(owner.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-5">
                        <EmptyState icon={<Hospital className="h-7 w-7" />} title="No clinic owners found" description="Try another search or approval filter." />
                    </div>
                )}
            </section>
        </div>
    );
};

export default AllOwners;
