const express = require("express");
const router = express.Router();
const { addToCart, getCart ,updateCart, deleteCartItem } = require("../Controllers/CartController");
const { authMiddleware } = require("../middlewares/AuthMiddleware");

router.post("/", authMiddleware, addToCart);
router.get("/:userId", authMiddleware, getCart);
router.put("/:userId/:productId", authMiddleware, updateCart);
router.delete("/:userId/:productId", authMiddleware, deleteCartItem);

module.exports = router;
