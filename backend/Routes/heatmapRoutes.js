const express = require('express');
const router = express.Router();
const heatmapController = require('../Controllers/HeatmapController');
const { authMiddleware } = require('../middlewares/AuthMiddleware');

// Debug log to check what is imported
console.log('HeatmapController imported:', Object.keys(heatmapController));

// Admin heatmap route - requires admin authentication
router.get('/admin', authMiddleware, heatmapController.getAdminHeatmapData);

// Seller heatmap route - requires seller authentication
router.get('/seller/:sellerId', authMiddleware, heatmapController.getSellerHeatmapData);

// Get detailed orders for a specific location
router.get('/location-orders', authMiddleware, heatmapController.getLocationOrders);

module.exports = router; 