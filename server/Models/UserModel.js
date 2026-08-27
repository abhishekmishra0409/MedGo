const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
        },
        username: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            select: false,
        },
        role: {
            type: String,
            enum: ['user', 'doctor', 'clinic-owner', 'admin'],
            default: 'user',
        },
        avatar: {
            type: String,
            trim: true,
        },
        bio: {
            type: String,
            trim: true,
        },
        dateOfBirth: {
            type: Date,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other', 'prefer-not-to-say', ''],
            default: '',
        },
        bloodGroup: {
            type: String,
            trim: true,
            uppercase: true,
        },
        address: {
            line1: {
                type: String,
                trim: true,
            },
            line2: {
                type: String,
                trim: true,
            },
            city: {
                type: String,
                trim: true,
            },
            state: {
                type: String,
                trim: true,
            },
            postalCode: {
                type: String,
                trim: true,
            },
            country: {
                type: String,
                trim: true,
            },
        },
        emergencyContact: {
            name: {
                type: String,
                trim: true,
            },
            relationship: {
                type: String,
                trim: true,
            },
            phone: {
                type: String,
                trim: true,
            },
        },
        legacyDoctorId: {
            type: String,
            trim: true,
        },
        doctorProfile: {
            approvalStatus: {
                type: String,
                enum: ['pending', 'approved', 'rejected'],
                default: 'pending',
            },
            approvalNotes: {
                type: String,
                trim: true,
            },
            registrationMode: {
                type: String,
                enum: ['join-clinic', 'create-clinic', 'solo', null],
                default: null,
            },
            clinicRole: {
                type: String,
                enum: ['member', 'owner', null],
                default: null,
            },
            // Independent of approvalStatus (platform verification). This is the
            // clinic owner's roster gate: 'none' means the doctor isn't attached
            // to any clinic (solo practice), so it never blocks listing.
            clinicMembershipStatus: {
                type: String,
                enum: ['none', 'pending', 'approved', 'rejected'],
                default: 'none',
            },
            clinicMembershipNotes: {
                type: String,
                trim: true,
            },
            primaryClinic: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Clinic',
            },
            requestedClinicAccessCode: {
                type: String,
                trim: true,
                uppercase: true,
            },
            specialty: {
                type: String,
                trim: true,
            },
            qualification: {
                type: String,
                trim: true,
            },
            // Not `required` at the schema level: legacy doctors predate this field
            // and full-document validation on save() would brick their profile edits.
            // Enforced only in UserService.registerUser for new registrations.
            councilRegistrationNumber: {
                type: String,
                trim: true,
                uppercase: true,
            },
            councilName: {
                type: String,
                trim: true,
            },
            image: {
                type: String,
                trim: true,
            },
            cloudinary_id: {
                type: String,
                trim: true,
            },
            contactEmail: {
                type: String,
                trim: true,
                lowercase: true,
            },
            address: {
                type: String,
                trim: true,
            },
            // Solo doctors only: lets them take in-person bookings without a clinic.
            practiceAddress: {
                street: { type: String, trim: true },
                city: { type: String, trim: true },
                state: { type: String, trim: true },
                postalCode: { type: String, trim: true },
                country: { type: String, trim: true, default: 'INDIA' },
            },
            operatingHours: {
                weekdays: {
                    open: { type: String, trim: true },
                    close: { type: String, trim: true },
                },
                weekends: {
                    open: { type: String, trim: true },
                    close: { type: String, trim: true },
                },
            },
            consultationSettings: {
                slotDuration: {
                    type: Number,
                    default: 30,
                    enum: [15, 30, 45, 60],
                },
                maxDailyAppointments: {
                    type: Number,
                    default: 20,
                },
            },
            workingHours: [
                {
                    days: {
                        type: String,
                        trim: true,
                    },
                    hours: {
                        type: String,
                        trim: true,
                    },
                },
            ],
            education: [String],
            biography: [String],
            specializations: [String],
            rating: {
                type: Number,
                default: 0,
                min: 0,
                max: 5,
            },
            reviews: {
                type: Number,
                default: 0,
            },
        },
        // Non-doctor facility owner (role: 'clinic-owner'). No `clinic` field here —
        // ClinicModel.owner already points back at this user, so the link is
        // Clinic.findOne({ owner: user._id }).
        ownerProfile: {
            approvalStatus: {
                type: String,
                enum: ['pending', 'approved', 'rejected'],
                default: 'pending',
            },
            approvalNotes: {
                type: String,
                trim: true,
            },
        },
        passwordResetToken: {
            type: String,
            select: false,
        },
        passwordResetExpiresAt: {
            type: Date,
            select: false,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.index({ role: 1, email: 1 });
userSchema.index({ legacyDoctorId: 1 }, { sparse: true });
userSchema.index({ role: 1, 'doctorProfile.specialty': 1, name: 1 });
// Matches the public-listing predicate in buildDoctorSearchQuery exactly.
userSchema.index({ role: 1, 'doctorProfile.approvalStatus': 1, 'doctorProfile.clinicMembershipStatus': 1 });
// Owner roster query: "pending members of my clinic".
userSchema.index({ 'doctorProfile.primaryClinic': 1, 'doctorProfile.clinicMembershipStatus': 1 });
// Compound because Indian medical registration numbers are only unique within
// the issuing state council, not globally.
userSchema.index(
    { 'doctorProfile.councilRegistrationNumber': 1, 'doctorProfile.councilName': 1 },
    { unique: true, sparse: true }
);
userSchema.index({ role: 1, 'ownerProfile.approvalStatus': 1 });
userSchema.index({
    username: 'text',
    name: 'text',
    'doctorProfile.specialty': 'text',
    'doctorProfile.qualification': 'text',
    'doctorProfile.address': 'text',
    'doctorProfile.specializations': 'text',
});

const User = mongoose.model('User', userSchema);

module.exports = User;
