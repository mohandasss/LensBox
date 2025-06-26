const mongoose = require("mongoose");
const WishlistSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    products: [{ type: String }]  // Changed to array of product IDs
  });
module.exports = mongoose.model("Wishlist", WishlistSchema);
