const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const crypto = require('crypto');

const { protect } = require('./middleware/authMiddleware');

const createApp = ({ useMongoSessionStore = true } = {}) => {
  const app = express();
  const isProduction = process.env.NODE_ENV === 'production';
  const configuredOrigins = (process.env.CORS_ORIGINS || (isProduction ? '' : 'http://localhost:5173'))
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  if (isProduction && configuredOrigins.length === 0) {
    throw new Error('CORS_ORIGINS must be configured in production');
  }

  const allowedOrigins = new Set(configuredOrigins);

  app.use(cors({
    origin: (origin, callback) => {
      callback(null, !origin || allowedOrigins.has(origin));
    },
    credentials: true
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use((req, res, next) => {
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return next();
    }

    const origin = req.get('origin');
    if (!origin || allowedOrigins.has(origin)) {
      return next();
    }

    return res.status(403).json({ message: 'Request origin is not allowed' });
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/ready', (req, res) => {
    const ready = mongoose.connection.readyState === 1;
    res.status(ready ? 200 : 503).json({
      status: ready ? 'ready' : 'not ready',
      database: ready ? 'connected' : 'disconnected'
    });
  });

  const sessionSecret = process.env.SESSION_SECRET;
  if (isProduction && !sessionSecret) {
    throw new Error('SESSION_SECRET must be configured in production');
  }

  if (isProduction) {
    app.set('trust proxy', 1);
  }

  const sessionOptions = {
    secret: sessionSecret || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProduction,
      sameSite: process.env.COOKIE_SAME_SITE || 'lax'
    }
  };

  if (useMongoSessionStore) {
    sessionOptions.store = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/jn_ceylon_erp',
      ttl: 14 * 24 * 60 * 60
    });
  }

  app.use(session(sessionOptions));

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/users', require('./routes/users'));

  app.use('/api/quotations', protect, require('./routes/quotations'));
  app.use('/api/invoices', protect, require('./routes/invoices'));
  app.use('/api/statements', protect, require('./routes/statements'));
  app.use('/api/payments', protect, require('./routes/payments'));
  app.use('/api/companies', protect, require('./routes/companies'));
  app.use('/api/dashboard', protect, require('./routes/dashboard'));
  app.use('/api/custom-statements', protect, require('./routes/customStatements'));
  app.use('/api/recycle-bin', protect, require('./routes/recycleBin'));

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

  return app;
};

module.exports = createApp;