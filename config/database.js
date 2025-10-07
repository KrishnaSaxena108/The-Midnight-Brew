// Load environment variables
require('dotenv').config();

const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
const connectDB = async () => {
    // If no URI is provided, skip DB connection so the static site can still run locally
    if (!MONGODB_URI) {
        console.warn('MONGODB_URI not set. Skipping database connection. Static pages will still be served.');
        return false;
    }
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB connected successfully');
        return true;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;