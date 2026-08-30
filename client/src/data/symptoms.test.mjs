// Run: node src/data/symptoms.test.mjs
import assert from 'assert';
import { SYMPTOMS, BODY_AREAS, matchSymptom, symptomsByArea, hasRedFlag, validateSymptomTable } from './symptoms.js';
import { SPECIALTY_NAMES, resolveSpecialty } from './specialties.js';

// --- table integrity: a typo here routes a patient to zero doctors ---
const problems = validateSymptomTable();
assert.deepEqual(problems, [], `symptom table problems:\n  ${problems.join('\n  ')}`);

assert.ok(SYMPTOMS.length >= 80, `expected a substantial table, got ${SYMPTOMS.length}`);
BODY_AREAS.forEach((area) => {
    assert.ok(symptomsByArea(area.id).length > 0, `body area "${area.id}" has no symptoms — it would render an empty list`);
});

// --- red flags ---
const redFlags = SYMPTOMS.filter((s) => s.redFlag);
assert.ok(redFlags.length >= 8, 'expected the common emergencies to be covered');
redFlags.forEach((s) => {
    assert.ok(s.advice && s.advice.length > 20, `${s.id}: red flag advice must be actionable`);
    assert.ok(/108|14416/.test(s.advice), `${s.id}: advice must name a number to call`);
});

// The specific presentations that must never route to a routine booking.
[
    ['chest pain', 'Cardiology'],
    ['heart attack', 'Cardiology'],
    ["can't breathe", 'Pulmonology'],
    ['stroke', 'Neurology'],
    ['suicidal', 'Psychiatry'],
].forEach(([query, specialty]) => {
    const [top] = matchSymptom(query);
    assert.ok(top, `"${query}" must match something`);
    assert.equal(top.redFlag, true, `"${query}" must be flagged as an emergency`);
    assert.equal(top.specialty, specialty, `"${query}" should route to ${specialty}`);
});

// --- routine routing ---
[
    ['skin rash', 'Dermatology'],
    ['toothache', 'Dentistry'],
    ['back pain', 'Orthopedics'],
    ['irregular periods', 'Gynecology'],
    ['blurred vision', 'Ophthalmology'],
    ['sugar', 'Endocrinology'],
    ['piles', 'Gastroenterology'],
    ["can't sleep", 'Psychiatry'],
    ['fever', 'General Medicine'],
    ['baby fever', 'Pediatrics'],
    ['burning urine', 'Urology'],
    ['ear pain', 'ENT'],
].forEach(([query, specialty]) => {
    const [top] = matchSymptom(query);
    assert.ok(top, `"${query}" must match something`);
    assert.equal(top.specialty, specialty, `"${query}" → expected ${specialty}, got ${top.specialty} (${top.id})`);
});

// --- matcher behaviour ---
assert.deepEqual(matchSymptom(''), [], 'an empty query matches nothing');
assert.deepEqual(matchSymptom('   '), [], 'whitespace matches nothing');
assert.deepEqual(matchSymptom('zzzznotasymptom'), [], 'nonsense matches nothing');
assert.ok(matchSymptom('pain').length > 1, 'a broad term returns several options');
assert.ok(matchSymptom('a', 3).length <= 3, 'the limit is respected');
assert.equal(matchSymptom('CHEST PAIN')[0].id, 'chest-pain', 'matching is case-insensitive');

assert.equal(hasRedFlag(matchSymptom('chest pain')), true);
assert.equal(hasRedFlag(matchSymptom('toothache')), false);

// --- every routed specialty must resolve to itself (canonical, not an alias) ---
[...new Set(SYMPTOMS.map((s) => s.specialty))].forEach((specialty) => {
    assert.ok(SPECIALTY_NAMES.includes(specialty), `${specialty} is not canonical`);
    assert.equal(resolveSpecialty(specialty), specialty, `${specialty} must be its own canonical form`);
});

console.log(`symptom table: ${SYMPTOMS.length} entries, ${redFlags.length} red flags, ${BODY_AREAS.length} areas — all checks passed`);
