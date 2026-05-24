const NotificationService = require('../Services/notificationService');

exports.getNotifications = async (req, res) => {
    try {
        const result = await NotificationService.listForRecipient(req.user, {
            page: req.query.page,
            limit: req.query.limit,
            unreadOnly: req.query.unreadOnly,
        });

        res.status(200).json({
            success: true,
            data: result.items,
            unreadCount: result.unreadCount,
            pagination: result.pagination,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

exports.markNotificationRead = async (req, res) => {
    try {
        const notification = await NotificationService.markRead(req.user, req.params.id);

        res.status(200).json({
            success: true,
            data: notification,
            message: 'Notification marked as read',
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message,
        });
    }
};

exports.markAllNotificationsRead = async (req, res) => {
    try {
        const result = await NotificationService.markAllRead(req.user);

        res.status(200).json({
            success: true,
            data: result,
            message: 'Notifications marked as read',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};
