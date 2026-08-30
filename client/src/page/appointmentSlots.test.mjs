// Run: node src/page/appointmentSlots.test.mjs
import assert from 'assert';
import { buildSlotsForDate, parseTimeRange, isScheduleApplicable } from './appointmentSlots.js';

// 2026-08-31 is a Monday; 2026-09-05 a Saturday; 2026-09-06 a Sunday.
const MON = '2026-08-31', SAT = '2026-09-05', SUN = '2026-09-06';

const split = [
    { days: 'Monday, Tuesday, Wednesday, Thursday, Friday', hours: '09:00 - 14:00' },
    { days: 'Monday, Wednesday, Friday', hours: '17:00 - 21:00' },
    { days: 'Saturday', hours: '10:00 - 13:00' },
];

// --- the whole point: both blocks on a split-shift day ---
const monday = buildSlotsForDate(split, MON, 30);
assert.equal(monday.length, 10 + 8, 'Monday must expose morning AND evening blocks');
assert.equal(monday[0].start, '09:00');
assert.equal(monday.at(-1).end, '21:00');
assert.ok(monday.some((s) => s.start === '17:00'), 'the evening block must be bookable');

// The gap between blocks must not be offered.
assert.ok(!monday.some((s) => s.start >= '14:00' && s.start < '17:00'), 'the 14:00-17:00 gap must produce no slots');

// --- days the doctor does not work ---
assert.deepEqual(buildSlotsForDate(split, SUN, 30), [], 'Sunday has no blocks');
assert.equal(buildSlotsForDate(split, SAT, 30).length, 6, 'Saturday has its own single block');

// --- slot duration drives the count ---
assert.equal(buildSlotsForDate([{ days: 'Monday', hours: '09:00 - 14:00' }], MON, 20).length, 15);
assert.equal(buildSlotsForDate([{ days: 'Monday', hours: '09:00 - 14:00' }], MON, 60).length, 5);
// A block shorter than one slot yields nothing rather than a partial slot.
assert.equal(buildSlotsForDate([{ days: 'Monday', hours: '09:00 - 09:20' }], MON, 30).length, 0);

// --- overlapping blocks must not double up ---
const overlapping = [
    { days: 'Monday', hours: '09:00 - 12:00' },
    { days: 'Monday', hours: '11:00 - 13:00' },
];
const merged = buildSlotsForDate(overlapping, MON, 60);
const keys = merged.map((s) => `${s.start}-${s.end}`);
assert.equal(new Set(keys).size, keys.length, 'overlapping blocks must not emit duplicate slots');
assert.deepEqual(keys, ['09:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00'], 'merged and sorted');

// --- legacy free-text schedules still parse ---
assert.ok(buildSlotsForDate([{ days: 'Mon - Fri', hours: '9:00 AM - 5:00 PM' }], MON, 30).length > 0, '12-hour legacy format');
assert.ok(buildSlotsForDate([{ days: 'Weekdays', hours: '09:00 - 17:00' }], MON, 30).length > 0, '"Weekdays" label');
assert.equal(buildSlotsForDate([{ days: 'Weekend', hours: '10:00 - 12:00' }], MON, 30).length, 0, '"Weekend" excludes Monday');
assert.ok(buildSlotsForDate([{ days: 'Weekend', hours: '10:00 - 12:00' }], SAT, 30).length > 0, '"Weekend" includes Saturday');

// --- all-day, from the availability editor ---
assert.equal(buildSlotsForDate([{ days: 'Monday', hours: '00:00 - 23:59' }], MON, 60).length, 23, 'all-day yields a full day of slots');

// --- guards ---
assert.deepEqual(buildSlotsForDate(split, '', 30), [], 'no date, no slots');
assert.deepEqual(buildSlotsForDate(null, MON, 30), [], 'no schedule, no slots');
assert.deepEqual(buildSlotsForDate([{ days: 'Monday', hours: 'garbage' }], MON, 30), [], 'unparseable hours yield nothing');
assert.equal(parseTimeRange('14:00 - 09:00'), null, 'a backwards range is rejected');
assert.equal(isScheduleApplicable('Monday', SUN), false);

console.log('appointment slot checks passed');
