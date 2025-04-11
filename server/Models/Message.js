const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'senderModel'
    },
    senderModel: {
        type: String,
        required: true,
        enum: ['Doctor', 'User']
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'recipientModel'
    },
    recipientModel: {
        type: String,
        required: true,
        enum: ['Doctor', 'User']
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    isRead: {
        type: Boolean,
        default: false
    },
    attachments: [{
        url: String,
        type: {
            type: String,
            enum: ['image', 'pdf', 'prescription'],
            required: true
        },
        originalName: String
    }],
    metadata: {
        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Appointment'
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

// Indexes for optimized queries
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);