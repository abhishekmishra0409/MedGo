const Conversation = require('../Models/Conversation');
const Message = require('../Models/Message');
const Doctor = require('../Models/DoctorModel');
const User = require('../Models/UserModel');
const { getWSSInstance } = require('../config/websocket');

class MessageService {
    static async getOrCreateConversation(doctorId, patientId) {
        // Verify both users exist and have correct roles
        const [doctor, patient] = await Promise.all([
            Doctor.findById(doctorId),
            User.findById(patientId)
        ]);

        if (!doctor || !patient) {
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
        const sender = await Doctor.findById(senderId) || await User.findById(senderId);
        const recipient = await Doctor.findById(recipientId) || await User.findById(recipientId);

        if (!sender || !recipient) {
            throw new Error('Participants not found');
        }

        // Ensure conversation is between doctor and patient
        if ((sender instanceof Doctor && recipient instanceof Doctor) ||
            (sender instanceof User && recipient instanceof User)) {
            throw new Error('Messages only allowed between doctors and patients');
        }

        const doctorId = sender instanceof Doctor ? senderId : recipientId;
        const patientId = sender instanceof User ? senderId : recipientId;

        const conversation = await this.getOrCreateConversation(doctorId, patientId);

        const message = new Message({
            conversation: conversation._id,
            sender: senderId,
            senderModel: sender instanceof Doctor ? 'Doctor' : 'User',
            recipient: recipientId,
            recipientModel: recipient instanceof Doctor ? 'Doctor' : 'User',
            content,
            attachments,
            metadata: { appointment: appointmentId }
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
            .populate('sender recipient');
    }

    static async getUserConversations(userId, userType) {
        const query = userType === 'doctor'
            ? { doctor: userId }
            : { patient: userId };

        return await Conversation.find(query)
            .populate({
                path: 'doctor',
                select: '_id name speciality'
            })
            .populate({
                path: 'patient',
                select: '_id username email'
            })
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

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