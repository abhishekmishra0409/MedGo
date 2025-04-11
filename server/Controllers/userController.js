const UserService = require('../Services/userServices');

class UserController {
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
            const users = await UserService.getAllUsers();
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