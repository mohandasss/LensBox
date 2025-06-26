const express = require('express');
const router = express.Router();
const { broadcastEmail } = require('../Controllers/mailController');
const { authMiddleware, isAdmin } = require('../middlewares/AuthMiddleware');

/**
 * @route   POST /api/mail/broadcast
 * @desc    Send email to all subscribers (Admin only)
 * @access  Private/Admin
 */
router.post('/broadcast', authMiddleware, isAdmin, broadcastEmail);

module.exports = router;
