const Conversation = require('../Models/Conversation');
const Message = require('../Models/Message');
const User = require('../Models/UserModel');
const { getWSSInstance } = require('../config/websocket');
const { buildDoctorAccount } = require('../Utils/doctorAccount');

class MessageService {
    static async getOrCreateConversation(doctorId, patientId) {
        // Verify both users exist and have correct roles
        const [doctor, patient] = await Promise.all([
            User.findOne({ _id: doctorId, role: 'doctor' }),
            User.findById(patientId)
        ]);

        if (!doctor || !patient || patient.role !== 'user') {
            throw new Error('Doctor or patient not found');
        }

        let conversation = await Conversation.findOne({
            doctor: doctorId,
            patient: patientId
        });

        if (!conversation) {
            conversation = new Conversation({
                doctor: doctorId,
                patient: patientId
            });
            await conversation.save();
        }

        return conversation;
    }

    static async sendMessage({ senderId, recipientId, content, attachments, appointmentId }) {
        // Determine sender and recipient types
        const sender = await User.findById(senderId);
        const recipient = await User.findById(recipientId);

        if (!sender || !recipient) {
            throw new Error('Participants not found');
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
            conversation.unreadCount += 1;
        }

        await Promise.all([message.save(), conversation.save()]);

        // WebSocket notifications
        getWSSInstance().notifyUser(recipientId, 'NEW_MESSAGE', message);
        getWSSInstance().updateConversationLists([senderId, recipientId]);

        return message;
    }

    static async getConversationMessages(userId, conversationId, page = 1, limit = 20) {
        const conversation = await Conversation.findOne({
            _id: conversationId,
            $or: [{ doctor: userId }, { patient: userId }]
        });

        if (!conversation) {
            throw new Error('Conversation not found or access denied');
        }

        return await Message.find({ conversation: conversationId })
            .sort({ createdAt: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('sender', 'username name email role')
            .populate('recipient', 'username name email role');
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
            return item;
        });
    }

    static async markAsRead(userId, conversationId) {
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
                { $set: { unreadCount: 0 } }
            )
        ]);

        // WebSocket notification
        const conversation = await Conversation.findById(conversationId);
        const otherUserId = conversation.doctor.equals(userId)
            ? conversation.patient
            : conversation.doctor;

        getWSSInstance().notifyUser(otherUserId, 'MESSAGES_READ', {
            conversationId,
            readerId: userId
        });
    }
}

module.exports = MessageService;
