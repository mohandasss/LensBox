const router = require("express").Router();
const { addCategory, updateCategory, deleteCategory, getCategoryById, getAllCategories } = require("../Controllers/CategoryController.js");

router.post("/", addCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);
router.get("/:id", getCategoryById);
router.get("/", getAllCategories);

module.exports = router;

