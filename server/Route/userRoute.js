const express = require('express');
const multer = require('multer');
const UserController = require('../Controllers/userController');
const authMiddleware = require('../Middlewares/authMiddleware');
const adminMiddleware = require('../Middlewares/adminMiddleware');

const userRouter = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, callback) => {
        if (file.mimetype?.startsWith('image/')) {
            callback(null, true);
            return;
        }

        callback(new Error('Only image files are allowed'));
    },
});

// Public routes (no authentication required)
userRouter.post('/register', UserController.register);
userRouter.post('/login', UserController.login);
userRouter.post('/upload-profile-image', upload.single('image'), UserController.uploadProfileImage);
userRouter.post('/forgot-password', UserController.forgotPassword);
userRouter.post('/reset-password/:token', UserController.resetPassword);
userRouter.get('/doctors', UserController.getAllDoctorsPublic);
userRouter.get('/doctors/:id', UserController.getDoctorByIdPublic);

// Protected routes (require authentication)
userRouter.use(authMiddleware);

userRouter.get('/me', UserController.getMe);
userRouter.put('/profile', UserController.updateUser);

// Admin-only routes (require admin role)
userRouter.use(adminMiddleware);

userRouter.get('/admin/doctors', UserController.getAllDoctorsAdmin);
userRouter.post('/admin/doctors', UserController.createDoctorAdmin);
userRouter.put('/admin/doctors/:id', UserController.updateDoctorAdmin);
userRouter.patch('/admin/doctors/:id/approval', UserController.updateDoctorApprovalAdmin);
userRouter.delete('/admin/doctors/:id', UserController.deleteDoctorAdmin);

userRouter.delete('/account', UserController.deleteUser);
userRouter.get('/', UserController.getAllUsers);
userRouter.get('/:id', UserController.getUser);

module.exports = userRouter;
