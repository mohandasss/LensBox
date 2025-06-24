require("dotenv").config();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../Models/orderModel");
const { log } = require("console");
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
    
    console.log("📋 Create order request body:", req.body);
    console.log("👤 User ID received:", userId);

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
    console.log("✅ Razorpay order created:", razorpayOrder.id);

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

    console.log("✅ Temp order saved with userId:", userId);

    res.status(200).json({ 
      success: true, 
      order: razorpayOrder,
      razorpayOrderId: razorpayOrder.id
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

const verifyAndCreateOrder = async (req, res) => {
  try {
    console.log("🔍 Received verification request body:", req.body);
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error("❌ Missing required fields:", {
        razorpay_order_id: !!razorpay_order_id,
        razorpay_payment_id: !!razorpay_payment_id,
        razorpay_signature: !!razorpay_signature
      });
      return res.status(400).json({ 
        success: false, 
        message: "Missing required payment verification data" 
      });
    }

    console.log("🔑 Payment verification data:");
    console.log("Order ID:", razorpay_order_id);
    console.log("Payment ID:", razorpay_payment_id);
    console.log("Signature:", razorpay_signature);

    // Create expected signature
    const expectedSignature = crypto
      .createHmac("sha256", secret.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    console.log("🔐 Expected signature:", expectedSignature);
    console.log("🔐 Received signature:", razorpay_signature);

    if (expectedSignature !== razorpay_signature) {
      console.error("❌ Signature verification failed");
      return res.status(400).json({ 
        success: false, 
        message: "Invalid payment signature" 
      });
    }

    console.log("✅ Signature verified successfully");

    // Fetch stored temp order data
    console.log("🔍 Looking for temp order with razorpayOrderId:", razorpay_order_id);
    const tempOrder = await tempOrderModel.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!tempOrder) {
      console.error("❌ Temp order not found for razorpayOrderId:", razorpay_order_id);
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    console.log("✅ Temp order found:", tempOrder._id);
    const orderData = tempOrder.orderData;
    
    // Log the orderData to see what's available
    console.log("📋 Order data from temp order:", orderData);
    console.log("👤 User ID from order data:", orderData.userId);

    // Check if userId exists in orderData
    if (!orderData.userId) {
      console.error("❌ No userId found in temp order data");
      return res.status(400).json({ 
        success: false, 
        message: "User ID not found in order data" 
      });
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
    console.log("✅ New order created:", newOrder._id);
    
    await tempOrder.deleteOne();
    console.log("✅ Temp order deleted");

    res.status(200).json({
      success: true,
      message: "Payment verified and order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("❌ Verify Order Error:", error);
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