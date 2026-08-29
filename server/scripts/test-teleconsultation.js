// ponytail: no framework, no DB. These two are the only pieces with real
// branching, and both are pure. Run: node scripts/test-teleconsultation.js
const assert = require('assert');
const AppointmentService = require('../Services/appointmentServices');

/* ---- slotInstants: the timezone-sensitive bit ---------------------- */

// `date` is stored as server-local midnight; the time is a bare "HH:MM".
const day = new Date(2026, 8, 30, 0, 0, 0, 0);
const { start, end } = AppointmentService.slotInstants({
    date: day,
    timeSlot: { start: '10:00', end: '10:30' },
});

assert.strictEqual(start.getHours(), 10, 'slot start must land on the local hour, not UTC');
assert.strictEqual(start.getMinutes(), 0);
assert.strictEqual(end.getHours(), 10);
assert.strictEqual(end.getMinutes(), 30);
assert.strictEqual(end - start, 30 * 60000);

// A row whose date carries a stray time component must still normalise.
const messy = AppointmentService.slotInstants({
    date: new Date(2026, 8, 30, 17, 42, 13),
    timeSlot: { start: '09:15', end: '09:45' },
});
assert.strictEqual(messy.start.getHours(), 9);
assert.strictEqual(messy.start.getMinutes(), 15);

assert.throws(
    () => AppointmentService.slotInstants({ date: day, timeSlot: { start: 'lunchtime', end: '10:30' } }),
    /unreadable time slot/,
);

/* ---- assertParticipant: the access rule ---------------------------- */

const patient = { _id: 'p1' };
const doctor = { _id: 'd1' };
const raw = { patient: 'p1', doctor: 'd1' };
const populated = { patient: { _id: 'p1' }, doctor: { _id: 'd1' } };

for (const appointment of [raw, populated]) {
    AppointmentService.assertParticipant(appointment, patient);
    AppointmentService.assertParticipant(appointment, doctor);
    AppointmentService.assertParticipant(appointment, { _id: 'x', role: 'admin' });

    // Controllers pass a Mongoose doc, where `id` is the string virtual.
    AppointmentService.assertParticipant(appointment, { id: 'p1' });

    // The hole this closes: another approved doctor guessing an id.
    assert.throws(() => AppointmentService.assertParticipant(appointment, { _id: 'd2', role: 'doctor' }), /do not have access/);
    // Fails closed rather than open when the caller forgets to pass a user.
    assert.throws(() => AppointmentService.assertParticipant(appointment, undefined), /do not have access/);
    assert.throws(() => AppointmentService.assertParticipant(appointment, {}), /do not have access/);
}

assert.strictEqual(
    (() => { try { AppointmentService.assertParticipant(raw, { _id: 'd2' }); } catch (e) { return e.status; } })(),
    403,
);

console.log('teleconsultation checks passed  (TZ =', Intl.DateTimeFormat().resolvedOptions().timeZone + ')');
