const express = require('express');
const DoctorController = require('../Controllers/doctorController');
const authMiddleware = require('../Middlewares/authMiddleware');
const adminMiddleware = require('../Middlewares/adminMiddleware');

const doctorRouter = express.Router();

// Public routes
doctorRouter.get('/', DoctorController.getAllDoctors);

// Protected admin routes
doctorRouter.get('/admin/all', authMiddleware, adminMiddleware, DoctorController.getAllDoctorsAdmin);
doctorRouter.post('/register', authMiddleware, adminMiddleware, DoctorController.createDoctor);
doctorRouter.put('/:id', authMiddleware, adminMiddleware, DoctorController.updateDoctor);
doctorRouter.patch('/:id/approval', authMiddleware, adminMiddleware, DoctorController.updateDoctorApproval);
doctorRouter.delete('/:id', authMiddleware, adminMiddleware, DoctorController.deleteDoctor);
doctorRouter.get('/:id', DoctorController.getDoctorById);

module.exports = doctorRouter;
