// Run: node Services/appointmentServices.test.js
const assert = require('assert');
const AppointmentService = require('./appointmentServices');

const rejects = (from, to) => {
    assert.throws(
        () => AppointmentService.assertTransition(from, to),
        (e) => e.status === 409,
        `expected ${from} -> ${to} to be rejected`
    );
};
const allows = (from, to) => {
    assert.doesNotThrow(
        () => AppointmentService.assertTransition(from, to),
        `expected ${from} -> ${to} to be allowed`
    );
};

// Forward moves that must work.
allows('pending', 'confirmed');
allows('pending', 'cancelled');
allows('confirmed', 'completed');
allows('confirmed', 'cancelled');
allows('confirmed', 'no-show');

// Terminal states stay terminal — the regression this table exists for.
rejects('completed', 'pending');
rejects('completed', 'confirmed');
rejects('cancelled', 'confirmed');   // un-cancelling could collide with the unique index
rejects('no-show', 'confirmed');

// A walk-in can be completed without a confirm step.
allows('pending', 'completed');

// Idempotent writes are not transitions.
allows('completed', 'completed');
allows('cancelled', 'cancelled');

// --- participant guard ---
const patient = { _id: 'p1' };
const doctor = { _id: 'd1' };
const appt = { patient: 'p1', doctor: 'd1' };

assert.doesNotThrow(() => AppointmentService.assertParticipant(appt, patient));
assert.doesNotThrow(() => AppointmentService.assertParticipant(appt, doctor));
assert.throws(
    () => AppointmentService.assertParticipant(appt, { _id: 'stranger' }),
    (e) => e.status === 403,
    'a non-participant must be refused'
);
assert.throws(
    () => AppointmentService.assertParticipant(appt, undefined),
    (e) => e.status === 403,
    'a missing user must fail closed'
);
assert.doesNotThrow(() => AppointmentService.assertParticipant(appt, { _id: 'x', role: 'admin' }));

console.log('appointment transition + participant checks passed');
