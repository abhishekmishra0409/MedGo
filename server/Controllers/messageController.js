const MessageService = require('../Services/messageService');

exports.sendMessage = async (req, res) => {
    try {
        const message = await MessageService.sendMessage({
            senderId: req.user.id,
            recipientId: req.body.recipientId,
            content: req.body.content,
            attachments: req.body.attachments,
            appointmentId: req.body.appointmentId
        });

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (error) {
        res.status(error.statusCode || 400).json({
            success: false,
            error: error.message
        });
    }
};

exports.getConversations = async (req, res) => {
    try {
        const conversations = await MessageService.getUserConversations(
            req.user.id,
            req.user.role // 'doctor' or 'user'
        );

        res.json({
            success: true,
            data: conversations
        });
    } catch (error) {
        res.status(error.statusCode || 400).json({
            success: false,
            error: error.message
        });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const result = await MessageService.getConversationMessages(
            req.user.id,
            req.params.conversationId,
            Number(req.query.page),
            Number(req.query.limit)
        );

        res.json({
            success: true,
            data: result.messages,
            pagination: result.pagination
        });
    } catch (error) {
        res.status(error.statusCode || 400).json({
            success: false,
            error: error.message
        });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        await MessageService.markAsRead(
            req.user.id,
            req.params.conversationId
        );

        res.json({
            success: true,
            message: 'Messages marked as read'
        });
    } catch (error) {
        res.status(error.statusCode || 400).json({
            success: false,
            error: error.message
        });
    }
};
