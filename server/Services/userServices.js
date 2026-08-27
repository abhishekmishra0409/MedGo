const mongoose = require('mongoose');
const User = require('../Models/UserModel');
const Clinic = require('../Models/ClinicModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/config');
const NotificationService = require('./notificationService');

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

const sanitizeAddress = (address = {}, existingAddress = {}) => ({
    line1: address.line1?.trim() ?? existingAddress?.line1 ?? '',
    line2: address.line2?.trim() ?? existingAddress?.line2 ?? '',
    city: address.city?.trim() ?? existingAddress?.city ?? '',
    state: address.state?.trim() ?? existingAddress?.state ?? '',
    postalCode: address.postalCode?.trim() ?? existingAddress?.postalCode ?? '',
    country: address.country?.trim() ?? existingAddress?.country ?? '',
});

const sanitizeEmergencyContact = (contact = {}, existingContact = {}) => ({
    name: contact.name?.trim() ?? existingContact?.name ?? '',
    relationship: contact.relationship?.trim() ?? existingContact?.relationship ?? '',
    phone: contact.phone?.trim() ?? existingContact?.phone ?? '',
});

const normalizeDate = (value, fallback) => {
    if (value === '' || value === null) {
        return undefined;
    }

    if (!value) {
        return fallback;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? fallback : parsed;
};

const buildClinicPayload = (clinic = {}, ownerId, isActive = true) => ({
    name: clinic.name?.trim(),
    owner: ownerId,
    address: {
        street: clinic.address?.street?.trim(),
        city: clinic.address?.city?.trim(),
        state: clinic.address?.state?.trim(),
        postalCode: clinic.address?.postalCode?.trim(),
        country: clinic.address?.country?.trim() || 'INDIA',
    },
    contact: {
        phone: clinic.contact?.phone?.trim(),
        email: clinic.contact?.email?.toLowerCase().trim(),
    },
    facilities: normalizeStringArray(clinic.facilities),
    operatingHours: {
        weekdays: {
            open: clinic.operatingHours?.weekdays?.open?.trim(),
            close: clinic.operatingHours?.weekdays?.close?.trim(),
        },
        weekends: {
            open: clinic.operatingHours?.weekends?.open?.trim() || '',
            close: clinic.operatingHours?.weekends?.close?.trim() || '',
        },
    },
    appointmentSettings: {
        slotDuration: Number(clinic.appointmentSettings?.slotDuration) || 30,
        maxDailyAppointments: Number(clinic.appointmentSettings?.maxDailyAppointments) || 20,
    },
    isActive,
});

const validateClinicPayload = (clinic = {}) => {
    if (
        !clinic.name ||
        !clinic.address?.street ||
        !clinic.address?.city ||
        !clinic.address?.state ||
        !clinic.address?.postalCode ||
        !clinic.address?.country ||
        !clinic.contact?.phone ||
        !clinic.contact?.email
    ) {
        throw new Error('Clinic information is incomplete');
    }
};

const validatePracticeAddress = (address = {}) => {
    if (!address.street || !address.city || !address.state || !address.postalCode) {
        throw new Error('Practice address is required to register as an independent doctor');
    }
};

const sanitizePracticeAddress = (address = {}) => ({
    street: address.street?.trim() || '',
    city: address.city?.trim() || '',
    state: address.state?.trim() || '',
    postalCode: address.postalCode?.trim() || '',
    country: address.country?.trim() || 'INDIA',
});

class UserService {
    static async registerUser(userData) {
        let createdClinic = null;

        try {
            const normalizedEmail = userData.email?.toLowerCase().trim();
            const normalizedPhone = userData.phone?.trim();
            const role = ['doctor', 'clinic-owner'].includes(userData.role) ? userData.role : 'user';

            if (!normalizedEmail || !normalizedPhone || !userData.password) {
                throw new Error('Name, email, phone, and password are required');
            }

            const existingUser = await User.findOne({
                $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
            });

            if (existingUser) {
                throw new Error('A user with this email or phone already exists');
            }

            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const userId = new mongoose.Types.ObjectId();

            const userPayload = {
                _id: userId,
                username: userData.username?.trim() || userData.name?.trim(),
                name: userData.name?.trim() || userData.username?.trim(),
                email: normalizedEmail,
                phone: normalizedPhone,
                password: hashedPassword,
                role,
                avatar: userData.avatar?.trim() || '',
            };

            if (!userPayload.username) {
                throw new Error('Full name is required');
            }

            // Shared by doctor create-clinic and the clinic-owner role: creates the
            // clinic first with a pre-allocated owner id (no user saved yet), so
            // failure anywhere after this point rolls it back in the catch below.
            const createOwnedClinic = async (clinicPayload) => {
                validateClinicPayload(clinicPayload);
                return Clinic.create(buildClinicPayload(clinicPayload, userId, false));
            };

            if (role === 'doctor') {
                const doctorProfileInput = userData.doctorProfile || {};
                const registrationMode =
                    doctorProfileInput.registrationMode || userData.registrationMode || 'join-clinic';

                if (!doctorProfileInput.specialty?.trim() || !doctorProfileInput.qualification?.trim()) {
                    throw new Error('Specialty and qualification are required for doctor registration');
                }

                const councilRegistrationNumber = doctorProfileInput.councilRegistrationNumber?.trim().toUpperCase();
                const councilName = doctorProfileInput.councilName?.trim();

                if (!councilRegistrationNumber || !councilName) {
                    throw new Error('Medical council registration number and issuing council are required');
                }

                userPayload.doctorProfile = {
                    approvalStatus: 'pending',
                    approvalNotes: '',
                    registrationMode,
                    clinicMembershipStatus: 'none',
                    clinicMembershipNotes: '',
                    clinicRole: null,
                    specialty: doctorProfileInput.specialty.trim(),
                    qualification: doctorProfileInput.qualification.trim(),
                    councilRegistrationNumber,
                    councilName,
                    image: userPayload.avatar || '',
                    contactEmail: normalizedEmail,
                    address: '',
                    workingHours: [],
                    education: [],
                    biography: [],
                    specializations: [],
                    rating: 0,
                    reviews: 0,
                };

                if (registrationMode === 'join-clinic') {
                    const requestedClinicAccessCode = doctorProfileInput.requestedClinicAccessCode?.trim().toUpperCase();

                    if (!requestedClinicAccessCode) {
                        throw new Error('Clinic access code is required to join an existing clinic');
                    }

                    const clinic = await Clinic.findOne({ accessCode: requestedClinicAccessCode }).select('+accessCode');
                    if (!clinic) {
                        throw new Error('Clinic access code is invalid');
                    }

                    userPayload.doctorProfile.primaryClinic = clinic._id;
                    userPayload.doctorProfile.requestedClinicAccessCode = clinic.accessCode;
                    userPayload.doctorProfile.clinicRole = 'member';
                    userPayload.doctorProfile.clinicMembershipStatus = 'pending';
                } else if (registrationMode === 'create-clinic') {
                    createdClinic = await createOwnedClinic(userData.clinic);
                    userPayload.doctorProfile.primaryClinic = createdClinic._id;
                    userPayload.doctorProfile.requestedClinicAccessCode = createdClinic.accessCode;
                    userPayload.doctorProfile.clinicRole = 'owner';
                    // No second party's permission needed to join a clinic you own.
                    userPayload.doctorProfile.clinicMembershipStatus = 'approved';
                } else if (registrationMode === 'solo') {
                    validatePracticeAddress(doctorProfileInput.practiceAddress);
                    userPayload.doctorProfile.practiceAddress = sanitizePracticeAddress(doctorProfileInput.practiceAddress);
                } else {
                    throw new Error('Invalid registration mode');
                }
            }

            if (role === 'clinic-owner') {
                createdClinic = await createOwnedClinic(userData.clinic);
                userPayload.ownerProfile = { approvalStatus: 'pending', approvalNotes: '' };
            }

            const newUser = new User(userPayload);
            await newUser.save();
            newUser.password = undefined;

            if (role === 'doctor') {
                await NotificationService.safeCreateForAdmins({
                    type: 'doctor.application',
                    title: 'Doctor application submitted',
                    message: `${newUser.name || newUser.username || 'A doctor'} submitted a doctor application.`,
                    entityType: 'doctor',
                    entityId: newUser._id,
                    metadata: {
                        approvalStatus: newUser.doctorProfile?.approvalStatus,
                        registrationMode: newUser.doctorProfile?.registrationMode,
                    },
                });

                if (newUser.doctorProfile?.registrationMode === 'join-clinic' && createdClinic === null) {
                    const clinic = await Clinic.findById(newUser.doctorProfile.primaryClinic).select('owner name');
                    if (clinic?.owner) {
                        await NotificationService.safeCreate({
                            recipient: clinic.owner,
                            recipientRole: 'clinic-owner',
                            type: 'clinic.join-request',
                            title: 'New doctor wants to join your clinic',
                            message: `${newUser.name || newUser.username} requested to join ${clinic.name}.`,
                            entityType: 'doctor',
                            entityId: newUser._id,
                            metadata: { clinicId: clinic._id },
                        });
                    }
                }
            }

            if (role === 'clinic-owner') {
                await NotificationService.safeCreateForAdmins({
                    type: 'owner.application',
                    title: 'Clinic owner application submitted',
                    message: `${newUser.name || newUser.username || 'A clinic owner'} submitted a facility application.`,
                    entityType: 'clinic-owner',
                    entityId: newUser._id,
                    metadata: {
                        approvalStatus: newUser.ownerProfile?.approvalStatus,
                    },
                });
            }

            return newUser;
        } catch (error) {
            if (createdClinic?._id) {
                await Clinic.findByIdAndDelete(createdClinic._id).catch(() => null);
            }

            throw new Error(`Registration failed: ${error.message}`);
        }
    }

    static async loginUser(email, password) {
        try {
            const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

            if (!user) {
                throw new Error('Invalid credentials');
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new Error('Invalid credentials');
            }

            // Pending/rejected doctors and clinic-owners are allowed to log in so
            // they can see their own application status and finish setting up
            // their profile/clinic. The actual gate on doctor-only actions
            // (appointments, blogs, lab bookings, messages) lives in
            // doctorMiddleware, which re-reads approvalStatus from the DB on
            // every request — never from this token.
            const token = jwt.sign(
                { id: user._id, role: user.role },
                config.JWT_SECRET,
                { expiresIn: config.JWT_EXPIRES_IN }
            );

            user.password = undefined;
            return { user, token };
        } catch (error) {
            throw new Error(`Login failed: ${error.message}`);
        }
    }

    static async requestPasswordReset(email, originUrl = config.CLIENT_URL) {
        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail }).select('+passwordResetToken +passwordResetExpiresAt');
        const genericMessage = 'If an account with that email exists, a password reset link has been generated.';

        if (!user) {
            return { message: genericMessage };
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

        user.passwordResetToken = hashedToken;
        user.passwordResetExpiresAt = expiresAt;
        await user.save();

        return {
            message: genericMessage,
            resetUrl: `${originUrl || config.CLIENT_URL}/reset-password/${user.role === 'doctor' ? 'doctor' : 'user'}/${resetToken}`,
            expiresAt,
        };
    }

    static async resetPassword(resetToken, password, confirmPassword) {
        if (!password || password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }

        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpiresAt: { $gt: new Date() },
        }).select('+password +passwordResetToken +passwordResetExpiresAt');

        if (!user) {
            throw new Error('Reset link is invalid or has expired');
        }

        user.password = await bcrypt.hash(password, 10);
        user.passwordResetToken = undefined;
        user.passwordResetExpiresAt = undefined;
        await user.save();

        return { message: 'Password reset successfully' };
    }

    static async getCurrentUser(userId) {
        try {
            const user = await User.findById(userId).select('-password');
            if (!user) {
                throw new Error('User not found');
            }

            return user;
        } catch (error) {
            throw new Error(`Failed to get current user: ${error.message}`);
        }
    }

    static async getUserById(userId) {
        try {
            const user = await User.findById(userId).select('-password');
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error(`Failed to get user: ${error.message}`);
        }
    }

    static async updateUser(userId, updateData) {
        try {
            const user = await User.findById(userId).select('+password');
            if (!user) {
                throw new Error('User not found');
            }

            if (updateData.password) {
                user.password = await bcrypt.hash(updateData.password, 10);
            }

            if (updateData.email) {
                user.email = updateData.email.toLowerCase().trim();
            }

            if (updateData.phone) {
                user.phone = updateData.phone.trim();
            }

            if (updateData.username) {
                user.username = updateData.username.trim();
            }

            if (updateData.name) {
                user.name = updateData.name.trim();
            }

            if (updateData.avatar) {
                user.avatar = updateData.avatar.trim();
            }

            if (updateData.bio !== undefined) {
                user.bio = updateData.bio.trim();
            }

            if (updateData.dateOfBirth !== undefined) {
                user.dateOfBirth = normalizeDate(updateData.dateOfBirth, user.dateOfBirth);
            }

            if (updateData.gender !== undefined) {
                user.gender = updateData.gender;
            }

            if (updateData.bloodGroup !== undefined) {
                user.bloodGroup = updateData.bloodGroup.trim().toUpperCase();
            }

            if (updateData.address) {
                user.address = sanitizeAddress(updateData.address, user.address?.toObject?.() || user.address || {});
            }

            if (updateData.emergencyContact) {
                user.emergencyContact = sanitizeEmergencyContact(
                    updateData.emergencyContact,
                    user.emergencyContact?.toObject?.() || user.emergencyContact || {}
                );
            }

            if (updateData.doctorProfile && user.role === 'doctor') {
                // Whitelist: approvalStatus, clinicMembershipStatus, primaryClinic, etc. are
                // admin/owner-controlled and must never be settable from a client profile update.
                const input = updateData.doctorProfile;
                const current = user.doctorProfile?.toObject?.() || user.doctorProfile || {};

                user.doctorProfile = {
                    ...current,
                    specialty: input.specialty?.trim() ?? current.specialty,
                    qualification: input.qualification?.trim() ?? current.qualification,
                    image: input.image?.trim() ?? current.image,
                    cloudinary_id: input.cloudinary_id?.trim() ?? current.cloudinary_id,
                    contactEmail: input.contactEmail?.toLowerCase().trim() ?? current.contactEmail,
                    address: input.address?.trim() ?? current.address,
                    workingHours: input.workingHours
                        ? sanitizeWorkingHours(input.workingHours)
                        : current.workingHours,
                    education: input.education
                        ? normalizeStringArray(input.education)
                        : current.education,
                    biography: input.biography
                        ? normalizeStringArray(input.biography)
                        : current.biography,
                    specializations: input.specializations
                        ? normalizeStringArray(input.specializations)
                        : current.specializations,
                    practiceAddress: input.practiceAddress
                        ? sanitizePracticeAddress(input.practiceAddress)
                        : current.practiceAddress,
                    operatingHours: input.operatingHours
                        ? {
                            weekdays: {
                                open: input.operatingHours.weekdays?.open?.trim() || current.operatingHours?.weekdays?.open,
                                close: input.operatingHours.weekdays?.close?.trim() || current.operatingHours?.weekdays?.close,
                            },
                            weekends: {
                                open: input.operatingHours.weekends?.open?.trim() || '',
                                close: input.operatingHours.weekends?.close?.trim() || '',
                            },
                        }
                        : current.operatingHours,
                    consultationSettings: input.consultationSettings
                        ? {
                            slotDuration: Number(input.consultationSettings.slotDuration) || current.consultationSettings?.slotDuration || 30,
                            maxDailyAppointments: Number(input.consultationSettings.maxDailyAppointments) || current.consultationSettings?.maxDailyAppointments || 20,
                        }
                        : current.consultationSettings,
                };
            }

            await user.save();
            user.password = undefined;
            return user;
        } catch (error) {
            throw new Error(`Update failed: ${error.message}`);
        }
    }

    static async deleteUser(userId) {
        try {
            const deletedUser = await User.findByIdAndDelete(userId);
            if (!deletedUser) {
                throw new Error('User not found');
            }
            return { message: 'User deleted successfully' };
        } catch (error) {
            throw new Error(`Deletion failed: ${error.message}`);
        }
    }

    static async getAllUsers(filters = {}) {
        try {
            const query = {};

            if (filters.role) {
                query.role = filters.role;
            }

            return await User.find(query).select('-password');
        } catch (error) {
            throw new Error(`Failed to get all users: ${error.message}`);
        }
    }
}

module.exports = UserService;
