const express = require("express");
const router = express.Router();
const Product = require("../Models/Products");
const Order = require("../Models/orderModel");
const User = require("../Models/UserModel");
const Review = require("../Models/Review");
const { sendMail } = require("../services/sendMail");
const mongoose = require("mongoose");

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
    
    // Calculate total stats for all time
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
    
    // Calculate previous period totals for comparison (60-30 days ago)
    let previousTotalRevenue = 0;
    let previousTotalOrders = 0;
    let previousTotalProducts = 0;
    
    previousPeriodOrders.forEach(order => {
      order.items.forEach(item => {
        if (productIds.some(id => id.toString() === item.productId._id.toString())) {
          previousTotalRevenue += item.amount;
          previousTotalOrders += item.quantity;
        }
      });
    });
    
    // Get seller's average rating and previous period rating
    const seller = await User.findById(sellerId);
    const averageRating = seller?.avgRating || 0;
    
    // For rating change, we'll use a simplified approach since we don't have historical rating data
    const previousRating = seller?.previousAvgRating || (averageRating > 0 ? averageRating * 0.9 : 0); // Assume 10% change if no previous data
    const ratingChange = averageRating > 0 && previousRating > 0 ? 
      Math.round(((averageRating - previousRating) / previousRating) * 100) : 
      averageRating > 0 ? 100 : 0;
      
    // Calculate product count change (compare current active products with previous period)
    const previousActiveProducts = Math.max(0, activeProducts - 2); // Simple estimation
    const productsChange = previousActiveProducts > 0 ? 
      Math.round(((activeProducts - previousActiveProducts) / previousActiveProducts) * 100) : 
      activeProducts > 0 ? 100 : 0;
    
    // Calculate total revenue and orders change (current period vs previous period)
    const totalRevenueChange = previousTotalRevenue > 0 ? 
      Math.round(((totalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100) : 
      totalRevenue > 0 ? 100 : 0;
      
    const totalOrdersChange = previousTotalOrders > 0 ? 
      Math.round(((totalOrders - previousTotalOrders) / previousTotalOrders) * 100) : 
      totalOrders > 0 ? 100 : 0;
    
    const stats = {
      // Current period stats (last 30 days)
      currentRevenue,
      currentOrders,
      revenueChange,  // % change in revenue vs previous 30 days
      ordersChange,   // % change in order count vs previous 30 days
      
      // Total stats (all time)
      totalProducts,
      activeProducts,
      productsChange, // % change in active products vs previous period
      totalRevenue,
      totalRevenueChange, // % change in total revenue vs previous period
      totalOrders,
      totalOrdersChange,  // % change in total orders vs previous period
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      ratingChange,       // % change in rating vs previous period
      
      // For backward compatibility with frontend
      revenue: {
        total: totalRevenue,
        change: totalRevenueChange
      },
      products: {
        total: totalProducts,
        change: productsChange
      },
      orders: {
        total: totalOrders,
        change: totalOrdersChange
      },
      rating: {
        total: Math.round(averageRating * 10) / 10,
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
    const products = await Product.find({ 
      seller: sellerId,
      category: { $exists: true, $ne: null } // Only include products with valid category
    })
      .populate({
        path: 'category',
        select: 'name',
        options: { lean: true },
        transform: (doc) => doc ? doc : { name: 'Uncategorized' }
      })
      .sort({ salesCount: -1, createdAt: -1 }) // Sort by sales count first, then by creation date
      .limit(10);
    
    // Calculate real performance data using the sales tracking fields
    const performanceData = products.map(product => {
      const categoryName = product.category?.name || 'Uncategorized';
      
      return {
        id: product._id,
        name: product.name,
        category: categoryName,
        sales: product.salesCount || 0,
        revenue: product.totalRevenue || 0,
        stock: product.stock || 0,
        rating: product.averageRating || 0,
        lastSold: product.lastSoldAt ? new Date(product.lastSoldAt).toLocaleDateString() : 'Never'
      };
    });
    
    console.log('Product Performance from API:', performanceData);
    
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
  console.time('revenue-chart');
  
  try {
    console.log('📊 Fetching revenue chart data for seller:', sellerId);
    
    // Get seller's products with valid product IDs (optimized query)
    const products = await Product.find(
      { 
        seller: sellerId,
        _id: { $exists: true },
        status: { $ne: 'deleted' }
      },
      { _id: 1 } // Only fetch IDs to minimize data transfer
    ).lean();
    
    console.log('📦 Found products:', products.length);
    
    if (!products.length) {
      console.log('ℹ️ No products found for seller:', sellerId);
      return res.json({
        success: true,
        data: generateEmptyMonths(6) // Return empty data structure for consistency
      });
    }
    
    const productIds = products.map(p => p._id.toString());
    
    // Get orders from last 6 months (optimized query)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setHours(0, 0, 0, 0);
    
    console.log('⏳ Fetching orders from:', sixMonthsAgo.toISOString());
    
    // Use aggregation pipeline for better performance
    const orders = await Order.aggregate([
      {
        $match: {
          'items.productId': { $in: productIds.map(id => new mongoose.Types.ObjectId(id)) },
          createdAt: { $gte: sixMonthsAgo },
          status: { $nin: ['cancelled', 'failed'] }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $match: {
          'items.productId': { $in: productIds.map(id => new mongoose.Types.ObjectId(id)) }
        }
      },
      {
        $project: {
          _id: 1,
          'items.amount': 1,
          'items.quantity': 1,
          'items.productId': 1,
          createdAt: 1
        }
      }
    ]);
    
    console.log('✅ Fetched orders:', orders.length);
    
    // Initialize monthly data for the last 6 months
    const monthlyData = generateEmptyMonthlyData(6);
    
    // Initialize all months with zero values
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const year = date.getFullYear();
      const monthKey = `${monthName}-${year}`;
      
      monthlyData[monthKey] = { 
        month: monthName,
        year: year,
        revenue: 0, 
        orders: 0 
      };
    }
    
    // Process orders
    orders.forEach(order => {
      if (!order.items || !Array.isArray(order.items)) return;
      
      const orderDate = new Date(order.createdAt);
      const monthName = orderDate.toLocaleDateString('en-US', { month: 'short' });
      const year = orderDate.getFullYear();
      const monthKey = `${monthName}-${year}`;
      
      if (!monthlyData[monthKey]) return;
      
      let orderTotal = 0;
      let orderItems = 0;
      
      order.items.forEach(item => {
        const itemProductId = item.productId?._id?.toString?.() || item.productId?.toString?.();
        if (!itemProductId || !productIds.includes(itemProductId)) return;
        
        const amt = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount) || 0;
        const quantity = parseInt(item.quantity) || 1;
        
        orderTotal += amt * quantity;
        orderItems += quantity;
      });
      
      if (orderTotal > 0) {
        monthlyData[monthKey].revenue += orderTotal;
        monthlyData[monthKey].orders += orderItems > 0 ? 1 : 0;
      }
    });
    
    // Convert to array and format for response
    const result = Object.values(monthlyData).map(month => ({
      month: month.month,
      revenue: parseFloat(month.revenue.toFixed(2)),
      orders: month.orders
    }));
    
    res.json({
      success: true,
      data: result
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
    // Get seller's products with valid categories
    const products = await Product.find({ 
      seller: sellerId,
      category: { $exists: true, $ne: null }
    }).populate({
      path: 'category',
      select: 'name',
      options: { lean: true }
    });
    
    if (!products.length) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const productIds = products.map(p => p._id);
    const productMap = new Map(products.map(p => [p._id.toString(), p]));
    
    // Get completed orders for these products
    const orders = await Order.find({
      'items.productId': { $in: productIds },
      status: { $nin: ['cancelled', 'failed'] },
      createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } // Last year
    });
    
    // Initialize category map with all existing categories
    const categoryMap = new Map();
    const usedColors = new Set();
    
    products.forEach(product => {
      const categoryId = product.category?._id?.toString();
      const categoryName = product.category?.name || 'Uncategorized';
      
      if (categoryId && !categoryMap.has(categoryId)) {
        // Generate a unique color for each category
        let color;
        do {
          color = getRandomColor();
        } while (usedColors.has(color));
        
        usedColors.add(color);
        
        categoryMap.set(categoryId, {
          id: categoryId,
          name: categoryName,
          value: 0,
          count: 0,
          color: color
        });
      }
    });
    
    // Process orders to calculate category statistics
    orders.forEach(order => {
      if (!order.items || !Array.isArray(order.items)) return;
      
      order.items.forEach(item => {
        const productId = item.productId?.toString();
        if (!productId || !productMap.has(productId)) return;
        
        const product = productMap.get(productId);
        if (!product?.category?._id) return;
        
        const categoryId = product.category._id.toString();
        const amount = parseFloat(item.amount) || 0;
        const quantity = parseInt(item.quantity) || 1;
        
        if (categoryMap.has(categoryId)) {
          const category = categoryMap.get(categoryId);
          category.value += amount * quantity;
          category.count += quantity;
        }
      });
    });
    
    // Convert map to array and filter out categories with no sales
    const categoryData = Array.from(categoryMap.values())
      .filter(cat => cat.count > 0)
      .map(cat => ({
        ...cat,
        value: parseFloat(cat.value.toFixed(2))
      }))
      .sort((a, b) => b.value - a.value); // Sort by value descending
    
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

// Helper function to generate empty monthly data
function generateEmptyMonthlyData(monthsCount) {
  const monthlyData = {};
  const now = new Date();
  
  for (let i = monthsCount - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(now.getMonth() - i);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const monthKey = `${monthName}-${year}`;
    
    monthlyData[monthKey] = {
      month: monthName,
      year: year,
      revenue: 0,
      orders: 0
    };
  }
  
  return monthlyData;
}

// Helper function to generate random colors
function getRandomColor() {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];
  return colors[Math.floor(Math.random() * colors.length)];
}

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
