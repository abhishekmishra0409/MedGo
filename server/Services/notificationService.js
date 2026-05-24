const Notification = require('../Models/NotificationModel');
const User = require('../Models/UserModel');

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

const emitNotification = (notification) => {
    try {
        const { getWSSInstance } = require('../config/websocket');
        const wss = getWSSInstance();
        if (wss && notification?.recipient) {
            wss.notifyUser(String(notification.recipient), 'NOTIFICATION_CREATED', notification);
        }
    } catch {
        // Notifications should never block the source action.
    }
};

class NotificationService {
    static async create(payload) {
        if (!payload?.recipient || !payload?.recipientRole || !payload?.type || !payload?.title || !payload?.message) {
            throw new Error('Notification recipient, type, title, and message are required');
        }

        const notification = await Notification.create({
            recipient: payload.recipient,
            recipientRole: payload.recipientRole,
            type: payload.type,
            title: payload.title,
            message: payload.message,
            entityType: payload.entityType || '',
            entityId: payload.entityId || null,
            metadata: payload.metadata || {},
        });

        emitNotification(notification);
        return notification;
    }

    static async safeCreate(payload) {
        try {
            return await this.create(payload);
        } catch (error) {
            console.error('Notification create failed:', error.message);
            return null;
        }
    }

    static async createForAdmins(payload) {
        const admins = await User.find({ role: 'admin' }).select('_id role');
        const created = [];

        for (const admin of admins) {
            const notification = await this.create({
                ...payload,
                recipient: admin._id,
                recipientRole: 'admin',
            });
            created.push(notification);
        }

        return created;
    }

    static async safeCreateForAdmins(payload) {
        try {
            return await this.createForAdmins(payload);
        } catch (error) {
            console.error('Admin notification create failed:', error.message);
            return [];
        }
    }

    static async listForRecipient(user, options = {}) {
        const limit = Math.min(Number(options.limit) || DEFAULT_LIMIT, MAX_LIMIT);
        const page = Math.max(Number(options.page) || 1, 1);
        const query = {
            recipient: user._id,
            recipientRole: user.role,
        };

        if (options.unreadOnly === 'true' || options.unreadOnly === true) {
            query.readAt = null;
        }

        const [items, unreadCount, total] = await Promise.all([
            Notification.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Notification.countDocuments({
                recipient: user._id,
                recipientRole: user.role,
                readAt: null,
            }),
            Notification.countDocuments(query),
        ]);

        return {
            items,
            unreadCount,
            pagination: {
                total,
                currentPage: page,
                pages: Math.ceil(total / limit) || 1,
                limit,
            },
        };
    }

    static async markRead(user, notificationId) {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: notificationId,
                recipient: user._id,
                recipientRole: user.role,
            },
            { $set: { readAt: new Date() } },
            { new: true }
        );

        if (!notification) {
            throw new Error('Notification not found');
        }

        return notification;
    }

    static async markAllRead(user) {
        const result = await Notification.updateMany(
            {
                recipient: user._id,
                recipientRole: user.role,
                readAt: null,
            },
            { $set: { readAt: new Date() } }
        );

        return {
            modifiedCount: result.modifiedCount || 0,
        };
    }
}

module.exports = NotificationService;
