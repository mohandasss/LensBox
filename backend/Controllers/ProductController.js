const Product = require("../Models/Products");
const cloudinary = require("../Config/cloudanary");
const addProduct = async (req, res) => {
    try {
        const { name, price, description, image, category, stock, brand, subCategory  } = req.body;
        console.log(req.body);
        

        const uploader = async (path) => await cloudinary.uploader.upload(path, {
            folder: "products",
        });


        const uploadedResponse = await uploader(image);

        const product = await Product.create({ name, price, description, image: uploadedResponse.url, category, stock });
        res.status(201).json({ message: "Product added successfully", product });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

const updateProduct = async (req, res) => {
    try {
        const { name, price, description, image, category, stock } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        product.name = name;
        product.price = price;
        product.description = description;
        product.category = category;
        product.stock = stock;
        await product.save();
        res.status(200).json({ message: "Product updated successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}


const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        await Product.findByIdAndDelete(id);
        res.status(200).json({ message: "Product deleted successfully", product });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }

}

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json({ message: "Product found", product });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({ message: "Products found", products });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}


const searchProducts = async (req, res) => {
    try {
        const { name } = req.query;
        const products = await Product.find({ name: { $regex: name, $options: "i" } });
        res.status(200).json({ message: "Products found", products });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}
module.exports = { addProduct, updateProduct, deleteProduct, searchProducts, getProductById, getAllProducts };
