import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BadgeCheck, Check, Loader2, Mail, Phone, Users, X } from "lucide-react";
import { fetchMyRoster, updateRosterMembership } from "../../features/Clinic/ClinicSlice.js";
import EmptyState from "../../component/ui/EmptyState.jsx";

const membershipTone = {
    pending: "border-amber-200 bg-amber-50 text-amber-800",
    approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
    rejected: "border-rose-200 bg-rose-50 text-rose-700",
    none: "border-slate-200 bg-slate-100 text-slate-600",
};

const approvalTone = {
    pending: "border-amber-200 bg-amber-50 text-amber-800",
    approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
    rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

const Pill = ({ tone, children }) => (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold capitalize ${tone}`}>
        {children}
    </span>
);

const DoctorRoster = () => {
    const dispatch = useDispatch();
    const { roster = [], isLoading } = useSelector((state) => state.clinic);
    const [actingId, setActingId] = useState(null);

    // Shared by doctor-owners (/doctor/roster) and clinic-owner accounts
    // (/clinic/roster). The server requires the acting owner to be
    // platform-approved before they can decide roster membership (see
    // clinicService.updateRosterMembership) — checked here too so the page
    // shows a clear reason instead of letting the buttons fail with a 400.
    const ownerApprovalStatus = useSelector((state) => state.owner.profile?.ownerProfile?.approvalStatus);
    const doctorApprovalStatus = useSelector((state) => state.doctor.profile?.approvalStatus);
    const isOwnerRole = useSelector((state) => state.owner.isAuthenticated);
    const canDecide = isOwnerRole ? ownerApprovalStatus === "approved" : doctorApprovalStatus === "approved";

    useEffect(() => {
        dispatch(fetchMyRoster());
    }, [dispatch]);

    const handleDecision = async (doctorId, status) => {
        setActingId(doctorId);
        await dispatch(updateRosterMembership({ doctorId, status }));
        setActingId(null);
    };

    const pending = roster.filter((doctor) => doctor.clinicMembershipStatus === "pending");
    const decided = roster.filter((doctor) => doctor.clinicMembershipStatus !== "pending");

    const DoctorCard = ({ doctor }) => (
        <div className="rounded-3xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                        <Users className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-950">{doctor.name || "Unnamed doctor"}</p>
                        <p className="text-sm text-slate-500">{doctor.specialty || "Specialty not provided"}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <Pill tone={approvalTone[doctor.approvalStatus] || approvalTone.pending}>platform: {doctor.approvalStatus || "pending"}</Pill>
                            <Pill tone={membershipTone[doctor.clinicMembershipStatus] || membershipTone.none}>roster: {doctor.clinicMembershipStatus || "none"}</Pill>
                        </div>
                    </div>
                </div>

                {doctor.clinicMembershipStatus === "pending" ? (
                    <div className="flex shrink-0 gap-2">
                        <button
                            type="button"
                            onClick={() => handleDecision(doctor._id, "approved")}
                            disabled={actingId === doctor._id || !canDecide}
                            title={canDecide ? undefined : "Your account needs platform approval before you can manage the roster"}
                            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {actingId === doctor._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                            Approve
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDecision(doctor._id, "rejected")}
                            disabled={actingId === doctor._id || !canDecide}
                            title={canDecide ? undefined : "Your account needs platform approval before you can manage the roster"}
                            className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <X className="h-4 w-4" />
                            Reject
                        </button>
                    </div>
                ) : doctor.clinicMembershipStatus === "approved" ? (
                    <button
                        type="button"
                        onClick={() => handleDecision(doctor._id, "rejected")}
                        disabled={actingId === doctor._id || !canDecide}
                        title={canDecide ? undefined : "Your account needs platform approval before you can manage the roster"}
                        className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:border-rose-200 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {actingId === doctor._id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Remove from roster
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={() => handleDecision(doctor._id, "approved")}
                        disabled={actingId === doctor._id || !canDecide}
                        title={canDecide ? undefined : "Your account needs platform approval before you can manage the roster"}
                        className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-teal-200 px-3 text-sm font-semibold text-teal-700 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {actingId === doctor._id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        Re-approve
                    </button>
                )}
            </div>

            <div className="mt-3 grid gap-1.5 text-sm text-slate-600">
                <p className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-teal-700" />{doctor.councilRegistrationNumber ? `${doctor.councilRegistrationNumber} — ${doctor.councilName || "council not specified"}` : "No council registration on file"}</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-teal-700" />{doctor.contact?.phone || doctor.phone || "Phone unavailable"}</p>
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-teal-700" />{doctor.contact?.email || doctor.email || "Email unavailable"}</p>
            </div>
        </div>
    );

    return (
        <div className="w-full space-y-5">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Doctor roster</p>
                <h1 className="mt-1 text-2xl font-semibold text-slate-950">Who's on your clinic</h1>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                    A doctor who joins with your access code shows up here as pending. Approving adds them to your public roster;
                    they still need separate platform approval before patients can book them.
                </p>
            </div>

            {!canDecide ? (
                <div className="auth-alert auth-alert--info">
                    Your own account needs platform approval before you can decide roster membership. You can still see who's
                    waiting below.
                </div>
            ) : null}

            {isLoading && !roster.length ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading roster...</div>
            ) : roster.length ? (
                <div className="space-y-6">
                    {pending.length ? (
                        <section className="space-y-3">
                            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-amber-700">Awaiting your decision ({pending.length})</h2>
                            {pending.map((doctor) => <DoctorCard key={doctor._id} doctor={doctor} />)}
                        </section>
                    ) : null}

                    {decided.length ? (
                        <section className="space-y-3">
                            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Roster</h2>
                            {decided.map((doctor) => <DoctorCard key={doctor._id} doctor={doctor} />)}
                        </section>
                    ) : null}
                </div>
            ) : (
                <EmptyState
                    icon={Users}
                    title="No doctors yet"
                    message="Share your clinic's access code with doctors — they'll appear here once they register."
                    className="h-52"
                />
            )}
        </div>
    );
};

export default DoctorRoster;
