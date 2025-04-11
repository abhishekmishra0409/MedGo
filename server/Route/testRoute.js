const express = require('express');
const router = express.Router();
const testController = require('../Controllers/testController');
const authMiddleware = require('../Middlewares/authMiddleware');
const adminMiddleware = require('../Middlewares/adminMiddleware');

// Public routes
router.get('/', testController.getAllTests);

// Admin-protected routes

router.use(authMiddleware);
router.use(adminMiddleware);


router.post('/', testController.createTest);
router.put('/:id', testController.updateTest);
router.delete('/:id', testController.deactivateTest);

module.exports = router;