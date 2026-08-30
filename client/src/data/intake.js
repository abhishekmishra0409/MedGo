// The intake questions asked at booking.
//
// The free-text `reason` alone gave the doctor almost nothing — and it isn't
// even shown to them today. These are the questions a clinician asks first, so
// the answers arrive before the consultation rather than eating into it.
//
// Values must match the enums on Appointment.intake in the server model.

export const DURATIONS = [
    { value: "today", label: "Started today" },
    { value: "few-days", label: "A few days" },
    { value: "about-a-week", label: "About a week" },
    { value: "few-weeks", label: "A few weeks" },
    { value: "few-months", label: "A few months" },
    { value: "longer", label: "Longer than 6 months" },
];

export const SEVERITIES = [
    { value: "mild", label: "Mild", hint: "Noticeable, but I can carry on as normal" },
    { value: "moderate", label: "Moderate", hint: "It's affecting my daily activities" },
    { value: "severe", label: "Severe", hint: "It's stopping me doing things" },
];

// The conditions that most change how a doctor reads any other complaint.
export const COMMON_CONDITIONS = [
    "Diabetes",
    "High blood pressure",
    "Heart disease",
    "Asthma",
    "Thyroid disorder",
    "Kidney disease",
    "Liver disease",
    "Currently pregnant",
];

export const REASON_MIN_LENGTH = 10;

export const emptyIntake = () => ({
    duration: "",
    severity: "",
    existingConditions: [],
    currentMedications: "",
    allergies: "",
    previousTreatment: "",
});

/**
 * Seed the reason from a symptom chosen in the guided flow.
 *
 * Must clear the minimum on its own: a bare "Migraine." is 9 characters, so the
 * prefill was blocking the very patients it was meant to help.
 */
export const buildReasonFromSymptom = (symptom) => {
    if (!symptom) return "";
    return `I need to see a doctor about: ${symptom.label.toLowerCase()}.`;
};

export const getIntakeValidationError = (reason, intake) => {
    const trimmed = String(reason || "").trim();

    if (trimmed.length < REASON_MIN_LENGTH) {
        return `Please describe the problem in at least ${REASON_MIN_LENGTH} characters.`;
    }
    if (!intake?.duration) {
        return "Please tell us how long you have had this problem.";
    }
    if (!intake?.severity) {
        return "Please tell us how severe it is.";
    }

    return "";
};
