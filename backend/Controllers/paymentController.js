require('dotenv').config();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../Models/orderModel');

const instance = new Razorpay({
  key_id:   process.env.RAZORPAY_KEY_ID, // move keys to .env
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// === 1. Create Razorpay Order ===
const createOrder = async (req, res) => {
  try {
    const { total, currency = 'INR', receipt = 'receipt_order_1' } = req.body;
const amount = parseInt(Number(total) * 100); // Convert to paise and then int


    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }
   
    
    const options = {
      amount, // amount in paise: ₹100 = 10000
      currency,
      receipt,
    };

    const order = await instance.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// === 2. Verify Payment + Save Full Order ===
const verifyAndCreateOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData // { userId, items, address, total, startDate, endDate, ... }
    } = req.body;

    // === Signature Verification ===
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    // === Save to MongoDB ===
    const newOrder = new Order({
      user: orderData.userId,
      customerDetails: {
        fullName: orderData.fullName,
        phone: orderData.phone,
        addressLine1: orderData.addressLine1,
        addressLine2: orderData.addressLine2,
        city: orderData.city,
        state: orderData.state,
        country: orderData.country,
        zipCode: orderData.zipCode,
      },
      startDate: orderData.startDate,
      endDate: orderData.endDate,
      items: orderData.items,
      total: orderData.total,
      razorpay: {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      },
    });

    await newOrder.save();

    res.status(200).json({ success: true, message: 'Order verified & saved', order: newOrder });
  } catch (error) {
    console.error('Order Save Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  createOrder,
  verifyAndCreateOrder,
};
