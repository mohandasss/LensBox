const express = require("express");
const router = express.Router();
const { addToCart, getCart } = require("../Controllers/CartController");
const { authMiddleware } = require("../middlewares/AuthMiddleware");

router.post("/", authMiddleware, addToCart);
router.get("/", authMiddleware, getCart);

module.exports = router;
