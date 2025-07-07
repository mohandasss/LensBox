const router = require("express").Router();
const { 
  addProduct, 
  updateProduct, 
  deleteProduct,
  searchProducts, 
  searchSuggestions,
  getProductById, 
  getAllProducts, 
  getProductsByCategory,
  addBulkProducts,
  getSellerInfo,
  getRelatedProducts,
  toggleProductActive,
  getProductNames,
  getMostPopularProducts
} = require("../Controllers/ProductController");

const { authMiddleware, isSeller } = require("../middlewares/AuthMiddleware");

router.post("/", authMiddleware, isSeller, addProduct);
router.put("/:id", authMiddleware,  updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);
router.get("/:id", getProductById);
router.get("/", getAllProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.post("/search", searchProducts);

// Bulk product creation endpoint
router.post("/bulk", authMiddleware, addBulkProducts);

// Get seller information by product ID
router.get("/:productId/seller", getSellerInfo);

// Add related products endpoint
router.get("/:productId/related", getRelatedProducts);

router.patch("/:id/toggle-active", authMiddleware, isSeller, toggleProductActive);

// Place this before any dynamic :id routes
router.get("/names", getProductNames);

// Search suggestions endpoint
router.get("/suggestions", searchSuggestions);

router.get("/popular", getMostPopularProducts);

module.exports = router;
