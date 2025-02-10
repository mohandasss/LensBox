const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    description: {
        type: String,
        required: true,
        maxLength: [2000, 'Description cannot exceed 2000 characters']
    },
    image: {
        type: [String], // Array of image URLs
        default: []
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory'
    },
    brand: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        min: [0, 'Stock cannot be negative'],
        default: 0
    },
    ratings: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be negative'],
        max: [5, 'Rating cannot exceed 5']
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    sku: {
        type: String,
        unique: true,
        required: true
    },
    dimensions: {
        length: { type: Number },
        width: { type: Number },
        height: { type: Number },
        unit: { type: String, default: 'cm' }
    },
    weight: {
        value: { type: Number },
        unit: { type: String, default: 'kg' }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Product', productSchema);
