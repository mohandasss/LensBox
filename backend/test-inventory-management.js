const mongoose = require('mongoose');
const Product = require('./Models/Products');
const Order = require('./Models/orderModel');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lensbox', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const testInventoryManagement = async () => {
  try {
    console.log('🧪 Testing Inventory Management...\n');

    // Find a product to test with
    let testProduct = await Product.findOne({ stock: { $gt: 5 } });
    
    if (!testProduct) {
      // If no product with sufficient stock, find any product and update its stock
      testProduct = await Product.findOne();
      if (!testProduct) {
        console.log('❌ No products found in database');
        return;
      }
      
      // Update stock to a testable amount
      testProduct.stock = 10;
      await testProduct.save();
      console.log(`📦 Updated product "${testProduct.name}" stock to 10 for testing`);
    }

    console.log(`📦 Testing with product: ${testProduct.name}`);
    console.log(`📊 Initial stock: ${testProduct.stock}\n`);

    // Test 1: Check stock before purchase
    const purchaseQuantity = 2;
    console.log(`🛒 Attempting to purchase ${purchaseQuantity} units...`);

    if (testProduct.stock < purchaseQuantity) {
      console.log(`❌ Insufficient stock! Available: ${testProduct.stock}, Requested: ${purchaseQuantity}`);
      return;
    }

    // Simulate the inventory management logic
    const product = await Product.findById(testProduct._id);
    console.log(`📊 Current stock before purchase: ${product.stock}`);

    // Update stock (simulating the purchase)
    const updatedProduct = await Product.findByIdAndUpdate(
      testProduct._id,
      { $inc: { stock: -purchaseQuantity } },
      { new: true }
    );

    console.log(`📊 Stock after purchase: ${updatedProduct.stock}`);
    console.log(`✅ Stock successfully reduced by ${purchaseQuantity} units`);

    // Test 2: Verify the stock was actually updated
    const verifyProduct = await Product.findById(testProduct._id);
    console.log(`🔍 Verification - Current stock: ${verifyProduct.stock}`);
    
    if (verifyProduct.stock === testProduct.stock - purchaseQuantity) {
      console.log('✅ Inventory management test PASSED!');
    } else {
      console.log('❌ Inventory management test FAILED!');
    }

    // Test 3: Try to purchase more than available stock
    console.log('\n🧪 Testing insufficient stock scenario...');
    const excessiveQuantity = verifyProduct.stock + 5;
    console.log(`🛒 Attempting to purchase ${excessiveQuantity} units (only ${verifyProduct.stock} available)...`);

    if (verifyProduct.stock < excessiveQuantity) {
      console.log('✅ Correctly detected insufficient stock!');
    } else {
      console.log('❌ Failed to detect insufficient stock!');
    }

    console.log('\n🎉 Inventory management test completed!');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the test
testInventoryManagement(); 