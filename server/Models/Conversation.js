const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    unreadCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'archived'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Ensure one conversation per doctor-patient pair
conversationSchema.index({ doctor: 1, patient: 1 }, { unique: true });

// Virtual for participants (combines doctor and patient)
conversationSchema.virtual('participants').get(function() {
    return [this.doctor, this.patient];
});

module.exports = mongoose.model('Conversation', conversationSchema);