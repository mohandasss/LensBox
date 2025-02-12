const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID for unique SKU

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    sku: {
        type: String,
        unique: true, // Ensure SKU is unique
        default: () => uuidv4(), // Generate a random SKU if not provided
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative']
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: [String],
        default: []
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);
