const mongoose = require('mongoose');
const crypto = require('crypto');

const clinicSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Clinic name is required'],
        trim: true
    },
    address: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    contact: {
        phone: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return /^[0-9]{10,15}$/.test(v);
                },
                message: props => `${props.value} is not a valid phone number!`
            }
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format']
        }
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    doctors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    accessCode: {
        type: String,
        unique: true,
        uppercase: true,
        select: false,
        default: () => crypto.randomBytes(4).toString('hex').toUpperCase(),
    },
    facilities: [String],
    operatingHours: {
        weekdays: {
            open: { type: String, required: true },
            close: { type: String, required: true }
        },
        weekends: {
            open: String,
            close: String
        }
    },
    appointmentSettings: {
        slotDuration: {
            type: Number,
            default: 30,
            enum: [15, 30, 45, 60]
        },
        maxDailyAppointments: { type: Number, default: 20 }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

clinicSchema.index({ isActive: 1, name: 1, "address.city": 1, "address.state": 1 });
clinicSchema.index({
    name: "text",
    facilities: "text",
    "address.street": "text",
    "address.city": "text",
    "address.state": "text"
});

const Clinic = mongoose.model('Clinic', clinicSchema);

module.exports = Clinic;
