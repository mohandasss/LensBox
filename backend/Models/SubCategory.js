const mongoose = require("mongoose");

const SubCategorySchema = new mongoose.Schema({
    
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("SubCategory", SubCategorySchema);
