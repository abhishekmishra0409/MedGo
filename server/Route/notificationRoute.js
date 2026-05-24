const express = require('express');
const notificationController = require('../Controllers/notificationController');
const authMiddleware = require('../Middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllNotificationsRead);
router.patch('/:id/read', notificationController.markNotificationRead);

module.exports = router;
