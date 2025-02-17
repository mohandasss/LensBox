const mongoose = require("mongoose");

const Category = require("../Models/Category");

const addCategory = async (req, res) => {
    try {
      const { _id, name } = req.body;
  
      // Validate input
      if (!_id || !name) {
        return res.status(400).json({ message: "Category ID and name are required" });
      }
  
      // Check if the ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ message: "Invalid category ID format" });
      }
  
      // Check if a category with the same ID already exists
      const existingCategory = await Category.findById(_id);
      if (existingCategory) {
        return res.status(400).json({ message: "Category ID already exists" });
      }
  
      // Create category with provided ID
      const category = await Category.create({ _id, name });
  
      res.status(201).json({
        message: "Category created successfully",
        category: { id: category._id, name: category.name },
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  
 
  
const updateCategory = async (req, res) => {
    const { name, description, image } = req.body;
    const category = await Category.findByIdAndUpdate(req.params.id, { name, description, image }, { new: true });
    res.status(200).json({ message: "Category updated successfully", category });
}

const deleteCategory = async (req, res) => {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
        return res.status(404).json({ message: "Category not found" });
    }
    await Category.findByIdAndDelete(id);
    res.status(200).json({ message: "Category deleted successfully", category });

}


const getCategoryById = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Validate ID format before querying
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
  
      const category = await Category.findById(id);
  
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
  
      res.status(200).json({ message: "Category fetched successfully", category });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }

const getAllCategories = async (req, res) => {

    const categories = await Category.find();
    res.status(200).json({ message: "Categories fetched successfully", categories });
}







module.exports = { addCategory, updateCategory, deleteCategory, getCategoryById, getAllCategories };
