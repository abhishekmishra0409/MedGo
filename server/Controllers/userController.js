const UserService = require('../Services/userServices');
const doctorService = require('../Services/doctorServices');
const cloudinary = require('cloudinary').v2;

class UserController {
    static async uploadProfileImage(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'Image file is required',
                });
            }

            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'medgo/doctor-profiles',
                        resource_type: 'image',
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                            return;
                        }

                        resolve(result);
                    }
                );

                stream.end(req.file.buffer);
            });

            res.status(200).json({
                success: true,
                data: {
                    url: uploadResult.secure_url,
                    publicId: uploadResult.public_id,
                },
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message || 'Image upload failed',
            });
        }
    }

    static async getAllDoctorsPublic(req, res) {
        try {
            const doctors = await doctorService.getAllDoctors({
                search: req.query.search,
                specialty: req.query.specialty || req.query.speciality,
                approvalStatus: req.query.approvalStatus || 'approved',
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
    }

    static async getDoctorByIdPublic(req, res) {
        try {
            const doctor = await doctorService.getDoctorById(req.params.id);
            res.status(200).json({
                success: true,
                data: doctor,
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                error: error.message,
            });
        }
    }

    static async getAllDoctorsAdmin(req, res) {
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
    }

    static async createDoctorAdmin(req, res) {
        try {
            const doctor = await doctorService.createDoctor(req.body);
            res.status(201).json({
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

    static async updateDoctorAdmin(req, res) {
        try {
            const doctor = await doctorService.updateDoctor(req.params.id, req.body);
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

    static async updateDoctorApprovalAdmin(req, res) {
        try {
            const doctor = await doctorService.updateDoctorApproval(
                req.params.id,
                req.body.approvalStatus,
                req.body.approvalNotes
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

    static async deleteDoctorAdmin(req, res) {
        try {
            const result = await doctorService.deleteDoctor(req.params.id);
            res.status(200).json({
                success: true,
                data: result,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message,
            });
        }
    }

    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    error: 'Email is required'
                });
            }

            const result = await UserService.requestPasswordReset(email, req.get('origin'));
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
    }

    static async resetPassword(req, res) {
        try {
            const result = await UserService.resetPassword(
                req.params.token,
                req.body.password,
                req.body.confirmPassword
            );

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
    }

    // Register a new user
    static async register(req, res) {
        try {
            const user = await UserService.registerUser(req.body);
            res.status(201).json({
                success: true,
                data: user
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    // Login user
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Email and password are required'
                });
            }

            const { user, token } = await UserService.loginUser(email, password);
            res.status(200).json({
                success: true,
                token,
                data: user
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                error: error.message
            });
        }
    }

    // Get current user profile (requires auth)
    static async getMe(req, res) {
        try {
            const user = await UserService.getCurrentUser(req.user.id);
            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                error: error.message
            });
        }
    }

    // Get user by ID (admin only)
    static async getUser(req, res) {
        try {
            const user = await UserService.getUserById(req.params.id);
            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                error: error.message
            });
        }
    }

    // Update user profile
    static async updateUser(req, res) {
        try {
            const updatedUser = await UserService.updateUser(
                req.user.id,
                req.body
            );
            res.status(200).json({
                success: true,
                data: updatedUser
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    // Delete user account
    static async deleteUser(req, res) {
        try {
            const result = await UserService.deleteUser(req.params.id);
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
    }

    // Get all users (admin only)
    static async getAllUsers(req, res) {
        try {
            const users = await UserService.getAllUsers({ role: req.query.role });
            res.status(200).json({
                success: true,
                count: users.length,
                data: users
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = UserController;
