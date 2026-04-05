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
        image: profile.image || source.avatar || source.image || "",
        specialty: profile.specialty || source.specialty || "",
        qualification: profile.qualification || source.qualification || "",
        contact: {
            phone: source.phone || source.contact?.phone || "",
            email: profile.contactEmail || source.email || source.contact?.email || "",
            address: profile.address || source.contact?.address || "",
        },
        workingHours: profile.workingHours || source.workingHours || [],
        education: profile.education || source.education || [],
        biography: profile.biography || source.biography || [],
        specializations: profile.specializations || source.specializations || [],
        rating: profile.rating ?? source.rating ?? 0,
        reviews: profile.reviews ?? source.reviews ?? 0,
        approvalStatus: profile.approvalStatus || source.approvalStatus || "approved",
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
