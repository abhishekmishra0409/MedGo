const mongoose = require('mongoose');

const labTestBookingSchema = new mongoose.Schema({
    // User and Clinic References
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    clinic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clinic',
        required: true
    },

    // Test Information (embedded from Test catalog)
    test: {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        code: { type: String, required: true },
        price: { type: Number, required: true }
    },

    // Appointment Details
    bookingDate: {
        type: Date,
        required: true
    },
    timeSlot: {
        start: { type: String, required: true }, // e.g. "09:00"
        end: { type: String, required: true }    // e.g. "09:30"
    },

    // Status Tracking
    status: {
        type: String,
        enum: ['booked', 'sample-collected', 'processing', 'completed', 'cancelled'],
        default: 'booked'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },

    // Results
    results: mongoose.Schema.Types.Mixed,
    reportFile: String, // URL to PDF report
    completedAt: Date,

    // Additional Info
    notes: {
        patientNotes: String,
        staffNotes: String
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

// Indexes
labTestBookingSchema.index({ patient: 1, status: 1 });
labTestBookingSchema.index({ clinic: 1, bookingDate: 1 });

// Pre-save hook to validate time slots
labTestBookingSchema.pre('save', function(next) {
    if (this.isModified('status') && this.status === 'completed') {
        this.completedAt = new Date();
    }
    next();
});

module.exports = mongoose.model('LabTestBooking', labTestBookingSchema);