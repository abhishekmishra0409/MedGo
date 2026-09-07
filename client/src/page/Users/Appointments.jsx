import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { format, isAfter, isBefore } from "date-fns";
import {
    AlertCircle,
    Building2,
    CalendarDays,
    ChevronRight,
    Clock3,
    FileText,
    MapPin,
    MessageSquareText,
    Stethoscope,
    Video,
    X,
} from "lucide-react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { cancelAppointment, getMyAppointments } from "../../features/Appointment/AppointmentSlice.js";
import JoinTeleconsultation from "../../component/Appointments/JoinTeleconsultation.jsx";

const statusStyles = {
    pending: "border-amber-200 bg-amber-50 text-amber-800",
    confirmed: "border-teal-200 bg-teal-50 text-teal-800",
    completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
    cancelled: "border-rose-200 bg-rose-50 text-rose-800",
    "no-show": "border-slate-200 bg-slate-100 text-slate-700",
};

const paymentStyles = {
    pending: "bg-amber-50 text-amber-800",
    paid: "bg-emerald-50 text-emerald-800",
    refunded: "bg-slate-100 text-slate-700",
    failed: "bg-rose-50 text-rose-800",
};

const safeFormatDate = (dateString, pattern = "MMM dd, yyyy") => {
    if (!dateString) return "Not scheduled";
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) return "Not scheduled";
    return format(parsed, pattern);
};

const safeFormatTime = (timeString) => {
    if (!timeString) return "N/A";
    const parsed = new Date(`1970-01-01T${timeString}`);
    if (Number.isNaN(parsed.getTime())) return timeString;
    return format(parsed, "h:mm a");
};

const buildAppointmentDateTime = (appointment) => {
    if (!appointment?.date) return null;
    const parsedDay = new Date(appointment.date);
    if (Number.isNaN(parsedDay.getTime())) return null;

    const day = format(parsedDay, "yyyy-MM-dd");
    const start = appointment.timeSlot?.start || "00:00";
    const date = new Date(`${day}T${start}`);

    // An unreadable time still has a usable date — bucket it at midnight rather
    // than dropping the appointment out of the list and the counts entirely.
    return Number.isNaN(date.getTime()) ? new Date(`${day}T00:00`) : date;
};

const formatAddress = (clinic) => {
    if (!clinic?.address) return "Clinic address not available";
    const { street, city, state, postalCode, country } = clinic.address;
    return [street, city, state, postalCode, country].filter(Boolean).join(", ") || "Clinic address not available";
};

const StatusBadge = ({ status }) => (
    <span className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[status] || "border-slate-200 bg-slate-100 text-slate-700"}`}>
        {status || "unknown"}
    </span>
);

const InfoPill = ({ icon, children }) => (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
        {icon}
        {children}
    </span>
);

const EmptyState = ({ activeTab }) => (
    <div className="rounded-3xl border border-dashed border-teal-200 bg-teal-50/50 px-6 py-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm">
            <CalendarDays className="h-7 w-7" />
        </div>
        <h3 className="mt-5 text-xl font-bold text-slate-950">
            {activeTab === "upcoming" ? "No upcoming appointments" : "No past appointments"}
        </h3>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
            {activeTab === "upcoming"
                ? "When you book a consultation, the appointment card will appear here with doctor, clinic, time, and visit details."
                : "Completed, cancelled, and older appointments will appear here for quick reference."}
        </p>
        {activeTab === "upcoming" ? (
            <Link
                to="/doctorlists"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
            >
                Find a doctor
                <ChevronRight className="h-4 w-4" />
            </Link>
        ) : null}
    </div>
);

const AppointmentCard = ({ appointment, onViewDetails, onViewClinic, onCancel }) => {
    const doctorName = appointment.doctor?.name || appointment.doctor?.username || "Doctor unavailable";
    const doctorInitial = doctorName.charAt(0).toUpperCase();
    const clinicName = appointment.clinic?.name || "Clinic not assigned";
    const isVirtual = appointment.type === "teleconsultation";
    const dateLabel = safeFormatDate(appointment.date, "EEEE, MMM dd");
    const timeLabel = `${safeFormatTime(appointment.timeSlot?.start)} - ${safeFormatTime(appointment.timeSlot?.end)}`;
    const canCancel = ["pending", "confirmed"].includes(appointment.status);

    return (
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-teal-100 text-lg font-bold text-teal-800">
                        {appointment.doctor?.image ? (
                            <img src={appointment.doctor.image} alt={doctorName} className="h-full w-full object-cover" />
                        ) : (
                            doctorInitial
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-950">{doctorName}</h3>
                            <StatusBadge status={appointment.status} />
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                            {appointment.doctor?.specialty || appointment.doctor?.qualification || "Care team details unavailable"}
                        </p>
                        {!appointment.doctor ? (
                            <p className="mt-2 inline-flex items-center gap-2 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                                <AlertCircle className="h-4 w-4" />
                                This older appointment is missing doctor details.
                            </p>
                        ) : null}
                    </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:min-w-[24rem]">
                    <InfoPill icon={<CalendarDays className="h-3.5 w-3.5 text-teal-700" />}>{dateLabel}</InfoPill>
                    <InfoPill icon={<Clock3 className="h-3.5 w-3.5 text-teal-700" />}>{timeLabel}</InfoPill>
                    <InfoPill icon={isVirtual ? <Video className="h-3.5 w-3.5 text-teal-700" /> : <Building2 className="h-3.5 w-3.5 text-teal-700" />}>{isVirtual ? "Teleconsultation" : "In-person"}</InfoPill>
                    <InfoPill icon={<MapPin className="h-3.5 w-3.5 text-teal-700" />}>{clinicName}</InfoPill>
                </div>
            </div>

            <div className="mt-5 grid gap-4 border-t border-slate-100 pt-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Reason</p>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-700">
                        {appointment.reason || "No reason added."}
                    </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <JoinTeleconsultation appointment={appointment} tokenKey="userToken" />
                    {appointment.doctor?._id && appointment.status !== "cancelled" ? (
                        <Link
                            to={`/user/messages?doctorId=${appointment.doctor._id}&appointmentId=${appointment._id}`}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-teal-200 px-4 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
                        >
                            <MessageSquareText className="h-4 w-4" />
                            Message
                        </Link>
                    ) : null}
                    {appointment.clinic ? (
                        <button
                            type="button"
                            onClick={() => onViewClinic(appointment.clinic)}
                            className="inline-flex items-center justify-center rounded-2xl border border-teal-200 px-4 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
                        >
                            Clinic
                        </button>
                    ) : null}
                    {canCancel && onCancel ? (
                        <button
                            type="button"
                            onClick={() => onCancel(appointment)}
                            className="inline-flex items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                        >
                            Cancel
                        </button>
                    ) : null}
                    <button
                        type="button"
                        onClick={() => onViewDetails(appointment)}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
                    >
                        View details
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </article>
    );
};

const DetailItem = ({ label, value }) => (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
        <div className="mt-2 text-sm font-semibold text-slate-950">{value}</div>
    </div>
);

const ModalShell = ({ title, children, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
        <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="shrink-0 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
                <h2 className="text-xl font-bold text-slate-950">{title}</h2>
                <button
                    type="button"
                    onClick={onClose}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                    aria-label="Close modal"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
            <div className="modal-scroll min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>
        </div>
    </div>
);

const Appointments = () => {
    const dispatch = useDispatch();
    const { myAppointments, isLoading, isError, message } = useSelector((state) => state.appointment);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [activeTab, setActiveTab] = useState("upcoming");
    const [cancelTarget, setCancelTarget] = useState(null);
    const [cancelReason, setCancelReason] = useState("");
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        dispatch(getMyAppointments());
    }, [dispatch]);

    useEffect(() => {
        if (isError && message) {
            toast.error(message);
        }
    }, [isError, message]);

    const { upcomingAppointments, pastAppointments, stats } = useMemo(() => {
        const now = new Date();
        const safeAppointments = Array.isArray(myAppointments) ? myAppointments : [];

        const normalized = safeAppointments
            .filter((appointment) => appointment?.date)
            .map((appointment) => ({
                ...appointment,
                appointmentDateTime: buildAppointmentDateTime(appointment),
            }))
            .filter((appointment) => appointment.appointmentDateTime);

        const upcoming = normalized
            .filter((appointment) => isAfter(appointment.appointmentDateTime, now) && appointment.status !== "cancelled")
            .sort((a, b) => a.appointmentDateTime - b.appointmentDateTime);

        const past = normalized
            .filter((appointment) => isBefore(appointment.appointmentDateTime, now) || appointment.status === "cancelled")
            .sort((a, b) => b.appointmentDateTime - a.appointmentDateTime);

        return {
            upcomingAppointments: upcoming,
            pastAppointments: past,
            stats: {
                total: normalized.length,
                upcoming: upcoming.length,
                completed: normalized.filter((appointment) => appointment.status === "completed").length,
                cancelled: normalized.filter((appointment) => appointment.status === "cancelled").length,
            },
        };
    }, [myAppointments]);

    const visibleAppointments = activeTab === "upcoming" ? upcomingAppointments : pastAppointments;
    const nextAppointment = upcomingAppointments[0];

    const closeCancelDialog = () => {
        setCancelTarget(null);
        setCancelReason("");
    };

    const confirmCancel = async () => {
        if (!cancelTarget) return;

        setIsCancelling(true);
        const result = await dispatch(cancelAppointment({
            appointmentId: cancelTarget._id,
            notes: cancelReason.trim() || undefined,
            as: "user",
        }));
        setIsCancelling(false);

        if (cancelAppointment.fulfilled.match(result)) {
            closeCancelDialog();
        }
    };

    if (isLoading && !myAppointments?.length) {
        return (
            <div className="w-full space-y-6 p-4 sm:p-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="h-8 w-56 animate-pulse rounded-full bg-slate-100" />
                    <div className="mt-6 grid gap-4 md:grid-cols-4">
                        {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="h-24 animate-pulse rounded-3xl bg-slate-100" />
                        ))}
                    </div>
                </div>
                <div className="h-44 animate-pulse rounded-3xl bg-white shadow-sm" />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 p-4 sm:p-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Appointments</p>
                        <h1 className="mt-2 text-3xl font-bold text-slate-950">Your appointments</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                            Track upcoming visits, review past consultations, and keep clinic details close before every appointment.
                        </p>
                    </div>
                    <Link
                        to="/doctorlists"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
                    >
                        Book appointment
                        <ChevronRight className="h-4 w-4" />
                    </Link>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <DetailItem label="Total visits" value={stats.total} />
                    <DetailItem label="Upcoming" value={stats.upcoming} />
                    <DetailItem label="Completed" value={stats.completed} />
                    <DetailItem label="Cancelled" value={stats.cancelled} />
                </div>

                {nextAppointment ? (
                    <div className="mt-6 rounded-3xl border border-teal-100 bg-teal-50/70 p-4 sm:p-5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm">
                                    <CalendarDays className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Next visit</p>
                                    <p className="mt-1 text-base font-bold text-slate-950">
                                        {safeFormatDate(nextAppointment.date, "EEEE, MMM dd")} at {safeFormatTime(nextAppointment.timeSlot?.start)}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-600">
                                        {nextAppointment.doctor?.name || "Doctor unavailable"} at {nextAppointment.clinic?.name || "clinic not assigned"}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedAppointment(nextAppointment)}
                                className="inline-flex items-center justify-center rounded-2xl border border-teal-200 bg-white px-4 py-2.5 text-sm font-semibold text-teal-700 transition hover:bg-teal-50"
                            >
                                Review details
                            </button>
                        </div>
                    </div>
                ) : null}
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
                    <div className="inline-flex w-fit rounded-2xl bg-slate-100 p-1">
                        {[
                            { id: "upcoming", label: "Upcoming", count: upcomingAppointments.length },
                            { id: "past", label: "Past", count: pastAppointments.length },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${activeTab === tab.id ? "bg-white text-teal-800 shadow-sm" : "text-slate-600 hover:text-slate-950"}`}
                            >
                                {tab.label}
                                <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-700">{tab.count}</span>
                            </button>
                        ))}
                    </div>
                    <p className="text-sm text-slate-500">
                        {visibleAppointments.length} {visibleAppointments.length === 1 ? "appointment" : "appointments"} shown
                    </p>
                </div>

                <div className="mt-5 space-y-4">
                    {visibleAppointments.length ? (
                        visibleAppointments.map((appointment) => (
                            <AppointmentCard
                                key={appointment._id}
                                appointment={appointment}
                                onViewDetails={setSelectedAppointment}
                                onViewClinic={setSelectedClinic}
                                onCancel={setCancelTarget}
                            />
                        ))
                    ) : (
                        <EmptyState activeTab={activeTab} />
                    )}
                </div>
            </section>

            {selectedAppointment ? (
                <ModalShell title="Appointment details" onClose={() => setSelectedAppointment(null)}>
                    <div className="space-y-5">
                        <div className="flex flex-col gap-4 rounded-3xl bg-slate-50 p-5 sm:flex-row sm:items-start">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
                                <Stethoscope className="h-7 w-7" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-xl font-bold text-slate-950">
                                        {selectedAppointment.doctor?.name || "Doctor unavailable"}
                                    </h3>
                                    <StatusBadge status={selectedAppointment.status} />
                                </div>
                                <p className="mt-1 text-sm text-slate-600">
                                    {selectedAppointment.doctor?.specialty || selectedAppointment.doctor?.qualification || "Care team details unavailable"}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <DetailItem label="Date" value={safeFormatDate(selectedAppointment.date, "MMMM dd, yyyy")} />
                            <DetailItem label="Time" value={`${safeFormatTime(selectedAppointment.timeSlot?.start)} - ${safeFormatTime(selectedAppointment.timeSlot?.end)}`} />
                            <DetailItem label="Visit type" value={selectedAppointment.type === "in-person" ? "In-person" : "Teleconsultation"} />
                            <DetailItem label="Payment" value={<span className={`rounded-full px-3 py-1 text-xs capitalize ${paymentStyles[selectedAppointment.payment?.status] || "bg-slate-100 text-slate-700"}`}>{selectedAppointment.payment?.status || "Not specified"}</span>} />
                        </div>

                        <JoinTeleconsultation appointment={selectedAppointment} tokenKey="userToken" />

                        <div className="rounded-3xl border border-slate-200 p-5">
                            <p className="flex items-center gap-2 text-sm font-bold text-slate-950">
                                <Building2 className="h-4 w-4 text-teal-700" />
                                Clinic
                            </p>
                            <p className="mt-3 font-semibold text-slate-900">{selectedAppointment.clinic?.name || "Clinic not assigned"}</p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">{formatAddress(selectedAppointment.clinic)}</p>
                            {selectedAppointment.clinic ? (
                                <button
                                    type="button"
                                    onClick={() => setSelectedClinic(selectedAppointment.clinic)}
                                    className="mt-4 inline-flex items-center rounded-2xl border border-teal-200 px-4 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
                                >
                                    View clinic details
                                </button>
                            ) : null}
                        </div>

                        <div className="rounded-3xl border border-slate-200 p-5">
                            <p className="flex items-center gap-2 text-sm font-bold text-slate-950">
                                <FileText className="h-4 w-4 text-teal-700" />
                                Reason and notes
                            </p>
                            <p className="mt-3 text-sm leading-6 text-slate-700">{selectedAppointment.reason || "No reason added."}</p>
                            {selectedAppointment.notes?.doctorNotes ? (
                                <div className="mt-4 rounded-2xl bg-teal-50 p-4 text-sm leading-6 text-slate-700">
                                    <span className="font-semibold text-slate-950">Doctor note: </span>
                                    {selectedAppointment.notes.doctorNotes}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </ModalShell>
            ) : null}

            {selectedClinic ? (
                <ModalShell title="Clinic details" onClose={() => setSelectedClinic(null)}>
                    <div className="space-y-5">
                        <div className="rounded-3xl bg-teal-50 p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Clinic</p>
                            <h3 className="mt-2 text-2xl font-bold text-slate-950">{selectedClinic.name || "Clinic"}</h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{formatAddress(selectedClinic)}</p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <DetailItem label="Phone" value={selectedClinic.contact?.phone || "N/A"} />
                            <DetailItem label="Email" value={selectedClinic.contact?.email || "N/A"} />
                            <DetailItem label="Weekdays" value={`${safeFormatTime(selectedClinic.operatingHours?.weekdays?.open)} - ${safeFormatTime(selectedClinic.operatingHours?.weekdays?.close)}`} />
                            <DetailItem label="Weekends" value={`${safeFormatTime(selectedClinic.operatingHours?.weekends?.open)} - ${safeFormatTime(selectedClinic.operatingHours?.weekends?.close)}`} />
                        </div>
                    </div>
                </ModalShell>
            ) : null}

            {/* Headless UI Dialog: focus trap, Escape, backdrop click and the
                dialog role all come from the primitive — the hand-rolled
                ModalShell above has none of them and is replaced in Phase 2. */}
            <Dialog open={Boolean(cancelTarget)} onClose={closeCancelDialog} className="relative z-[70]">
                <div className="fixed inset-0 bg-slate-950/60" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                        <DialogTitle className="text-xl font-bold text-slate-950">Cancel this appointment?</DialogTitle>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                            {cancelTarget
                                ? `${safeFormatDate(cancelTarget.date, "EEEE, MMM dd")} at ${safeFormatTime(cancelTarget.timeSlot?.start)} with ${cancelTarget.doctor?.name || cancelTarget.doctor?.username || "your doctor"}.`
                                : ""}
                            {" "}This cannot be undone.
                        </p>

                        <label className="mt-4 block">
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Reason (optional)</span>
                            <textarea
                                value={cancelReason}
                                onChange={(event) => setCancelReason(event.target.value)}
                                rows={3}
                                placeholder="Let the doctor know why."
                                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50"
                            />
                        </label>

                        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={closeCancelDialog}
                                disabled={isCancelling}
                                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                            >
                                Keep appointment
                            </button>
                            <button
                                type="button"
                                onClick={confirmCancel}
                                disabled={isCancelling}
                                className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:opacity-60"
                            >
                                {isCancelling ? "Cancelling..." : "Cancel appointment"}
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </Dialog>
        </div>
    );
};

export default Appointments;
