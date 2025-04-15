const User = require('../Models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

class UserService {
    // Register a new user with password hashing
    static async registerUser(userData) {
        try {
            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });
            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Create new user
            const newUser = new User({
                ...userData,
                password: hashedPassword,
                role: userData.role || 'user'
            });

            await newUser.save();

            // Remove password before returning
            newUser.password = undefined;
            return newUser;

        } catch (error) {
            throw new Error(`Registration failed: ${error.message}`);
        }
    }

    // Login user with JWT token generation
    static async loginUser(email, password) {
        try {
            // Find user with password
            const user = await User.findOne({ email }).select('+password');
            if (!user) {
                throw new Error('Invalid credentials');
            }

            // Verify password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                throw new Error('Invalid credentials');
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user._id, role: user.role },
                config.JWT_SECRET,
                { expiresIn: config.JWT_EXPIRES_IN }
            );

            // Remove sensitive data
            user.password = undefined;

            return { user, token };

        } catch (error) {
            throw new Error(`Login failed: ${error.message}`);
        }
    }

    // Get user by ID (without password)
    static async getUserById(userId) {
        try {
            const user = await User.findById(userId).select('-password');
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error(`Failed to get user: ${error.message}`);
        }
    }

    // Update user profile (with optional password update)
    static async updateUser(userId, updateData) {
        try {
            // Hash new password if provided
            if (updateData.password) {
                updateData.password = await bcrypt.hash(updateData.password, 10);
            }

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            ).select('-password');

            if (!updatedUser) {
                throw new Error('User not found');
            }

            return updatedUser;

        } catch (error) {
            throw new Error(`Update failed: ${error.message}`);
        }
    }

    // Delete user account
    static async deleteUser(userId) {
        try {
            const deletedUser = await User.findByIdAndDelete(userId);
            if (!deletedUser) {
                throw new Error('User not found');
            }
            return { message: 'User deleted successfully' };
        } catch (error) {
            throw new Error(`Deletion failed: ${error.message}`);
        }
    }

    // Get current user profile (for authenticated requests)
    static async getAllUsers() {
        try {
            const user = await User.find().select('-password');
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw new Error(`Failed to get current user: ${error.message}`);
        }
    }
}

module.exports = UserService;