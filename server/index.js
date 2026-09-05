const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const ensureIndexes = require('./config/indexes');
const seedAdmin = require('./services/seedAdmin');
const { startOverdueChecker } = require('./services/overdueChecker');
const createApp = require('./app');
const app = createApp();

// Connect Database, Seed Admin, Ensure Indexes, and Start Overdue Checker
connectDB().then(() => {
  seedAdmin();
  ensureIndexes();
  startOverdueChecker();
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`JN Ceylon ERP Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is currently in use. Nodemon will retry automatically.`);
  } else {
    console.error('Server error:', err);
  }
});
