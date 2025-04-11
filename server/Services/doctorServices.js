const Doctor = require('../Models/DoctorModel');
const cloudinary = require("cloudinary").v2;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const mongoose = require('mongoose');

// Image Upload Function
async function uploadToCloudinary(file) {
    try {
        if (!file) throw new Error('No file provided');

        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'doctors',
            use_filename: true,
            resource_type: 'auto'
        });

        return {
            url: result.secure_url,
            public_id: result.public_id
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image: ' + error.message);
    }
}

// Authentication Services
const loginDoctor = async (email, password) => {
    try {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        const doctor = await Doctor.findOne({ email: email.toLowerCase().trim() })
            .select('+password');
        if (!doctor) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, doctor.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const token = jwt.sign(
            {
                id: doctor._id,
                role: 'doctor'
            },
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRES_IN }
        );

        const doctorData = doctor.toObject();
        delete doctorData.password;
        delete doctorData.__v;

        return { doctor: doctorData, token };
    } catch (error) {
        console.error('Login error:', error.message);
        throw new Error('Login failed: ' + error.message);
    }
};


// Doctor CRUD Services
const createDoctor = async (doctorData, file) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!file) throw new Error('Doctor image is required');
        if (!doctorData.password) throw new Error('Password is required');

        // Check if email already exists
        const existingDoctor = await Doctor.findOne({ email: doctorData.email.toLowerCase().trim() });
        if (existingDoctor) {
            throw new Error('Email already in use');
        }

        // Upload image
        const uploadResult = await uploadToCloudinary(file);

        // Hash password
        const hashedPassword = await bcrypt.hash(doctorData.password, 10);

        const doctor = new Doctor({
            ...doctorData,
            password: hashedPassword,
            image: uploadResult.url,
            cloudinary_id: uploadResult.public_id
        });

        await doctor.save({ session });
        await session.commitTransaction();

        const newDoctor = doctor.toObject();
        delete newDoctor.password;
        delete newDoctor.__v;

        return newDoctor;
    } catch (error) {
        await session.abortTransaction();
        console.error('Create doctor error:', error.message);
        throw new Error('Failed to create doctor: ' + error.message);
    } finally {
        session.endSession();
    }
};

const getAllDoctors = async (filters = {}) => {
    try {
        return await Doctor.find(filters)
            .select('-password -__v')
            .lean();
    } catch (error) {
        console.error('Get all doctors error:', error.message);
        throw new Error('Failed to fetch doctors');
    }
};

const getDoctorById = async (id) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid doctor ID');
        }

        const doctor = await Doctor.findById(id)
            .select('-password -__v')
            .lean();
        if (!doctor) {
            throw new Error('Doctor not found');
        }

        return doctor;
    } catch (error) {
        console.error('Get doctor by ID error:', error.message);
        throw error;
    }
};

const updateDoctor = async (id, updatedData, file) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid doctor ID');
        }

        const doctor = await Doctor.findById(id).session(session);
        if (!doctor) {
            throw new Error('Doctor not found');
        }

        // Handle password update
        if (updatedData.password) {
            updatedData.password = await bcrypt.hash(updatedData.password, 10);
        }

        // Handle image update
        let oldPublicId = null;
        if (file) {
            const uploadResult = await uploadToCloudinary(file);
            oldPublicId = doctor.cloudinary_id;
            updatedData.image = uploadResult.url;
            updatedData.cloudinary_id = uploadResult.public_id;
        }

        const updatedDoctor = await Doctor.findByIdAndUpdate(
            id,
            updatedData,
            {
                new: true,
                runValidators: true,
                session
            }
        ).select('-password -__v');

        // Delete old image if new one was uploaded
        if (oldPublicId) {
            try {
                await cloudinary.uploader.destroy(oldPublicId);
            } catch (cleanupError) {
                console.error('Failed to cleanup old image:', cleanupError);
            }
        }

        await session.commitTransaction();
        return updatedDoctor;
    } catch (error) {
        await session.abortTransaction();
        console.error('Update doctor error:', error.message);
        throw new Error('Failed to update doctor: ' + error.message);
    } finally {
        session.endSession();
    }
};

const deleteDoctor = async (id) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid doctor ID');
        }

        const doctor = await Doctor.findById(id).session(session);
        if (!doctor) {
            throw new Error('Doctor not found');
        }

        const publicId = doctor.cloudinary_id;
        await Doctor.findByIdAndDelete(id).session(session);

        if (publicId) {
            try {
                await cloudinary.uploader.destroy(publicId);
            } catch (cleanupError) {
                console.error('Failed to cleanup image:', cleanupError);
            }
        }

        await session.commitTransaction();
        return { message: 'Doctor deleted successfully' };
    } catch (error) {
        await session.abortTransaction();
        console.error('Delete doctor error:', error.message);
        throw new Error('Failed to delete doctor: ' + error.message);
    } finally {
        session.endSession();
    }
};

module.exports = {
    // Authentication
    loginDoctor,

    // CRUD Operations
    createDoctor,
    getAllDoctors,
    getDoctorById,
    updateDoctor,
    deleteDoctor
};