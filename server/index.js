const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/db');
const seedAdmin = require('./services/seedAdmin');
const { protect } = require('./middleware/authMiddleware');

const app = express();

// Connect Database & Seed Admin
connectDB().then(() => {
  seedAdmin();
});

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Express Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'jn_ceylon_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jn_ceylon_erp',
    ttl: 14 * 24 * 60 * 60 // 14 days
  }),
  cookie: {
    maxAge: 14 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Auth & Public API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));

// Protected Data API Routes
app.use('/api/quotations', protect, require('./routes/quotations'));
app.use('/api/invoices', protect, require('./routes/invoices'));
app.use('/api/statements', protect, require('./routes/statements'));
app.use('/api/payments', protect, require('./routes/payments'));
app.use('/api/companies', protect, require('./routes/companies'));
app.use('/api/dashboard', protect, require('./routes/dashboard'));
app.use('/api/custom-statements', protect, require('./routes/customStatements'));
app.use('/api/recycle-bin', protect, require('./routes/recycleBin'));

// Serve Static Assets in Production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('JN Ceylon ERP API Server Running...');
  });
}

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
