const mongoose = require('mongoose');

const connectDB = async () => {
    const uri = process.env.MONGO_URI || process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/rental-management-system-dev';

    if (!process.env.MONGO_URI && !process.env.DATABASE_URL) {
        console.warn('Warning: MONGO_URI / DATABASE_URL not set — falling back to local MongoDB at', uri);
        console.warn('If you intended to use a remote database, set MONGO_URI in backend/.env or your environment.');
    }

    try {
        const conn = await mongoose.connect(uri, { connectTimeoutMS: 10000, serverSelectionTimeoutMS: 10000 });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        console.error('If you do not have MongoDB running locally, set MONGO_URI in backend/.env to a valid connection string.');
        process.exit(1);
    }
};

module.exports = connectDB;
