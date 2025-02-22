const router = require("express").Router();
const { addProduct, updateProduct, searchProducts, deleteProduct, getProductById, getAllProducts, getProductsByCategory  } = require("../Controllers/ProductController");

const { authMiddleware } = require("../middlewares/AuthMiddleware");

router.post("/", authMiddleware,  addProduct);
router.put("/:id", authMiddleware,  updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);
router.get("/:id", getProductById);
router.get("/", getAllProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/search", searchProducts);

module.exports = router;
