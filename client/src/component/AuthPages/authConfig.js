export const AUTH_ROLES = ["user", "doctor", "clinic-owner"];

export const normalizeAuthRole = (role) => (AUTH_ROLES.includes(role) ? role : "user");

// Signup-only now — login no longer offers a role tab, role comes back from
// the login response itself.
export const authRoleOptions = [
    { value: "user", label: "Patient" },
    { value: "doctor", label: "Doctor" },
    { value: "clinic-owner", label: "Clinic / hospital" },
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
        summary: "A shared sign-in keeps clinical work, scheduling, and communication in one dependable entry point.",
        highlights: [
            "Open your dashboard, bookings, and messaging from one login.",
            "Practise solo, join a clinic, or start your own — all one application.",
            "Reset access safely when credentials need to change.",
        ],
    },
    "clinic-owner": {
        label: "Clinic / hospital",
        modeLabel: "Facility workspace",
        headline: "Register your facility, manage your doctor roster, and keep patients informed.",
        summary: "One workspace to set up your clinic's details and decide who joins your team.",
        highlights: [
            "Share your access code with doctors you want to join.",
            "Approve or reject doctors before they appear in patient search.",
            "Edit facility details, hours, and contact info any time.",
        ],
    },
};
