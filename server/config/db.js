const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/orbit');
    console.log(`✦ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`✦ MongoDB connection error: ${error.message}`);
    // Don't crash the server — allow it to run without DB for demo purposes
    console.warn('✦ Server will continue without database. Board persistence is disabled.');
  }
};

module.exports = connectDB;
