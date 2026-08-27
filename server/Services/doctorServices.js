const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../Models/UserModel');
const Clinic = require('../Models/ClinicModel');
const { buildDoctorAccount, buildDoctorSearchQuery } = require('../Utils/doctorAccount');

const normalizeStringArray = (value) =>
    Array.isArray(value)
        ? value.map((item) => String(item).trim()).filter(Boolean)
        : [];

const sanitizeWorkingHours = (value) =>
    Array.isArray(value)
        ? value
            .map((slot) => ({
                days: String(slot?.days || '').trim(),
                hours: String(slot?.hours || '').trim(),
            }))
            .filter((slot) => slot.days || slot.hours)
        : [];

const buildDoctorProfileFromPayload = (payload = {}, existingProfile = {}) => ({
    ...existingProfile,
    specialty: payload.specialty?.trim() ?? existingProfile.specialty ?? '',
    qualification: payload.qualification?.trim() ?? existingProfile.qualification ?? '',
    councilRegistrationNumber: payload.councilRegistrationNumber?.trim().toUpperCase() ?? existingProfile.councilRegistrationNumber ?? '',
    councilName: payload.councilName?.trim() ?? existingProfile.councilName ?? '',
    image: payload.image?.trim() ?? payload.avatar?.trim() ?? existingProfile.image ?? '',
    contactEmail: payload.contact?.email?.toLowerCase().trim() ?? existingProfile.contactEmail ?? payload.email?.toLowerCase().trim() ?? '',
    address: payload.contact?.address?.trim() ?? existingProfile.address ?? '',
    workingHours: payload.workingHours ? sanitizeWorkingHours(payload.workingHours) : existingProfile.workingHours || [],
    education: payload.education ? normalizeStringArray(payload.education) : existingProfile.education || [],
    biography: payload.biography ? normalizeStringArray(payload.biography) : existingProfile.biography || [],
    specializations: payload.specializations ? normalizeStringArray(payload.specializations) : existingProfile.specializations || [],
    rating: payload.rating !== undefined ? Number(payload.rating) || 0 : existingProfile.rating ?? 0,
    reviews: payload.reviews !== undefined ? Number(payload.reviews) || 0 : existingProfile.reviews ?? 0,
});

const getAllDoctors = async (filters = {}) => {
    const search = filters.search?.trim();
    const doctors = await User.find(buildDoctorSearchQuery(filters))
        .select('-password -__v')
        .sort(
            search
                ? { score: { $meta: 'textScore' }, 'doctorProfile.rating': -1, 'doctorProfile.reviews': -1, createdAt: -1 }
                : { 'doctorProfile.rating': -1, 'doctorProfile.reviews': -1, createdAt: -1 }
        )
        .lean();

    return doctors.map(buildDoctorAccount);
};

const getAllDoctorsAdmin = async (filters = {}) => {
    const doctors = await User.find(buildDoctorSearchQuery({
        ...filters,
        approvalStatus: filters.approvalStatus || 'all',
        clinicMembershipStatus: filters.clinicMembershipStatus || 'all',
    }))
        .select('-password -__v')
        .sort({ createdAt: -1 })
        .lean();

    return doctors.map(buildDoctorAccount);
};

const getDoctorById = async (id) => {
    const approvedVisibilityFilter = buildDoctorSearchQuery({ approvalStatus: 'approved' });
    const idMatchers = [{ legacyDoctorId: id }];

    if (mongoose.Types.ObjectId.isValid(id)) {
        idMatchers.push({ _id: id });
    }

    const doctor = await User.findOne({
        role: 'doctor',
        $and: [
            approvedVisibilityFilter,
            { $or: idMatchers },
        ],
    })
        .select('-password -__v')
        .lean();

    if (!doctor) {
        throw new Error('Doctor not found');
    }

    return buildDoctorAccount(doctor);
};

const createDoctor = async (doctorData) => {
    const normalizedEmail = doctorData.email?.toLowerCase().trim();
    const normalizedPhone = doctorData.contact?.phone?.trim() || doctorData.phone?.trim();

    if (!normalizedEmail || !normalizedPhone || !doctorData.name || !doctorData.password) {
        throw new Error('Name, email, phone, and password are required');
    }

    const existingDoctor = await User.findOne({
        $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    });

    if (existingDoctor) {
        throw new Error('Email or phone already in use');
    }

    const hashedPassword = await bcrypt.hash(doctorData.password, 10);
    const doctor = await User.create({
        username: doctorData.name.trim(),
        name: doctorData.name.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        password: hashedPassword,
        role: 'doctor',
        avatar: doctorData.image?.trim() || doctorData.avatar?.trim() || '',
        doctorProfile: {
            ...buildDoctorProfileFromPayload(doctorData),
            // Admin creating an account directly *is* the approval.
            approvalStatus: doctorData.approvalStatus || 'approved',
            clinicRole: doctorData.clinicRole || null,
            registrationMode: doctorData.registrationMode || null,
            requestedClinicAccessCode: doctorData.requestedClinicAccessCode || '',
            // Admin-created doctors should be listable without a roster round-trip.
            clinicMembershipStatus: doctorData.clinicMembershipStatus || 'none',
        },
    });

    return buildDoctorAccount(doctor.toObject());
};

const updateDoctor = async (id, updatedData) => {
    const doctor = await User.findOne({ _id: id, role: 'doctor' }).select('+password');

    if (!doctor) {
        throw new Error('Doctor not found');
    }

    if (updatedData.email) {
        doctor.email = updatedData.email.toLowerCase().trim();
    }

    if (updatedData.name) {
        doctor.name = updatedData.name.trim();
        doctor.username = updatedData.name.trim();
    }

    if (updatedData.contact?.phone || updatedData.phone) {
        doctor.phone = updatedData.contact?.phone?.trim() || updatedData.phone?.trim();
    }

    if (updatedData.password) {
        doctor.password = await bcrypt.hash(updatedData.password, 10);
    }

    if (updatedData.image || updatedData.avatar) {
        doctor.avatar = updatedData.image?.trim() || updatedData.avatar?.trim() || '';
    }

    doctor.doctorProfile = buildDoctorProfileFromPayload(updatedData, doctor.doctorProfile?.toObject?.() || doctor.doctorProfile || {});
    await doctor.save();

    return buildDoctorAccount(doctor.toObject());
};

// Role-aware: covers both 'doctor' (doctorProfile.approvalStatus) and
// 'clinic-owner' (ownerProfile.approvalStatus) — the platform-level (layer 1)
// approval. Clinic roster membership (layer 2) is a separate gate owned by
// clinicService.updateRosterMembership and is never touched here except to
// avoid silently bypassing it (see joinsRoster below).
const updateAccountApproval = async (id, approvalStatus, approvalNotes = '') => {
    const account = await User.findOne({ _id: id, role: { $in: ['doctor', 'clinic-owner'] } });

    if (!account) {
        throw new Error('Account not found');
    }

    if (!['pending', 'approved', 'rejected'].includes(approvalStatus)) {
        throw new Error('Invalid approval status');
    }

    const notes = approvalNotes?.trim() || '';

    if (account.role === 'clinic-owner') {
        account.ownerProfile = {
            ...(account.ownerProfile?.toObject?.() || account.ownerProfile || {}),
            approvalStatus,
            approvalNotes: notes,
        };

        const clinic = await Clinic.findOne({ owner: account._id });
        if (clinic) {
            await Clinic.findByIdAndUpdate(clinic._id, { isActive: approvalStatus === 'approved' });
        }
    } else {
        const profile = account.doctorProfile?.toObject?.() || account.doctorProfile || {};
        account.doctorProfile = { ...profile, approvalStatus, approvalNotes: notes };

        // A doctor who owns their clinic, or whose clinicMembershipStatus is
        // already 'approved' by the clinic owner, joins the roster on platform
        // approval. A member still awaiting the owner's roster decision does not
        // — approving layer 1 must never silently bypass layer 2.
        const joinsRoster = profile.clinicRole === 'owner' || profile.clinicMembershipStatus === 'approved';

        if (approvalStatus === 'approved' && joinsRoster && profile.primaryClinic) {
            await Clinic.findByIdAndUpdate(profile.primaryClinic, {
                $set: {
                    isActive: true,
                    ...(profile.clinicRole === 'owner' ? { owner: account._id } : {}),
                },
                $addToSet: { doctors: account._id },
            });
        }

        // Deactivation only follows the owner losing platform approval — never
        // a plain member, whose clinic isn't theirs to take down.
        if (approvalStatus !== 'approved' && profile.clinicRole === 'owner' && profile.primaryClinic) {
            await Clinic.findByIdAndUpdate(profile.primaryClinic, { isActive: false });
        }
    }

    await account.save();
    return account.role === 'clinic-owner' ? account.toObject() : buildDoctorAccount(account.toObject());
};

const deleteDoctor = async (id) => {
    const doctor = await User.findOneAndDelete({ _id: id, role: 'doctor' });

    if (!doctor) {
        throw new Error('Doctor not found');
    }

    await Clinic.updateMany(
        { doctors: doctor._id },
        {
            $pull: { doctors: doctor._id },
            ...(doctor.doctorProfile?.clinicRole === 'owner' ? { $set: { isActive: false } } : {}),
        }
    );

    return { message: 'Doctor deleted successfully' };
};

module.exports = {
    createDoctor,
    deleteDoctor,
    getAllDoctors,
    getAllDoctorsAdmin,
    getDoctorById,
    updateDoctor,
    updateAccountApproval,
};
