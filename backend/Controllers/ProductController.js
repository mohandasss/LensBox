const Product = require("../Models/Products");
const Order = require("../Models/orderModel");
const User = require("../Models/UserModel");
const cloudinary = require("../Config/cloudanary");
const axios = require('axios');
const { Readable } = require('stream');
const Review = require('../Models/Review');
const { sendStockNotifications } = require('./StockNotificationController');
const { log } = require("console");

// Function to upload image from URL to Cloudinary
const uploadFromUrl = async (imageUrl) => {
  try {
    // Download the image
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    
    // Convert buffer to stream
    const stream = cloudinary.uploader.upload_stream(
      { folder: "productsLensbox" },
      (error, result) => {
        if (error) throw error;
        return result;
      }
    );
    
    // Create a readable stream and pipe to Cloudinary
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "productsLensbox" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      readableStream.pipe(uploadStream);
    });
  } catch (error) {
    console.error('Error uploading image from URL:', error);
    throw error;
  }
};

const categorymappedwithid = {
  camera: "507f1f77bcf86cd799439011",
  lens: "507f1f77bcf86cd799439012",
  equipment: "507f1f77bcf86cd799439013",}



  const getDashboardStats = async (req, res) => {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
      const sixtyDaysAgo = new Date(now.getTime() - (60 * 24 * 60 * 60 * 1000));

      // Get current period stats (last 30 days)
      const [currentStats] = await Order.aggregate([
        {
          $match: {
            status: { $ne: 'cancelled' }, // Exclude cancelled orders
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $unwind: "$items" // Unwind the items array to calculate per-item totals
        },
        {
          $group: {
            _id: null,
            totalRevenue: { 
              $sum: { 
                $multiply: ["$items.price", "$items.quantity"] 
              } 
            },
            totalOrders: { $sum: 1 }
          }
        }
      ]);

      // Get previous period stats (30-60 days ago)
      const [previousStats] = await Order.aggregate([
        {
          $match: {
            status: { $ne: 'cancelled' }, // Exclude cancelled orders
            createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
          }
        },
        {
          $unwind: "$items" // Unwind the items array to calculate per-item totals
        },
        {
          $group: {
            _id: null,
            totalRevenue: { 
              $sum: { 
                $multiply: ["$items.price", "$items.quantity"] 
              } 
            },
            totalOrders: { $sum: 1 }
          }
        }
      ]);

      // Get total products count
      const totalProducts = await Product.countDocuments();
      
      // Get new products added in current period
      const newProducts = await Product.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
      });

      // Get active users (last 30 days and previous 30 days)
      const activeUsers = await User.countDocuments({
        lastActive: { $gte: thirtyDaysAgo }
      });

      const previousActiveUsers = await User.countDocuments({
        lastActive: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
      });

      // Calculate percentage changes
      const calculateChange = (current, previous) => {
        if (!previous || previous === 0) return 100; // Handle division by zero
        return ((current - previous) / previous) * 100;
      };

      // Get user statistics
      const [userStats] = await User.aggregate([
        {
          $group: {
            _id: null,
            totalUsers: { $sum: 1 },
            newUsers: {
              $sum: {
                $cond: [{ $gte: ["$createdAt", thirtyDaysAgo] }, 1, 0]
              }
            },
            adminUsers: {
              $sum: { $cond: [{ $eq: ["$role", "admin"] }, 1, 0] }
            }
          }
        }
      ]);

      // Get order statistics
      const [orderStats] = await Order.aggregate([
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            completedOrders: { $sum: 1 }, // assume all are completed for now
            pendingOrders: { $sum: 0 },   // no pending orders yet
            cancelledOrders: { $sum: 0 }, // no cancelled orders yet
            totalRevenue: { $sum: "$total" } // summing total field from each order
          }
        }
      ]);
      

      // Get product statistics
      const [productStats] = await Product.aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalStock: { $sum: "$stock" },
            averagePrice: { $avg: "$price" },
            categories: { $addToSet: "$category" }
          }
        }
      ]);

      // Format the response with comprehensive stats
      const response = {
        // Revenue Section
        revenue: {
          total: orderStats?.totalRevenue || 0,
          change: calculateChange(
            orderStats?.totalRevenue || 0,
            previousStats?.totalRevenue || 0
          ),
          currency: "INR"
        },
        
        // Orders Section
        orders: {
          total: orderStats?.totalOrders || 0,
          change: calculateChange(
            orderStats?.totalOrders || 0,
            previousStats?.totalOrders || 0
          ),
          completed: orderStats?.completedOrders || 0,
          pending: orderStats?.pendingOrders || 0,
          cancelled: orderStats?.cancelledOrders || 0
        },
        
        // Products Section
        products: {
          total: productStats?.totalProducts || 0,
          change: calculateChange(
            newProducts,
            totalProducts - newProducts
          ),
          inStock: productStats?.totalStock || 0,
          avgPrice: productStats?.averagePrice?.toFixed(2) || 0,
          categories: productStats?.categories?.length || 0
        },
        
        // Users Section
        users: {
          total: userStats?.totalUsers || 0,
          active: activeUsers,
          change: calculateChange(activeUsers, previousActiveUsers),
          newUsers: userStats?.newUsers || 0,
          admins: userStats?.adminUsers || 0
        }
      };

      res.status(200).json({ message: "Dashboard stats", stats: response });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  
  
const addProduct = async (req, res) => {
  try {
    const { name, price, description, category, stock, features } = req.body;

    // 🛑 Validate Required Fields
    if (!name || !price || !description || !category || !stock || !features) {
      return res
        .status(400)
        .json({ error: "All fields are required." });
    }

    // 🛑 Check If Image File Exists
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: "Image is required." });
    }

    const imageFiles = Array.isArray(req.files.image) ? req.files.image : [req.files.image];
    const uploadedImages = [];

    // Upload all images to Cloudinary
    for (const file of imageFiles) {
      const uploadedResponse = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "productsLensbox",
      });
      uploadedImages.push(uploadedResponse.secure_url);
    }

    // Parse features if it's a JSON string
    let parsedFeatures = features;
    if (typeof features === 'string') {
      try {
        parsedFeatures = JSON.parse(features);
      } catch (error) {
        parsedFeatures = [features];
      }
    }

    // ✅ Save Product to MongoDB with a Unique SKU and seller from auth
    const newProduct = new Product({
      sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      description,
      price,
      category,
      stock,
      seller: req.user.userId, // Use authenticated user's ID as seller
      features: parsedFeatures,
      image: uploadedImages,
    });

    await newProduct.save();
    res.status(201).json({ 
      success: true,
      message: "Product added successfully", 
      product: newProduct 
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ error: "Failed to add product" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, price, description, category, stock, features } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Store old stock value to check if stock was increased from 0
    const oldStock = product.stock;

    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.category = category || product.category;
    product.stock = stock || product.stock;
    product.features = features || product.features;

    if (req.files && req.files.image) {
      if (product.image && typeof product.image === "string") {
        const publicId = product.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }

      const uploadedResponse = await cloudinary.uploader.upload(req.files.image.tempFilePath, {
        folder: "products",
      });
      product.image = uploadedResponse.secure_url;
    }

    await product.save();

    // Send stock notifications if stock was increased from 0
    if (oldStock === 0 && product.stock > 0) {
      try {
        await sendStockNotifications(product._id);
        console.log(`📧 Stock notifications sent for product: ${product.name}`);
      } catch (notificationError) {
        console.error('Error sending stock notifications:', notificationError);
        // Don't fail the update if notifications fail
      }
    }

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    
    // Find product and verify ownership
    const product = await Product.findOne({ _id: id, seller: userId });

    if (!product) {
      return res.status(404).json({ error: "Product not found or not owned by seller" });
    }

    // Delete images from Cloudinary if they exist
    if (product.image && Array.isArray(product.image)) {
      for (const imageUrl of product.image) {
        try {
          const publicId = imageUrl.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        } catch (cloudinaryError) {
          console.error('Error deleting image from Cloudinary:', cloudinaryError);
          // Continue with deletion even if Cloudinary fails
        }
      }
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;
    
    const total = await Product.countDocuments({ active: true });
    const products = await Product.find({ active: true })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }
    
    res.json({
      data: products,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};


const searchSuggestions = async (req, res) => {
  try {
    console.log('Search suggestions request received:', {
      query: req.query,
      body: req.body,
      params: req.params
    });

    const query = req.query.q || req.body.q || '';
    
    if (!query || query.trim() === '') {
      console.log('Empty query, returning empty suggestions');
      return res.status(200).json({
        success: true,
        data: []
      });
    }
    
    console.log('Processing search suggestions for query:', query);

    // First, try to find exact matches at the start of the name
    const exactMatchPipeline = [
      {
        $match: {
          active: true,
          name: { $regex: `^${query}`, $options: 'i' }
        }
      },
      { $limit: 5 },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: 1,
          category: '$categoryInfo.name',
          score: 2 // High score for exact start matches
        }
      }
    ];

    // If we don't have enough exact matches, find partial matches
    const partialMatchPipeline = [
      {
        $match: {
          active: true,
          $and: [
            { name: { $regex: query, $options: 'i' } },
            { name: { $not: { $regex: `^${query}`, $options: 'i' } } }
          ]
        }
      },
      { $limit: 5 },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $project: {
          _id: 0,
          id: '$_id',
          name: 1,
          category: '$categoryInfo.name',
          score: 1 // Lower score for partial matches
        }
      }
    ];

    console.log('Running exact match pipeline...');
    const exactMatches = await Product.aggregate(exactMatchPipeline);
    console.log(`Found ${exactMatches.length} exact matches`);

    let suggestions = exactMatches;
    
    // If we need more suggestions, get partial matches
    if (exactMatches.length < 5) {
      const limit = 5 - exactMatches.length;
      console.log(`Fetching up to ${limit} partial matches...`);
      
      const partialMatches = await Product.aggregate([
        ...partialMatchPipeline.slice(0, 1), // Take the match stage
        { $limit: limit },
        ...partialMatchPipeline.slice(1) // Take the rest of the pipeline
      ]);
      
      console.log(`Found ${partialMatches.length} partial matches`);
      suggestions = [...exactMatches, ...partialMatches];
    }

    console.log('Total suggestions found:', suggestions.length);
    console.log('Sample suggestions:', suggestions.slice(0, 2));

    res.status(200).json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Search suggestions error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      query: req.query,
      body: req.body
    });
    
    // Check if this is a MongoDB error
    if (error.name === 'MongoServerError') {
      console.error('MongoDB Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Database error occurred while fetching suggestions',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to get search suggestions',
      ...(process.env.NODE_ENV === 'development' && { 
        details: error.message,
        stack: error.stack 
      })
    });
  }
};

const searchProducts = async (req, res) => {
  try {
    // Get search parameters from both query params and request body
    const searchTerm = req.query.q || req.body.searchTerm || req.body.q;
    const category = req.query.category || req.body.selectedCategory || req.body.category;
    const page = parseInt(req.query.page || req.body.page || '1');
    const limit = parseInt(req.query.limit || req.body.limit || '15');
    const skip = (page - 1) * limit;

    // Validate search term exists
    if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim() === '') {
      return res.status(400).json({ 
        success: false,
        error: 'Search term is required',
        example: { 
          GET: '/api/products/search?q=camera&category=lens&page=1&limit=15',
          POST: '{"searchTerm": "camera", "category": "lens", "page": 1, "limit": 15}'
        } 
      });
    }

    // Build search query
    const searchQuery = {
      active: true, // Only search active products
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { features: { $in: [new RegExp(searchTerm, 'i')] } },
        { sku: { $regex: searchTerm, $options: 'i' } }
      ]
    };

    // Add category filter if provided
    if (category && category !== 'all') {
      searchQuery.category = categorymappedwithid[category] || category;
    }

    // Execute search with pagination
    const total = await Product.countDocuments(searchQuery);
    const products = await Product.find(searchQuery)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('category', 'name');

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Return results
    res.status(200).json({
      success: true,
      message: 'Search completed successfully',
      data: products,
      meta: {
        total,
        count: products.length,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPreviousPage
      }
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Search failed',
      message: 'An error occurred while processing your search',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const getProductByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { location, dateranges } = req.body;
    const products = await Product.find({ category });
    res.status(200).json({ message: "Products found", products });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


const getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.categoryId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    // Validate categoryId is a valid ObjectId
    if (!categoryId || !categoryId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const total = await Product.countDocuments({ category: categoryId, active: true });
    const products = await Product.find({ category: categoryId, active: true })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({ 
      message: "Products found", 
      products,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      limit
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: "Server error" });
  }
};




const getSalesOverview = async (req, res) => {
  try {
    // Get sales data for the last 6 months by default
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Initialize array for the last 6 months
    const monthsData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      monthsData.push({
        month: monthNames[date.getMonth()],
        year: date.getFullYear(),
        startDate: new Date(date.getFullYear(), date.getMonth(), 1),
        endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
      });
    }

    // Get total revenue for the current period
    const revenueData = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' },
          createdAt: { $gte: monthsData[0].startDate, $lte: monthsData[monthsData.length - 1].endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalSales: { $sum: '$total' }
        }
      }
    ]);

    // Create a map of month-year to sales
    const salesMap = new Map();
    revenueData.forEach(item => {
      const key = `${monthNames[item._id.month - 1]}-${item._id.year}`;
      salesMap.set(key, item.totalSales);
    });

    // Format the response to match the sample
    const formattedData = monthsData.map(({ month, year }) => {
      const key = `${month}-${year}`;
      // For the current month, use the average daily sales * 30 for estimation
      if (month === monthNames[currentMonth] && year === currentYear) {
        const dailyAvg = salesMap.get(key) ? salesMap.get(key) / currentDate.getDate() : 0;
        return {
          month,
          sales: Math.round(dailyAvg * 30) // Estimated monthly sales
        };
      }
      return {
        month,
        sales: salesMap.get(key) || 0
      };
    });

    res.status(200).json({ data: formattedData });
  } catch (error) {
    console.error('Error fetching sales overview:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getSalesByCategory = async (req, res) => {
  try {
    const salesData = await Order.aggregate([
      {
        $match: { status: { $ne: 'cancelled' } }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalSales: { $sum: { $multiply: ['$items.quantity', '$items.amount'] } },
          count: { $sum: '$items.quantity' }
        }
      },
      {
        $project: {
          _id: 0,
          categoryId: '$_id',
          name: {
            $switch: {
              branches: [
                { 
                  case: { $eq: [{ $toString: '$_id' }, '507f1f77bcf86cd799439011'] }, 
                  then: 'Camera' 
                },
                { 
                  case: { $eq: [{ $toString: '$_id' }, '507f1f77bcf86cd799439012'] }, 
                  then: 'Lens' 
                },
                { 
                  case: { $eq: [{ $toString: '$_id' }, '507f1f77bcf86cd799439013'] }, 
                  then: 'Equipment' 
                }
              ],
              default: 'Other'
            }
          },
          value: { $round: ['$totalSales', 2] },
          count: 1,
          color: {
            $switch: {
              branches: [
                { 
                  case: { $eq: [{ $toString: '$_id' }, '507f1f77bcf86cd799439011'] }, 
                  then: '#8b5cf6' 
                },
                { 
                  case: { $eq: [{ $toString: '$_id' }, '507f1f77bcf86cd799439012'] }, 
                  then: '#06b6d4' 
                },
                { 
                  case: { $eq: [{ $toString: '$_id' }, '507f1f77bcf86cd799439013'] }, 
                  then: '#10b981' 
                }
              ],
              default: '#6b7280'
            }
          }
        }
      },
      { $sort: { value: -1 } }
    ]);

    res.status(200).json({ data: salesData });
  } catch (error) {
    console.error('Error fetching sales by category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 15; // Fixed at 15 items per page as per requirement
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Order.countDocuments({});
    const pages = Math.ceil(total / limit);

    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .populate({
        path: 'items.productId',
        select: 'name image', // Include image field in the population
        options: { lean: true }
      })
      .lean();

    const formattedOrders = orders.map(order => {
      const itemCount = order.items.reduce((total, item) => total + (item.quantity || 0), 0);
      
      // Get the first item with a valid product and image
      const firstItemWithImage = order.items.find(item => 
        item.productId?.image?.length > 0
      );

      // Get the first image from the first product with images, or use a placeholder
      const productImage = firstItemWithImage?.productId?.image?.[0] || 
                          'https://via.placeholder.com/100x100?text=No+Image';

      return {
        id: `#${order._id.toString().substring(18, 24)}`,
        customer: order.customerDetails?.fullName || 'Guest User',
        email: order.customerDetails?.email || order.user?.email || 'no-email@example.com',
        amount: order.total || 0,
        status: order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown',
        date: order.createdAt ? order.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        items: itemCount,
        payment: 'Paid',
        productImage: productImage
      };
    });

    res.status(200).json({
      data: formattedOrders,
      pagination: {
        total,
        page,
        pages,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching paginated orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getRecentOrders = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('user', 'name email')
      .populate({
        path: 'items.productId',
        select: 'name image',
        options: { lean: true }
      })
      .lean();

    const formattedOrders = orders.map(order => {
      const itemCount = order.items.reduce((total, item) => total + (item.quantity || 0), 0);
      
      // Get the first item with a valid product and image
      const firstItemWithImage = order.items.find(item => 
        item.productId?.image?.length > 0
      );

      // Get the first image from the first product with images, or use a placeholder
      const productImage = firstItemWithImage?.productId?.image?.[0] || 
                          'https://via.placeholder.com/100x100?text=No+Image';
      
      return {
        id: `#${order._id.toString().substring(18, 24)}`,
        customer: order.customerDetails?.fullName || 'Guest User',
        email: order.customerDetails?.email || order.user?.email || 'no-email@example.com',
        amount: order.total || 0,
        status: order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown',
        date: order.createdAt ? order.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        items: itemCount,
        payment: 'Paid',
        productImage: productImage
      };
    });

    res.status(200).json({ data: formattedOrders });
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const salesdata = async (req, res) => {
  try {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Get data for the last 12 months
    const monthlySales = await Order.aggregate([
      {
        $match: {
          status: { $ne: 'cancelled' },
          createdAt: { $gte: new Date(currentYear - 1, currentDate.getMonth(), 1) }
        }
      },
      {
        $project: {
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
          total: 1,
          items: 1
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            month: '$month',
            year: '$year'
          },
          totalSales: { $sum: { $multiply: ['$items.quantity', '$items.amount'] } },
          orderCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          month: '$_id.month',
          year: '$_id.year',
          monthName: {
            $let: {
              vars: { months: monthNames },
              in: { $arrayElemAt: ['$$months', { $subtract: ['$_id.month', 1] }] }
            }
          },
          totalSales: 1,
          orderCount: 1
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]);

    // Format the response to include all months, even those with no sales
    const formattedData = [];
    const startDate = new Date(currentYear - 1, currentDate.getMonth(), 1);
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(startDate);
      date.setMonth(startDate.getMonth() + i);
      
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const monthName = monthNames[date.getMonth()];
      
      const monthData = monthlySales.find(
        m => m.month === month && m.year === year
      );
      
      formattedData.push({
        month: monthName,
        year: year,
        sales: monthData ? Math.round(monthData.totalSales) : 0,
        orderCount: monthData ? monthData.orderCount : 0
      });
    }

    res.status(200).json({ data: formattedData });
  } catch (error) {
    console.error('Error fetching monthly sales data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};




const getProductStats = async (req, res) => {
  try {
    // Get all products with their stock information
    const products = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $project: {
          _id: 1,
          name: 1,
          sku: 1,
          price: 1,
          stock: 1,
          image: { $arrayElemAt: ['$image', 0] }, // Get first image
          category: '$categoryInfo.name',
          status: {
            $switch: {
              branches: [
                { case: { $lte: ['$stock', 0] }, then: 'Out of Stock' },
                { case: { $lt: ['$stock', 5] }, then: 'Low Stock' },
                { case: { $gte: ['$stock', 5] }, then: 'In Stock' }
              ],
              default: 'In Stock'
            }
          }
        }
      },
      { $sort: { stock: 1 } } // Sort by stock (out of stock first)
    ]);

    // Calculate statistics
    const totalProducts = products.length;
    const outOfStock = products.filter(p => p.stock <= 0).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock < 5).length;
    const inStock = products.filter(p => p.stock >= 5).length;

    // Format response
    const response = {
      statistics: {
        totalProducts,
        outOfStock,
        lowStock,
        inStock
      },
      products: products.map(p => ({
        id: p._id,
        name: p.name,
        sku: p.sku,
        price: p.price,
        stock: p.stock,
        image: p.image,
        category: p.category,
        status: p.status
      }))
    };

    res.status(200).json({ data: response });
  } catch (error) {
    console.error('Error fetching product statistics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserStats = async (req, res) => {
  try {
    console.log("📊 Starting aggregation to get user stats...");

    const userStats = await User.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          createdAt: 1,
          profilePic: 1, // ✅ include it early so it's available later
          orderCount: { $size: '$orders' },
          totalSpent: {
            $reduce: {
              input: '$orders',
              initialValue: 0,
              in: {
                $add: ['$$value', { $ifNull: ['$$this.total', 0] }]
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          createdAt: 1, // ✅ required for sorting
          joinDate: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          orderCount: 1,
          totalSpent: { $round: ['$totalSpent', 2] },
          profilePic: {
            $ifNull: ['$profilePic', 'https://yourdomain.com/default-avatar.png'] // Optional fallback
          }
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    console.log("✅ Aggregation complete. User stats:");
    console.log(JSON.stringify(userStats, null, 2));

    res.status(200).json({ data: userStats });
  } catch (error) {
    console.error('❌ Error fetching user statistics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};



const addBulkProducts = async (req, res) => {
  try {
    const { products } = req.body;
    console.log('Received products:', JSON.stringify(products, null, 2));
    
    // Validate input
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Products array is required and must not be empty' 
      });
    }

    // Validate each product and process images
    const processedProducts = await Promise.all(products.map(async (product, index) => {
      const { name, price, description, category, stock, seller, features, image } = product;
      const productIdentifier = name ? `"${name}"` : `at index ${index}`;

      // Check for missing required fields
      const missingFields = [];
      if (!name) missingFields.push('name');
      if (!price) missingFields.push('price');
      if (!description) missingFields.push('description');
      if (!category) missingFields.push('category');
      if (!stock) missingFields.push('stock');
      if (!seller) missingFields.push('seller');
      if (!features || !features.length) missingFields.push('features');
      if (!image) missingFields.push('image');

      if (missingFields.length > 0) {
        throw new Error(`Product ${productIdentifier} is missing required fields: ${missingFields.join(', ')}`);
      }

      try {
        // Generate SKU first (in case image upload fails, we still have the SKU for error tracking)
        const sku = `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Upload image to Cloudinary if image URL is provided
        let imageUrl = '';
        if (image) {
          try {
            const uploadedImage = await uploadFromUrl(image);
            imageUrl = uploadedImage.secure_url;
          } catch (uploadError) {
            console.error(`Failed to upload image for product ${productIdentifier}:`, uploadError);
            throw new Error(`Failed to upload image for product ${productIdentifier}. ${uploadError.message}`);
          }
        } else {
          throw new Error(`No image URL provided for product ${productIdentifier}`);
        }

        return {
          sku,
          name,
          description,
          price,
          category,
          stock,
          seller,
          features: Array.isArray(features) ? features : [features],
          image: [imageUrl]
        };
      } catch (error) {
        console.error(`Error processing product ${productIdentifier}:`, error);
        throw error; // Re-throw to be caught by the outer try-catch
      }
    }));

    // Insert all products into the database
    const createdProducts = await Product.insertMany(processedProducts);

    res.status(201).json({
      success: true,
      message: `${createdProducts.length} products added successfully`,
      data: createdProducts
    });

  } catch (error) {
    console.error('Error in bulk product creation:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add products in bulk',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// Get seller information by product ID
const getSellerInfo = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log(productId);

    // Find the product to get the seller ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Find the seller information
    const seller = await User.findById(product.seller);
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Aggregate all reviews for this seller
    const result = await Review.aggregate([
      { $match: { seller: seller._id } },
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
      seller: {
        name: seller.name,
        profilePic: seller.cloudinaryUrl || seller.profilePic || '',
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings
      }
    });
  } catch (error) {
    console.error('Error getting seller info:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get random related products from the same category
// @route   GET /api/products/:productId/related
// @access  Public
const getRelatedProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId).select('category');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    // Find other products in the same category, excluding the current product
    const relatedProducts = await Product.aggregate([
      { $match: { category: product.category, _id: { $ne: product._id } } },
      { $sample: { size: 4 } } // Return 4 random products
    ]);
    res.status(200).json({
      success: true,
      data: relatedProducts
    });
  } catch (error) {
    console.error('Error getting related products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle product active status (enable/disable)
const toggleProductActive = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const product = await Product.findOne({ _id: id, seller: userId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found or not owned by seller' });
    }
    product.active = !product.active;
    await product.save();
    res.json({ success: true, active: product.active, message: `Product is now ${product.active ? 'active' : 'inactive'}` });
  } catch (error) {
    console.error('Error toggling product active status:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle product status', error: error.message });
  }
};

const getProductNames = async (req, res) => {
  try {
    const q = req.query.q || '';
    if (!q || typeof q !== 'string' || q.trim() === '') {
      return res.status(400).json({ error: 'Query parameter q is required' });
    }
    const names = await Product.find({
      name: { $regex: q, $options: 'i' },
      active: true
    })
      .limit(10)
      .select('name -_id');
    res.json({ names: names.map(n => n.name) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product names' });
  }
};

const getMostPopularProducts = async (req, res) => {
  try {
    console.log(req.query);
    const limit = parseInt(req.query.limit) || 7;
    
    
    // Sort by salesCount descending, then by createdAt descending for tie-breaker
    const products = await Product.find({ active: true })
      .sort({ salesCount: -1, createdAt: -1 })
      .limit(limit);
    if (!products || products.length === 0) {
      return res.status(404).json({ success: false, message: 'No popular products found' });
    }
    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error in getMostPopularProducts:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch most popular products', error: error.message });
  }
};

// Get top 10 products by salesCount (high to low)
const getTopTenProductsBySalesCount = async (req, res) => {
  console.log('getTopTenProductsBySalesCount called');
  try {
    console.log('Querying for active products...');
    
    // Add proper validation and error handling
    const products = await Product.find({ 
      active: true,
      salesCount: { $exists: true, $gte: 0 } // Ensure salesCount field exists
    })
    .select('name price description image category stock seller salesCount averageRating reviewCount sku') // Select only needed fields
    .sort({ salesCount: -1 })
    .limit(10)
    .populate('category', 'name') // Populate category if needed
    .populate('seller', 'name email') // Populate seller if needed
    .lean(); // Use lean() for better performance

    console.log('Query result:', products);
    
    // Check if products exist
    if (!products || products.length === 0) {
      console.log('No products found');
      return res.status(200).json({ 
        success: true, 
        message: 'No products found',
        data: []
      });
    }

    console.log(`Found ${products.length} products`);
    
    // Return success response
    res.status(200).json({
      success: true,
      count: products.length,
      message: 'Top products fetched successfully',
      data: products
    });

  } catch (error) {
    console.error('Error in getTopTenProductsBySalesCount:', error);
    
    // More detailed error handling
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid query parameters',
        error: error.message 
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Data validation error',
        error: error.message 
      });
    }

    // Generic server error
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch top products', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  addProduct,
  updateProduct,
  getSellerInfo,
  deleteProduct,
  getProductById,
  getAllProducts,
  searchProducts,
  searchSuggestions,
  getProductsByCategory,
  getDashboardStats,
  getSalesOverview,
  getSalesByCategory,
  getRecentOrders,
  getAllOrders,
  salesdata,
  getUserStats,
  getProductStats,
  addBulkProducts,
  getRelatedProducts,
  toggleProductActive,
  getProductNames,
  getMostPopularProducts,
  getTopTenProductsBySalesCount
};
// Bulk product creation function

