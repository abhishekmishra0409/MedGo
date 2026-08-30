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
        // The availability check and the insert are not atomic, so a concurrent
        // booking can still trip the unique index. Translate it rather than
        // returning a raw "E11000 duplicate key error" to the patient.
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                error: 'That time slot was just booked. Please choose another.'
            });
        }

        res.status(error.status || 400).json({
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
        res.status(error.status || 400).json({
            success: false,
            error: error.message
        });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes, paymentStatus } = req.body;

        const appointment = await AppointmentService.updateAppointmentStatus(id, status, notes, paymentStatus, req.user);

        res.status(200).json({
            success: true,
            data: appointment
        });
    } catch (error) {
        res.status(error.status || 400).json({
            success: false,
            error: error.message
        });
    }
};

// Returns the slots already taken on one doctor/date, so the client can filter
// its generated grid with a single request instead of one per slot.
exports.getBookedSlots = async (req, res) => {
    try {
        const { doctor, date } = req.query;
        const slots = await AppointmentService.getBookedSlots(doctor, date);

        res.status(200).json({
            success: true,
            data: slots,
        });
    } catch (error) {
        res.status(error.status || 400).json({
            success: false,
            error: error.message,
        });
    }
};

exports.cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes } = req.body || {};
        const appointment = await AppointmentService.updateAppointmentStatus(id, 'cancelled', notes, null, req.user);

        res.status(200).json({
            success: true,
            data: appointment,
            message: 'Appointment cancelled successfully'
        });
    } catch (error) {
        res.status(error.status || 400).json({
            success: false,
            error: error.message
        });
    }
};

exports.completeAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes, paymentStatus } = req.body;
        const appointment = await AppointmentService.updateAppointmentStatus(id, 'completed', notes, paymentStatus, req.user);

        res.status(200).json({
            success: true,
            data: appointment,
            message: 'Appointment marked as completed'
        });
    } catch (error) {
        res.status(error.status || 400).json({
            success: false,
            error: error.message
        });
    }
};

exports.joinTeleconsultation = async (req, res) => {
    try {
        const join = await AppointmentService.getTeleconsultationJoin(req.params.id, req.user);

        res.status(200).json({
            success: true,
            data: join
        });
    } catch (error) {
        res.status(error.status || 400).json({
            success: false,
            error: error.message
        });
    }
};
