const express = require('express');
const UserController = require('../Controllers/userController');
const authMiddleware = require('../Middlewares/authMiddleware');
const adminMiddleware = require('../Middlewares/adminMiddleware');

const userRouter = express.Router();

// Public routes (no authentication required)
userRouter.post('/register', UserController.register);
userRouter.post('/login', UserController.login);

// Protected routes (require authentication)
userRouter.use(authMiddleware);

userRouter.get('/me', UserController.getMe);
userRouter.put('/profile', UserController.updateUser);
userRouter.delete('/account', UserController.deleteUser);

// Admin-only routes (require admin role)
userRouter.use(adminMiddleware);

userRouter.get('/', UserController.getAllUsers);
userRouter.get('/:id', UserController.getUser);

module.exports = userRouter;