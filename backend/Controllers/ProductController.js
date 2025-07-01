const Product = require("../Models/Products");
const Order = require("../Models/orderModel");
const User = require("../Models/UserModel");
const cloudinary = require("../Config/cloudanary");
  


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
    const { name, price, description, category, stock, seller, features } = req.body;

    // 🛑 Validate Required Fields
    if (!name || !price || !description || !category || !stock || !seller || !features) {
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

    // ✅ Save Product to MongoDB with a Unique SKU
    const newProduct = new Product({
      sku: `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name,
      description,
      price,
      category,
      stock,
      seller,
      features,
      image: uploadedImages,
    });

    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
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
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const publicId = product.image.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(publicId);

    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
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
    const products = await Product.find();
    if (products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};


const searchProducts = async (req, res) => {
  try {
    // Get search term from query params or request body
    const search = req.query.q || req.body.searchTerm;
    const category = req.query.category || req.body.selectedCategory;

    // Validate search term exists
    if (!search || typeof search !== 'string' || search.trim() === '') {
      return res.status(400).json({ 
        error: 'Search term is required',
        example: '/api/products/search?q=camera' 
      });
    }

    // Build search query
    const searchQuery = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { features: { $in: [new RegExp(search, 'i')] } }
      ]
    };

    // Add category filter if provided
    if (category) {
      searchQuery.category = category;
    }

    // Execute search
    const products = await Product.find(searchQuery);

    // Return results
    res.json({
      success: true,
      count: products.length,
      data: products
    });
    
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Search failed',
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
    console.log(req.params);
    const category = req.params.categoryId;
    
    const categoryId = categorymappedwithid[category];
    
    // Add validation for invalid category
    if (!categoryId) {
      return res.status(400).json({ message: "Invalid category" });
    }
    
    const products = await Product.find({ category: categoryId });
    
    res.status(200).json({ message: "Products found", products });
  } catch (error) {
    console.error('Error fetching products:', error); // Better error logging
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
        status: 'Completed',
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
        status: 'Completed',
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


module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
  getProductById,
  getAllProducts,
  searchProducts,
  getProductsByCategory,
  getDashboardStats,
  getSalesOverview,
  getSalesByCategory,
  getRecentOrders,
  getAllOrders,
  salesdata,
  getUserStats,
  getProductStats
};
