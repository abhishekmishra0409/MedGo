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

// --- mass assignment: the booking payload is an allow-list ---
const hostile = {
    patient: 'p1',
    doctor: 'IGNORED',
    date: 'IGNORED',
    timeSlot: { start: '09:00', end: '09:30' },
    type: 'teleconsultation',
    reason: 'a genuine reason string',
    // Everything below is an escalation attempt and must not survive.
    status: 'confirmed',
    payment: { status: 'paid', amount: 0, method: 'upi' },
    notes: { doctorNotes: 'forged clinical note' },
    cancellation: { reason: 'forged', initiatedBy: 'doctor' },
    teleconsultation: { meetingId: 'vz_forged', joinCode: 'AAAA-BBBB' },
    createdAt: new Date(0),
};

const startOfDay = new Date(2099, 0, 1);
const built = AppointmentService.buildAppointmentPayload(hostile, 'realDoctorId', startOfDay);

assert.equal(built.doctor, 'realDoctorId', 'doctor comes from the resolved record');
assert.equal(built.date, startOfDay, 'date comes from the server-parsed range');
assert.equal(built.patient, 'p1');
assert.equal(built.type, 'teleconsultation');

assert.equal(built.status, undefined, 'status must not be settable by the patient');
assert.equal(built.cancellation, undefined, 'cancellation must not be settable');
assert.equal(built.teleconsultation, undefined, 'the teleconsultation block must not be forgeable');
assert.equal(built.notes, undefined, 'doctorNotes must not be settable');
assert.equal(built.createdAt, undefined, 'timestamps must not be settable');
assert.equal(built.payment.status, undefined, 'payment.status must not be settable');
assert.equal(built.payment.method, undefined, 'payment.method must not be settable');
assert.deepEqual(Object.keys(built.payment), ['amount'], 'only the amount is patient-supplied');

// in-person keeps the clinic, drops payment entirely
const inPerson = AppointmentService.buildAppointmentPayload(
    { patient: 'p1', timeSlot: { start: '10:00', end: '10:30' }, type: 'in-person', reason: 'x'.repeat(12), clinic: 'c1', status: 'completed' },
    'd1', startOfDay
);
assert.equal(inPerson.clinic, 'c1');
assert.equal(inPerson.payment, undefined, 'in-person carries no payment block');
assert.equal(inPerson.status, undefined);

console.log('appointment transition + participant + payload allow-list checks passed');
