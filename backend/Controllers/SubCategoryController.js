const mongoose = require("mongoose");
const SubCategory = require("../Models/SubCategory");

const addSubCategory = async (req, res) => {
    const { name, description, image } = req.body;
    const subCategory = await SubCategory.create({ name, description, image });
    res.status(201).json({ message: "SubCategory created successfully", subCategory });
}

const updateSubCategory = async (req, res) => {
    const { name, description, image } = req.body;
    const subCategory = await SubCategory.findByIdAndUpdate(req.params.id, { name, description, image }, { new: true });
    res.status(200).json({ message: "SubCategory updated successfully", subCategory });
}

const deleteSubCategory = async (req, res) => {
    const { id } = req.params;
    const subCategory = await SubCategory.findById(id);
    if (!subCategory) {
        return res.status(404).json({ message: "SubCategory not found" });
    }
    await SubCategory.findByIdAndDelete(id);
    res.status(200).json({ message: "SubCategory deleted successfully", subCategory });
}

const getSubCategoriesByCategory = async (req, res) => {
    const category = req.params.categoryId;
    const subCategories = await SubCategory.find({ category });
    res.status(200).json({ message: "SubCategories found", subCategories });
}


module.exports = {  getSubCategoriesByCategory, addSubCategory, updateSubCategory, deleteSubCategory  };
