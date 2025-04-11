const LabTestService = require('../Services/labTestService');

exports.bookTest = async (req, res) => {
    try {
        const booking = await LabTestService.bookLabTest({
            ...req.body,
            patientId: req.user.id
        });
        res.status(201).json({
            success: true,
            data: booking,
            message: 'Test booked successfully'
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await LabTestService.getPatientBookings(req.user.id);
        res.json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateBookingStatus = async (req, res) => {
    try {
        const booking = await LabTestService.updateBookingStatus(
            req.params.id,
            req.body.status
        );
        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

exports.getClinicBookings = async (req, res) => {
    try {
        const bookings = await LabTestService.getClinicBookings(
            req.params.clinicId,
            req.query.date
        );
        res.json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.uploadReport = async (req, res) => {
    try {
        const bookingId  = req.params.id;
        const file = req.file;

        // console.log(bookingId)
        const updatedBooking = await LabTestService.uploadReport(
            bookingId,
            file.path // or req.file.buffer for memory storage
        );

        res.json(updatedBooking);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};