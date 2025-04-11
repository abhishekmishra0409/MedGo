const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const MessageService = require('../Services/messageService');
const Conversation = require('../Models/Conversation'); // You missed this in your WebSocket file

class WSServer {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.clients = new Map();

        this.setupConnectionHandling();
    }

    setupConnectionHandling() {
        this.wss.on('connection', (ws, req) => {
            const token = req.url.split('token=')[1];
            let userId;

            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
                this.clients.set(userId, ws);
            } catch (error) {
                ws.close(1008, 'Invalid token');
                return;
            }

            ws.on('message', (data) => this.handleIncomingMessage(data, userId));
            ws.on('close', () => this.clients.delete(userId));
        });
    }

    async handleIncomingMessage(data, senderId) {
        try {
            const { action, payload } = JSON.parse(data);

            switch (action) {
                case 'SEND_MESSAGE':
                    await this.handleSendMessage(senderId, payload);
                    break;
                case 'TYPING_STATUS':
                    this.handleTypingStatus(senderId, payload);
                    break;
                case 'MARK_AS_READ':
                    await this.handleMarkAsRead(senderId, payload.conversationId);
                    break;
            }
        } catch (error) {
            console.error('WebSocket error:', error);
        }
    }

    async handleSendMessage(senderId, { recipientId, content, attachments, appointmentId }) {
        const message = await MessageService.sendMessage({
            senderId,
            recipientId,
            content,
            attachments,
            appointmentId
        });

        this.notifyUser(recipientId, 'NEW_MESSAGE', message);
        this.updateConversationLists([senderId, recipientId]);
    }

    async handleMarkAsRead(userId, conversationId) {
        await MessageService.markAsRead(userId, conversationId);

        const conversation = await Conversation.findById(conversationId);
        const otherUserId = conversation.doctor.equals(userId)
            ? conversation.patient
            : conversation.doctor;

        this.notifyUser(otherUserId, 'MESSAGES_READ', {
            conversationId,
            readerId: userId
        });
    }

    handleTypingStatus(senderId, { conversationId, isTyping }) {
        Conversation.findById(conversationId).then((conversation) => {
            const recipientId = conversation.doctor.equals(senderId)
                ? conversation.patient
                : conversation.doctor;

            this.notifyUser(recipientId, 'TYPING_INDICATOR', {
                conversationId,
                isTyping
            });
        });
    }

    async updateConversationLists(userIds) {
        for (const userId of userIds) {
            if (this.clients.has(userId)) {
                const userType = userId.startsWith('doc_') ? 'doctor' : 'user';
                const conversations = await MessageService.getUserConversations(userId, userType);

                this.notifyUser(userId, 'UPDATE_CONVERSATIONS', conversations);
            }
        }
    }

    notifyUser(userId, event, data) {
        if (this.clients.has(userId)) {
            this.clients.get(userId).send(JSON.stringify({ event, data }));
        }
    }
}

// Export the instance separately so it can be used in MessageService
let wssInstance;

function initializeWSS(server) {
    wssInstance = new WSServer(server);
}

function getWSSInstance() {
    return wssInstance;
}

module.exports = {
    initializeWSS,
    getWSSInstance
};
