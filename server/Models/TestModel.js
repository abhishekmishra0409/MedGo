const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Test name is required'],
        unique: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        uppercase: true,
        unique: true,
        match: [/^[A-Z0-9]{3,8}$/, 'Invalid test code format']
    },
    description: String,
    category: {
        type: String,
        enum: ['blood', 'urine', 'imaging', 'pathology', 'genetic','swab'],
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    preparationInstructions: String,
    reportTime: { // Typical turnaround time in hours
        type: Number,
        default: 24
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);