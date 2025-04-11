const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Patient ID is required']
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: [true, 'Doctor ID is required']
    },
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: function() {
            return this.type === 'in-person';
        }
    },
    date: {
        type: Date,
        required: [true, 'Appointment date is required'],
        validate: {
            validator: function(value) {
                return value > new Date();
            },
            message: 'Appointment date must be in the future'
        }
    },
    timeSlot: {
        start: {
            type: String,
            required: true,
            match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
        },
        end: {
            type: String,
            required: true,
            match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)']
        }
    },
    type: {
        type: String,
        enum: ['in-person', 'teleconsultation'],
        required: [true, 'Appointment type is required']
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
        default: 'pending'
    },
    reason: {
        type: String,
        required: [true, 'Appointment reason is required'],
        minlength: [10, 'Reason must be at least 10 characters']
    },
    notes: {
        patientNotes: String,
        doctorNotes: String
    },
    payment: {
        status: {
            type: String,
            enum: ['pending', 'paid', 'refunded', 'failed'],
            default: 'pending'
        },
        amount: {
            type: Number,
            required: function() {
                return this.type === 'teleconsultation';
            }
        },
        method: {
            type: String,
            enum: ['credit_card', 'debit_card', 'upi', 'netbanking', null],
            default: null
        }
    },
    cancellation: {
        reason: String,
        initiatedBy: {
            type: String,
            enum: ['patient', 'doctor', 'clinic']
        },
        timestamp: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for performance
appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ doctor: 1 });
appointmentSchema.index({ clinic: 1 });
appointmentSchema.index({ date: 1, status: 1 });

// Prevent double booking
appointmentSchema.index(
    { doctor: 1, date: 1, 'timeSlot.start': 1, 'timeSlot.end': 1 },
    { unique: true, partialFilterExpression: { status: { $ne: 'cancelled' } } }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;