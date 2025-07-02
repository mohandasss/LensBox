const express = require('express');
const router = express.Router();
const { 
  broadcastEmail,
  sendWelcomeEmail,
  sendPurchaseConfirmationEmail 
} = require('../Controllers/mailController');
const { authMiddleware, isAdmin } = require('../middlewares/AuthMiddleware');

/**
 * @route   POST /api/mail/welcome
 * @desc    Send welcome email to new subscriber
 * @access  Public
 */
router.post('/welcome', sendWelcomeEmail);

/**
 * @route   POST /api/mail/purchase-confirmation
 * @desc    Send purchase confirmation email with invoice
 * @access  Private
 */
router.post('/purchase-confirmation', authMiddleware, sendPurchaseConfirmationEmail);
/**
 * @route   POST /api/mail/broadcast
 * @desc    Send email to all subscribers (Admin only)
 * @access  Private/Admin
 */


module.exports = router;
