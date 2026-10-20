const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const ensureIndexes = require('./config/indexes');
const seedAdmin = require('./services/seedAdmin');
const { startOverdueChecker } = require('./services/overdueChecker');
const createApp = require('./app');

const app = createApp();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const printBanner = ({ port, env, dbHost }) => {
  const c = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
  };

  const width = 58;
  const title = 'JN CEYLON PRODUCTS ERP';
  const padTotal = width - title.length;
  const left = Math.floor(padTotal / 2);
  const right = padTotal - left;
  const headerContent = ' '.repeat(left) + c.bold + title + c.reset + ' '.repeat(right);

  const row = (label, val, valColor = c.green) => {
    const maxValLen = width - 19;
    const safeVal = val.length > maxValLen ? val.slice(0, maxValLen - 3) + '...' : val;
    const plain = '  ' + label.padEnd(14) + ': ' + safeVal;
    const pad = width - plain.length;
    return c.cyan + '│' + c.reset + '  ' + c.bold + label.padEnd(14) + c.reset + ': ' + valColor + safeVal + c.reset + ' '.repeat(Math.max(0, pad - 1)) + c.cyan + '│' + c.reset;
  };

  console.log('\n' + c.cyan + '┌' + '─'.repeat(width) + '┐' + c.reset);
  console.log(c.cyan + '│' + c.reset + headerContent + c.cyan + '│' + c.reset);
  console.log(c.cyan + '├' + '─'.repeat(width) + '┤' + c.reset);
  console.log(row('Environment', env, env === 'production' ? c.yellow : c.green));
  console.log(row('API Server', `http://localhost:${port}/api`, c.green));
  console.log(row('Health Check', `http://localhost:${port}/api/health`, c.dim));
  if (dbHost) {
    const cluster = dbHost.includes('.') ? dbHost.split('.')[0] : dbHost;
    console.log(row('Database', `MongoDB Atlas (${cluster})`, c.green));
  } else {
    console.log(row('Database', 'MongoDB Connected', c.green));
  }
  console.log(row('Web Client', 'http://localhost:5173', c.cyan));
  console.log(c.cyan + '└' + '─'.repeat(width) + '┘\n' + c.reset);
};

async function startServer() {
  const conn = await connectDB();
  await seedAdmin();
  await ensureIndexes();
  startOverdueChecker();

  const server = app.listen(PORT, () => {
    const dbHost = conn && conn.connection ? conn.connection.host : null;
    printBanner({ port: PORT, env: NODE_ENV, dbHost });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\x1b[31m[ERROR]\x1b[0m Port ${PORT} is currently in use. Nodemon will retry automatically.`);
    } else {
      console.error('\x1b[31m[ERROR]\x1b[0m Server error:', err);
    }
  });
}

startServer();
