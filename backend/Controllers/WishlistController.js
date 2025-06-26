const Wishlist = require("../Models/Wishlist");
const Product = require("../Models/Products");

const addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    
    // Input validation
    if (!userId || !productId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID and Product ID are required" 
      });
    }

    // Trim productId to handle any accidental whitespace
    const trimmedProductId = productId.trim();
    
    // Find the user's wishlist
    let wishlist = await Wishlist.findOne({ userId });

    // If wishlist doesn't exist, create a new one
    if (!wishlist) {
      const newWishlist = new Wishlist({ 
        userId, 
        products: [trimmedProductId] 
      });
      await newWishlist.save();
      return res.status(200).json({ 
        success: true, 
        message: "Product added to wishlist" 
      });
    }

    // Check if product already exists in wishlist
    const productExists = wishlist.products.some(
      id => id.toString() === trimmedProductId
    );

    if (productExists) {
      return res.status(200).json({ 
        success: false, 
        message: "Product is already in your wishlist" 
      });
    }

    // Add the product to wishlist
    wishlist.products.push(trimmedProductId);
    await wishlist.save();
    
    return res.status(200).json({ 
      success: true, 
      message: "Product added to wishlist" 
    });
  } catch (error) {
    console.error("Error in addToWishlist:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to update wishlist" 
    });
  }
};

const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the user's wishlist
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res.status(200).json({ success: true, products: [] });
    }

    // Get product details for each product in the wishlist
    const products = [];
    for (let productId of wishlist.products) {
      try {
        // Trim any whitespace from the product ID
        productId = productId.trim();
        // Skip if productId is empty after trimming
        if (!productId) continue;

        const product = await Product.findById(productId);
        if (product) {
          products.push(product);
        }
      } catch (error) {
        console.error(`Error fetching product ${productId}:`, error.message);
        // Continue with next product even if one fails
        continue;
      }
    }

    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Error getting wishlist:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching wishlist products",
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      return res
        .status(404)
        .json({ success: false, message: "Wishlist not found" });
    }
    wishlist.products.pull(productId);
    await wishlist.save();
    return res
      .status(200)
      .json({ success: true, message: "Product removed from wishlist" });
  } catch (error) {
    console.error("Error removing product from wishlist:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};
