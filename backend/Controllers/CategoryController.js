const Category = require("../Models/Category");

const addCategory = async (req, res) => {
    const { name, description, image } = req.body;
    const category = await Category.create({ name, description, image });
    res.status(201).json({ message: "Category created successfully", category });
}

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
    const { id } = req.params;
    const category = await Category.findById(id);
    res.status(200).json({ message: "Category fetched successfully", category });
}

const getAllCategories = async (req, res) => {

    const categories = await Category.find();
    res.status(200).json({ message: "Categories fetched successfully", categories });
}







module.exports = { addCategory, updateCategory, deleteCategory, getCategoryById };
