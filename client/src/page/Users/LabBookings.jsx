import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { toast } from "react-toastify";
import {
    Building2,
    CalendarDays,
    ChevronDown,
    ClipboardCheck,
    FileDown,
    FlaskConical,
    SearchX,
} from "lucide-react";
import { fetchMyBookings } from "../../features/Labtest/LabtestSlice.js";

const statusStyles = {
    booked: "border-teal-100 bg-teal-50 text-teal-800",
    "sample-collected": "border-cyan-100 bg-cyan-50 text-cyan-800",
    processing: "border-yellow-100 bg-yellow-50 text-yellow-800",
    completed: "border-emerald-100 bg-emerald-50 text-emerald-800",
    cancelled: "border-rose-100 bg-rose-50 text-rose-700",
};

const paymentStyles = {
    pending: "border-orange-100 bg-orange-50 text-orange-800",
    paid: "border-emerald-100 bg-emerald-50 text-emerald-800",
    completed: "border-emerald-100 bg-emerald-50 text-emerald-800",
    refunded: "border-slate-100 bg-slate-100 text-slate-700",
};

const tabs = [
    { key: "upcoming", label: "Upcoming tests" },
    { key: "past", label: "Past tests" },
];

const safeFormatDate = (dateString) => {
    if (!dateString) return "Date unavailable";
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) return "Date unavailable";
    return format(parsed, "MMMM dd, yyyy");
};

const safeFormatTime = (timeString) => {
    if (!timeString) return "Time unavailable";
    const parsed = new Date(`1970-01-01T${timeString}`);
    if (Number.isNaN(parsed.getTime())) return timeString;
    return format(parsed, "h:mm a");
};

const normalize = (value) => String(value || "").toLowerCase();

const StatusBadge = ({ value, type = "status" }) => {
    const normalized = normalize(value) || "pending";
    const styles = type === "payment" ? paymentStyles : statusStyles;

    return (
        <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold capitalize ${styles[normalized] || "border-slate-100 bg-slate-100 text-slate-700"}`}>
            {normalized.replace(/-/g, " ")}
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

const LabBookings = () => {
    const dispatch = useDispatch();
    const { myBookings, isLoading } = useSelector((state) => state.labTest);
    const [activeTab, setActiveTab] = useState("upcoming");
    const [expandedBooking, setExpandedBooking] = useState(null);

    const bookingList = useMemo(() => (Array.isArray(myBookings) ? myBookings : []), [myBookings]);

    useEffect(() => {
        dispatch(fetchMyBookings());
    }, [dispatch]);

    const filteredBookings = useMemo(() => {
        const now = new Date();

        return bookingList.filter((booking) => {
            const bookingDate = new Date(booking.bookingDate);
            const isPastDate = Number.isNaN(bookingDate.getTime()) ? false : bookingDate < now;
            const status = normalize(booking.status);

            if (activeTab === "upcoming") {
                return !["completed", "cancelled"].includes(status) && !isPastDate;
            }

            return ["completed", "cancelled"].includes(status) || isPastDate;
        });
    }, [activeTab, bookingList]);

    const stats = useMemo(() => ({
        total: bookingList.length,
        upcoming: bookingList.filter((booking) => !["completed", "cancelled"].includes(normalize(booking.status))).length,
        completed: bookingList.filter((booking) => normalize(booking.status) === "completed").length,
    }), [bookingList]);

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
            .catch(() => {
                toast.error("Failed to download the report.");
            });
    };

    const toggleExpand = (id) => {
        setExpandedBooking((current) => (current === id ? null : id));
    };

    return (
        <div className="w-full space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">Lab tests</p>
                    <h1 className="mt-2 text-3xl font-bold text-slate-950">My lab test bookings</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        Track sample collection, processing progress, clinic details, and downloadable reports.
                    </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <StatCard label="Total tests" value={stats.total} icon={<FlaskConical className="h-5 w-5 text-teal-700" />} />
                    <StatCard label="In progress" value={stats.upcoming} icon={<CalendarDays className="h-5 w-5 text-teal-700" />} />
                    <StatCard label="Completed" value={stats.completed} icon={<ClipboardCheck className="h-5 w-5 text-teal-700" />} />
                </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="inline-flex w-fit rounded-2xl bg-slate-100 p-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setActiveTab(tab.key)}
                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${activeTab === tab.key ? "bg-white text-teal-800 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <p className="text-sm text-slate-500">
                        {filteredBookings.length} booking{filteredBookings.length === 1 ? "" : "s"} shown
                    </p>
                </div>

                {isLoading && !bookingList.length ? (
                    <div className="grid gap-4 py-6">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="h-24 animate-pulse rounded-3xl bg-slate-100" />
                        ))}
                    </div>
                ) : filteredBookings.length ? (
                    <div className="mt-5 space-y-4">
                        {filteredBookings.map((booking) => {
                            const expanded = expandedBooking === booking._id;
                            const test = booking.test || {};
                            const clinic = booking.clinic || {};

                            return (
                                <article key={booking._id} className="overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:border-teal-200 hover:shadow-sm">
                                    <button
                                        type="button"
                                        className="flex w-full flex-col gap-4 p-4 text-left sm:flex-row sm:items-center sm:justify-between"
                                        onClick={() => toggleExpand(booking._id)}
                                    >
                                        <div className="flex min-w-0 items-center gap-4">
                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-100 text-teal-800">
                                                <FlaskConical className="h-7 w-7" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="truncate text-lg font-bold text-slate-950">{test.name || "Lab test unavailable"}</h3>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    {safeFormatDate(booking.bookingDate)} - {safeFormatTime(booking.timeSlot?.start)} to {safeFormatTime(booking.timeSlot?.end)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                                            <StatusBadge value={booking.status} />
                                            {booking.paymentStatus ? <StatusBadge value={booking.paymentStatus} type="payment" /> : null}
                                            <ChevronDown className={`h-5 w-5 text-slate-400 transition ${expanded ? "rotate-180" : ""}`} />
                                        </div>
                                    </button>

                                    {expanded ? (
                                        <div className="border-t border-slate-200 bg-slate-50 p-4">
                                            <div className="mb-4 grid gap-3 md:grid-cols-4">
                                                {["booked", "sample-collected", "processing", "completed"].map((step) => {
                                                    const order = ["booked", "sample-collected", "processing", "completed"];
                                                    const active = order.indexOf(normalize(booking.status)) >= order.indexOf(step);
                                                    return (
                                                        <div key={step} className={`rounded-2xl border p-3 text-xs capitalize ${active ? "border-teal-200 bg-teal-50 text-teal-800" : "border-slate-200 bg-white text-slate-500"}`}>
                                                            <p className="font-semibold">{step.replace("-", " ")}</p>
                                                            <p className="mt-1">{active ? "Reached" : "Pending"}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="grid gap-4 lg:grid-cols-2">
                                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-950">
                                                        <FlaskConical className="h-4 w-4 text-teal-700" />
                                                        Test details
                                                    </h4>
                                                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                                                        <p><span className="font-semibold text-slate-950">Test code:</span> {test.code || "N/A"}</p>
                                                        <p><span className="font-semibold text-slate-950">Price:</span> Rs. {Number(test.price || 0).toFixed(2)}</p>
                                                    </div>
                                                </div>

                                                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-950">
                                                        <Building2 className="h-4 w-4 text-teal-700" />
                                                        Clinic details
                                                    </h4>
                                                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                                                        <p className="font-semibold text-slate-950">{clinic.name || "Clinic unavailable"}</p>
                                                        <p>
                                                            {[clinic.address?.street, clinic.address?.city, clinic.address?.state, clinic.address?.postalCode]
                                                                .filter(Boolean)
                                                                .join(", ") || "Address unavailable"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {normalize(booking.status) === "completed" && booking.reportFile ? (
                                                <div className="mt-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => forceDownload(booking.reportFile, `lab-report-${booking._id}.pdf`)}
                                                        className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
                                                    >
                                                        <FileDown className="h-5 w-5" />
                                                        Download report
                                                    </button>
                                                </div>
                                            ) : null}
                                        </div>
                                    ) : null}
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="mt-5 rounded-3xl border border-dashed border-teal-200 bg-white p-10 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                            <SearchX className="h-7 w-7" />
                        </div>
                        <h3 className="mt-5 text-xl font-bold text-slate-950">
                            {activeTab === "upcoming" ? "No upcoming lab tests" : "No past lab tests"}
                        </h3>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                            {activeTab === "upcoming"
                                ? "Booked lab tests will appear here with clinic, time, and processing details."
                                : "Completed and cancelled lab test records will appear here for quick review."}
                        </p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default LabBookings;
