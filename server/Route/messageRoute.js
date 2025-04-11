const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const userAuth = require('../middlewares/authMiddleware');
const doctorAuth = require('../middlewares/doctorMiddleware');

// USER ROUTES
router.post('/user/send', userAuth, messageController.sendMessage); // Only authenticated users can send
router.get('/user/conversations', userAuth, messageController.getConversations); // Get user's conversations
router.get('/user/conversations/:conversationId/messages', userAuth, messageController.getMessages);
router.patch('/user/conversations/:conversationId/mark-read', userAuth, messageController.markAsRead);

// DOCTOR ROUTES
router.post('/doctor/send', doctorAuth, messageController.sendMessage); // Doctors can also send messages
router.get('/doctor/conversations', doctorAuth, messageController.getConversations);
router.get('/doctor/conversations/:conversationId/messages', doctorAuth, messageController.getMessages);
router.patch('/doctor/conversations/:conversationId/mark-read', doctorAuth, messageController.markAsRead);

module.exports = router;
