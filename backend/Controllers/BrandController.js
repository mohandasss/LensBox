const Brand = require("../Models/Brand");

const addBrand = async (req, res) => {
    const { name, description, image } = req.body;
    const brand = await Brand.create({ name, description, image });
    res.status(201).json({ message: "Brand created successfully", brand });
}

const updateBrand = async (req, res) => {
    const { name, description, image } = req.body;
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
    }
    brand.name = name;
    brand.description = description;
    brand.image = image;
    await brand.save();
    res.status(200).json({ message: "Brand updated successfully", brand });
}

const deleteBrand = async (req, res) => {
    const { id } = req.params;
    const brand = await Brand.findById(id);
    if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
    }
    await Brand.findByIdAndDelete(id);

    res.status(200).json({ message: "Brand deleted successfully", brand });
}


module.exports = { addBrand, updateBrand, deleteBrand };




