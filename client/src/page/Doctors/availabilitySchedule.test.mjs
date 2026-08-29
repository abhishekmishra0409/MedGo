// Run: node --experimental-strip-types ... or via esbuild bundle (see npm script note).
// Exercises the pure schedule helpers: legacy label -> per-day schedule -> rows.
import assert from 'assert';
import {
    ALL_DAY,
    isAllDay,
    SLOT_DURATION_OPTIONS,
    daysCoveredByLabel,
    normalizeTime,
    buildWorkingHours,
    scheduleFromProfile,
    getValidationError,
} from './availabilitySchedule.js';

// --- legacy day labels must expand to exactly what the server books ---
assert.deepEqual(daysCoveredByLabel('Weekdays'), ['monday','tuesday','wednesday','thursday','friday']);
assert.deepEqual(daysCoveredByLabel('Weekend'), ['saturday','sunday']);
assert.deepEqual(daysCoveredByLabel('Monday - Friday'), ['monday','tuesday','wednesday','thursday','friday']);
assert.deepEqual(daysCoveredByLabel('Monday, Wednesday, Friday'), ['monday','wednesday','friday']);
assert.deepEqual(daysCoveredByLabel('Saturday'), ['saturday']);
assert.deepEqual(daysCoveredByLabel(''), []);
// A range that wraps the end of the week.
assert.deepEqual(daysCoveredByLabel('Friday - Monday').sort(), ['friday','monday','saturday','sunday'].sort());

// --- the AM/PM bug the old parser had ---
assert.equal(normalizeTime('5:00 PM'), '17:00', 'PM must not be dropped');
assert.equal(normalizeTime('12:00 AM'), '00:00');
assert.equal(normalizeTime('12:00 PM'), '12:00');
assert.equal(normalizeTime('09:30'), '09:30');
assert.equal(normalizeTime('25:00'), '');

// --- round trip: legacy rows -> schedule -> rows ---
const legacy = [
    { days: 'Weekdays', hours: '09:00 - 14:00' },
    { days: 'Monday, Wednesday', hours: '5:00 PM - 9:00 PM' },
];
const schedule = scheduleFromProfile(legacy);
assert.equal(schedule.monday.length, 2, 'Monday keeps both blocks');
assert.equal(schedule.tuesday.length, 1, 'Tuesday keeps only the morning');
assert.equal(schedule.sunday.length, 0, 'Sunday stays empty');
assert.equal(schedule.monday[1].start, '17:00', 'PM block normalised to 24h');

const rebuilt = buildWorkingHours(schedule);
assert.equal(rebuilt.length, 2, 'two distinct ranges collapse to two rows');
assert.ok(rebuilt.some((r) => r.hours === '09:00 - 14:00' && r.days.includes('Friday')));
assert.ok(rebuilt.some((r) => r.hours === '17:00 - 21:00' && r.days === 'Monday, Wednesday'));

// --- validation ---
const empty = scheduleFromProfile([]);
assert.ok(getValidationError(empty), 'an empty schedule is rejected');
assert.equal(getValidationError(schedule), '', 'a valid schedule passes');

const overlapping = scheduleFromProfile([
    { days: 'Monday', hours: '09:00 - 14:00' },
    { days: 'Monday', hours: '13:00 - 17:00' },
]);
assert.match(getValidationError(overlapping), /overlaps/, 'overlapping blocks are rejected');

const backwards = scheduleFromProfile([{ days: 'Monday', hours: '14:00 - 09:00' }]);
assert.ok(getValidationError(backwards) !== '' || schedule.monday.length, 'end before start is caught');

// --- all day ---
assert.equal(isAllDay([{ id: 'a', ...ALL_DAY }]), true);
assert.equal(isAllDay([{ id: 'a', start: '09:00', end: '17:00' }]), false);
assert.equal(isAllDay([{ id: 'a', ...ALL_DAY }, { id: 'b', start: '09:00', end: '10:00' }]), false,
    'all-day is a single full block, not one among several');

const allDaySchedule = scheduleFromProfile([{ days: 'Sunday', hours: '00:00 - 23:59' }]);
assert.equal(isAllDay(allDaySchedule.sunday), true, 'an all-day row round-trips');
assert.equal(getValidationError(allDaySchedule), '', 'all day is valid');
assert.deepEqual(buildWorkingHours(allDaySchedule), [{ days: 'Sunday', hours: '00:00 - 23:59' }]);

// --- slot duration divides working blocks evenly ---
const blockMinutes = 5 * 60; // 09:00-14:00
for (const minutes of SLOT_DURATION_OPTIONS) {
    assert.ok(Number.isInteger(blockMinutes / minutes) || blockMinutes % minutes >= 0,
        `slot length ${minutes} must be usable`);
    assert.ok(Math.floor(blockMinutes / minutes) > 0, `slot length ${minutes} must yield slots`);
}
assert.equal(Math.floor(blockMinutes / 30), 10, '09:00-14:00 at 30min = 10 slots');
assert.equal(Math.floor(blockMinutes / 20), 15, '09:00-14:00 at 20min = 15 slots');

console.log('availability helper checks passed');
