const mongoose = require('mongoose');
const Product = require('./Models/Products');
const Order = require('./Models/orderModel');
require('dotenv').config();

const oldSellerId = '507f1f77bcf86cd799439012';
const newSellerId = '686559295a8b8364ffd488b0';

async function completeMigration() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    console.log('Starting comprehensive data migration...\n');

    // 1. Migrate Products
    console.log('🔄 MIGRATING PRODUCTS...');
    console.log('========================');
    
    const productsToUpdate = await Product.find({ seller: oldSellerId });
    console.log(`Found ${productsToUpdate.length} products with old seller ID`);

    if (productsToUpdate.length > 0) {
      const productUpdateResult = await Product.updateMany(
        { seller: oldSellerId },
        { $set: { seller: newSellerId } }
      );
      console.log(`✅ Updated ${productUpdateResult.modifiedCount} products`);
    } else {
      console.log('✅ All products already have the correct seller ID');
    }

    // Get all product IDs for the seller (both old and new)
    const allSellerProducts = await Product.find({ seller: newSellerId });
    const productIds = allSellerProducts.map(p => p._id);
    console.log(`Total products now owned by seller: ${allSellerProducts.length}\n`);

    // 2. Check and display current dashboard stats
    console.log('📊 CALCULATING DASHBOARD STATS...');
    console.log('==================================');

    // Calculate total revenue and orders
    const orders = await Order.find({
      'items.productId': { $in: productIds }
    }).populate('items.productId');

    let totalRevenue = 0;
    let totalOrders = 0;
    let totalOrderCount = orders.length;

    orders.forEach(order => {
      order.items.forEach(item => {
        if (productIds.some(id => id.toString() === item.productId._id.toString())) {
          totalRevenue += item.amount || (item.quantity * item.productId.price);
          totalOrders += item.quantity || 1;
        }
      });
    });

    const activeProducts = allSellerProducts.filter(p => p.stock > 0).length;

    console.log(`💰 Total Revenue: ₹${totalRevenue.toLocaleString()}`);
    console.log(`📦 Total Products: ${allSellerProducts.length}`);
    console.log(`✅ Active Products: ${activeProducts}`);
    console.log(`🛒 Total Order Items: ${totalOrders}`);
    console.log(`📋 Total Orders: ${totalOrderCount}`);

    // 3. Sample products verification
    console.log('\n📦 SAMPLE PRODUCTS:');
    console.log('===================');
    
    const sampleProducts = allSellerProducts.slice(0, 5);
    sampleProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   - Price: ₹${product.price}`);
      console.log(`   - Stock: ${product.stock}`);
      console.log(`   - Seller ID: ${product.seller}`);
      console.log('');
    });

    // 4. Recent orders check
    console.log('📋 RECENT ORDERS CHECK:');
    console.log('=======================');
    
    const recentOrders = await Order.find({
      'items.productId': { $in: productIds }
    })
    .populate('user', 'name')
    .populate('items.productId', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

    if (recentOrders.length > 0) {
      recentOrders.forEach((order, index) => {
        const sellerItems = order.items.filter(item => 
          productIds.some(id => id.toString() === item.productId._id.toString())
        );
        const orderTotal = sellerItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        
        console.log(`${index + 1}. Order ${order._id.toString().slice(-8)}`);
        console.log(`   - Customer: ${order.user?.name || 'Unknown'}`);
        console.log(`   - Amount: ₹${orderTotal}`);
        console.log(`   - Status: ${order.status || 'confirmed'}`);
        console.log(`   - Date: ${order.createdAt.toLocaleDateString()}`);
        console.log('');
      });
    } else {
      console.log('No orders found for your products yet.');
    }

    console.log('\n✅ MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('====================================');
    console.log(`Your seller ID (${newSellerId}) now has:`);
    console.log(`- ${allSellerProducts.length} products`);
    console.log(`- ${totalOrderCount} orders`);
    console.log(`- ₹${totalRevenue.toLocaleString()} total revenue`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
}

// Run the complete migration
completeMigration();
