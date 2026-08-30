const { resolveSpecialty, getSpecialty } = require('./specialties');
const buildDoctorAccount = (user = {}) => {
    if (!user) {
        return null;
    }

    const profile = user.doctorProfile || {};

    return {
        _id: user._id,
        id: user._id,
        name: user.name || user.username || "",
        username: user.username || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role,
        bio: user.bio || "",
        dateOfBirth: user.dateOfBirth || "",
        gender: user.gender || "",
        bloodGroup: user.bloodGroup || "",
        address: user.address || {},
        emergencyContact: user.emergencyContact || {},
        image: profile.image || user.avatar || "",
        avatar: user.avatar || profile.image || "",
        specialty: profile.specialty || "",
        qualification: profile.qualification || "",
        contact: {
            phone: user.phone || "",
            email: profile.contactEmail || user.email || "",
            address: profile.address || "",
        },
        workingHours: profile.workingHours || [],
        education: profile.education || [],
        biography: profile.biography || [],
        specializations: profile.specializations || [],
        rating: profile.rating ?? 0,
        reviews: profile.reviews ?? 0,
        approvalStatus: profile.approvalStatus || "pending",
        approvalNotes: profile.approvalNotes || "",
        clinicRole: profile.clinicRole || null,
        registrationMode: profile.registrationMode || null,
        primaryClinic: profile.primaryClinic || null,
        requestedClinicAccessCode: profile.requestedClinicAccessCode || "",
        clinicMembershipStatus: profile.clinicMembershipStatus || "none",
        clinicMembershipNotes: profile.clinicMembershipNotes || "",
        councilRegistrationNumber: profile.councilRegistrationNumber || "",
        councilName: profile.councilName || "",
        practiceAddress: profile.practiceAddress || {},
        operatingHours: profile.operatingHours || {},
        consultationSettings: profile.consultationSettings || {},
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};

// approvalStatus = layer 1 (super admin credential verification).
// clinicMembershipStatus = layer 2 (clinic owner roster approval), independent
// of layer 1. Both must pass for the doctor to be publicly visible/bookable;
// 'none' (solo, no clinic) never blocks visibility.
const buildDoctorSearchQuery = ({ search, specialty, approvalStatus = "approved", clinicMembershipStatus } = {}) => {
    const query = {
        role: "doctor",
    };

    if (approvalStatus && approvalStatus !== "all") {
        query["doctorProfile.approvalStatus"] = approvalStatus;

        if (approvalStatus === "approved" && !clinicMembershipStatus) {
            query["doctorProfile.clinicMembershipStatus"] = { $in: ["none", "approved"] };
        }
    }

    if (clinicMembershipStatus && clinicMembershipStatus !== "all") {
        query["doctorProfile.clinicMembershipStatus"] = clinicMembershipStatus;
    }

    if (specialty?.trim()) {
        // Was exact, case-sensitive equality, so "Cardiology" never matched a
        // doctor stored as "Cardiologist". Match the canonical name and every
        // alias, case-insensitively, so pre-existing records resolve with no
        // migration.
        const canonical = resolveSpecialty(specialty);
        const entry = getSpecialty(canonical);
        const candidates = entry ? [entry.name, ...entry.aliases] : [specialty.trim()];
        const escape = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        // Stored values often append a role word — "Orthopedic Surgeon",
        // "Heart Specialist" — so allow one optional suffix rather than trying
        // to enumerate every combination as its own alias.
        const ROLE_SUFFIX = "(?:\\s+(?:surgeon|specialist|doctor|consultant|physician|surgery))?";

        query["doctorProfile.specialty"] = {
            $in: candidates.map((value) => new RegExp(`^${escape(value)}${ROLE_SUFFIX}$`, "i")),
        };
    }

    if (search?.trim()) {
        query.$text = { $search: search.trim() };
    }

    return query;
};

module.exports = {
    buildDoctorAccount,
    buildDoctorSearchQuery,
};
