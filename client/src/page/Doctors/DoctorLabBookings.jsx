import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { toast } from "react-toastify";
import {
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    FileDown,
    FileUp,
    FlaskConical,
    MapPin,
    UserRound,
    X,
} from "lucide-react";
import { fetchClinicsByDoctor } from "../../features/Clinic/ClinicSlice.js";
import { fetchClinicBookings, updateLabTestStatus, uploadLabTestReport } from "../../features/Labtest/LabtestSlice.js";

const labStatuses = ["booked", "sample-collected", "processing", "completed", "cancelled"];

const statusStyles = {
    booked: "border-teal-100 bg-teal-50 text-teal-800",
    "sample-collected": "border-cyan-100 bg-cyan-50 text-cyan-800",
    processing: "border-yellow-100 bg-yellow-50 text-yellow-800",
    completed: "border-emerald-100 bg-emerald-50 text-emerald-800",
    cancelled: "border-rose-100 bg-rose-50 text-rose-700",
};

const normalize = (value) => String(value || "booked").toLowerCase();

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

const StatusBadge = ({ value }) => {
    const status = normalize(value);
    return (
        <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${statusStyles[status] || "border-slate-100 bg-slate-100 text-slate-700"}`}>
            {status.replace(/-/g, " ")}
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

const formatAddress = (clinic) => {
    const { street, city, state, postalCode } = clinic?.address || {};
    return [street, city, state, postalCode].filter(Boolean).join(", ") || "Address unavailable";
};

const formatOperatingHours = (clinic) => {
    const { weekdays, weekends } = clinic?.operatingHours || {};
    const weekdayText = weekdays?.open && weekdays?.close ? `${weekdays.open} - ${weekdays.close}` : "Not set";
    const weekendText = weekends?.open && weekends?.close ? `${weekends.open} - ${weekends.close}` : "Not set";
    return `Weekdays: ${weekdayText} | Weekends: ${weekendText}`;
};

const DoctorLabBookings = () => {
    const doctor = localStorage.getItem("doctor") ? JSON.parse(localStorage.getItem("doctor")) : null;
    const doctorId = doctor?._id;
    const dispatch = useDispatch();
    const { doctorClinics, isLoading: clinicLoading } = useSelector((state) => state.clinic);
    const { clinicBookings, isLoading: labTestLoading } = useSelector((state) => state.labTest);

    const [selectedBooking, setSelectedBooking] = useState(null);
    const [statusUpdate, setStatusUpdate] = useState("");
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [expandedBooking, setExpandedBooking] = useState(null);
    const [uploadingReport, setUploadingReport] = useState(null);

    const clinicList = useMemo(
        () => (Array.isArray(doctorClinics) ? doctorClinics : doctorClinics ? [doctorClinics] : []),
        [doctorClinics]
    );
    const currentClinic = clinicList[0] || null;
    const bookings = useMemo(() => (Array.isArray(clinicBookings) ? clinicBookings : []), [clinicBookings]);

    useEffect(() => {
        if (doctorId) dispatch(fetchClinicsByDoctor(doctorId));
    }, [dispatch, doctorId]);

    useEffect(() => {
        if (currentClinic?._id) dispatch(fetchClinicBookings(currentClinic._id));
    }, [currentClinic?._id, dispatch]);

    const stats = useMemo(() => ({
        total: bookings.length,
        processing: bookings.filter((item) => normalize(item.status) === "processing").length,
        completed: bookings.filter((item) => normalize(item.status) === "completed").length,
    }), [bookings]);

    const forceDownload = (url, filename) => {
        fetch(url)
            .then((res) => res.blob())
            .then((blob) => {
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = blobUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(blobUrl);
            })
            .catch(() => toast.error("Failed to download the report."));
    };

    const handleStatusUpdate = () => {
        if (!selectedBooking || !statusUpdate) {
            toast.error("Please select a status");
            return;
        }

        dispatch(updateLabTestStatus({ bookingId: selectedBooking._id, status: statusUpdate }))
            .unwrap()
            .then(() => {
                setSelectedBooking(null);
                setStatusUpdate("");
                if (currentClinic?._id) dispatch(fetchClinicBookings(currentClinic._id));
            })
            .catch((error) => toast.error(error?.message || error || "Failed to update lab test"));
    };

    const handleFileUpload = (bookingId, event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast.error("Please upload a PDF file");
            return;
        }

        setUploadingReport(bookingId);
        dispatch(uploadLabTestReport({ bookingId, file }))
            .unwrap()
            .then(() => {
                if (currentClinic?._id) dispatch(fetchClinicBookings(currentClinic._id));
            })
            .catch((error) => toast.error(error?.message || error || "Failed to upload report"))
            .finally(() => setUploadingReport(null));
    };

    if (clinicLoading || labTestLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Lab tests</p>
                    <h1 className="mt-2 text-3xl font-bold text-slate-950">Manage lab test bookings</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        Track clinic lab requests, update sample progress, and upload patient reports.
                    </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <StatCard label="Total bookings" value={stats.total} icon={<FlaskConical className="h-5 w-5 text-teal-700" />} />
                    <StatCard label="Processing" value={stats.processing} icon={<CalendarDays className="h-5 w-5 text-teal-700" />} />
                    <StatCard label="Completed" value={stats.completed} icon={<CheckCircle2 className="h-5 w-5 text-teal-700" />} />
                </div>
            </section>

            {currentClinic ? (
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                        <div>
                            <p className="flex items-center gap-2 text-sm font-bold text-slate-950">
                                <Building2 className="h-5 w-5 text-teal-700" />
                                {currentClinic.name}
                            </p>
                            <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                                <MapPin className="h-4 w-4 text-teal-700" />
                                {formatAddress(currentClinic)}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">{formatOperatingHours(currentClinic)}</p>
                        </div>
                        <span className="rounded-2xl bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">
                            {currentClinic.appointmentSettings?.slotDuration || "N/A"} min slots
                        </span>
                    </div>
                </section>
            ) : null}

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                {!currentClinic ? (
                    <EmptyState title="No clinic linked" description="Clinic lab bookings will appear after a clinic is assigned to this doctor account." />
                ) : bookings.length ? (
                    <div className="space-y-4">
                        {bookings.map((booking) => {
                            const expanded = expandedBooking === booking._id;
                            const status = normalize(booking.status);

                            return (
                                <article key={booking._id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:border-teal-200 hover:shadow-sm">
                                    <button
                                        type="button"
                                        className="flex w-full flex-col gap-4 p-4 text-left xl:flex-row xl:items-center xl:justify-between"
                                        onClick={() => setExpandedBooking((current) => (current === booking._id ? null : booking._id))}
                                    >
                                        <div className="flex min-w-0 items-center gap-4">
                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
                                                <FlaskConical className="h-7 w-7" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="truncate text-lg font-bold text-slate-950">{booking.test?.name || "Lab test unavailable"}</h3>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {booking.patient?.username || "Patient unavailable"} - {safeFormatDate(booking.bookingDate)} - {safeFormatTime(booking.timeSlot?.start)} to {safeFormatTime(booking.timeSlot?.end)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <StatusBadge value={status} />
                                            <ChevronDown className={`h-5 w-5 text-slate-400 transition ${expanded ? "rotate-180" : ""}`} />
                                        </div>
                                    </button>

                                    {expanded ? (
                                        <div className="border-t border-slate-200 bg-slate-50 p-4">
                                            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                                                <div className="grid gap-3 sm:grid-cols-2">
                                                    <InfoBlock label="Patient" value={booking.patient?.username || "N/A"} />
                                                    <InfoBlock label="Test code" value={booking.test?.code || "N/A"} />
                                                    <InfoBlock label="Date" value={safeFormatDate(booking.bookingDate)} />
                                                    <InfoBlock label="Time" value={`${safeFormatTime(booking.timeSlot?.start)} - ${safeFormatTime(booking.timeSlot?.end)}`} />
                                                </div>
                                                <div className="flex flex-wrap gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedBooking(booking);
                                                            setStatusUpdate(status);
                                                        }}
                                                        className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700"
                                                    >
                                                        Update status
                                                    </button>
                                                    {status === "processing" ? (
                                                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-teal-200 px-5 py-3 text-sm font-semibold text-teal-700 hover:bg-teal-50">
                                                            <FileUp className="h-4 w-4" />
                                                            {uploadingReport === booking._id ? "Uploading..." : "Upload PDF"}
                                                            <input type="file" accept=".pdf" className="hidden" onChange={(event) => handleFileUpload(booking._id, event)} />
                                                        </label>
                                                    ) : null}
                                                    {booking.reportFile ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => forceDownload(booking.reportFile, `lab-report-${booking._id}.pdf`)}
                                                            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-white"
                                                        >
                                                            <FileDown className="h-4 w-4" />
                                                            Report
                                                        </button>
                                                    ) : null}
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedPatient(booking.patient)}
                                                        className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-white"
                                                    >
                                                        Patient
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState title="No lab test bookings" description="Lab requests for your clinic will appear here after patients book tests." />
                )}
            </section>

            {selectedBooking ? (
                <StatusModal
                    booking={selectedBooking}
                    status={statusUpdate}
                    onClose={() => {
                        setSelectedBooking(null);
                        setStatusUpdate("");
                    }}
                    onChange={setStatusUpdate}
                    onSubmit={handleStatusUpdate}
                />
            ) : null}

            {selectedPatient ? (
                <PatientModal patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
            ) : null}
        </div>
    );
};

const EmptyState = ({ title, description }) => (
    <div className="rounded-3xl border border-dashed border-teal-200 bg-white p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
            <FlaskConical className="h-7 w-7" />
        </div>
        <h3 className="mt-5 text-xl font-bold text-slate-950">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
    </div>
);

const InfoBlock = ({ label, value }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
        <p className="mt-2 text-sm font-bold text-slate-950">{value}</p>
    </div>
);

const StatusModal = ({ booking, status, onChange, onClose, onSubmit }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
        <section className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Lab status</p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-950">Update booking</h2>
                </div>
                <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label="Close">
                    <X className="h-5 w-5" />
                </button>
            </header>
            <div className="space-y-5 p-5">
                <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-bold text-slate-950">{booking.test?.name || "Lab test unavailable"}</p>
                    <p className="mt-1 text-sm text-slate-500">{booking.patient?.username || "Patient unavailable"}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                    {labStatuses.map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => onChange(option)}
                            className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold capitalize transition ${
                                status === option
                                    ? "border-teal-200 bg-teal-50 text-teal-800"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-teal-200"
                            }`}
                        >
                            {option.replace(/-/g, " ")}
                        </button>
                    ))}
                </div>
            </div>
            <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end">
                <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Cancel
                </button>
                <button type="button" onClick={onSubmit} className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700">
                    Save status
                </button>
            </footer>
        </section>
    </div>
);

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
                <InfoBlock label="Name" value={patient?.username || patient?.name || "N/A"} />
                <InfoBlock label="Email" value={patient?.email || "N/A"} />
                <InfoBlock label="Phone" value={patient?.phone || "N/A"} />
            </div>
        </section>
    </div>
);

export default DoctorLabBookings;
