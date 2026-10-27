const mongoose = require('mongoose');

let memoryServer = null;

const connectDB = async () => {
  // If already connected or connecting, return existing connection (critical for Vercel/serverless environments)
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/imovies';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Auto-seed if database is empty (works on both local and Vercel with Atlas)
    if (!process.env.SEED_SCRIPT) {
      try {
        const Movie = require('../models/Movie');
        const movieCount = await Movie.countDocuments();
        if (movieCount === 0) {
          console.log('Database is empty. Automatically seeding sample data...');
          const seedFunction = require('../seedHelper');
          await seedFunction();
        }
      } catch (seedErr) {
        console.warn('Auto-seed check failed (non-fatal):', seedErr.message);
      }
    }

    return conn;
  } catch (error) {
    console.warn(`Could not connect to external MongoDB at ${uri} (${error.message}).`);

    // On Vercel serverless or production, do NOT try MongoMemoryServer (binary too large for serverless)
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      throw new Error(
        'MongoDB connection failed. Set MONGODB_URI in Vercel Environment Variables to a MongoDB Atlas URI.'
      );
    }

    // In local development or test, fallback to embedded MongoMemoryServer
    try {
      console.log('Starting local in-memory MongoDB server as fallback...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      if (!memoryServer) {
        memoryServer = await MongoMemoryServer.create();
      }
      const memUri = memoryServer.getUri();
      process.env.MONGODB_URI = memUri;
      const conn = await mongoose.connect(memUri);
      console.log(`Connected to Fallback In-Memory MongoDB at ${memUri}`);

      if (!process.env.SEED_SCRIPT) {
        const User = require('../models/User');
        const count = await User.countDocuments();
        if (count === 0) {
          console.log('Database is empty. Automatically seeding sample data...');
          const seedFunction = require('../seedHelper');
          await seedFunction();
        }
      }

      return conn;
    } catch (memError) {
      console.error(`Failed to start in-memory MongoDB: ${memError.message}`);
      throw memError;
    }
  }
};

module.exports = connectDB;
