const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        select: false,
    },
    role: {
        type: String,
        enum: ['doctor', 'admin'],
        default: 'doctor',
    },
    specialty: {
        type: String,
        required: true,
        trim: true
    },
    qualification: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    cloudinary_id: {
        type: String
    },
    contact: {
        phone: { type: String, required: true },
        email: { type: String, required: true },
        address: { type: String, required: true }
    },
    workingHours: [{
        days: String,
        hours: String
    }],
    education: [String],
    biography: [String],
    specializations: [String],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviews: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});


const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
