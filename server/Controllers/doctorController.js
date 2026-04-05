const doctorService = require('../Services/doctorServices');

// CRUD Controllers
exports.createDoctor = async (req, res) => {
    try {
        const doctor = await doctorService.createDoctor(req.body);

        res.status(201).json({
            success: true,
            data: doctor
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await doctorService.getAllDoctors({
            search: req.query.search,
            specialty: req.query.specialty || req.query.speciality
        });

        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.getAllDoctorsAdmin = async (req, res) => {
    try {
        const doctors = await doctorService.getAllDoctorsAdmin({
            search: req.query.search,
            specialty: req.query.specialty || req.query.speciality,
            approvalStatus: req.query.approvalStatus || 'all',
        });

        res.status(200).json({
            success: true,
            count: doctors.length,
            data: doctors,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getDoctorById = async (req, res) => {
    try {
        const doctor = await doctorService.getDoctorById(req.params.id);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                error: 'Doctor not found'
            });
        }

        res.status(200).json({
            success: true,
            data: doctor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

exports.updateDoctor = async (req, res) => {
    try {
        const doctor = await doctorService.updateDoctor(req.params.id, req.body);

        if (!doctor) {
            return res.status(404).json({
                success: false,
                error: 'Doctor not found'
            });
        }

        res.status(200).json({
            success: true,
            data: doctor
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.updateDoctorApproval = async (req, res) => {
    try {
        const doctor = await doctorService.updateDoctorApproval(
            req.params.id,
            req.body.approvalStatus,
            req.body.approvalNotes
        );

        res.status(200).json({
            success: true,
            data: doctor
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

exports.deleteDoctor = async (req, res) => {
    try {
        const result = await doctorService.deleteDoctor(req.params.id);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};
