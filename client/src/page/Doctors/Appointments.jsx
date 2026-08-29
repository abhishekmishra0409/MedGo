import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { toast } from "react-toastify";
import {
    AlertCircle,
    CalendarDays,
    CheckCircle2,
    Clock,
    CreditCard,
    MapPin,
    Stethoscope,
    UserRound,
    X,
} from "lucide-react";
import {
    cancelAppointment,
    completeAppointment,
    getDoctorAppointments,
    updateAppointmentStatus,
} from "../../features/Appointment/AppointmentSlice.js";
import JoinTeleconsultation from "../../component/Appointments/JoinTeleconsultation.jsx";

const appointmentStatuses = ["pending", "confirmed", "completed", "cancelled"];
const paymentStatuses = ["pending", "paid", "failed", "refunded"];

const statusStyles = {
    pending: "border-amber-100 bg-amber-50 text-amber-800",
    confirmed: "border-teal-100 bg-teal-50 text-teal-800",
    completed: "border-emerald-100 bg-emerald-50 text-emerald-800",
    cancelled: "border-rose-100 bg-rose-50 text-rose-700",
    paid: "border-emerald-100 bg-emerald-50 text-emerald-800",
    failed: "border-rose-100 bg-rose-50 text-rose-700",
    refunded: "border-slate-100 bg-slate-100 text-slate-700",
};

const safeFormatDate = (dateString) => {
    if (!dateString) return "Date unavailable";
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) return "Date unavailable";
    return format(parsed, "MMMM dd, yyyy");
};

const safeFormatTime = (timeString) => {
    if (!timeString) return "Time unavailable";
    const parsed = new Date(`1970-01-01T${timeString}`);
    if (Number.isNaN(parsed.getTime())) return timeString || "Time unavailable";
    return format(parsed, "h:mm a");
};

const normalize = (value) => String(value || "pending").toLowerCase();

const StatusBadge = ({ value, label }) => {
    const status = normalize(value);
    return (
        <span className={`inline-flex w-fit rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${statusStyles[status] || "border-slate-100 bg-slate-100 text-slate-700"}`}>
            {label || status.replace(/-/g, " ")}
        </span>
    );
};

const StatCard = ({ label, value, icon }) => (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
        <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
            {icon}
        </div>
        <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
    </div>
);

const InfoTile = ({ label, value, icon }) => (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            {icon}
            {label}
        </p>
        <div className="mt-2 text-sm font-bold capitalize text-slate-950">{value}</div>
    </div>
);

const DoctorsAppointments = () => {
    const dispatch = useDispatch();
    const { doctorAppointments, isLoading, isError, message } = useSelector((state) => state.appointment);
    const [editingAppointment, setEditingAppointment] = useState(null);
    const [status, setStatus] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");
    const [notes, setNotes] = useState("");
    const [selectedPatient, setSelectedPatient] = useState(null);

    const appointments = useMemo(
        () => (Array.isArray(doctorAppointments) ? doctorAppointments : []),
        [doctorAppointments]
    );

    useEffect(() => {
        dispatch(getDoctorAppointments());
    }, [dispatch]);

    useEffect(() => {
        if (isError) toast.error(message);
    }, [isError, message]);

    const stats = useMemo(() => ({
        total: appointments.length,
        upcoming: appointments.filter((item) => ["pending", "confirmed"].includes(normalize(item.status))).length,
        completed: appointments.filter((item) => normalize(item.status) === "completed").length,
        cancelled: appointments.filter((item) => normalize(item.status) === "cancelled").length,
    }), [appointments]);

    const openUpdateModal = (appointment) => {
        setEditingAppointment(appointment);
        setStatus(normalize(appointment.status));
        setPaymentStatus(normalize(appointment.payment?.status));
        setNotes(appointment.notes?.doctorNotes || "");
    };

    const closeUpdateModal = () => {
        setEditingAppointment(null);
        setStatus("");
        setPaymentStatus("");
        setNotes("");
    };

    const handleStatusUpdate = () => {
        if (!editingAppointment || !status) {
            toast.error("Please select a status");
            return;
        }

        const updateData = {
            appointmentId: editingAppointment._id,
            status,
            notes,
            paymentStatus,
        };

        const action = status === "cancelled"
            ? cancelAppointment({ appointmentId: editingAppointment._id, notes })
            : status === "completed"
                ? completeAppointment({ appointmentId: editingAppointment._id, notes, paymentStatus })
                : updateAppointmentStatus(updateData);

        dispatch(action)
            .unwrap()
            .then(() => {
                closeUpdateModal();
                dispatch(getDoctorAppointments());
            })
            .catch((error) => toast.error(error?.message || error || "Failed to update appointment"));
    };

    return (
        <div className="w-full space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Appointments</p>
                    <h1 className="mt-2 text-3xl font-bold text-slate-950">Doctor appointments</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        Review patient visits, clinic details, payment state, and consultation notes.
                    </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Total visits" value={stats.total} icon={<CalendarDays className="h-5 w-5 text-teal-700" />} />
                    <StatCard label="Upcoming" value={stats.upcoming} icon={<Clock className="h-5 w-5 text-teal-700" />} />
                    <StatCard label="Completed" value={stats.completed} icon={<CheckCircle2 className="h-5 w-5 text-teal-700" />} />
                    <StatCard label="Cancelled" value={stats.cancelled} icon={<AlertCircle className="h-5 w-5 text-teal-700" />} />
                </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                {isLoading && !appointments.length ? (
                    <div className="grid gap-4">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="h-36 animate-pulse rounded-3xl bg-slate-100" />
                        ))}
                    </div>
                ) : appointments.length ? (
                    <div className="grid gap-4">
                        {appointments.map((appointment) => {
                            const patientName = appointment.patient?.username || appointment.patient?.name || "Patient unavailable";
                            const appointmentStatus = normalize(appointment.status);
                            const payment = normalize(appointment.payment?.status);

                            return (
                                <article key={appointment._id} className="rounded-3xl border border-slate-200 bg-white p-4 transition hover:border-teal-200 hover:shadow-sm">
                                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                                        <div className="flex min-w-0 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedPatient(appointment.patient)}
                                                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-lg font-bold text-teal-800"
                                                aria-label="View patient details"
                                            >
                                                {patientName.slice(0, 1).toUpperCase()}
                                            </button>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-lg font-bold text-slate-950">{patientName}</h3>
                                                    <StatusBadge value={appointmentStatus} />
                                                    <StatusBadge value={payment} label={`Payment: ${payment}`} />
                                                </div>
                                                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                                                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                                                        <CalendarDays className="h-4 w-4 text-teal-700" />
                                                        {safeFormatDate(appointment.date)}
                                                    </span>
                                                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                                                        <Clock className="h-4 w-4 text-teal-700" />
                                                        {safeFormatTime(appointment.timeSlot?.start)} - {safeFormatTime(appointment.timeSlot?.end)}
                                                    </span>
                                                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                                                        <MapPin className="h-4 w-4 text-teal-700" />
                                                        {appointment.clinic?.name || "Clinic unavailable"}
                                                    </span>
                                                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                                                        <Stethoscope className="h-4 w-4 text-teal-700" />
                                                        {appointment.type === "in-person" ? "In-person" : "Teleconsultation"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <JoinTeleconsultation appointment={appointment} tokenKey="doctorToken" />
                                            <button
                                                type="button"
                                                onClick={() => openUpdateModal(appointment)}
                                                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                                            >
                                                Update appointment
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-3xl border border-dashed border-teal-200 bg-white p-10 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                            <CalendarDays className="h-7 w-7" />
                        </div>
                        <h3 className="mt-5 text-xl font-bold text-slate-950">No appointments yet</h3>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                            Booked patient visits will appear here with status controls and clinic details.
                        </p>
                    </div>
                )}
            </section>

            {selectedPatient ? (
                <PatientModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
            ) : null}

            {editingAppointment ? (
                <UpdateAppointmentModal
                    appointment={editingAppointment}
                    notes={notes}
                    paymentStatus={paymentStatus}
                    status={status}
                    onClose={closeUpdateModal}
                    onNotesChange={setNotes}
                    onPaymentStatusChange={setPaymentStatus}
                    onStatusChange={setStatus}
                    onSubmit={handleStatusUpdate}
                />
            ) : null}
        </div>
    );
};

const PatientModal = ({ patient, onClose }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
        <section className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Patient</p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-950">Patient details</h2>
                </div>
                <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label="Close">
                    <X className="h-5 w-5" />
                </button>
            </header>
            <div className="space-y-3 p-5">
                <InfoTile label="Name" value={patient.username || patient.name || "Not available"} icon={<UserRound className="h-4 w-4 text-teal-700" />} />
                <InfoTile label="Email" value={patient.email || "Not available"} icon={<CreditCard className="h-4 w-4 text-teal-700" />} />
                <InfoTile label="Phone" value={patient.phone || "Not available"} icon={<CreditCard className="h-4 w-4 text-teal-700" />} />
            </div>
        </section>
    </div>
);

const ChoiceGroup = ({ label, options, value, onChange }) => (
    <div>
        <p className="text-sm font-semibold text-slate-700">{label}</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {options.map((option) => (
                <button
                    key={option}
                    type="button"
                    onClick={() => onChange(option)}
                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold capitalize transition ${
                        value === option
                            ? "border-teal-200 bg-teal-50 text-teal-800"
                            : "border-slate-200 bg-white text-slate-600 hover:border-teal-200"
                    }`}
                >
                    {option.replace(/-/g, " ")}
                </button>
            ))}
        </div>
    </div>
);

const UpdateAppointmentModal = ({
    appointment,
    notes,
    paymentStatus,
    status,
    onClose,
    onNotesChange,
    onPaymentStatusChange,
    onStatusChange,
    onSubmit,
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
        <section className="flex max-h-[calc(100dvh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Update visit</p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-950">Appointment status</h2>
                </div>
                <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label="Close">
                    <X className="h-5 w-5" />
                </button>
            </header>
            <div className="modal-scroll flex-1 space-y-5 overflow-y-auto p-5">
                <div className="grid gap-3 md:grid-cols-2">
                    <InfoTile label="Patient" value={appointment.patient?.username || appointment.patient?.name || "N/A"} icon={<UserRound className="h-4 w-4 text-teal-700" />} />
                    <InfoTile label="Date and time" value={`${safeFormatDate(appointment.date)} at ${safeFormatTime(appointment.timeSlot?.start)}`} icon={<CalendarDays className="h-4 w-4 text-teal-700" />} />
                    <InfoTile label="Clinic" value={appointment.clinic?.name || "N/A"} icon={<MapPin className="h-4 w-4 text-teal-700" />} />
                    <InfoTile label="Type" value={appointment.type === "in-person" ? "In-person" : "Teleconsultation"} icon={<Stethoscope className="h-4 w-4 text-teal-700" />} />
                </div>

                <ChoiceGroup label="Appointment status" options={appointmentStatuses} value={status} onChange={onStatusChange} />
                <ChoiceGroup label="Payment status" options={paymentStatuses} value={paymentStatus} onChange={onPaymentStatusChange} />

                <label className="block">
                    <span className="text-sm font-semibold text-slate-700">Doctor notes</span>
                    <textarea
                        rows={4}
                        value={notes}
                        onChange={(event) => onNotesChange(event.target.value)}
                        className="mt-2 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50"
                        placeholder="Add consultation notes..."
                    />
                </label>
            </div>
            <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Cancel
                </button>
                <button type="button" onClick={onSubmit} className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700">
                    Save changes
                </button>
            </footer>
        </section>
    </div>
);

export default DoctorsAppointments;
