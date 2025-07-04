const router = require("express").Router();
const { 
  addProduct, 
  updateProduct, 
  deleteProduct,
  searchProducts, 
  getProductById, 
  getAllProducts, 
  getProductsByCategory,
  addBulkProducts,
  getSellerInfo,
  getRelatedProducts
} = require("../Controllers/ProductController");

const { authMiddleware } = require("../middlewares/AuthMiddleware");

router.post("/", authMiddleware,  addProduct);
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

module.exports = router;
