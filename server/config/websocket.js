const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const config = require('./config');
const Conversation = require('../Models/Conversation'); // You missed this in your WebSocket file

// Required lazily (not at module load) inside the methods that use it —
// messageService.js requires this file too (to call notifyUser/updateConversationLists),
// so a top-level require here creates a circular import: whichever module loads
// second gets the other's still-empty module.exports at that point in time,
// and MessageService.getUserConversations ends up undefined at call time.
const getMessageService = () => require('../Services/messageService');

class WSServer {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.clients = new Map();

        this.setupConnectionHandling();
    }

    setupConnectionHandling() {
        this.wss.on('connection', (ws, req) => {
            const { searchParams } = new URL(req.url, 'http://localhost');
            const token = searchParams.get('token');
            let userId;

            try {
                const decoded = jwt.verify(token, config.JWT_SECRET);
                userId = String(decoded.id);
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
                    await this.handleTypingStatus(senderId, payload);
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
        const message = await getMessageService().sendMessage({
            senderId,
            recipientId,
            content,
            attachments,
            appointmentId
        });

        try {
            this.notifyUser(recipientId, 'NEW_MESSAGE', message);
            this.updateConversationLists([
                { id: senderId, role: message.senderRole },
                { id: recipientId, role: message.recipientRole },
            ]);
        } catch (wsError) {
            console.error('WS notify failed after message persisted:', wsError);
        }
    }

    async handleMarkAsRead(userId, conversationId) {
        await getMessageService().markAsRead(userId, conversationId);

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return;
        }
        const otherUserId = conversation.doctor.equals(userId)
            ? conversation.patient
            : conversation.doctor;

        this.notifyUser(String(otherUserId), 'MESSAGES_READ', {
            conversationId,
            readerId: userId
        });
    }

    async handleTypingStatus(senderId, { conversationId, isTyping }) {
        try {
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) return;

            const recipientId = conversation.doctor.equals(senderId)
                ? conversation.patient
                : conversation.doctor;

            this.notifyUser(String(recipientId), 'TYPING_INDICATOR', {
                conversationId,
                isTyping
            });
        } catch (error) {
            console.error('handleTypingStatus error:', error);
        }
    }

    async updateConversationLists(participants) {
        for (const { id, role } of participants) {
            const key = String(id);
            if (this.clients.has(key)) {
                const userType = role === 'doctor' ? 'doctor' : 'user';
                const conversations = await getMessageService().getUserConversations(key, userType);

                this.notifyUser(key, 'UPDATE_CONVERSATIONS', conversations);
            }
        }
    }

    notifyUser(userId, event, data) {
        const key = String(userId);
        if (this.clients.has(key)) {
            this.clients.get(key).send(JSON.stringify({ event, data }));
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
