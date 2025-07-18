const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // If MONGO_URI is not defined in the environment, fallback to a manual string (for testing)
    const uri = process.env.MONGO_URI

    console.log('?? Attempting to connect to MongoDB Atlas...');
    
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`? MongoDB connected at host: ${conn.connection.host}`);
    console.log(`?? Database name: ${conn.connection.name}`);

    // Logging collection names (to confirm data exists)
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`?? Collections (${collections.length}): ${collections.map(c => c.name).join(', ')}`);

    // Connection event logs
    mongoose.connection.on('connected', () => {
      console.log('?? Mongoose connection established');
    });

    mongoose.connection.on('error', (err) => {
      console.error('? Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('?? Mongoose disconnected');
    });

    return conn;
  } catch (error) {
    console.error('?? MongoDB connection failed:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    const state = mongoose.connection.readyState;
    console.error(`?? Mongoose readyState: ${state}`);
    process.exit(1);
  }
};

module.exports = connectDB;
