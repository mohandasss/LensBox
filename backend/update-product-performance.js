const mongoose = require('mongoose');
const Product = require('./Models/Products');
const Order = require('./Models/orderModel');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lensbox', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const updateProductPerformance = async () => {
  try {
    console.log('🔄 Starting product performance update...');
    
    // Get all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to update`);
    
    let updatedCount = 0;
    
    for (const product of products) {
      console.log(`\n📊 Processing product: ${product.name}`);
      
      // Get all orders for this product
      const orders = await Order.aggregate([
        {
          $match: {
            'items.productId': product._id,
            status: { $in: ['confirmed', 'shipped', 'delivered'] }
          }
        },
        {
          $unwind: '$items'
        },
        {
          $match: {
            'items.productId': product._id
          }
        },
        {
          $group: {
            _id: '$items.productId',
            totalSales: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.amount' },
            lastSoldAt: { $max: '$createdAt' }
          }
        }
      ]);
      
      const orderData = orders[0] || { totalSales: 0, totalRevenue: 0, lastSoldAt: null };
      
      // Update product with real data
      const updatedProduct = await Product.findByIdAndUpdate(
        product._id,
        {
          salesCount: orderData.totalSales,
          totalRevenue: orderData.totalRevenue,
          lastSoldAt: orderData.lastSoldAt
        },
        { new: true }
      );
      
      console.log(`✅ Updated ${product.name}:`);
      console.log(`   Sales: ${orderData.totalSales}`);
      console.log(`   Revenue: ₹${orderData.totalRevenue}`);
      console.log(`   Last Sold: ${orderData.lastSoldAt ? new Date(orderData.lastSoldAt).toLocaleDateString() : 'Never'}`);
      
      updatedCount++;
    }
    
    console.log(`\n🎉 Successfully updated ${updatedCount} products with real performance data!`);
    
  } catch (error) {
    console.error('❌ Error updating product performance:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run the update
updateProductPerformance(); 