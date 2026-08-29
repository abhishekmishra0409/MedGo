import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AlertCircle, Clock, Copy, Plus, Save, Trash2 } from "lucide-react";
import { getDoctorProfile, updateDoctorProfile } from "../../features/Doctor/DoctorSlice.js";
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import {
    ALL_DAY,
    DAYS,
    SLOT_DURATION_OPTIONS,
    TIME_OPTIONS,
    buildWorkingHours,
    emptySchedule,
    getValidationError,
    isAllDay,
    makeId,
    scheduleFromProfile,
    toMinutes,
} from "./availabilitySchedule.js";

// A 96-option <select> rendered as a full-screen list. A combobox keeps the
// popover small and scrollable, and lets you type "930" instead of scrolling.
const matchTimes = (query) => {
    const digits = String(query).replace(/\D/g, "");
    if (!digits) return TIME_OPTIONS;

    // "9" -> 09:xx, "930" -> 09:30, "1430" -> 14:30
    const key = digits.length === 1 || digits.length === 3 ? `0${digits}` : digits;
    return TIME_OPTIONS.filter((option) => option.replace(":", "").startsWith(key));
};

const TimeField = ({ value, onChange, label }) => {
    const [query, setQuery] = useState("");
    const matches = matchTimes(query);
    const options = matches.length ? matches : TIME_OPTIONS;

    return (
        <Combobox
            value={value}
            onChange={(next) => {
                if (next) onChange(next);
                setQuery("");
            }}
        >
            <div className="relative">
                <ComboboxInput
                    aria-label={label}
                    displayValue={(time) => time}
                    onChange={(event) => setQuery(event.target.value)}
                    onBlur={() => setQuery("")}
                    className="w-24 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-50 focus-visible:ring-2 focus-visible:ring-teal-500"
                />
                <ComboboxOptions
                    anchor="bottom start"
                    className="z-[80] max-h-56 w-32 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-2xl [--anchor-gap:4px] empty:invisible"
                >
                    {options.map((option) => (
                        <ComboboxOption
                            key={option}
                            value={option}
                            className="cursor-pointer rounded-xl px-3 py-2 text-sm text-slate-700 data-[focus]:bg-teal-50 data-[focus]:text-teal-800 data-[selected]:font-semibold"
                        >
                            {option}
                        </ComboboxOption>
                    ))}
                </ComboboxOptions>
            </div>
        </Combobox>
    );
};

const DoctorAvailability = () => {
    const dispatch = useDispatch();
    const { profile, isLoading } = useSelector((state) => state.doctor);
    const [schedule, setSchedule] = useState(emptySchedule);
    const [slotDuration, setSlotDuration] = useState(30);
    const [maxDaily, setMaxDaily] = useState(20);
    const [error, setError] = useState("");

    useEffect(() => {
        dispatch(getDoctorProfile());
    }, [dispatch]);

    const isReady = Boolean(profile);

    useEffect(() => {
        if (!profile) return;
        setSchedule(scheduleFromProfile(profile.workingHours));
        setSlotDuration(Number(profile.consultationSettings?.slotDuration) || 30);
        setMaxDaily(Number(profile.consultationSettings?.maxDailyAppointments) || 20);
    }, [profile]);

    const preview = useMemo(() => buildWorkingHours(schedule), [schedule]);
    const activeDayCount = DAYS.filter((day) => schedule[day.key]?.length).length;

    const mutateDay = (dayKey, updater) => {
        setError("");
        setSchedule((current) => ({ ...current, [dayKey]: updater(current[dayKey] || []) }));
    };

    const toggleDay = (dayKey) => {
        mutateDay(dayKey, (ranges) => (
            ranges.length ? [] : [{ id: makeId(), start: "09:00", end: "17:00" }]
        ));
    };

    const toggleAllDay = (dayKey) => {
        mutateDay(dayKey, (ranges) => (
            isAllDay(ranges)
                ? [{ id: makeId(), start: "09:00", end: "17:00" }]
                : [{ id: makeId(), ...ALL_DAY }]
        ));
    };

    const addRange = (dayKey) => {
        mutateDay(dayKey, (ranges) => {
            const last = ranges[ranges.length - 1];
            // Start the new block after the previous one so the default never
            // lands on an overlap the doctor then has to fix.
            const start = last && toMinutes(last.end) <= 20 * 60 ? last.end : "17:00";
            const endMinutes = Math.min(toMinutes(start) + 240, 23 * 60 + 45);
            const end = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
            return [...ranges, { id: makeId(), start, end }];
        });
    };

    const updateRange = (dayKey, rangeId, field, value) => {
        mutateDay(dayKey, (ranges) => ranges.map((range) => (
            range.id === rangeId ? { ...range, [field]: value } : range
        )));
    };

    const removeRange = (dayKey, rangeId) => {
        mutateDay(dayKey, (ranges) => ranges.filter((range) => range.id !== rangeId));
    };

    const copyToAllDays = (dayKey) => {
        setError("");
        setSchedule((current) => {
            const source = current[dayKey] || [];
            return Object.fromEntries(DAYS.map((day) => [
                day.key,
                source.map((range) => ({ ...range, id: makeId() })),
            ]));
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!isReady) return;

        const validationError = getValidationError(schedule);
        if (validationError) {
            setError(validationError);
            return;
        }

        const result = await dispatch(
            updateDoctorProfile({
                doctorProfile: {
                    workingHours: buildWorkingHours(schedule),
                    consultationSettings: {
                        slotDuration,
                        maxDailyAppointments: maxDaily,
                    },
                },
            })
        );

        if (updateDoctorProfile.fulfilled.match(result)) {
            setError("");
            dispatch(getDoctorProfile());
        }
    };

    if (!isReady) {
        return (
            <div className="w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="h-4 w-28 animate-pulse rounded-full bg-slate-100" />
                <div className="mt-3 h-8 w-56 animate-pulse rounded-full bg-slate-100" />
                <div className="mt-6 space-y-3">
                    {Array.from({ length: 7 }).map((_, index) => (
                        <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-50" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Availability</p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">Working hours</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Pick the days you work, then add one or more time blocks per day — for example 09:00-14:00 and 17:00-21:00. Times are 24-hour.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-3">
                    {DAYS.map((day) => {
                        const ranges = schedule[day.key] || [];
                        const isActive = ranges.length > 0;
                        const allDay = isAllDay(ranges);

                        return (
                            <div
                                key={day.key}
                                className={`rounded-2xl border p-4 transition ${isActive ? "border-teal-200 bg-teal-50/40" : "border-slate-200 bg-white"}`}
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <label className="flex cursor-pointer items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={isActive}
                                            onChange={() => toggleDay(day.key)}
                                            className="h-5 w-5 rounded border-slate-300 text-teal-600 focus-visible:ring-2 focus-visible:ring-teal-500"
                                        />
                                        <span className="text-sm font-semibold text-slate-900">{day.label}</span>
                                    </label>

                                    {isActive ? (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-teal-200">
                                                <input
                                                    type="checkbox"
                                                    checked={allDay}
                                                    onChange={() => toggleAllDay(day.key)}
                                                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus-visible:ring-2 focus-visible:ring-teal-500"
                                                />
                                                All day
                                            </label>
                                            <button
                                                type="button"
                                                disabled={allDay}
                                                onClick={() => addRange(day.key)}
                                                className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-semibold text-teal-700 transition hover:bg-teal-50 focus-visible:ring-2 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                                Add time
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => copyToAllDays(day.key)}
                                                title={`Apply ${day.label}'s hours to every day`}
                                                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-teal-200 hover:text-teal-700 focus-visible:ring-2 focus-visible:ring-teal-500"
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                                Copy to all
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-slate-400">Unavailable</span>
                                    )}
                                </div>

                                {isActive && allDay ? (
                                    <p className="mt-3 text-sm text-slate-600 sm:pl-8">Available all day (00:00 - 23:59).</p>
                                ) : null}

                                {isActive && !allDay ? (
                                    <div className="mt-3 space-y-2 sm:pl-8">
                                        {ranges.map((range) => (
                                            <div key={range.id} className="flex flex-wrap items-center gap-2">
                                                <TimeField
                                                    value={range.start}
                                                    onChange={(value) => updateRange(day.key, range.id, "start", value)}
                                                    label={`${day.label} start time`}
                                                />
                                                <span className="text-sm text-slate-400">to</span>
                                                <TimeField
                                                    value={range.end}
                                                    onChange={(value) => updateRange(day.key, range.id, "end", value)}
                                                    label={`${day.label} end time`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeRange(day.key, range.id)}
                                                    aria-label={`Remove ${range.start} to ${range.end} on ${day.label}`}
                                                    className="rounded-full p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-rose-400"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}
                </div>

                {error ? (
                    <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                ) : null}

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <label htmlFor="slot-duration" className="text-sm font-semibold text-slate-900">
                        Appointment slot length
                    </label>
                    <p className="mt-1 text-sm text-slate-500">
                        Each working block is divided into slots of this length for patients to book.
                        A 09:00-14:00 block gives {Math.floor(300 / slotDuration)} slots at {slotDuration} minutes.
                    </p>
                    <div className="mt-3 flex flex-wrap items-end gap-4">
                        <select
                            id="slot-duration"
                            value={slotDuration}
                            onChange={(event) => setSlotDuration(Number(event.target.value))}
                            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-50 focus-visible:ring-2 focus-visible:ring-teal-500"
                        >
                            {SLOT_DURATION_OPTIONS.map((minutes) => (
                                <option key={minutes} value={minutes}>{minutes} minutes</option>
                            ))}
                        </select>

                        <div>
                            <label htmlFor="max-daily" className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Max appointments per day
                            </label>
                            <input
                                id="max-daily"
                                type="number"
                                min={1}
                                max={200}
                                value={maxDaily}
                                onChange={(event) => setMaxDaily(Number(event.target.value))}
                                className="mt-1 w-28 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-50 focus-visible:ring-2 focus-visible:ring-teal-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <Clock className="h-4 w-4 text-teal-700" />
                            Current preview
                            <span className="text-xs font-normal text-slate-500">
                                ({activeDayCount} day{activeDayCount === 1 ? "" : "s"})
                            </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {preview.length ? (
                                preview.map((slot) => (
                                    <span key={`${slot.days}-${slot.hours}`} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700">
                                        {slot.days}: {slot.hours}
                                    </span>
                                ))
                            ) : (
                                <span className="text-sm text-slate-500">No availability set yet.</span>
                            )}
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 focus-visible:ring-2 focus-visible:ring-teal-500 disabled:opacity-70"
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
