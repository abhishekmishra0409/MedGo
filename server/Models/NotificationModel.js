const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        recipientRole: {
            type: String,
            enum: ['user', 'doctor', 'admin'],
            required: true,
            index: true,
        },
        type: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        entityType: {
            type: String,
            trim: true,
            default: '',
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
        readAt: {
            type: Date,
            default: null,
            index: true,
        },
        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

notificationSchema.index({ recipient: 1, readAt: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
