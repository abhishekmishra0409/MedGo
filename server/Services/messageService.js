const Conversation = require('../Models/Conversation');
const Message = require('../Models/Message');
const User = require('../Models/UserModel');
const { getWSSInstance } = require('../config/websocket');
const { buildDoctorAccount } = require('../Utils/doctorAccount');
const NotificationService = require('./notificationService');

class MessageService {
    static async getOrCreateConversation(doctorId, patientId) {
        // Verify both users exist and have correct roles
        const [doctor, patient] = await Promise.all([
            User.findOne({ _id: doctorId, role: 'doctor' }),
            User.findById(patientId)
        ]);

        if (!doctor || !patient || patient.role !== 'user') {
            const err = new Error('Doctor or patient not found');
            err.statusCode = 404;
            throw err;
        }

        const conversation = await Conversation.findOneAndUpdate(
            { doctor: doctorId, patient: patientId },
            { $setOnInsert: { doctor: doctorId, patient: patientId } },
            { new: true, upsert: true }
        );

        return conversation;
    }

    static async sendMessage({ senderId, recipientId, content, attachments, appointmentId }) {
        // Determine sender and recipient types
        const sender = await User.findById(senderId);
        const recipient = await User.findById(recipientId);

        if (!sender || !recipient) {
            const err = new Error('Participants not found');
            err.statusCode = 404;
            throw err;
        }

        // Ensure conversation is between doctor and patient
        if (sender.role === recipient.role) {
            throw new Error('Messages only allowed between doctors and patients');
        }

        const doctorId = sender.role === 'doctor' ? senderId : recipientId;
        const patientId = sender.role === 'user' ? senderId : recipientId;

        const conversation = await this.getOrCreateConversation(doctorId, patientId);

        const message = new Message({
            conversation: conversation._id,
            sender: senderId,
            senderModel: 'User',
            recipient: recipientId,
            recipientModel: 'User',
            content,
            attachments,
            metadata: { appointment: appointmentId },
            senderRole: sender.role,
            recipientRole: recipient.role,
        });

        // Update conversation
        conversation.lastMessage = message._id;
        if (recipientId.toString() !== senderId.toString()) {
            if (recipient.role === 'doctor') {
                conversation.unreadCountForDoctor += 1;
            } else {
                conversation.unreadCountForPatient += 1;
            }
        }

        await Promise.all([message.save(), conversation.save()]);

        await NotificationService.safeCreate({
            recipient: recipientId,
            recipientRole: recipient.role,
            type: 'message.received',
            title: 'New message',
            message: `${sender.name || sender.username || 'A contact'} sent you a message.`,
            entityType: 'message',
            entityId: message._id,
            metadata: {
                conversationId: conversation._id,
                senderId,
                senderRole: sender.role,
            },
        });

        // WebSocket notifications — must never fail a send that already persisted.
        try {
            getWSSInstance().notifyUser(String(recipientId), 'NEW_MESSAGE', message);
            getWSSInstance().updateConversationLists([
                { id: senderId, role: sender.role },
                { id: recipientId, role: recipient.role },
            ]);
        } catch (wsError) {
            console.error('WS notify failed after message persisted:', wsError);
        }

        return message;
    }

    static async getConversationMessages(userId, conversationId, page = 1, limit = 20) {
        const safePage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
        const safeLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 100) : 20;

        const conversation = await Conversation.findOne({
            _id: conversationId,
            $or: [{ doctor: userId }, { patient: userId }]
        });

        if (!conversation) {
            const err = new Error('Conversation not found or access denied');
            err.statusCode = 404;
            throw err;
        }

        // Page 1 must be the MOST RECENT messages — ascending skip/limit meant
        // page 1 was the oldest 20 and a long conversation never showed today.
        // Fetch newest-first for paging, then flip back to reading order.
        const skip = (safePage - 1) * safeLimit;
        const total = await Message.countDocuments({ conversation: conversationId });
        const messages = (await Message.find({ conversation: conversationId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(safeLimit)
            .lean()).reverse();

        const participantIds = [
            ...new Set(
                messages
                    .flatMap((message) => [message.sender, message.recipient])
                    .filter(Boolean)
                    .map((id) => String(id))
            ),
        ];

        const participants = await User.find({ _id: { $in: participantIds } })
            .select('_id username name email role')
            .lean();
        const participantById = new Map(participants.map((participant) => [String(participant._id), participant]));

        return {
            messages: messages.map((message) => ({
                ...message,
                sender: participantById.get(String(message.sender)) || null,
                recipient: participantById.get(String(message.recipient)) || null,
            })),
            pagination: {
                total,
                page: safePage,
                limit: safeLimit,
                hasMore: skip + messages.length < total,
            },
        };
    }

    static async getUserConversations(userId, userType) {
        const query = userType === 'doctor'
            ? { doctor: userId }
            : { patient: userId };

        const conversations = await Conversation.find(query)
            .populate({
                path: 'doctor',
                select: '_id name username email phone avatar role doctorProfile'
            })
            .populate({
                path: 'patient',
                select: '_id username name email role'
            })
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        return conversations.map((conversation) => {
            const item = conversation.toObject();
            item.doctor = item.doctor ? buildDoctorAccount(item.doctor) : null;
            item.isAvailable = Boolean(item.doctor && item.patient);
            item.unreadCount = userType === 'doctor' ? item.unreadCountForDoctor : item.unreadCountForPatient;
            return item;
        });
    }

    static async markAsRead(userId, conversationId) {
        const conversation = await Conversation.findOne({
            _id: conversationId,
            $or: [{ doctor: userId }, { patient: userId }]
        });

        if (!conversation) {
            const err = new Error('Conversation not found or access denied');
            err.statusCode = 404;
            throw err;
        }

        const isDoctor = conversation.doctor.equals(userId);
        const unreadField = isDoctor ? 'unreadCountForDoctor' : 'unreadCountForPatient';
        const otherUserId = isDoctor ? conversation.patient : conversation.doctor;

        await Promise.all([
            Message.updateMany(
                {
                    conversation: conversationId,
                    recipient: userId,
                    isRead: false
                },
                { $set: { isRead: true } }
            ),
            Conversation.updateOne(
                { _id: conversationId },
                { $set: { [unreadField]: 0 } }
            )
        ]);

        try {
            getWSSInstance().notifyUser(String(otherUserId), 'MESSAGES_READ', {
                conversationId,
                readerId: userId
            });
        } catch (wsError) {
            console.error('WS notify failed after mark-as-read persisted:', wsError);
        }
    }
}

module.exports = MessageService;
