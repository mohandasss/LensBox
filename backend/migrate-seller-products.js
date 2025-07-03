const mongoose = require('mongoose');
const Product = require('./Models/Products');
require('dotenv').config();

const oldSellerId = '507f1f77bcf86cd799439012';
const newSellerId = '686559295a8b8364ffd488b0';

async function migrateSeller() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all products with the old seller ID
    const productsToUpdate = await Product.find({ seller: oldSellerId });
    console.log(`Found ${productsToUpdate.length} products with old seller ID`);

    if (productsToUpdate.length === 0) {
      console.log('No products found with the old seller ID');
      return;
    }

    // Update all products to use the new seller ID
    const updateResult = await Product.updateMany(
      { seller: oldSellerId },
      { $set: { seller: newSellerId } }
    );

    console.log(`Migration completed successfully!`);
    console.log(`Updated ${updateResult.modifiedCount} products`);
    console.log(`Old Seller ID: ${oldSellerId}`);
    console.log(`New Seller ID: ${newSellerId}`);

    // Verify the migration
    const verifyCount = await Product.countDocuments({ seller: newSellerId });
    console.log(`Total products now associated with new seller ID: ${verifyCount}`);

    // Check if any products still have the old seller ID
    const remainingOld = await Product.countDocuments({ seller: oldSellerId });
    console.log(`Products remaining with old seller ID: ${remainingOld}`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

// Run the migration
migrateSeller();
