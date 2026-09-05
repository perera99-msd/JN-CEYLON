const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');

const { protect } = require('./middleware/authMiddleware');

const createApp = ({ useMongoSessionStore = true } = {}) => {
  const app = express();

  app.use(cors({
    origin: true,
    credentials: true
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

  const sessionOptions = {
    secret: process.env.SESSION_SECRET || 'jn_ceylon_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
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