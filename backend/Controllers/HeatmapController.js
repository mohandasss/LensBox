const Order = require("../Models/orderModel");
const Product = require("../Models/Products");

/**
 * Get heatmap data for admin dashboard (all orders)
 */
const getAdminHeatmapData = async (req, res) => {
  try {
    // Aggregate orders by location with count
    const heatmapData = await Order.aggregate([
      // Only include orders with valid coordinates
      {
        $match: {
          'location.lat': { $ne: null },
          'location.lng': { $ne: null }
        }
      },
      // Group by rounded coordinates (to cluster nearby locations)
      {
        $group: {
          _id: {
            lat: { $round: ['$location.lat', 2] }, // Round to 2 decimal places (~1km precision)
            lng: { $round: ['$location.lng', 2] }
          },
          count: { $sum: 1 },
          orders: { $push: '$$ROOT' }
        }
      },
      // Project to desired format
      {
        $project: {
          _id: 0,
          lat: '$_id.lat',
          lng: '$_id.lng',
          count: 1,
          orders: 1
        }
      },
      // Sort by count descending
      {
        $sort: { count: -1 }
      }
    ]);

    console.log(`Admin heatmap data: ${heatmapData.length} locations found`);

    res.status(200).json({
      success: true,
      data: heatmapData,
      totalLocations: heatmapData.length
    });
  } catch (error) {
    console.error('Error fetching admin heatmap data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching heatmap data',
      error: error.message
    });
  }
};

/**
 * Get heatmap data for seller dashboard (seller's orders only)
 */
const getSellerHeatmapData = async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: 'Seller ID is required'
      });
    }

    // First, get all products by this seller
    const sellerProducts = await Product.find({ seller: sellerId }).select('_id');
    const productIds = sellerProducts.map(product => product._id);

    if (productIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        totalLocations: 0,
        message: 'No products found for this seller'
      });
    }

    // Aggregate orders that contain seller's products
    const heatmapData = await Order.aggregate([
      // Match orders that contain seller's products
      {
        $match: {
          'items.productId': { $in: productIds },
          'location.lat': { $ne: null },
          'location.lng': { $ne: null }
        }
      },
      // Group by rounded coordinates
      {
        $group: {
          _id: {
            lat: { $round: ['$location.lat', 2] },
            lng: { $round: ['$location.lng', 2] }
          },
          count: { $sum: 1 },
          orders: { $push: '$$ROOT' }
        }
      },
      // Project to desired format
      {
        $project: {
          _id: 0,
          lat: '$_id.lat',
          lng: '$_id.lng',
          count: 1,
          orders: 1
        }
      },
      // Sort by count descending
      {
        $sort: { count: -1 }
      }
    ]);

    console.log(`Seller heatmap data for seller ${sellerId}: ${heatmapData.length} locations found`);

    res.status(200).json({
      success: true,
      data: heatmapData,
      totalLocations: heatmapData.length
    });
  } catch (error) {
    console.error('Error fetching seller heatmap data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching seller heatmap data',
      error: error.message
    });
  }
};

/**
 * Get detailed order information for a specific location
 */
const getLocationOrders = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Find orders at the specified location (with some tolerance)
    const tolerance = 0.01; // ~1km tolerance
    const orders = await Order.find({
      'location.lat': {
        $gte: parseFloat(lat) - tolerance,
        $lte: parseFloat(lat) + tolerance
      },
      'location.lng': {
        $gte: parseFloat(lng) - tolerance,
        $lte: parseFloat(lng) + tolerance
      }
    })
    .populate('user', 'firstName lastName email')
    .populate('items.productId', 'name price images')
    .sort({ createdAt: -1 })
    .limit(20);

    res.status(200).json({
      success: true,
      data: orders,
      totalOrders: orders.length
    });
  } catch (error) {
    console.error('Error fetching location orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching location orders',
      error: error.message
    });
  }
};

module.exports = {
  getAdminHeatmapData,
  getSellerHeatmapData,
  getLocationOrders
}; 