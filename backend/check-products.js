const mongoose = require('mongoose');
const Product = require('./Models/Products');
const User = require('./Models/UserModel');
require('dotenv').config();

const SELLER_ID = '686559295a8b8364ffd488b0';

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lensbox', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const checkProducts = async () => {
  try {
    console.log('🔍 Checking products for seller:', SELLER_ID);
    
    // Get all products for this seller
    const products = await Product.find({ seller: SELLER_ID }).populate('seller', 'firstName lastName email');
    console.log(`\n📦 Total products found for seller: ${products.length}`);
    
    if (products.length === 0) {
      console.log('❌ No products found for this seller');
      return;
    }
    
    products.forEach(product => {
      console.log(`\n- ${product.name}`);
      console.log(`   ID: ${product._id}`);
      console.log(`   Price: ₹${product.price}`);
      console.log(`   Stock: ${product.stock}`);
      console.log(`   Sales Count: ${product.salesCount}`);
      console.log(`   Total Revenue: ₹${product.totalRevenue}`);
      console.log(`   Last Sold At: ${product.lastSoldAt}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking products:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the check
checkProducts(); 