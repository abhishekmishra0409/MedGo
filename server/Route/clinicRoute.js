const express = require('express');
const router = express.Router();
const ClinicController = require('../Controllers/clinicController');
const authMiddleware = require('../Middlewares/authMiddleware');
const adminMiddleware = require('../Middlewares/adminMiddleware');

// ─── Public Routes ──────────────────────────────────────────────────────────────
router.get('/', ClinicController.getClinics);
router.get('/:id', ClinicController.getClinic);
router.get('/:clinicId/slots', ClinicController.getAvailableSlots);
router.get('/doctor/:doctorId', ClinicController.getClinicByDoctor);
router.get('/all-by-doctor/:doctorId', ClinicController.getClinicsByDoctor);

// ─── Protected Admin Routes ─────────────────────────────────────────────────────
router.use(authMiddleware);
router.use(adminMiddleware);

router.post('/', ClinicController.createClinic);
router.put('/:id', ClinicController.updateClinic);
router.post('/:clinicId/doctors', ClinicController.addDoctor);
router.delete('/:clinicId/doctors', ClinicController.removeDoctor);

module.exports = router;
