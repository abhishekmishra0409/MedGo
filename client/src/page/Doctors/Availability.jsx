import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertCircle, Clock, Plus, Save, Trash2 } from "lucide-react";
import { getDoctorProfile, updateDoctorProfile } from "../../features/Doctor/DoctorSlice.js";

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const defaultRows = () => [
    {
        id: makeId(),
        days: "Monday - Friday",
        start: "09:00",
        end: "17:00",
    },
];

const toMinutes = (value = "") => {
    const [hours, minutes] = value.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return null;
    }

    return hours * 60 + minutes;
};

const isEndAfterStart = (start, end) => {
    const startMinutes = toMinutes(start);
    const endMinutes = toMinutes(end);

    return startMinutes !== null && endMinutes !== null && endMinutes > startMinutes;
};

const normalizeTime = (value = "") => {
    const match = value.trim().match(/^(\d{1,2}):(\d{2})/);
    if (!match) {
        return "";
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours > 23 || minutes > 59) {
        return "";
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const parseHours = (hours = "") => {
    const [start = "", end = ""] = hours.split(/\s*-\s*/);
    return {
        start: normalizeTime(start),
        end: normalizeTime(end),
    };
};

const rowsFromProfile = (workingHours = []) => {
    const rows = (workingHours || [])
        .map((slot) => {
            const range = parseHours(slot.hours || "");

            return {
                id: makeId(),
                days: slot.days || "",
                start: range.start,
                end: range.end,
            };
        })
        .filter((row) => row.days || row.start || row.end);

    return rows.length ? rows : defaultRows();
};

const buildWorkingHours = (rows) =>
    rows.map((row) => ({
        days: row.days.trim(),
        hours: `${row.start} - ${row.end}`,
    }));

const getValidationError = (rows) => {
    if (!rows.length) {
        return "Add at least one availability row.";
    }

    const incompleteRow = rows.find((row) => !row.days.trim() || !row.start || !row.end);
    if (incompleteRow) {
        return "Every availability row needs a day label, start time, and end time.";
    }

    const invalidRange = rows.find((row) => !isEndAfterStart(row.start, row.end));
    if (invalidRange) {
        return `End time must be after start time for ${invalidRange.days || "each row"}.`;
    }

    return "";
};

const DoctorAvailability = () => {
    const dispatch = useDispatch();
    const { profile, isLoading } = useSelector((state) => state.doctor);
    const [rows, setRows] = useState(defaultRows);
    const [error, setError] = useState("");

    useEffect(() => {
        dispatch(getDoctorProfile());
    }, [dispatch]);

    useEffect(() => {
        setRows(rowsFromProfile(profile?.workingHours));
    }, [profile?.workingHours]);

    const previewRows = useMemo(() => buildWorkingHours(rows), [rows]);

    const updateRow = (id, field, value) => {
        setError("");
        setRows((current) =>
            current.map((row) => (row.id === id ? { ...row, [field]: value } : row))
        );
    };

    const addRow = () => {
        setError("");
        setRows((current) => [
            ...current,
            {
                id: makeId(),
                days: "",
                start: "09:00",
                end: "13:00",
            },
        ]);
    };

    const removeRow = (id) => {
        setError("");
        setRows((current) => current.filter((row) => row.id !== id));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationError = getValidationError(rows);
        if (validationError) {
            setError(validationError);
            return;
        }

        const result = await dispatch(
            updateDoctorProfile({
                doctorProfile: {
                    workingHours: buildWorkingHours(rows),
                },
            })
        );

        if (updateDoctorProfile.fulfilled.match(result)) {
            setError("");
            dispatch(getDoctorProfile());
        }
    };

    return (
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Availability</p>
                    <h1 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">Working hours</h1>
                    <p className="mt-1 text-sm text-slate-500">Set the time ranges patients and clinic staff can expect you to be available.</p>
                </div>
                <button
                    type="button"
                    onClick={addRow}
                    className="inline-flex items-center gap-2 rounded-2xl border border-teal-200 px-4 py-3 text-sm font-semibold text-teal-700 hover:bg-teal-50"
                >
                    <Plus className="h-4 w-4" />
                    Add row
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                    <div className="grid gap-3 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 md:grid-cols-[1.4fr_1fr_1fr_auto]">
                        <span>Day label</span>
                        <span>Start time</span>
                        <span>End time</span>
                        <span className="sr-only">Actions</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {rows.map((row) => (
                            <div key={row.id} className="grid gap-3 px-4 py-4 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-center">
                                <label className="block">
                                    <span className="mb-1 block text-xs font-medium text-slate-500 md:hidden">Day label</span>
                                    <input
                                        type="text"
                                        value={row.days}
                                        onChange={(event) => updateRow(row.id, "days", event.target.value)}
                                        placeholder="Monday - Friday"
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none"
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-1 block text-xs font-medium text-slate-500 md:hidden">Start time</span>
                                    <input
                                        type="time"
                                        value={row.start}
                                        onChange={(event) => updateRow(row.id, "start", event.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none"
                                    />
                                </label>
                                <label className="block">
                                    <span className="mb-1 block text-xs font-medium text-slate-500 md:hidden">End time</span>
                                    <input
                                        type="time"
                                        value={row.end}
                                        onChange={(event) => updateRow(row.id, "end", event.target.value)}
                                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none"
                                    />
                                </label>
                                <button
                                    type="button"
                                    onClick={() => removeRow(row.id)}
                                    disabled={rows.length === 1}
                                    aria-label={`Remove ${row.days || "availability"} row`}
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {error ? (
                    <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                ) : null}

                <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                        <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <Clock className="h-4 w-4 text-teal-700" />
                            Current preview
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-600">
                            {previewRows.map((slot, index) => (
                                <span key={`${slot.days}-${index}`} className="rounded-xl bg-white px-3 py-2">
                                    {slot.days || "Day"}: {slot.hours}
                                </span>
                            ))}
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-70"
                    >
                        <Save className="h-4 w-4" />
                        {isLoading ? "Saving..." : "Save availability"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DoctorAvailability;
