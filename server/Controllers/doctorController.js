const doctorService = require('../Services/doctorServices');

// Authentication Controllers
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }

        const { doctor, token } = await doctorService.loginDoctor(email, password);

        res.status(200).json({
            success: true,
            data: {
                doctor,
                token
            }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
};


// CRUD Controllers
exports.createDoctor = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Doctor image is required'
            });
        }

        const doctor = await doctorService.createDoctor(req.body, req.file);

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
        const doctors = await doctorService.getAllDoctors();

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

exports.getDoctorById = async (req, res) => {
    try {
        // Handle the special 'me' case
        if (req.params.id === 'me') {
            return exports.getCurrentDoctor(req, res);
        }

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
        const doctor = await doctorService.updateDoctor(
            req.params.id,
            req.body,
            req.file
        );

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

exports.deleteDoctor = async (req, res) => {
    try {
        const result = await doctorService.deleteDoctor(req.params.id);

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};