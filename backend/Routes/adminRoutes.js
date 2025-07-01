const { authMiddleware, isAdmin } = require("../middlewares/AuthMiddleware");
const express = require("express");
const router = express.Router();
const { 
  getDashboardStats,
  getSalesOverview,
  getSalesByCategory,
  getRecentOrders,
  getAllOrders,
  salesdata,
  getUserStats,
  getProductStats
} = require("../Controllers/ProductController");

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Get admin dashboard statistics
 * @access  Private/Admin
 */
router.get("/dashboard/stats", getDashboardStats);

/**
 * @route   GET /api/admin/dashboard/sales-overview
 * @desc    Get sales overview data for a specific period
 * @param   {string} period - Time period in months (e.g., '6m', '12m')
 * @access  Private/Admin
 */
router.get("/dashboard/sales-overview", getSalesOverview);

/**
 * @route   GET /api/admin/dashboard/sales-by-category
 * @desc    Get sales data grouped by product category
 * @access  Private/Admin
 */
router.get("/dashboard/sales-by-category", getSalesByCategory);

/**
 * @route   GET /api/admin/orders/recent
 * @desc    Get recent orders
 * @param   {number} limit - Number of recent orders to return (default: 5)
 * @access  Private/Admin
 */


/**
 * @route   GET /api/admin/dashboard/sales-data
 * @desc    Get monthly sales data for the last 12 months
 * @access  Private/Admin
 */
router.get("/dashboard/sales-data", salesdata);

/**
 * @route   GET /api/admin/dashboard/recent-orders
 * @desc    Get recent orders
 * @param   {number} limit - Number of recent orders to return (default: 5)
 * @access  Private/Admin
 */
router.get("/dashboard/recent-orders", getRecentOrders);

/**
 * @route   GET /api/admin/dashboard/user-stats
 * @desc    Get user statistics including order history and total spending
 * @access  Private/Admin
 */
router.get("/dashboard/user-stats", getUserStats);

/**
 * @route   GET /api/admin/dashboard/product-stats
 * @desc    Get product statistics including stock status
 * @access  Private/Admin
 */
router.get("/dashboard/product-stats", getProductStats);

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders with pagination (15 per page)
 * @param   {number} page - Page number (default: 1)
 * @access  Private/Admin
 */
router.get("/dashboard/orders", getAllOrders);

module.exports = router;
