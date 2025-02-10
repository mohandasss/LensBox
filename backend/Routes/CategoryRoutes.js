const router = require("express").Router();
const { addCategory, updateCategory, deleteCategory } = require("../Controllers/CategoryController.js");

router.post("/", addCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

module.exports = router;

