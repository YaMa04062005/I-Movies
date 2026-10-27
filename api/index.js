// Vercel Serverless Function Entry Point for IMovies API
// This file wraps the Express app for Vercel's serverless runtime

// Set VERCEL env flag early so the app knows it's in serverless mode
process.env.VERCEL = '1';

// Load dotenv from backend directory
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const app = require('../backend/server');

module.exports = app;
