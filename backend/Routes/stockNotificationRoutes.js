const express = require('express');
const router = express.Router();
const { 
  subscribeToStockNotification, 
  unsubscribeFromStockNotification, 
  checkStockNotificationStatus,
  manuallyTriggerStockNotifications
} = require('../Controllers/StockNotificationController');
const { authMiddleware } = require('../middlewares/AuthMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Subscribe to stock notification
router.post('/subscribe/:productId', subscribeToStockNotification);

// Unsubscribe from stock notification
router.delete('/unsubscribe/:productId', unsubscribeFromStockNotification);

// Check notification status
router.get('/status/:productId', checkStockNotificationStatus);

// Manual trigger for stock notifications (for sellers)
router.post('/trigger/:productId', manuallyTriggerStockNotifications);

module.exports = router; 