const express = require('express');
const multer = require('multer');
const DoctorController = require('../Controllers/doctorController');
const authMiddleware = require('../Middlewares/authMiddleware');
const adminMiddleware = require('../Middlewares/adminMiddleware');

const doctorRouter = express.Router();
const upload = multer({ dest: 'uploads/' });

// Public routes
doctorRouter.get('/', DoctorController.getAllDoctors);
doctorRouter.get('/:id', DoctorController.getDoctorById);
doctorRouter.post('/login', DoctorController.login);

// Protected admin routes
doctorRouter.post('/register', authMiddleware, adminMiddleware, upload.single('image'), DoctorController.createDoctor);
doctorRouter.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), DoctorController.updateDoctor);
doctorRouter.delete('/:id', authMiddleware, adminMiddleware, DoctorController.deleteDoctor);

module.exports = doctorRouter;