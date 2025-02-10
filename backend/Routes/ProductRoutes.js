const router = require("express").Router();
const { addProduct, updateProduct, searchProducts, deleteProduct, getProductById, getAllProducts } = require("../Controllers/ProductController");

const { authMiddleware, isAdmin } = require("../middlewares/AuthMiddleware");

router.post("/",  addProduct);
router.put("/:id", authMiddleware, isAdmin, updateProduct);
router.delete("/:id", authMiddleware, isAdmin, deleteProduct);
router.get("/:id", getProductById);
router.get("/", getAllProducts);

router.get("/search", searchProducts);

module.exports = router;
