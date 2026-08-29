const STORAGE_KEYS = {
    user: {
        session: "userSession",
        token: "userToken",
        raw: "user",
    },
    doctor: {
        session: "doctorSession",
        token: "doctorToken",
        raw: "doctor",
    },
    "clinic-owner": {
        session: "ownerSession",
        token: "ownerToken",
        raw: "owner",
    },
};

const safeParse = (value) => {
    try {
        return value ? JSON.parse(value) : null;
    } catch {
        return null;
    }
};

const flattenDoctorProfile = (payload) => {
    const source = payload?.data?.doctor || payload?.doctor || payload?.data || payload || null;

    if (!source) {
        return null;
    }

    const profile = source.doctorProfile || {};

    return {
        ...source,
        name: source.name || source.username || "",
        username: source.username || source.name || "",
        bio: source.bio || "",
        dateOfBirth: source.dateOfBirth || "",
        gender: source.gender || "",
        bloodGroup: source.bloodGroup || "",
        address: source.address || {},
        emergencyContact: source.emergencyContact || {},
        avatar: source.avatar || profile.image || source.image || "",
        image: profile.image || source.avatar || source.image || "",
        specialty: profile.specialty || source.specialty || "",
        qualification: profile.qualification || source.qualification || "",
        contact: {
            phone: source.phone || source.contact?.phone || "",
            email: profile.contactEmail || source.email || source.contact?.email || "",
            address: profile.address || source.contact?.address || "",
        },
        workingHours: profile.workingHours || source.workingHours || [],
        consultationSettings: {
            slotDuration: profile.consultationSettings?.slotDuration || 30,
            maxDailyAppointments: profile.consultationSettings?.maxDailyAppointments || 20,
        },
        education: profile.education || source.education || [],
        biography: profile.biography || source.biography || [],
        specializations: profile.specializations || source.specializations || [],
        rating: profile.rating ?? source.rating ?? 0,
        reviews: profile.reviews ?? source.reviews ?? 0,
        // Fail-closed: an unrecognized/missing status must never read as approved.
        approvalStatus: profile.approvalStatus || source.approvalStatus || "pending",
        clinicMembershipStatus: profile.clinicMembershipStatus || source.clinicMembershipStatus || "none",
        clinicMembershipNotes: profile.clinicMembershipNotes || source.clinicMembershipNotes || "",
        councilRegistrationNumber: profile.councilRegistrationNumber || source.councilRegistrationNumber || "",
        councilName: profile.councilName || source.councilName || "",
        practiceAddress: profile.practiceAddress || source.practiceAddress || {},
    };
};

const normalizeProfile = (role, payload) => {
    if (role === "doctor") {
        return flattenDoctorProfile(payload);
    }

    return payload?.data || payload?.user || payload || null;
};

const normalizeToken = (payload) => payload?.token || payload?.data?.token || "";

export const createSessionPayload = (role, payload) => ({
    role,
    token: normalizeToken(payload),
    profile: normalizeProfile(role, payload),
    raw: payload,
});

export const persistSession = (role, payload) => {
    const keys = STORAGE_KEYS[role];
    const session = createSessionPayload(role, payload);

    localStorage.setItem(keys.session, JSON.stringify(session));
    localStorage.setItem(keys.raw, JSON.stringify(payload));

    if (session.token) {
        localStorage.setItem(keys.token, session.token);
    }

    return session;
};

export const clearSession = (role) => {
    const keys = STORAGE_KEYS[role];
    localStorage.removeItem(keys.session);
    localStorage.removeItem(keys.token);
    localStorage.removeItem(keys.raw);
};

// Role is derived from the login response now, not chosen by the user, so a
// stale session under a different role bucket can never coexist with a fresh
// login — e.g. logging in as a patient after a doctor session leaves no
// dangling doctorToken behind.
export const clearAllSessions = () => {
    Object.keys(STORAGE_KEYS).forEach(clearSession);
};

export const getStoredSession = (role) => {
    const keys = STORAGE_KEYS[role];
    const storedSession = safeParse(localStorage.getItem(keys.session));

    if (storedSession?.profile) {
        return storedSession;
    }

    const raw = safeParse(localStorage.getItem(keys.raw));
    const token = localStorage.getItem(keys.token) || "";

    if (!raw && !token) {
        return null;
    }

    return {
        role,
        token,
        profile: normalizeProfile(role, raw),
        raw,
    };
};
