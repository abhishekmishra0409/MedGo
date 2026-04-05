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
            enum: ['user', 'doctor', 'admin'],
            default: 'user', 
        },
        avatar: {
            type: String,
            trim: true,
        },
        legacyDoctorId: {
            type: String,
            trim: true,
        },
        doctorProfile: {
            approvalStatus: {
                type: String,
                enum: ['pending', 'approved', 'rejected'],
                default: 'approved',
            },
            approvalNotes: {
                type: String,
                trim: true,
            },
            registrationMode: {
                type: String,
                enum: ['join-clinic', 'create-clinic', null],
                default: null,
            },
            clinicRole: {
                type: String,
                enum: ['member', 'owner', null],
                default: null,
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
userSchema.index({ role: 1, 'doctorProfile.approvalStatus': 1, 'doctorProfile.primaryClinic': 1 });
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
