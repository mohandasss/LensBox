const StockNotification = require('../Models/StockNotification');
const Product = require('../Models/Products');
const User = require('../Models/UserModel');
const { sendMail } = require('../services/sendMail');

// Subscribe to stock notification
const subscribeToStockNotification = async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId } = req.user;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product is actually out of stock
    if (product.stock > 0) {
      return res.status(400).json({
        success: false,
        message: 'Product is already in stock'
      });
    }

    // Get user email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already subscribed
    const existingNotification = await StockNotification.findOne({
      userId,
      productId
    });

    if (existingNotification) {
      return res.status(400).json({
        success: false,
        message: 'You are already subscribed to notifications for this product'
      });
    }

    // Create new notification subscription
    const stockNotification = new StockNotification({
      userId,
      productId,
      email: user.email
    });

    await stockNotification.save();

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to stock notifications',
      data: stockNotification
    });

  } catch (error) {
    console.error('Error subscribing to stock notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to stock notification',
      error: error.message
    });
  }
};

// Unsubscribe from stock notification
const unsubscribeFromStockNotification = async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId } = req.user;

    const deletedNotification = await StockNotification.findOneAndDelete({
      userId,
      productId
    });

    if (!deletedNotification) {
      return res.status(404).json({
        success: false,
        message: 'No active notification subscription found for this product'
      });
    }

    res.json({
      success: true,
      message: 'Successfully unsubscribed from stock notifications'
    });

  } catch (error) {
    console.error('Error unsubscribing from stock notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe from stock notification',
      error: error.message
    });
  }
};

// Check if user is subscribed to stock notification
const checkStockNotificationStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId } = req.user;

    const notification = await StockNotification.findOne({
      userId,
      productId
    });

    res.json({
      success: true,
      isSubscribed: !!notification,
      data: notification
    });

  } catch (error) {
    console.error('Error checking stock notification status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check notification status',
      error: error.message
    });
  }
};

// Manual trigger for stock notifications (for sellers who update DB directly)
const manuallyTriggerStockNotifications = async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId } = req.user; // This should be the seller's ID

    // Check if product exists and belongs to the seller
    const product = await Product.findOne({ _id: productId, seller: userId });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or not owned by you'
      });
    }

    // Check if product is in stock
    if (product.stock <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Product is still out of stock. No notifications to send.'
      });
    }

    // Send notifications
    const result = await sendStockNotifications(productId);

    res.json({
      success: true,
      message: `Stock notifications triggered for ${product.name}`,
      productName: product.name,
      currentStock: product.stock,
      result
    });

  } catch (error) {
    console.error('Error manually triggering stock notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger stock notifications',
      error: error.message
    });
  }
};

// Send notifications when product comes back in stock (to be called when stock is updated)
const sendStockNotifications = async (productId) => {
  try {
    const product = await Product.findById(productId);
    if (!product || product.stock <= 0) {
      return { sent: 0, message: 'Product not found or still out of stock' };
    }

    // Find all pending notifications for this product
    const notifications = await StockNotification.find({
      productId,
      isNotified: false
    }).populate('userId', 'name email');

    if (notifications.length === 0) {
      return { sent: 0, message: 'No pending notifications found' };
    }

    let sentCount = 0;
    let errorCount = 0;

    // Send email notifications
    for (const notification of notifications) {
      try {
        const emailData = {
          to: notification.email,
          subject: `${product.name} is back in stock!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">Product Back in Stock!</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">LensBox Rental</p>
              </div>
              
              <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
                <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
                  Dear <strong>${notification.userId.name}</strong>,
                </p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2 style="color: #667eea; margin: 0 0 10px 0; font-size: 18px;">
                    Great News! ${product.name} is back in stock
                  </h2>
                  <p style="color: #666; margin: 0 0 15px 0;">
                    <strong>Available Stock:</strong> ${product.stock} units
                  </p>
                  <p style="color: #333; margin: 0; line-height: 1.6;">
                    The product you were waiting for is now available for rental. Don't miss out!
                  </p>
                </div>
                
                <div style="margin: 20px 0;">
                  <h3 style="color: #333; margin-bottom: 15px;">Product Details:</h3>
                  <ul style="color: #666; line-height: 1.6; padding-left: 20px;">
                    <li><strong>Name:</strong> ${product.name}</li>
                    <li><strong>Price:</strong> ₹${product.price}/day</li>
                    <li><strong>Category:</strong> ${product.category}</li>
                  </ul>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="http://localhost:3000/product/${product._id}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                    Rent Now
                  </a>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9; text-align: center; color: #666; font-size: 14px;">
                  <p>Thank you for your patience!</p>
                  <p>This notification was sent because you subscribed to stock alerts for this product.</p>
                </div>
              </div>
            </div>
          `
        };

        await sendMail(emailData);

        // Mark notification as sent
        notification.isNotified = true;
        notification.notifiedAt = new Date();
        await notification.save();

        sentCount++;
        console.log(`📧 Stock notification sent to: ${notification.email} for product: ${product.name}`);

      } catch (emailError) {
        console.error(`❌ Error sending stock notification to ${notification.email}:`, emailError);
        errorCount++;
        // Continue with other notifications even if one fails
      }
    }

    console.log(`✅ Sent ${sentCount} stock notifications for product: ${product.name}`);
    return { 
      sent: sentCount, 
      errors: errorCount, 
      total: notifications.length,
      message: `Successfully sent ${sentCount} notifications`
    };

  } catch (error) {
    console.error('Error sending stock notifications:', error);
    return { sent: 0, errors: 1, message: 'Failed to send notifications' };
  }
};

module.exports = {
  subscribeToStockNotification,
  unsubscribeFromStockNotification,
  checkStockNotificationStatus,
  manuallyTriggerStockNotifications,
  sendStockNotifications
}; 