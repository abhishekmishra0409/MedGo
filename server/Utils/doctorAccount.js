const buildDoctorAccount = (user = {}) => {
    const profile = user.doctorProfile || {};

    return {
        _id: user._id,
        id: user._id,
        name: user.name || user.username || "",
        username: user.username || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role,
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
        approvalStatus: profile.approvalStatus || "approved",
        approvalNotes: profile.approvalNotes || "",
        clinicRole: profile.clinicRole || null,
        registrationMode: profile.registrationMode || null,
        primaryClinic: profile.primaryClinic || null,
        requestedClinicAccessCode: profile.requestedClinicAccessCode || "",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};

const buildDoctorSearchQuery = ({ search, specialty, approvalStatus = "approved" } = {}) => {
    const query = {
        role: "doctor",
    };

    if (approvalStatus && approvalStatus !== "all") {
        if (approvalStatus === "approved") {
            query.$or = [
                { "doctorProfile.approvalStatus": "approved" },
                { "doctorProfile.approvalStatus": { $exists: false } },
                { "doctorProfile.approvalStatus": null },
            ];
        } else {
            query["doctorProfile.approvalStatus"] = approvalStatus;
        }
    }

    if (specialty?.trim()) {
        query["doctorProfile.specialty"] = specialty.trim();
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
