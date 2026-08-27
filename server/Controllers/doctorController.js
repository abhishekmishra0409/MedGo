const doctorService = require('../Services/doctorServices');

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
