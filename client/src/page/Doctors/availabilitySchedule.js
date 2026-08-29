// Pure schedule logic for the doctor availability editor — no React, redux, or
// network imports, so it stays directly testable.
export const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const DAYS = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
];

// 24-hour, quarter-hour granularity. A fixed list keeps the display in 24h on
// every locale — <input type="time"> renders AM/PM wherever the browser says so.
export const TIME_OPTIONS = Array.from({ length: 96 }, (_, index) => {
    const hours = String(Math.floor(index / 4)).padStart(2, "0");
    const minutes = String((index % 4) * 15).padStart(2, "0");
    return `${hours}:${minutes}`;
});

export const toMinutes = (value = "") => {
    const match = String(value).match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    return Number(match[1]) * 60 + Number(match[2]);
};

// Handles both "14:00" and legacy "2:00 PM" — the old parser ignored the
// meridiem entirely and silently turned 5:00 PM into 05:00.
export const normalizeTime = (value = "") => {
    const match = String(value).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
    if (!match) return "";

    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const period = match[3]?.toUpperCase();

    if (minutes > 59) return "";
    if (period) {
        if (hours < 1 || hours > 12) return "";
        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
    } else if (hours > 23) {
        return "";
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

// Mirrors AppointmentService.workingDaysIncludeDate on the server, so a legacy
// label ("Weekdays", "Mon - Fri") loads into exactly the days it books on.
export const daysCoveredByLabel = (daysLabel = "") => {
    const label = String(daysLabel).toLowerCase();
    if (!label) return [];

    if (label.includes("weekday")) return DAYS.slice(0, 5).map((day) => day.key);
    if (label.includes("weekend")) return ["saturday", "sunday"];

    const named = DAYS.filter((day) => label.includes(day.key)).map((day) => day.key);

    const rangeMatch = label.match(
        /(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s*(?:-|to)\s*(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/
    );
    if (rangeMatch) {
        const order = DAYS.map((day) => day.key);
        // The server indexes from Sunday; DAYS starts at Monday. Compare in the
        // server's frame so a wrapping range (Fri - Mon) resolves identically.
        const weekFromSunday = ["sunday", ...order.slice(0, 6)];
        const start = weekFromSunday.indexOf(rangeMatch[1]);
        const end = weekFromSunday.indexOf(rangeMatch[2]);

        if (start !== -1 && end !== -1) {
            return weekFromSunday.filter((_, index) => (
                start <= end ? index >= start && index <= end : index >= start || index <= end
            ));
        }
    }

    return named;
};

export const ALL_DAY = { start: "00:00", end: "23:59" };

export const isAllDay = (ranges = []) => (
    ranges.length === 1 && ranges[0].start === ALL_DAY.start && ranges[0].end === ALL_DAY.end
);

// Consultation lengths that divide a clinic hour cleanly.
// Must stay in step with the schema enum on doctorProfile.consultationSettings.slotDuration
export const SLOT_DURATION_OPTIONS = [10, 15, 20, 30, 45, 60];

export const emptySchedule = () => Object.fromEntries(DAYS.map((day) => [day.key, []]));

export const scheduleFromProfile = (workingHours = []) => {
    const schedule = emptySchedule();

    (workingHours || []).forEach((slot) => {
        const [rawStart = "", rawEnd = ""] = String(slot?.hours || "").split(/\s*(?:-|to)\s*/i);
        const start = normalizeTime(rawStart);
        const end = normalizeTime(rawEnd);
        if (!start || !end) return;

        daysCoveredByLabel(slot?.days).forEach((dayKey) => {
            schedule[dayKey].push({ id: makeId(), start, end });
        });
    });

    DAYS.forEach((day) => {
        schedule[day.key].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
    });

    return schedule;
};

// Collapse back to the stored shape: one row per distinct time range, with the
// days that share it comma-joined. The server matches on substring, so a comma
// list resolves per-day exactly.
export const buildWorkingHours = (schedule) => {
    const byRange = new Map();

    DAYS.forEach((day) => {
        (schedule[day.key] || []).forEach((range) => {
            const key = `${range.start} - ${range.end}`;
            if (!byRange.has(key)) byRange.set(key, []);
            byRange.get(key).push(day.label);
        });
    });

    return [...byRange.entries()]
        .map(([hours, days]) => ({ days: days.join(", "), hours }))
        .sort((a, b) => a.hours.localeCompare(b.hours));
};

export const getValidationError = (schedule) => {
    const activeDays = DAYS.filter((day) => (schedule[day.key] || []).length);
    if (!activeDays.length) {
        return "Select at least one day and add a time range.";
    }

    for (const day of activeDays) {
        const ranges = schedule[day.key];

        for (const range of ranges) {
            if (!range.start || !range.end) {
                return `${day.label} has a time range with a missing start or end.`;
            }
            if (toMinutes(range.end) <= toMinutes(range.start)) {
                return `${day.label}: end time must be after start time.`;
            }
        }

        const sorted = [...ranges].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
        for (let index = 1; index < sorted.length; index += 1) {
            if (toMinutes(sorted[index].start) < toMinutes(sorted[index - 1].end)) {
                return `${day.label}: ${sorted[index - 1].start}-${sorted[index - 1].end} overlaps ${sorted[index].start}-${sorted[index].end}.`;
            }
        }
    }

    return "";
};

