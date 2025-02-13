const Product = require("../Models/Products");
const cloudinary = require("../Config/cloudanary");

const addProduct = async (req, res) => {
  try {
    const { name, price, description, category, stock, seller } = req.body;

    // 🛑 Validate Required Fields
    if (!name || !price) {
      return res
        .status(400)
        .json({ error: "Name and Price are required fields." });
    }

    // 🛑 Check If Image File Exists
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "Image is required." });
    }

    const imageFiles = Array.isArray(req.files.image) ? req.files.image : [req.files.image];
    const uploadedImages = [];

    // Upload all images to Cloudinary
    for (const file of imageFiles) {
      const uploadedResponse = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "productsLensbox",
      });
      uploadedImages.push(uploadedResponse.secure_url);
    }

    // ✅ Save Product to MongoDB with a Unique SKU
    const newProduct = new Product({
      sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      description,
      price,
      category,
      stock,
      seller,
      image: uploadedImages, // Store array of image URLs
    });

    await newProduct.save();
    res
      .status(201)
      .json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, price, description, category, stock } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.category = category || product.category;
    product.stock = stock || product.stock;

    if (req.files && req.files.image) {
      // ✅ Ensure product.image exists and is a string
      if (product.image && typeof product.image === "string") {
        const publicId = product.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }

      // ✅ Upload new image
      const uploadedResponse = await cloudinary.uploader.upload(
        req.files.image.tempFilePath,
        {
          folder: "products",
        }
      );
      product.image = uploadedResponse.secure_url;
    }

    await product.save();
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete image from Cloudinary
    const publicId = product.image.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(publicId);

    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error" });
  }
};

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
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }

    res.status(200).json({ message: "Products found", products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const searchProducts = async (req, res) => {
  try {
    const { name,location,dateranges } = req.body;
    console.log(name,location,dateranges);
    const products = await Product.find({
      name: { $regex: name, $options: "i" },
    });
    res.status(200).json({ message: "Products found", products });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductById,
  getAllProducts,
};
