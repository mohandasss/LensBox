const mongoose = require("mongoose");

const BrandSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("Brand", BrandSchema);
