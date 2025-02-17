const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true }, // Allow manual ID
    name: { type: String, required: true },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", CategorySchema);

module.exports = Category;
