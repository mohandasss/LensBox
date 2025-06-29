require("dotenv").config();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../Models/orderModel");
const tempOrderModel = require("../Models/tempOrderModel");
const secret = require("../secret");

const instance = new Razorpay({
  key_id: secret.RAZORPAY_KEY_ID,
  key_secret: secret.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
  try {
    const {
      total,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country,
      startDate,
      endDate,
      items,
      userId, // Add this - should come from frontend
    } = req.body;

    const amount = parseInt(Number(total) * 100);

    if (!amount || !items || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Amount and items are required" });
    }

    // Check if userId is provided
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const options = {
      amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder = await instance.orders.create(options);

    // Save all the data in TempOrder INCLUDING userId
    await tempOrderModel.create({
      razorpayOrderId: razorpayOrder.id,
      orderData: {
        userId, // Add this line
        fullName,
        phone,
        addressLine1,
        addressLine2,
        city,
        state,
        zipCode,
        country,
        startDate,
        endDate,
        total,
        items,
      },
    });

    res.status(200).json({ 
      success: true, 
      order: razorpayOrder,
      razorpayOrderId: razorpayOrder.id
    });
  } catch (error) {
    // Error creating order
    res.status(500).json({ success: false, error: error.message });
  }
};

const verifyAndCreateOrder = async (req, res) => {
  try {
    // Processing payment verification
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Verifying payment signature

    // Create expected signature
    const expectedSignature = crypto
      .createHmac("sha256", secret.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // Verifying signature match

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    // Signature verified

    // Fetch stored temp order data
    // Retrieving temporary order
    const tempOrder = await tempOrderModel.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!tempOrder) {
      return res.status(404).json({ success: false, message: 'Temporary order not found' });
    }

    // Temporary order retrieved
    const orderData = tempOrder.orderData;
    
    // Processing order data

    // Check if userId exists in orderData
    if (!orderData.userId) {
      return res.status(400).json({ success: false, message: 'User ID not found in order data' });
    }

    // Create new order
    const newOrder = new Order({
      user: orderData.userId, // This should now be available
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
      
      status: 'confirmed'
    });

    await newOrder.save();
    console.log("New order created:",);
    
    await tempOrder.deleteOne();
    // Order processed successfully

    res.status(200).json({
      success: true,
      message: "Payment verified and order created successfully",
      order: newOrder,
      orderId: newOrder._id
    });
  } catch (error) {
    // Error processing order verification
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: error.message 
    });
  }
};

module.exports = {
  createOrder,
  verifyAndCreateOrder,
};