const express = require("express");
const router = express.Router();
const Product = require("../Models/Products");
const Order = require("../Models/orderModel");
const User = require("../Models/UserModel");
const Review = require("../Models/Review");
const { sendMail } = require("../services/sendMail");

const sellerId = '686559295a8b8364ffd488b0';

// Test endpoint without authentication
router.get("/test-dashboard/stats", async (req, res) => {
  try {
    console.log('🧪 TEST: Getting seller dashboard stats for:', sellerId);
    
    // Get seller's products
    const products = await Product.find({ seller: sellerId });
    const productIds = products.map(p => p._id);
    
    console.log('📦 Found products:', products.length);
    
    // Get orders containing seller's products
    const orders = await Order.find({
      'items.productId': { $in: productIds }
    }).populate('items.productId');
    
    console.log('📋 Found orders:', orders.length);
    
    // Calculate current period stats (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
    
    // Filter orders for last 30 days and previous 30 days
    const currentPeriodOrders = orders.filter(order => 
      new Date(order.createdAt) >= thirtyDaysAgo
    );
    
    const previousPeriodOrders = orders.filter(order => 
      new Date(order.createdAt) >= sixtyDaysAgo && 
      new Date(order.createdAt) < thirtyDaysAgo
    );
    
    // Calculate current period stats
    let currentRevenue = 0;
    let currentOrders = 0;
    
    currentPeriodOrders.forEach(order => {
      order.items.forEach(item => {
        if (productIds.some(id => id.toString() === item.productId._id.toString())) {
          currentRevenue += item.amount;
          currentOrders += item.quantity;
        }
      });
    });
    
    // Calculate previous period stats
    let previousRevenue = 0;
    let previousOrders = 0;
    
    previousPeriodOrders.forEach(order => {
      order.items.forEach(item => {
        if (productIds.some(id => id.toString() === item.productId._id.toString())) {
          previousRevenue += item.amount;
          previousOrders += item.quantity;
        }
      });
    });
    
    // Calculate percentage changes
    const revenueChange = previousRevenue > 0 ? 
      Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100) : 
      currentRevenue > 0 ? 100 : 0;
    
    const ordersChange = previousOrders > 0 ? 
      Math.round(((currentOrders - previousOrders) / previousOrders) * 100) : 
      currentOrders > 0 ? 100 : 0;
    
    // Calculate total stats
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.stock > 0).length;
    
    let totalRevenue = 0;
    let totalOrders = 0;
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (productIds.some(id => id.toString() === item.productId._id.toString())) {
          totalRevenue += item.amount;
          totalOrders += item.quantity;
        }
      });
    });
    
    // Get seller's average rating directly from user collection
    const seller = await User.findById(sellerId);
    const averageRating = seller?.avgRating || 0;
    
    // Calculate rating change (mock data for now since we don't have historical rating data)
    const ratingChange = 2; // This would need to be calculated from historical data
    
    const stats = {
      revenue: {
        total: totalRevenue,
        change: revenueChange
      },
      products: {
        total: totalProducts,
        change: 8 // Mock data for now
      },
      orders: {
        total: totalOrders,
        change: ordersChange
      },
      rating: {
        total: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        change: ratingChange
      }
    };
    
    console.log('✅ Calculated stats:', stats);
    console.log('📊 Period comparison:', {
      currentPeriod: { revenue: currentRevenue, orders: currentOrders },
      previousPeriod: { revenue: previousRevenue, orders: previousOrders },
      changes: { revenue: revenueChange, orders: ordersChange }
    });
    
    res.json({
      success: true,
      stats,
      debug: {
        sellerId,
        totalProducts,
        activeProducts,
        totalRevenue,
        totalOrders,
        ordersFound: orders.length,
        currentPeriodOrders: currentPeriodOrders.length,
        previousPeriodOrders: previousPeriodOrders.length
      }
    });
    
  } catch (error) {
    console.error("❌ Error fetching seller dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message
    });
  }
});

// Get real recent orders
router.get("/test-dashboard/recent-orders", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    console.log('📋 Fetching recent orders with limit:', limit);
    
    // Get seller's products
    const products = await Product.find({ seller: sellerId });
    const productIds = products.map(p => p._id);
    
    // Get recent orders
    const orders = await Order.find({
      'items.productId': { $in: productIds }
    })
    .populate('user', 'name email profilePic cloudinaryUrl')
    .populate('items.productId', 'name')
    .sort({ createdAt: -1 })
    .limit(limit);
    
    // Format orders for display
    const formattedOrders = orders.map(order => {
      const sellerItems = order.items.filter(item => 
        productIds.some(id => id.toString() === item.productId._id.toString())
      );
      
      const orderTotal = sellerItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      const productNames = sellerItems.map(item => item.productId.name).join(', ');
      
      return {
        id: order._id.toString(),
        displayId: '#' + order._id.toString().slice(-8),
        customer: order.user?.name || 'Unknown Customer',
        customerEmail: order.user?.email || '',
        customerProfilePic: order.user?.profilePic || order.user?.cloudinaryUrl || null,
        product: productNames || 'Unknown Product',
        amount: orderTotal,
        status: order.status || 'confirmed',
        date: order.createdAt.toLocaleDateString(),
        createdAt: order.createdAt
      };
    });
    
    res.json({
      success: true,
      data: formattedOrders
    });
    
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch recent orders",
      error: error.message
    });
  }
});

// Get paginated orders for seller
router.get("/test-dashboard/orders", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    console.log('📋 Fetching paginated orders - page:', page, 'limit:', limit);
    
    // Get seller's products
    const products = await Product.find({ seller: sellerId });
    const productIds = products.map(p => p._id);
    
    // Get total count for pagination
    const totalOrders = await Order.countDocuments({
      'items.productId': { $in: productIds }
    });
    
    // Get paginated orders
    const orders = await Order.find({
      'items.productId': { $in: productIds }
    })
    .populate('user', 'name email profilePic cloudinaryUrl')
    .populate('items.productId', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
    // Format orders for display
    const formattedOrders = orders.map(order => {
      const sellerItems = order.items.filter(item => 
        productIds.some(id => id.toString() === item.productId._id.toString())
      );
      
      const orderTotal = sellerItems.reduce((sum, item) => sum + (item.amount || 0), 0);
      const productNames = sellerItems.map(item => item.productId.name).join(', ');
      
      return {
        id: order._id.toString(),
        displayId: '#' + order._id.toString().slice(-8),
        customer: order.user?.name || 'Unknown Customer',
        customerEmail: order.user?.email || '',
        customerProfilePic: order.user?.profilePic || order.user?.cloudinaryUrl || null,
        product: productNames || 'Unknown Product',
        amount: orderTotal,
        status: order.status || 'confirmed',
        date: order.createdAt.toLocaleDateString(),
        createdAt: order.createdAt
      };
    });
    
    const totalPages = Math.ceil(totalOrders / limit);
    
    res.json({
      success: true,
      data: {
        orders: formattedOrders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error("Error fetching paginated orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message
    });
  }
});

// Get real product performance data
router.get("/test-dashboard/product-performance", async (req, res) => {
  try {
    // Get seller's products with real sales data
    const products = await Product.find({ seller: sellerId })
      .populate('category', 'name')
      .sort({ salesCount: -1, createdAt: -1 }) // Sort by sales count first, then by creation date
      .limit(10);
    
    // Calculate real performance data using the sales tracking fields
    const performanceData = products.map(product => {
      return {
        id: product._id,
        name: product.name,
        category: product.category?.name || 'Unknown',
        sales: product.salesCount || 0,
        revenue: product.totalRevenue || 0,
        stock: product.stock,
        rating: product.averageRating || 0,
        lastSold: product.lastSoldAt ? new Date(product.lastSoldAt).toLocaleDateString() : 'Never'
      };
    });
    
    res.json({
      success: true,
      data: performanceData
    });
    
  } catch (error) {
    console.error("Error fetching product performance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product performance",
      error: error.message
    });
  }
});

// Get real revenue chart data
router.get("/test-dashboard/revenue-chart", async (req, res) => {
  try {
    // Get seller's products
    const products = await Product.find({ seller: sellerId });
    const productIds = products.map(p => p._id);
    
    // Get orders from last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const orders = await Order.find({
      'items.productId': { $in: productIds },
      createdAt: { $gte: sixMonthsAgo }
    }).populate('items.productId');
    
    // Group orders by month
    const monthlyData = {};
    
    orders.forEach(order => {
      const month = order.createdAt.toLocaleDateString('en-US', { month: 'short' });
      if (!monthlyData[month]) {
        monthlyData[month] = { revenue: 0, orders: 0 };
      }
      
      order.items.forEach(item => {
        if (productIds.some(id => id.toString() === item.productId._id.toString())) {
          monthlyData[month].revenue += item.amount || 0;
          monthlyData[month].orders += item.quantity || 1;
        }
      });
    });
    
    // Generate last 6 months array with real data
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      months.push({
        month: monthName,
        revenue: monthlyData[monthName]?.revenue || 0,
        orders: monthlyData[monthName]?.orders || 0
      });
    }
    
    res.json({
      success: true,
      data: months
    });
    
  } catch (error) {
    console.error("Error fetching revenue chart data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch revenue chart data",
      error: error.message
    });
  }
});

// Get real category data
router.get("/test-dashboard/category-data", async (req, res) => {
  try {
    // Get seller's products with categories
    const products = await Product.find({ seller: sellerId }).populate('category');
    const productIds = products.map(p => p._id);
    
    // Get orders to calculate real sales by category
    const orders = await Order.find({
      'items.productId': { $in: productIds }
    }).populate('items.productId');
    
    // Group by category and calculate real sales
    const categoryMap = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (productIds.some(id => id.toString() === item.productId._id.toString())) {
          const product = products.find(p => p._id.toString() === item.productId._id.toString());
          const categoryName = product?.category?.name || 'Unknown';
          
          if (!categoryMap[categoryName]) {
            categoryMap[categoryName] = {
              name: categoryName,
              value: 0,
              count: 0,
              color: getRandomColor()
            };
          }
          categoryMap[categoryName].value += item.amount || 0;
          categoryMap[categoryName].count += item.quantity || 1;
        }
      });
    });
    
    const categoryData = Object.values(categoryMap);
    
    res.json({
      success: true,
      data: categoryData
    });
    
  } catch (error) {
    console.error("Error fetching category data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch category data",
      error: error.message
    });
  }
});

// Helper function to generate random colors
const getRandomColor = () => {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Get paginated reviews for seller's products
router.get("/test-dashboard/reviews", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    console.log('⭐ Fetching paginated reviews - page:', page, 'limit:', limit);
    
    // Get seller's products
    const products = await Product.find({ seller: sellerId });
    const productIds = products.map(p => p._id);
    
    // Get total count for pagination
    const totalReviews = await Review.countDocuments({
      product: { $in: productIds }
    });
    
    // Get paginated reviews
    const reviews = await Review.find({
      product: { $in: productIds }
    })
    .populate('user', 'name email profilePic cloudinaryUrl')
    .populate('product', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
    // Format reviews for display
    const formattedReviews = reviews.map(review => {
      const timeAgo = getTimeAgo(review.createdAt);
      
      return {
        id: review._id,
        user: review.user?.name || 'Anonymous',
        userEmail: review.user?.email || '',
        userProfilePic: review.user?.profilePic || review.user?.cloudinaryUrl || null,
        product: review.product?.name || 'Unknown Product',
        rating: review.rating,
        comment: review.comment,
        date: review.createdAt.toLocaleDateString(),
        timeAgo: timeAgo,
        createdAt: review.createdAt
      };
    });
    
    const totalPages = Math.ceil(totalReviews / limit);
    
    res.json({
      success: true,
      data: {
        reviews: formattedReviews,
        pagination: {
          currentPage: page,
          totalPages,
          totalReviews,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error("Error fetching paginated reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message
    });
  }
});

// Helper function to calculate time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
}

// Update order status with email notification
router.put("/test-dashboard/orders/:orderId/status", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    console.log('📦 Updating order status:', orderId, 'to:', status);
    
    // Validate status
    const validStatuses = ['confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: confirmed, shipped, delivered, cancelled'
      });
    }
    
    // Get seller's products to ensure this order belongs to the seller
    const products = await Product.find({ seller: sellerId });
    const productIds = products.map(p => p._id);
    
    // Find the order and ensure it contains seller's products
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('items.productId', 'name');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if order contains seller's products
    const sellerItems = order.items.filter(item => 
      productIds.some(id => id.toString() === item.productId._id.toString())
    );
    
    if (sellerItems.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'This order does not contain any of your products'
      });
    }
    
    // Update order status
    const oldStatus = order.status;
    order.status = status;
    await order.save();
    
    console.log('✅ Order status updated from', oldStatus, 'to', status);
    
    // Send email notification to customer
    if (order.user && order.user.email) {
      try {
        const statusMessages = {
          'confirmed': 'Your order has been confirmed and is being prepared for shipping.',
          'shipped': 'Your order has been shipped and is on its way to you.',
          'delivered': 'Your order has been delivered successfully.',
          'cancelled': 'Your order has been cancelled.'
        };
        
        const emailData = {
          to: order.user.email,
          subject: `Order Status Update - ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">Order Status Update</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">LensBox Rental</p>
              </div>
              
              <div style="background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 10px 10px;">
                <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
                  Dear <strong>${order.user.name}</strong>,
                </p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2 style="color: #667eea; margin: 0 0 10px 0; font-size: 18px;">
                    Order #${order._id.toString().slice(-8)}
                  </h2>
                  <p style="color: #666; margin: 0 0 15px 0;">
                    <strong>Status:</strong> 
                    <span style="color: #28a745; font-weight: bold; text-transform: capitalize;">${status}</span>
                  </p>
                  <p style="color: #333; margin: 0; line-height: 1.6;">
                    ${statusMessages[status]}
                  </p>
                </div>
                
                <div style="margin: 20px 0;">
                  <h3 style="color: #333; margin-bottom: 15px;">Order Details:</h3>
                  <ul style="color: #666; line-height: 1.6; padding-left: 20px;">
                    ${sellerItems.map(item => `
                      <li><strong>${item.productId.name}</strong> - Quantity: ${item.quantity}</li>
                    `).join('')}
                  </ul>
                  <p style="color: #333; font-weight: bold; margin-top: 15px;">
                    Total Amount: ₹${sellerItems.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                  </p>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                  <a href="http://localhost:3000/orders" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; font-weight: bold;">
                    View Order Details
                  </a>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e5e9; text-align: center; color: #666; font-size: 14px;">
                  <p>Thank you for choosing LensBox Rental!</p>
                  <p>If you have any questions, please contact our support team.</p>
                </div>
              </div>
            </div>
          `
        };
        
        await sendMail(emailData);
        console.log('📧 Email notification sent to:', order.user.email);
        
      } catch (emailError) {
        console.error('❌ Error sending email notification:', emailError);
        // Don't fail the request if email fails
      }
    }
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        orderId: order._id,
        oldStatus,
        newStatus: status,
        emailSent: order.user && order.user.email
      }
    });
    
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message
    });
  }
});

module.exports = router;
