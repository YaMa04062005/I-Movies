// Vercel Catch-All Serverless Route for /api/*
process.env.VERCEL = '1';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });

const app = require('../backend/server');

module.exports = app;
