const express = require('express');
const router = express.Router();
const labTestController = require('../controllers/labTestController');
const authMiddleware = require('../Middlewares/authMiddleware');
const doctorMiddleware = require('../Middlewares/doctorMiddleware');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Patient routes
router.post('/book', authMiddleware, labTestController.bookTest);
router.get('/my-bookings', authMiddleware, labTestController.getMyBookings);

// Clinic staff routes
router.patch('/:id/status', doctorMiddleware, labTestController.updateBookingStatus);
router.get('/clinic/:clinicId', doctorMiddleware, labTestController.getClinicBookings);

// Corrected PDF upload route (middleware order matters!)
router.post('/:id/report', doctorMiddleware, upload.single('report'), labTestController.uploadReport);

module.exports = router;