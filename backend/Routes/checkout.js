const express = require('express');
const router = express.Router();

const { createOrder, verifyAndCreateOrder } = require('../Controllers/paymentController');
const { authMiddleware } = require('../middlewares/AuthMiddleware');

// Route to create Razorpay order
router.post('/create-order', authMiddleware, createOrder);

// Route to verify Razorpay payment and create order in DB
router.post('/verify-payment',  authMiddleware, verifyAndCreateOrder);

module.exports = router;
