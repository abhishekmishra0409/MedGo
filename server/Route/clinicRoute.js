const express = require('express');
const router = express.Router();
const ClinicController = require('../Controllers/clinicController');
const authMiddleware = require('../Middlewares/authMiddleware');
const adminMiddleware = require('../Middlewares/adminMiddleware');

// ─── Public Routes ──────────────────────────────────────────────────────────────
router.get('/', ClinicController.getClinics);
router.get('/doctor/:doctorId', ClinicController.getClinicByDoctor);
router.get('/all-by-doctor/:doctorId', ClinicController.getClinicsByDoctor);
router.get('/:clinicId/slots', ClinicController.getAvailableSlots);

// ─── Protected Admin Routes ─────────────────────────────────────────────────────
router.get('/admin/all', authMiddleware, adminMiddleware, ClinicController.getClinicsAdmin);
router.post('/', authMiddleware, adminMiddleware, ClinicController.createClinic);
router.put('/:id', authMiddleware, adminMiddleware, ClinicController.updateClinic);
router.post('/:clinicId/doctors', authMiddleware, adminMiddleware, ClinicController.addDoctor);
router.delete('/:clinicId/doctors', authMiddleware, adminMiddleware, ClinicController.removeDoctor);
router.get('/:id', ClinicController.getClinic);

module.exports = router;
