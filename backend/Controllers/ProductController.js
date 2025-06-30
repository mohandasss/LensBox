const Product = require("../Models/Products");
const cloudinary = require("../Config/cloudanary");



const categorymappedwithid = {
  camera: "507f1f77bcf86cd799439011",
  lens: "507f1f77bcf86cd799439012",
  equipment: "507f1f77bcf86cd799439013",}
  
const addProduct = async (req, res) => {
  try {
    const { name, price, description, category, stock, seller, features } = req.body;

    // 🛑 Validate Required Fields
    if (!name || !price || !description || !category || !stock || !seller || !features) {
      return res
        .status(400)
        .json({ error: "All fields are required." });
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
      features,
      image: uploadedImages,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ error: "Failed to add product" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, price, description, category, stock, features } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.category = category || product.category;
    product.stock = stock || product.stock;
    product.features = features || product.features;

    if (req.files && req.files.image) {
      if (product.image && typeof product.image === "string") {
        const publicId = product.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }

      const uploadedResponse = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: "products",
      });
      product.image = uploadedResponse.secure_url;
    }

    await product.save();
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const publicId = product.image.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(publicId);

    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

/**
 * Search products with flexible querying
 * Supports searching by name, description, and features
 * Can filter by category (optional)
 * 
 * Query Parameters (GET):
 * - q: Search term (required)
 * - category: Category ID to filter by (optional)
 * 
 * Request Body (POST):
 * - searchTerm: Search term (required)
 * - selectedCategory: Category ID to filter by (optional)
 */
const searchProducts = async (req, res) => {
  try {
    // Get search term from query params or request body
    const search = req.query.q || req.body.searchTerm;
    const category = req.query.category || req.body.selectedCategory;

    // Validate search term exists
    if (!search || typeof search !== 'string' || search.trim() === '') {
      return res.status(400).json({ 
        error: 'Search term is required',
        example: '/api/products/search?q=camera' 
      });
    }

    // Build search query
    const searchQuery = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { features: { $in: [new RegExp(search, 'i')] } }
      ]
    };

    // Add category filter if provided
    if (category) {
      searchQuery.category = category;
    }

    // Execute search
    const products = await Product.find(searchQuery);

    // Return results
    res.json({
      success: true,
      count: products.length,
      data: products
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Search failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const getProductByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { location, dateranges } = req.body;
    const products = await Product.find({ category });
    res.status(200).json({ message: "Products found", products });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


const getProductsByCategory = async (req, res) => {
  try {
    console.log(req.params);
    const category = req.params.categoryId;
    
    const categoryId = categorymappedwithid[category];
    
    // Add validation for invalid category
    if (!categoryId) {
      return res.status(400).json({ message: "Invalid category" });
    }
    
    const products = await Product.find({ category: categoryId });
    
    res.status(200).json({ message: "Products found", products });
  } catch (error) {
    console.error('Error fetching products:', error); // Better error logging
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getAllProducts,
  searchProducts,
  getProductsByCategory,

};
