const { authMiddleware, isSeller } = require("../middlewares/AuthMiddleware");
const express = require("express");
const router = express.Router();
const { 
  getSellerDashboardStats,
  getSellerProducts,
  getSellerOrders,
  getSellerReviews,
  getSellerAnalytics,
  getSellerRevenueChart,
  getSellerCategoryData,
  getSellerRecentOrders,
  getSellerProductPerformance,
  updateProductStatus,
  updateOrderStatus,
  getSellerRatings,
  getProductsBySellerId
} = require("../Controllers/SellerController");

/**
 * @route   GET /api/seller/dashboard/stats
 * @desc    Get seller dashboard statistics
 * @access  Private/Seller
 */
router.get("/dashboard/stats", authMiddleware, getSellerDashboardStats);

/**
 * @route   GET /api/seller/products
 * @desc    Get all products for the seller (supports ?sort=salesCount|totalRevenue|createdAt&order=asc|desc)
 * @access  Private/Seller
 */
router.get("/products", authMiddleware, getSellerProducts);

/**
 * @route   GET /api/seller/orders
 * @desc    Get all orders for seller's products
 * @access  Private/Seller
 */
router.get("/orders", authMiddleware, getSellerOrders);

/**
 * @route   GET /api/seller/reviews
 * @desc    Get all reviews for seller's products
 * @access  Private/Seller
 */
router.get("/reviews", authMiddleware, getSellerReviews);

/**
 * @route   GET /api/seller/analytics
 * @desc    Get seller analytics data
 * @access  Private/Seller
 */
router.get("/analytics", authMiddleware, getSellerAnalytics);

/**
 * @route   GET /api/seller/dashboard/revenue-chart
 * @desc    Get revenue chart data for seller
 * @access  Private/Seller
 */
router.get("/dashboard/revenue-chart", authMiddleware, getSellerRevenueChart);

/**
 * @route   GET /api/seller/dashboard/category-data
 * @desc    Get category-wise sales data for seller
 * @access  Private/Seller
 */
router.get("/dashboard/category-data", authMiddleware, getSellerCategoryData);

/**
 * @route   GET /api/seller/dashboard/recent-orders
 * @desc    Get recent orders for seller
 * @access  Private/Seller
 */
router.get("/dashboard/recent-orders", authMiddleware, getSellerRecentOrders);

/**
 * @route   GET /api/seller/dashboard/product-performance
 * @desc    Get product performance data for seller
 * @access  Private/Seller
 */
router.get("/dashboard/product-performance", authMiddleware, getSellerProductPerformance);

/**
 * @route   PUT /api/seller/products/:id/status
 * @desc    Update product status (active/inactive)
 * @access  Private/Seller
 */
router.put("/products/:id/status", authMiddleware, updateProductStatus);

/**
 * @route   PUT /api/seller/orders/:id/status
 * @desc    Update order status
 * @access  Private/Seller
 */
router.put("/orders/:id/status", authMiddleware, updateOrderStatus);

/**
 * @route   GET /api/seller/:sellerId/ratings
 * @desc    Get seller's average rating and total ratings
 * @access  Public
 */
router.get("/:sellerId/ratings", getSellerRatings);

/**
 * @route   GET /api/seller/products/by-id/:sellerId
 * @desc    Get all products for a given sellerId (public)
 */
router.get('/products/by-id/:sellerId', getProductsBySellerId);

module.exports = router;
