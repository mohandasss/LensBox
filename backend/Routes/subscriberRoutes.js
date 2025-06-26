const express = require('express');
const router = express.Router();
const { subscribe, unsubscribe } = require('../Controllers/SubscriberController');

/**
 * @route   POST /api/subscribe
 * @desc    Subscribe to newsletter
 * @access  Public
 */
router.post('/subscribe', subscribe);

/**
 * @route   POST /api/unsubscribe
 * @desc    Unsubscribe from newsletter
 * @access  Public
 */
router.post('/unsubscribe', unsubscribe);

module.exports = router;