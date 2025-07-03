const Product = require("../Models/Products");
const Order = require("../Models/orderModel");
const User = require("../Models/UserModel");
const Category = require("../Models/Category");

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
    const sellerId = req.user.id;
    console.log('🔍 DEBUG: Current user ID from token:', sellerId);
    console.log('🔍 DEBUG: Expected seller ID:', '686559295a8b8364ffd488b0');
    
    // Get seller's products
    const products = await Product.find({ seller: sellerId });
    const productIds = products.map(p => p._id);
    
    // Get orders containing seller's products
    const orders = await Order.find({
      'items.productId': { $in: productIds }
    }).populate('items.productId');
    
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
    const sellerId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const products = await Product.find({ seller: sellerId })
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalProducts = await Product.countDocuments({ seller: sellerId });
    const totalPages = Math.ceil(totalProducts / limit);
    
    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        pages: totalPages,
        total: totalProducts,
        limit
      }
    });
    
  } catch (error) {
    console.error("Error fetching seller products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message
    });
  }
};

// Get seller's orders
const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;
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
    const sellerId = req.user.id;
    
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

// Get revenue chart data
const getSellerRevenueChart = async (req, res) => {
  try {
    const sellerId = req.user.id;
    
    // Generate last 6 months data
    const months = generateLast6MonthsData();
    
    // Mock revenue data for each month
    const revenueData = months.map((month, index) => ({
      month: month.month,
      revenue: Math.floor(Math.random() * 5000) + 3000, // Random revenue between 3000-8000
      orders: Math.floor(Math.random() * 50) + 20 // Random orders between 20-70
    }));
    
    res.json({
      success: true,
      data: revenueData
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
    const sellerId = req.user.id;
    
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
    const sellerId = req.user.id;
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
        id: order._id.toString().slice(-8),
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
    const sellerId = req.user.id;
    
    // Get seller's products
    const products = await Product.find({ seller: sellerId })
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Mock performance data
    const performanceData = products.map(product => ({
      id: product._id,
      name: product.name,
      category: product.category.name,
      sales: Math.floor(Math.random() * 50) + 10,
      revenue: Math.floor(Math.random() * 5000) + 1000,
      stock: product.stock,
      rating: (Math.random() * 2 + 3).toFixed(1) // Random rating between 3-5
    }));
    
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
    const sellerId = req.user.id;
    
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
    const sellerId = req.user.id;
    
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
  updateOrderStatus
};
