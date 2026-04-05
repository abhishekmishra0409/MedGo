const mongoose = require('mongoose');
const User = require('../Models/UserModel');
const Clinic = require('../Models/ClinicModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/config');

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
        !clinic.contact?.email ||
        !clinic.operatingHours?.weekdays?.open ||
        !clinic.operatingHours?.weekdays?.close
    ) {
        throw new Error('Clinic information is incomplete');
    }
};

class UserService {
    static async registerUser(userData) {
        let createdClinic = null;

        try {
            const normalizedEmail = userData.email?.toLowerCase().trim();
            const normalizedPhone = userData.phone?.trim();
            const role = userData.role === 'doctor' ? 'doctor' : 'user';

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

            if (role === 'doctor') {
                const doctorProfileInput = userData.doctorProfile || {};
                const registrationMode =
                    doctorProfileInput.registrationMode || userData.registrationMode || 'join-clinic';

                if (!doctorProfileInput.specialty?.trim() || !doctorProfileInput.qualification?.trim()) {
                    throw new Error('Specialty and qualification are required for doctor registration');
                }

                userPayload.doctorProfile = {
                    approvalStatus: 'pending',
                    approvalNotes: '',
                    registrationMode,
                    clinicRole: registrationMode === 'create-clinic' ? 'owner' : 'member',
                    specialty: doctorProfileInput.specialty.trim(),
                    qualification: doctorProfileInput.qualification.trim(),
                    image: doctorProfileInput.image?.trim() || userPayload.avatar || '',
                    contactEmail: doctorProfileInput.contactEmail?.toLowerCase().trim() || normalizedEmail,
                    address: doctorProfileInput.address?.trim() || '',
                    workingHours: sanitizeWorkingHours(doctorProfileInput.workingHours),
                    education: normalizeStringArray(doctorProfileInput.education),
                    biography: normalizeStringArray(doctorProfileInput.biography),
                    specializations: normalizeStringArray(doctorProfileInput.specializations),
                    rating: Number(doctorProfileInput.rating) || 0,
                    reviews: Number(doctorProfileInput.reviews) || 0,
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
                }

                if (registrationMode === 'create-clinic') {
                    validateClinicPayload(userData.clinic);
                    createdClinic = await Clinic.create(buildClinicPayload(userData.clinic, userId, false));
                    userPayload.doctorProfile.primaryClinic = createdClinic._id;
                    userPayload.doctorProfile.requestedClinicAccessCode = createdClinic.accessCode;
                }
            }

            const newUser = new User(userPayload);
            await newUser.save();
            newUser.password = undefined;
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

            if (user.role === 'doctor' && user.doctorProfile?.approvalStatus !== 'approved') {
                throw new Error(
                    user.doctorProfile?.approvalStatus === 'rejected'
                        ? 'Doctor access has been rejected. Please contact admin.'
                        : 'Doctor account is pending admin approval.'
                );
            }

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

            if (updateData.doctorProfile) {
                user.doctorProfile = {
                    ...user.doctorProfile?.toObject?.(),
                    ...updateData.doctorProfile,
                    specialty: updateData.doctorProfile.specialty?.trim() ?? user.doctorProfile?.specialty,
                    qualification: updateData.doctorProfile.qualification?.trim() ?? user.doctorProfile?.qualification,
                    image: updateData.doctorProfile.image?.trim() ?? user.doctorProfile?.image,
                    contactEmail: updateData.doctorProfile.contactEmail?.toLowerCase().trim() ?? user.doctorProfile?.contactEmail,
                    address: updateData.doctorProfile.address?.trim() ?? user.doctorProfile?.address,
                    workingHours: updateData.doctorProfile.workingHours
                        ? sanitizeWorkingHours(updateData.doctorProfile.workingHours)
                        : user.doctorProfile?.workingHours,
                    education: updateData.doctorProfile.education
                        ? normalizeStringArray(updateData.doctorProfile.education)
                        : user.doctorProfile?.education,
                    biography: updateData.doctorProfile.biography
                        ? normalizeStringArray(updateData.doctorProfile.biography)
                        : user.doctorProfile?.biography,
                    specializations: updateData.doctorProfile.specializations
                        ? normalizeStringArray(updateData.doctorProfile.specializations)
                        : user.doctorProfile?.specializations,
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
