require('dotenv').config();
const express = require("express");
const router = express.Router();
const { addToWishlist, getWishlist, removeFromWishlist } = require("../Controllers/WishlistController");
const { authMiddleware } = require("../middlewares/AuthMiddleware");

router.post("/", authMiddleware, addToWishlist);
router.get("/:userId", authMiddleware, getWishlist);
router.delete("/:userId/:productId", authMiddleware, removeFromWishlist);

module.exports = router;
