const Product = require("../Models/Products");
const Order = require("../Models/orderModel");
const User = require("../Models/UserModel");
const Category = require("../Models/Category");
const Review = require("../Models/Review");
const mongoose = require('mongoose');

// Helper function to generate last 6 months data
const generateLast6MonthsData = () => {
  const months = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      fullDate: date
    });
  }
  return months;
};

// Get seller dashboard statistics
const getSellerDashboardStats = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    // Get seller's products
    const products = await Product.find({ seller: sellerId });
    const productIds = products.map(p => p._id);
    if (!productIds.length) {
      return res.json({
        success: true,
        stats: {
          revenue: { total: '₹0', change: 0 },
          products: { total: 0, change: 0 },
          orders: { total: 0, change: 0 },
          rating: { total: 0, change: 0 }
        }
      });
    }
    // Date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));
    // Get orders for current and previous periods
    const currentOrders = await Order.find({
      'items.productId': { $in: productIds },
      createdAt: { $gte: thirtyDaysAgo }
    }).populate('items.productId');
    const previousOrders = await Order.find({
      'items.productId': { $in: productIds },
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    }).populate('items.productId');
    // Calculate stats for current period
    let currentRevenue = 0;
    let currentOrderCount = 0;
    currentOrders.forEach(order => {
      order.items.forEach(item => {
        const itemProductId = item.productId?._id?.toString?.() || item.productId?.toString?.();
        if (itemProductId && productIds.map(id=>id.toString()).includes(itemProductId)) {
          const amt = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount) || 0;
          currentRevenue += amt;
          currentOrderCount += item.quantity || 0;
        }
      });
    });
    // Calculate stats for previous period
    let previousRevenue = 0;
    let previousOrderCount = 0;
    previousOrders.forEach(order => {
      order.items.forEach(item => {
        const itemProductId = item.productId?._id?.toString?.() || item.productId?.toString?.();
        if (itemProductId && productIds.map(id=>id.toString()).includes(itemProductId)) {
          const amt = typeof item.amount === 'number' ? item.amount : parseFloat(item.amount) || 0;
          previousRevenue += amt;
          previousOrderCount += item.quantity || 0;
        }
      });
    });
    // Products
    const totalProducts = products.length;
    const newProducts = products.filter(p => p.createdAt >= thirtyDaysAgo).length;
    const previousProducts = products.filter(p => p.createdAt >= sixtyDaysAgo && p.createdAt < thirtyDaysAgo).length;
    // Rating
    const seller = await User.findById(sellerId);
    const averageRating = seller?.avgRating || 0;
    // For rating change, you may need to implement historical rating tracking. For now, set to 0.
    // Calculate percentage changes
    const calculateChange = (current, previous) => {
      if (!previous || previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };
    const stats = {
      revenue: {
        total: `₹${currentRevenue.toLocaleString()}`,
        change: calculateChange(currentRevenue, previousRevenue)
      },
      products: {
        total: totalProducts,
        change: calculateChange(newProducts, previousProducts)
      },
      orders: {
        total: currentOrderCount,
        change: calculateChange(currentOrderCount, previousOrderCount)
      },
      rating: {
        total: averageRating,
        change: 0 // Needs historical data for real change
      }
    };
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("Error fetching seller dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message
    });
  }
};

// Get seller's products
const getSellerProducts = async (req, res) => {
  try {
    let sellerId = req.user.userId;
    console.log('Seller ID from token:', sellerId);
    // Ensure sellerId is an ObjectId
    if (typeof sellerId === 'string') sellerId = mongoose.Types.ObjectId(sellerId);
    // Sorting
    const sortField = req.query.sort || 'createdAt';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const sortObj = {};
    sortObj[sortField] = sortOrder;

    console.log('Fetching products for seller:', sellerId);
    const products = await Product.find({ seller: sellerId })
      .populate('category', 'name')
      .sort(sortObj);
    console.log('Products found:', products.length);

    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// Get seller's orders
const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get seller's products first
    const products = await Product.find({ seller: sellerId });
    const productIds = products.map(p => p._id);
    
    // Get orders containing seller's products
    const orders = await Order.find({
      'items.productId': { $in: productIds }
    })
    .populate('user', 'name email')
    .populate('items.productId', 'name price')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
    // Filter orders to only include seller's items
    const filteredOrders = orders.map(order => {
      const sellerItems = order.items.filter(item => 
        productIds.some(id => id.toString() === item.productId._id.toString())
      );
      
      return {
        ...order.toObject(),
        items: sellerItems,
        total: sellerItems.reduce((sum, item) => sum + item.amount, 0)
      };
    }).filter(order => order.items.length > 0);
    
    const totalOrders = await Order.countDocuments({
      'items.productId': { $in: productIds }
    });
    
    const totalPages = Math.ceil(totalOrders / limit);
    
    res.json({
      success: true,
      data: filteredOrders,
      pagination: {
        page,
        pages: totalPages,
        total: totalOrders,
        limit
      }
    });
    
  } catch (error) {
    console.error("Error fetching seller orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message
    });
  }
};

// Get seller's reviews (placeholder)
const getSellerReviews = async (req, res) => {
  try {
    // This would typically come from a reviews collection
    // For now, return mock data
    const mockReviews = [
      {
        id: 1,
        customer: "John Doe",
        product: "Canon EOS R5",
        rating: 5,
        comment: "Excellent camera quality!",
        date: "2024-01-15"
      },
      {
        id: 2,
        customer: "Jane Smith", 
        product: "Sony FX3",
        rating: 4,
        comment: "Good performance, fast delivery",
        date: "2024-01-10"
      }
    ];
    
    res.json({
      success: true,
      data: mockReviews
    });
    
  } catch (error) {
    console.error("Error fetching seller reviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews",
      error: error.message
    });
  }
};

// Get seller analytics
const getSellerAnalytics = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    
    // Get seller's products
    const products = await Product.find({ seller: sellerId });
    const productIds = products.map(p => p._id);
    
    // Get orders for analytics
    const orders = await Order.find({
      'items.productId': { $in: productIds }
    }).populate('items.productId');
    
    // Generate analytics data
    const analytics = {
      totalRevenue: 42000,
      totalOrders: 156,
      averageOrderValue: 269,
      topProducts: [
        { name: "Canon EOS R5", sales: 25, revenue: 12500 },
        { name: "Sony FX3", sales: 18, revenue: 9000 },
        { name: "Nikon Z6 II", sales: 15, revenue: 7500 }
      ],
      monthlyGrowth: 12.5
    };
    
    res.json({
      success: true,
      data: analytics
    });
    
  } catch (error) {
    console.error("Error fetching seller analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message
    });
  }
};

// Get real revenue chart data for seller
const getSellerRevenueChart = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    // Get seller's products
    const products = await Product.find({ seller: sellerId });
    const productIds = products.map(p => p._id);
    if (!productIds.length) {
      // Return 6 months of zero data
      const months = generateLast6MonthsData();
      return res.json({
        success: true,
        data: months.map(m => ({ month: m.month, revenue: 0, orders: 0 }))
      });
    }
    // Aggregate orders by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    const pipeline = [
      { $match: {
          'items.productId': { $in: productIds },
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      { $unwind: '$items' },
      { $match: { 'items.productId': { $in: productIds } } },
      { $project: {
          month: { $dateToString: { format: '%b-%Y', date: '$createdAt' } },
          amount: '$items.amount',
          quantity: '$items.quantity',
          productId: '$items.productId'
        }
      },
      { $group: {
          _id: '$month',
          revenue: { $sum: { $multiply: [ { $ifNull: ['$amount', 0] }, { $ifNull: ['$quantity', 1] } ] } },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ];
    const agg = await Order.aggregate(pipeline);
    // Fill in months with zero if missing
    const months = generateLast6MonthsData();
    const monthMap = {};
    agg.forEach(m => { monthMap[m._id] = m; });
    const result = months.map(m => ({
      month: m.month + '-' + m.fullDate.getFullYear(),
      revenue: monthMap[m.month + '-' + m.fullDate.getFullYear()]?.revenue || 0,
      orders: monthMap[m.month + '-' + m.fullDate.getFullYear()]?.orders || 0
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
};

// Get category-wise sales data
const getSellerCategoryData = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    
    // Get seller's products with categories
    const products = await Product.find({ seller: sellerId }).populate('category');
    
    // Group by category and calculate sales
    const categoryMap = {};
    
    products.forEach(product => {
      const categoryName = product.category.name;
      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = {
          name: categoryName,
          value: 0,
          count: 0,
          color: getRandomColor()
        };
      }
      categoryMap[categoryName].value += product.price;
      categoryMap[categoryName].count += 1;
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
};

// Get recent orders
const getSellerRecentOrders = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const limit = parseInt(req.query.limit) || 5;
    
    // Get seller's products
    const products = await Product.find({ seller: sellerId });
    const productIds = products.map(p => p._id);
    
    // Get recent orders
    const orders = await Order.find({
      'items.productId': { $in: productIds }
    })
    .populate('user', 'name')
    .populate('items.productId', 'name')
    .sort({ createdAt: -1 })
    .limit(limit);
    
    // Format orders for display
    const formattedOrders = orders.map(order => {
      const sellerItems = order.items.filter(item => 
        productIds.some(id => id.toString() === item.productId._id.toString())
      );
      
      return {
        id: order._id.toString(),
        customer: order.user.name,
        amount: sellerItems.reduce((sum, item) => sum + item.amount, 0),
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
};

// Get product performance data
const getSellerProductPerformance = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    
    // Get seller's products with real performance data
    const products = await Product.find({ seller: sellerId })
      .populate('category', 'name')
      .sort({ totalRevenue: -1, salesCount: -1 }) // Sort by performance
      .limit(10);
    
    // Get additional order data for last sold date
    const productIds = products.map(p => p._id);
    
    // Get last sold date for each product
    const lastSoldData = await Order.aggregate([
      {
        $match: {
          'items.productId': { $in: productIds },
          status: { $in: ['confirmed', 'shipped', 'delivered'] }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $match: {
          'items.productId': { $in: productIds }
        }
      },
      {
        $group: {
          _id: '$items.productId',
          lastSoldAt: { $max: '$createdAt' }
        }
      }
    ]);
    
    // Create a map for quick lookup
    const lastSoldMap = {};
    lastSoldData.forEach(item => {
      lastSoldMap[item._id.toString()] = item.lastSoldAt;
    });
    
    // Format performance data with real values
    const performanceData = products.map(product => ({
      id: product._id,
      name: product.name,
      category: product.category?.name || 'Uncategorized',
      sales: product.salesCount || 0,
      revenue: product.totalRevenue || 0,
      stock: product.stock || 0,
      rating: product.averageRating || 0,
      lastSold: lastSoldMap[product._id.toString()] 
        ? new Date(lastSoldMap[product._id.toString()]).toLocaleDateString()
        : 'Never sold'
    }));
    console.log('Returning product performance data:', performanceData);
    
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
};

// Update product status
const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const sellerId = req.user.userId;
    
    const product = await Product.findOne({ _id: id, seller: sellerId });
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }
    
    // Update stock to 0 if inactive, restore if active
    if (status === 'inactive') {
      product.stock = 0;
    } else if (status === 'active' && product.stock === 0) {
      product.stock = 1; // Set to 1 as default
    }
    
    await product.save();
    
    res.json({
      success: true,
      message: "Product status updated successfully",
      data: product
    });
    
  } catch (error) {
    console.error("Error updating product status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product status",
      error: error.message
    });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const sellerId = req.user.userId;
    
    // Verify seller owns products in this order
    const products = await Product.find({ seller: sellerId });
    const productIds = products.map(p => p._id);
    
    const order = await Order.findOne({
      _id: id,
      'items.productId': { $in: productIds }
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    order.status = status;
    await order.save();
    
    res.json({
      success: true,
      message: "Order status updated successfully",
      data: order
    });
    
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message
    });
  }
};

// Helper function to generate random colors
const getRandomColor = () => {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];
  return colors[Math.floor(Math.random() * colors.length)];
};

// @desc    Get seller's average rating and total ratings
// @route   GET /api/seller/:sellerId/ratings
// @access  Public
const getSellerRatings = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    // Aggregate all reviews for this seller
    const result = await Review.aggregate([
      { $match: { seller: mongoose.Types.ObjectId(sellerId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalRatings: { $sum: 1 }
        }
      }
    ]);
    const averageRating = result[0]?.averageRating || 0;
    const totalRatings = result[0]?.totalRatings || 0;
    res.status(200).json({
      success: true,
      data: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings
      }
    });
  } catch (error) {
    console.error("Error getting seller ratings:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all products for a given sellerId (public or for dashboard use)
const getProductsBySellerId = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    if (!sellerId) return res.status(400).json({ success: false, message: 'Missing sellerId' });
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    // Sorting
    const sortField = req.query.sort || 'salesCount';
    const sortOrder = req.query.order === 'asc' ? 1 : -1;
    const sortObj = {};
    sortObj[sortField] = sortOrder;
    // Query
    const total = await Product.countDocuments({ seller: sellerId });
    const products = await Product.find({ seller: sellerId })
      .populate('category', 'name')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);
    const pages = Math.ceil(total / limit);
    res.json({
      success: true,
      data: products,
      pagination: { page, pages, total, limit }
    });
  } catch (error) {
    console.error('Error fetching products by sellerId:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products', error: error.message });
  }
};

module.exports = {
  getSellerDashboardStats,
  getSellerProducts,
  getSellerOrders,
  getSellerReviews,
  getSellerAnalytics,
  getSellerRevenueChart,
  getSellerCategoryData,
  getSellerRecentOrders,
  getSellerProductPerformance,
  updateProductStatus,
  updateOrderStatus,
  getSellerRatings,
  getProductsBySellerId,
};
