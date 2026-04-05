export const normalizeAuthRole = (role) => (role === "doctor" ? "doctor" : "user");

export const authRoleOptions = [
    { value: "user", label: "Patient" },
    { value: "doctor", label: "Doctor" },
];

export const authRoleContent = {
    user: {
        label: "Patient",
        modeLabel: "Patient access",
        headline: "Manage consultations, tests, and pharmacy orders in one clear account area.",
        summary: "Track every care step with calmer navigation, visible status, and faster booking follow-through.",
        highlights: [
            "Appointments, lab bookings, and orders stay connected.",
            "Use the same account across search, checkout, and reports.",
            "Reset access quickly if you lose your password.",
        ],
    },
    doctor: {
        label: "Doctor",
        modeLabel: "Doctor workspace",
        headline: "Review appointments, lab requests, and patient conversations from one focused dashboard.",
        summary: "A shared doctor sign-in keeps clinical work, scheduling, and communication in one dependable entry point.",
        highlights: [
            "Open your dashboard, bookings, and messaging from one login.",
            "Stay aligned on patient flow without scattered tools.",
            "Reset access safely when credentials need to change.",
        ],
    },
};
