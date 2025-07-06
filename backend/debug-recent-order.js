const mongoose = require('mongoose');
const Order = require('./Models/orderModel');
const Product = require('./Models/Products');

mongoose.connect('mongodb://localhost:27017/lensbox');

const debugRecentOrder = async () => {
  try {
    console.log('Debugging recent order...\n');

    // Get the most recent order
    const recentOrder = await Order.findOne({}).sort({ createdAt: -1 });
    
    if (!recentOrder) {
      console.log('No orders found in database.');
      return;
    }

    console.log('Most recent order:');
    console.log(`Order ID: ${recentOrder._id}`);
    console.log(`User ID: ${recentOrder.user}`);
    console.log(`Total: ${recentOrder.total}`);
    console.log(`Items: ${recentOrder.items.length}`);
    console.log(`Location: ${recentOrder.location ? `${recentOrder.location.lat}, ${recentOrder.location.lng}` : 'No location'}`);
    console.log(`Created: ${recentOrder.createdAt}`);
    console.log('');

    // Check if order has location data
    if (recentOrder.location && recentOrder.location.lat && recentOrder.location.lng) {
      console.log('✅ Order has location data!');
    } else {
      console.log('❌ Order missing location data');
    }

    // Check the products in the order
    console.log('\nProducts in order:');
    for (const item of recentOrder.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        console.log(`- ${product.name} (ID: ${product._id})`);
        console.log(`  Seller: ${product.seller || 'No seller assigned'}`);
      } else {
        console.log(`- Product not found (ID: ${item.productId})`);
      }
    }

    // Check if any products have seller IDs
    const productIds = recentOrder.items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productsWithSeller = products.filter(p => p.seller);
    
    console.log(`\nProducts with seller: ${productsWithSeller.length}/${products.length}`);
    
    if (productsWithSeller.length > 0) {
      console.log('Seller IDs found:');
      productsWithSeller.forEach(product => {
        console.log(`- ${product.name}: ${product.seller}`);
      });
    } else {
      console.log('❌ No products have seller IDs assigned');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

debugRecentOrder(); 