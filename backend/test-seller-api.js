const mongoose = require('mongoose');
const Product = require('./Models/Products');
const Order = require('./Models/orderModel');
require('dotenv').config();

const sellerId = '686559295a8b8364ffd488b0';

async function testSellerAPI() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Testing Seller API Data...\n');

    // Simulate the getSellerDashboardStats function
    const products = await Product.find({ seller: sellerId });
    const productIds = products.map(p => p._id);
    
    const orders = await Order.find({
      'items.productId': { $in: productIds }
    }).populate('items.productId');
    
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
    
    const averageRating = 4.8;
    
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
    
    console.log('📊 DASHBOARD STATS (API Response):');
    console.log('==================================');
    console.log(JSON.stringify(stats, null, 2));
    
    console.log('\n✅ Your seller dashboard should now show:');
    console.log(`💰 Revenue: ${stats.revenue.total}`);
    console.log(`📦 Products: ${stats.products.total}`);
    console.log(`🛒 Orders: ${stats.orders.total}`);
    console.log(`⭐ Rating: ${stats.rating.total}/5`);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
}

testSellerAPI();
