const express = require("express");
const router = express.Router();
const Product = require("../Models/Products");
const Order = require("../Models/orderModel");
const User = require("../Models/UserModel");

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
    
    // Calculate stats
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.stock > 0).length;
    
    // Calculate revenue from seller's products only
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
    
    // Calculate average rating (mock data for now)
    const averageRating = 4.8;
    
    // Calculate percentage changes (mock data)
    const stats = {
      revenue: {
        total: `₹${totalRevenue.toLocaleString()}`,
        change: 12
      },
      products: {
        total: totalProducts,
        change: 8
      },
      orders: {
        total: totalOrders,
        change: 15
      },
      rating: {
        total: averageRating,
        change: 2
      }
    };
    
    console.log('✅ Calculated stats:', stats);
    
    res.json({
      success: true,
      stats,
      debug: {
        sellerId,
        totalProducts,
        activeProducts,
        totalRevenue,
        totalOrders,
        ordersFound: orders.length
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
        id: '#' + order._id.toString().slice(-8),
        customer: order.user?.name || 'Unknown Customer',
        product: productNames || 'Unknown Product',
        amount: orderTotal,
        status: order.status || 'confirmed',
        date: order.createdAt.toLocaleDateString()
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

// Get real product performance data
router.get("/test-dashboard/product-performance", async (req, res) => {
  try {
    // Get seller's products
    const products = await Product.find({ seller: sellerId })
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const productIds = products.map(p => p._id);
    
    // Get orders to calculate real sales data
    const orders = await Order.find({
      'items.productId': { $in: productIds }
    }).populate('items.productId');
    
    // Calculate real performance data
    const performanceData = products.map(product => {
      let sales = 0;
      let revenue = 0;
      
      // Calculate real sales and revenue for this product
      orders.forEach(order => {
        order.items.forEach(item => {
          if (item.productId._id.toString() === product._id.toString()) {
            sales += item.quantity || 1;
            revenue += item.amount || 0;
          }
        });
      });
      
      return {
        id: product._id,
        name: product.name,
        category: product.category?.name || 'Unknown',
        sales: sales,
        revenue: revenue,
        stock: product.stock,
        rating: 4.5 // We don't have reviews yet, so keeping this as default
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

module.exports = router;
