const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../Middlewares/authMiddleware');
const doctorMiddleware = require('../Middlewares/doctorMiddleware');

// Patient routes
router.post('/', authMiddleware, appointmentController.bookAppointment);
router.get('/my-appointments', authMiddleware, appointmentController.getMyAppointments);

// Doctor routes
router.get('/doctor-appointments', doctorMiddleware, appointmentController.getDoctorAppointments);
router.patch('/:id/status', doctorMiddleware, appointmentController.updateAppointmentStatus);
router.patch('/:id/cancel', doctorMiddleware, appointmentController.cancelAppointment);
router.patch('/:id/complete', doctorMiddleware, appointmentController.completeAppointment);

// Public route
router.post('/check-availability', appointmentController.checkAvailability);

module.exports = router;