const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
        },
        originalPrice: {
            type: Number,
            required: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        benefits: [
            {
                type: String,
                required: true,
            },
        ],
        dosage: {
            type: String,
            required: true,
        },
        isHot: {
            type: Boolean,
            default: false,
        },
        isNew: {
            type: Boolean,
            default: false,
        },
        rating: {
            type: Number,
            required: true,
            min: 0,
            max: 5,
        },
        reviews: {
            type: Number,
            required: true,
            default: 0,
        },
        image: {
            type: String,
            required: true,
        },
        images: [
            {
                type: String,
                required: true,
            },
        ],
        cloudinaryIds: {
            main: {
                type: String,
                required: true
            },
            additional: [
                {
                    type: String,
                    required: true
                }
            ]
        },
        stock: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

productSchema.index({ category: 1, isHot: 1, isNew: 1, createdAt: -1 });
productSchema.index({
    name: "text",
    category: "text",
    description: "text",
    benefits: "text",
    dosage: "text"
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
