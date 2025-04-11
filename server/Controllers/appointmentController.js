const AppointmentService = require('../Services/appointmentServices');

exports.bookAppointment = async (req, res) => {
    try {
        const appointment = await AppointmentService.createAppointment({
            ...req.body,
            patient: req.user.id
        });

        res.status(201).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.getMyAppointments = async (req, res) => {
    try {
        const appointments = await AppointmentService.getPatientAppointments(req.user.id);
        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.getDoctorAppointments = async (req, res) => {
    try {
        const appointments = await AppointmentService.getDoctorAppointments(req.user.id);
        res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.checkAvailability = async (req, res) => {
    try {
        const { doctor, date, timeSlot } = req.body;
        const isAvailable = await AppointmentService.checkAvailability(doctor, date, timeSlot);

        res.status(200).json({
            success: true,
            available: isAvailable
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, paymentStatus } = req.body;

        const appointment = await AppointmentService.updateAppointmentStatus(id, status, notes, paymentStatus);

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await AppointmentService.updateAppointmentStatus(id, 'cancelled');

        res.status(200).json({
            success: true,
            data: appointment,
            message: 'Appointment cancelled successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.completeAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes, paymentStatus } = req.body;
        const appointment = await AppointmentService.updateAppointmentStatus(id, 'completed', notes, paymentStatus);

        res.status(200).json({
            success: true,
            data: appointment,
            message: 'Appointment marked as completed'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};
