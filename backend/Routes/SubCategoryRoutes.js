const router = require("express").Router();
const { addSubCategory, updateSubCategory, deleteSubCategory } = require("../Controllers/SubCategoryController.js");

router.post("/", addSubCategory);
router.put("/:id", updateSubCategory);
router.delete("/:id", deleteSubCategory);

module.exports = router;
