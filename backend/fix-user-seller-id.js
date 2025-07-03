const mongoose = require('mongoose');
const User = require('./Models/UserModel');
const Product = require('./Models/Products');
require('dotenv').config();

const targetSellerId = '686559295a8b8364ffd488b0';

async function fixUserSellerId() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // First, let's see what users exist
    const users = await User.find({}).select('_id name email role');
    console.log('\n📋 EXISTING USERS:');
    console.log('==================');
    users.forEach(user => {
      console.log(`ID: ${user._id}`);
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log('---');
    });

    // Check if our target seller ID exists as a user
    const targetUser = await User.findById(targetSellerId);
    
    if (targetUser) {
      console.log('\n✅ Target seller ID already exists as user:');
      console.log(`Name: ${targetUser.name}`);
      console.log(`Email: ${targetUser.email}`);
      console.log(`Role: ${targetUser.role}`);
      
      // Update role to seller if not already
      if (targetUser.role !== 'seller') {
        targetUser.role = 'seller';
        await targetUser.save();
        console.log('✅ Updated role to "seller"');
      }
    } else {
      console.log('\n❌ Target seller ID does not exist as user');
      console.log('Creating user with target seller ID...');
      
      // Create user with our target seller ID
      const newUser = new User({
        _id: targetSellerId,
        name: 'Camera Store Seller',
        email: 'seller@camerastore.com',
        password: 'hashedpassword123', // You should hash this properly
        role: 'seller',
        address: {
          city: 'Mumbai',
          state: 'Maharashtra',
          zip: '400001',
          country: 'India'
        },
        phone: '+91-9876543210'
      });
      
      await newUser.save();
      console.log('✅ Created new seller user');
    }

    // Verify products are associated with this user
    const productsCount = await Product.countDocuments({ seller: targetSellerId });
    console.log(`\n📦 Products associated with seller ID ${targetSellerId}: ${productsCount}`);

    console.log('\n🎉 USER-SELLER ID SYNC COMPLETED!');
    console.log('==========================================');
    console.log(`Your seller ID: ${targetSellerId}`);
    console.log(`Products: ${productsCount}`);
    console.log('\nNow you can log in with:');
    console.log('Email: seller@camerastore.com');
    console.log('Password: hashedpassword123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
}

fixUserSellerId();
