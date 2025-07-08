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
   getMostPopularProducts,
   getTopTenProductsBySalesCount  // Added this in main destructuring
} = require("../Controllers/ProductController");

const { authMiddleware, isSeller } = require("../middlewares/AuthMiddleware");

// IMPORTANT: Static routes MUST come before dynamic routes
// Static routes (exact matches)
router.get("/names", getProductNames);
router.get("/suggestions", searchSuggestions);
router.get("/popular", getMostPopularProducts);
router.get("/top-sales", getTopTenProductsBySalesCount);  // Fixed: moved before /:id

// Search route
router.post("/search", searchProducts);

// Bulk product creation endpoint
router.post("/bulk", authMiddleware, addBulkProducts);

// Main CRUD routes
router.post("/", authMiddleware, isSeller, addProduct);
router.get("/", getAllProducts);

// Dynamic routes MUST come after static routes
router.get("/:id", getProductById);
router.put("/:id", authMiddleware, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);
router.patch("/:id/toggle-active", authMiddleware, isSeller, toggleProductActive);

// Routes with specific parameters
router.get("/category/:categoryId", getProductsByCategory);
router.get("/:productId/seller", getSellerInfo);
router.get("/:productId/related", getRelatedProducts);

console.log('ProductRoutes loaded');

module.exports = router;