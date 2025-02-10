const router = require("express").Router();
const { addBrand, updateBrand, deleteBrand } = require("../Controllers/BrandController.js");

router.post("/", addBrand);
router.put("/:id", updateBrand);
router.delete("/:id", deleteBrand);

module.exports = router;
