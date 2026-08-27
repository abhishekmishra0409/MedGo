const ClinicService = require('../Services/clinicService');

class ClinicController {
    static async createClinic(req, res) {
        try {
            const clinic = await ClinicService.createClinic(req.body);
            res.status(201).json({
                success: true,
                data: clinic
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    static async getClinic(req, res) {
        try {
            const clinic = await ClinicService.getClinicById(req.params.id);
            if (!clinic) {
                return res.status(404).json({
                    success: false,
                    error: 'Clinic not found'
                });
            }
            res.status(200).json({
                success: true,
                data: clinic
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async getClinics(req, res) {
        try {
            const clinics = await ClinicService.getClinics();
            res.status(200).json({
                success: true,
                count: clinics.length,
                data: clinics
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async updateClinic(req, res) {
        try {
            const clinic = await ClinicService.updateClinic(req.params.id, req.body);
            res.status(200).json({
                success: true,
                data: clinic
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    static async getMyClinic(req, res) {
        try {
            const clinic = await ClinicService.getMyClinic(req.user);
            res.status(200).json({
                success: true,
                data: clinic,
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                error: error.message,
            });
        }
    }

    static async updateMyClinic(req, res) {
        try {
            const clinic = await ClinicService.updateMyClinic(req.user, req.body);
            res.status(200).json({
                success: true,
                data: clinic,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message,
            });
        }
    }

    static async joinClinic(req, res) {
        try {
            const clinic = await ClinicService.joinClinicByAccessCode(req.user, req.body.accessCode);
            res.status(200).json({
                success: true,
                data: clinic,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message,
            });
        }
    }

    static async getMyRoster(req, res) {
        try {
            const roster = await ClinicService.getMyRoster(req.user);
            res.status(200).json({
                success: true,
                data: roster,
            });
        } catch (error) {
            res.status(403).json({
                success: false,
                error: error.message,
            });
        }
    }

    static async updateRosterMembership(req, res) {
        try {
            const doctor = await ClinicService.updateRosterMembership(
                req.user,
                req.params.doctorId,
                req.body.status,
                req.body.notes
            );
            res.status(200).json({
                success: true,
                data: doctor,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message,
            });
        }
    }

    static async addDoctor(req, res) {
        try {
            const clinic = await ClinicService.addDoctorToClinic(
                req.params.clinicId,
                req.body.doctorId
            );
            res.status(200).json({
                success: true,
                data: clinic
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    static async removeDoctor(req, res) {
        try {
            const clinic = await ClinicService.removeDoctorFromClinic(
                req.params.clinicId,
                req.body.doctorId
            );
            res.status(200).json({
                success: true,
                data: clinic
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    static async getAvailableSlots(req, res) {
        try {
            const slots = await ClinicService.getClinicAvailableSlots(
                req.params.clinicId,
                req.query.date
            );
            res.status(200).json({
                success: true,
                data: slots
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    static async getDoctorAvailableSlots(req, res) {
        try {
            const slots = await ClinicService.getDoctorAvailableSlots(
                req.params.doctorId,
                req.query.date
            );
            res.status(200).json({
                success: true,
                data: slots
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    static async getClinicByDoctor(req, res) {
        try {
            const clinic = await ClinicService.getClinicByDoctorId(req.params.doctorId);
            if (!clinic) {
                return res.status(404).json({
                    success: false,
                    error: 'Clinic not found'
                });
            }
            res.status(200).json({
                success: true,
                data: clinic
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    static async getClinicsByDoctor(req, res) {
        try {
            const clinics = await ClinicService.getClinicsByDoctor(req.params.doctorId);
            res.status(200).json({
                success: true,
                data: clinics
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    static async getClinicsAdmin(req, res) {
        try {
            const clinics = await ClinicService.getClinics({ includeInactive: true, includeAccessCode: true, publicOnly: false });
            res.status(200).json({
                success: true,
                count: clinics.length,
                data: clinics,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
}

module.exports = ClinicController;
