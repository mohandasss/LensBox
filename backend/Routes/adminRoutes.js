const { authMiddleware, isAdmin } = require("../middlewares/AuthMiddleware");
const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../Controllers/ProductController");

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Get admin dashboard statistics
 * @access  Private/Admin
 */
router.get("/dashboard/stats", getDashboardStats);

module.exports = router;
