const dotenv = require('dotenv');
dotenv.config();

process.env.SEED_SCRIPT = 'true';
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const seedInitialData = require('./seedHelper');

const runSeed = async () => {
  try {
    await connectDB();
    await seedInitialData();
    console.log('\nSeed completed successfully.');
    console.log('Admin user: admin@imovies.com / admin123');
    console.log('Regular user: user@imovies.com / user123\n');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

runSeed();
