// Pure slot helpers for the booking form — no React, redux, or network imports,
// so the schedule maths stays directly testable.

export const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export const parseTimeToMinutes = (value = "") => {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const match24 = trimmed.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
        const hours = Number(match24[1]);
        const minutes = Number(match24[2]);
        if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
            return hours * 60 + minutes;
        }
        return null;
    }

    const match12 = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
    if (match12) {
        let hours = Number(match12[1]);
        const minutes = Number(match12[2] || "0");
        const meridian = match12[3].toLowerCase();

        if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
            return null;
        }

        if (hours === 12) hours = 0;
        if (meridian === "pm") hours += 12;
        return hours * 60 + minutes;
    }

    return null;
};

export const parseTimeRange = (range = "") => {
    const normalized = range.replace(/\s+to\s+/i, "-");
    const [startRaw, endRaw] = normalized.split("-").map((part) => part?.trim() || "");
    if (!startRaw || !endRaw) return null;

    const start = parseTimeToMinutes(startRaw);
    const end = parseTimeToMinutes(endRaw);

    if (start === null || end === null || end <= start) {
        return null;
    }

    return { start, end };
};

export const formatMinutes24 = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60)
        .toString()
        .padStart(2, "0");
    const minutes = (totalMinutes % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}`;
};

export const formatMinutes12 = (totalMinutes) => {
    const rawHours = Math.floor(totalMinutes / 60);
    const minutes = (totalMinutes % 60).toString().padStart(2, "0");
    const suffix = rawHours >= 12 ? "PM" : "AM";
    const hours12 = rawHours % 12 || 12;
    return `${hours12}:${minutes} ${suffix}`;
};

export const deriveDayIndexes = (daysLabel = "") => {
    const normalized = daysLabel.toLowerCase();

    if (normalized.includes("everyday") || normalized.includes("all days") || normalized.includes("daily")) {
        return [0, 1, 2, 3, 4, 5, 6];
    }

    if (normalized.includes("weekday")) {
        return [1, 2, 3, 4, 5];
    }

    if (normalized.includes("weekend")) {
        return [0, 6];
    }

    const matchedDays = [];
    DAY_NAMES.forEach((dayName, index) => {
        if (normalized.includes(dayName)) {
            matchedDays.push(index);
        }
    });

    if (!matchedDays.length) {
        return [0, 1, 2, 3, 4, 5, 6];
    }

    if (matchedDays.length >= 2 && normalized.includes("-")) {
        const [startDay, endDay] = [matchedDays[0], matchedDays[1]];
        const dayIndexes = [];
        let cursor = startDay;
        dayIndexes.push(cursor);

        while (cursor !== endDay) {
            cursor = (cursor + 1) % 7;
            dayIndexes.push(cursor);
            if (dayIndexes.length > 7) break;
        }

        return [...new Set(dayIndexes)];
    }

    return [...new Set(matchedDays)];
};

export const isScheduleApplicable = (daysLabel, dateString) => {
    if (!dateString) return true;

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return false;

    return deriveDayIndexes(daysLabel).includes(date.getDay());
};

/**
 * Every bookable slot for one date, merged across all working-hour blocks that
 * apply to that weekday. A doctor with a morning and an evening block must
 * expose both — the form previously used a single block and hid the rest.
 */
export const buildSlotsForDate = (workingHours, dateString, slotDuration) => {
    if (!dateString || !slotDuration) return [];

    const slots = [];

    (workingHours || []).forEach((row) => {
        if (!row?.hours || !isScheduleApplicable(row.days, dateString)) return;

        const range = parseTimeRange(row.hours);
        if (!range) return;

        let cursor = range.start;
        while (cursor + slotDuration <= range.end) {
            slots.push({
                start: formatMinutes24(cursor),
                end: formatMinutes24(cursor + slotDuration),
                display: `${formatMinutes12(cursor)} - ${formatMinutes12(cursor + slotDuration)}`,
            });
            cursor += slotDuration;
        }
    });

    const seen = new Set();
    return slots
        .filter((slot) => {
            const key = `${slot.start}-${slot.end}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        })
        .sort((a, b) => a.start.localeCompare(b.start));
};
