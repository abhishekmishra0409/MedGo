const express = require('express');
const router = express.Router();
const appointmentController = require('../Controllers/appointmentController');
const authMiddleware = require('../Middlewares/authMiddleware');
const doctorMiddleware = require('../Middlewares/doctorMiddleware');

// Patient routes
router.post('/', authMiddleware, appointmentController.bookAppointment);
router.get('/my-appointments', authMiddleware, appointmentController.getMyAppointments);

// Doctor routes
router.get('/doctor-appointments', doctorMiddleware, appointmentController.getDoctorAppointments);
router.patch('/:id/status', doctorMiddleware, appointmentController.updateAppointmentStatus);
// authMiddleware, not doctorMiddleware: both parties can cancel, and the
// service's assertParticipant() already refuses anyone not on the appointment.
router.patch('/:id/cancel', authMiddleware, appointmentController.cancelAppointment);
router.patch('/:id/complete', doctorMiddleware, appointmentController.completeAppointment);

// Teleconsultation — authMiddleware, not doctorMiddleware: both parties use
// this one endpoint and the service decides which link you get back.
router.post('/:id/teleconsultation/join', authMiddleware, appointmentController.joinTeleconsultation);

// One call returns the day's taken slots, replacing the old one-POST-per-slot
// storm the booking form used to render its grid.
router.get('/booked', authMiddleware, appointmentController.getBookedSlots);

// authMiddleware added: this used to be public, which let anyone enumerate any
// approved doctor's booked calendar.
router.post('/check-availability', authMiddleware, appointmentController.checkAvailability);

module.exports = router;