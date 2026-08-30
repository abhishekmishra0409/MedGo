// Run: node src/data/intake.test.mjs
import assert from 'assert';
import { buildReasonFromSymptom, getIntakeValidationError, emptyIntake, REASON_MIN_LENGTH, DURATIONS, SEVERITIES, COMMON_CONDITIONS } from './intake.js';
import { SYMPTOMS, getSymptom } from './symptoms.js';

// --- the regression: a prefilled reason must clear its own minimum ---
// "Migraine." was 9 characters, so the guided flow's prefill failed validation
// and blocked the patient it was meant to help.
SYMPTOMS.forEach((symptom) => {
    const reason = buildReasonFromSymptom(symptom);
    assert.ok(
        reason.trim().length >= REASON_MIN_LENGTH,
        `prefill for "${symptom.id}" is only ${reason.trim().length} chars: ${JSON.stringify(reason)}`
    );
});

// The shortest labels are the ones that used to break.
['migraine', 'fever', 'headache', 'acne'].forEach((id) => {
    const reason = buildReasonFromSymptom(getSymptom(id));
    const intake = { ...emptyIntake(), duration: 'few-days', severity: 'mild' };
    assert.equal(getIntakeValidationError(reason, intake), '', `"${id}" must pass validation straight from the prefill`);
});

assert.equal(buildReasonFromSymptom(null), '', 'no symptom means no prefill');

// --- validation ---
const full = { ...emptyIntake(), duration: 'today', severity: 'severe' };
assert.equal(getIntakeValidationError('A detailed description here', full), '');

assert.match(getIntakeValidationError('short', full), /10 characters/);
assert.match(getIntakeValidationError('   ', full), /10 characters/, 'whitespace is not detail');
assert.match(getIntakeValidationError('A detailed description here', { ...full, duration: '' }), /how long/i);
assert.match(getIntakeValidationError('A detailed description here', { ...full, severity: '' }), /severe/i);
assert.match(getIntakeValidationError('A detailed description here', undefined), /how long/i, 'missing intake is caught');

// --- option values must match the server enums ---
const SERVER_DURATIONS = ['today', 'few-days', 'about-a-week', 'few-weeks', 'few-months', 'longer'];
const SERVER_SEVERITIES = ['mild', 'moderate', 'severe'];
assert.deepEqual(DURATIONS.map((d) => d.value), SERVER_DURATIONS, 'duration values must match Appointment.intake.duration enum');
assert.deepEqual(SEVERITIES.map((s) => s.value), SERVER_SEVERITIES, 'severity values must match Appointment.intake.severity enum');
SEVERITIES.forEach((s) => assert.ok(s.hint, `${s.value} needs a hint so "moderate" is not guesswork`));
assert.ok(COMMON_CONDITIONS.includes('Currently pregnant'), 'pregnancy changes what is safe to prescribe');

console.log(`intake checks passed — ${SYMPTOMS.length} prefills all clear the ${REASON_MIN_LENGTH}-char minimum`);
