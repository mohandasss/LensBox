const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    console.log('Attempting to connect to MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
    });
    
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);
    
    // Log MongoDB connection events
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to DB');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from DB');
    });
    
    // Test the connection with a simple query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Available collections: ${collections.length} collections`);
    
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', {
      message: error.message,
      name: error.name,
      code: error.code,
      codeName: error.codeName,
      error: error
    });
    
    // Attempt to get more detailed error information
    try {
      const status = await mongoose.connection.readyState;
      console.error(`Mongoose connection state: ${status}`);
    } catch (e) {
      console.error('Could not get connection state:', e);
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;
