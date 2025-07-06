require("dotenv").config();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../Models/orderModel");
const tempOrderModel = require("../Models/tempOrderModel");
const Product = require("../Models/Products");
const secret = require("../secret");
const { sendPurchaseConfirmationEmail } = require('../services/sendMail');
const { generateInvoicePDFBuffer } = require('./InvoiceController');
const { sendStockNotifications } = require('./StockNotificationController');
const axios = require('axios');

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
      lat, // Add location data
      lng, // Add location data
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

    // Save all the data in TempOrder INCLUDING userId and location
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
        lat, // Add location data
        lng, // Add location data
      },
    });

    console.log('Temp order created with location:', { lat, lng });

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

    // Inventory management: Check stock and update quantities
    const items = orderData.items;
    const insufficientStockItems = [];
    
    // Check if all products have sufficient stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: `Product with ID ${item.productId} not found` 
        });
      }
      
      if (product.stock < item.quantity) {
        insufficientStockItems.push({
          productName: product.name,
          requested: item.quantity,
          available: product.stock
        });
      }
    }
    
    // If any product has insufficient stock, return error
    if (insufficientStockItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock for some products',
        insufficientStockItems
      });
    }
    
    // Update product stock and track sales
    for (const item of items) {
      const product = await Product.findById(item.productId);
      console.log(`Updating stock for product: ${product.name}, Current stock: ${product.stock}, Deducting: ${item.quantity}`);
      
      const updatedProduct = await Product.findByIdAndUpdate(
        item.productId,
        { 
          $inc: { 
            stock: -item.quantity,
            salesCount: item.quantity,
            totalRevenue: item.amount
          },
          lastSoldAt: new Date()
        },
        { new: true }
      );
      
      console.log(`Updated stock for product: ${updatedProduct.name}, New stock: ${updatedProduct.stock}, Sales count: ${updatedProduct.salesCount}`);
      
      // Ensure stock doesn't go below 0 (additional safety check)
      if (updatedProduct.stock < 0) {
        // Rollback the stock and sales changes
        await Product.findByIdAndUpdate(
          item.productId,
          { 
            $inc: { 
              stock: item.quantity,
              salesCount: -item.quantity,
              totalRevenue: -item.amount
            }
          }
        );
        
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${updatedProduct.name}`,
          productName: updatedProduct.name,
          requested: item.quantity,
          available: updatedProduct.stock + item.quantity
        });
      }
    }

    // Get location coordinates for the order
    let location = null;
    console.log('Processing location data from orderData:', { 
      lat: orderData.lat, 
      lng: orderData.lng,
      hasLat: !!orderData.lat,
      hasLng: !!orderData.lng
    });
    
    if (orderData.lat && orderData.lng) {
      location = {
        lat: orderData.lat,
        lng: orderData.lng,
        address: `${orderData.addressLine1 || ''}, ${orderData.addressLine2 || ''}, ${orderData.city || ''}, ${orderData.state || ''}, ${orderData.country || ''}, ${orderData.zipCode || ''}`.replace(/, +/g, ', ').replace(/^, |, $/g, '').trim()
      };
      console.log('Location data created:', location);
    } else {
      console.log('No location data found in orderData');
    }

    // Create new order
    console.log('[ORDER DEBUG] Saving order with location:', location);
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
      location: location, // Add location data if available
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
    console.log("New order created:", newOrder._id);
    console.log("Order location data:", newOrder.location);
    
    // Reverse geocode to get city name if location exists and no city yet
    if (newOrder.location && newOrder.location.lat && newOrder.location.lng && !newOrder.location.city) {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newOrder.location.lat}&lon=${newOrder.location.lng}&zoom=10&addressdetails=1`;
        const response = await axios.get(url, { headers: { 'User-Agent': 'lensbox-app/1.0' } });
        const address = response.data.address || {};
        let city = address.city || address.town || address.village || address.hamlet || address.state || address.county;
        if (!city && response.data.display_name) {
          city = response.data.display_name.split(',')[0];
        }
        if (city) {
          newOrder.location.city = city;
          await newOrder.save();
          console.log('[ORDER DEBUG] Reverse geocoded city:', city);
        } else {
          console.log('[ORDER DEBUG] No city found in reverse geocode response:', response.data.address, response.data.display_name);
        }
      } catch (geoErr) {
        console.error('[ORDER DEBUG] Reverse geocoding failed:', geoErr.message);
      }
    }
    
    await tempOrder.deleteOne();
    
    // Send purchase confirmation email with PDF attachment
    try {
      // Populate the order with user and product details for email
      const populatedOrder = await Order.findById(newOrder._id)
        .populate('user', 'email firstName lastName')
        .populate('items.productId', 'name price');
      
      if (populatedOrder && populatedOrder.user) {
        // Prepare order items for email
        const orderItems = populatedOrder.items.map(item => ({
          name: item.productId?.name || 'Product',
          quantity: item.quantity,
          price: item.amount || item.productId?.price || 0,
          total: (item.quantity * (item.amount || item.productId?.price || 0)).toFixed(2)
        }));

        // Generate PDF buffer
        const pdfBuffer = await generateInvoicePDFBuffer(newOrder._id);
        
        // Send email with PDF attachment
        const emailResult = await sendPurchaseConfirmationEmail({
          to: populatedOrder.user.email,
          name: `${populatedOrder.user.firstName || ''} ${populatedOrder.user.lastName || ''}`.trim() || 'Customer',
          orderId: newOrder._id,
          items: orderItems,
          total: populatedOrder.total,
          addressLine1: populatedOrder.customerDetails?.addressLine1 || '',
          attachments: [{
            filename: `invoice-${newOrder._id.toString().slice(-6)}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }]
        });
        
        if (emailResult.success) {
          console.log("Purchase confirmation email sent successfully with PDF attachment");
        } else {
          console.error("Failed to send purchase confirmation email:", emailResult.error);
        }
      }
    } catch (emailError) {
      console.error("Error sending purchase confirmation email:", emailError);
      // Don't fail the order creation if email fails
    }
    
    // Order processed successfully

    res.status(200).json({
      success: true,
      message: "Payment verified and order created successfully",
      order: newOrder,
      orderId: newOrder._id
    });
  } catch (error) {
    // Error processing order verification
    console.error("Error in verifyAndCreateOrder:", error);
    
    // If order creation failed, we should ideally rollback stock changes
    // However, since this is a payment verification, the stock was already deducted
    // and the payment was successful, we might want to keep the stock deduction
    // and handle this case differently based on business logic
    
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