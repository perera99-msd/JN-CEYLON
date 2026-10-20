const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jn_ceylon_erp');
    return conn;
  } catch (error) {
    console.error(`\x1b[31m[DB ERROR]\x1b[0m MongoDB Connection Failed: ${error.message}`);
    // If local MongoDB is not running, warn but don't crash dev server immediately in development
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return null;
  }
};

module.exports = connectDB;
