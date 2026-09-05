const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');

const createApp = require('../server/app');

const request = (server, path) => new Promise((resolve, reject) => {
  const address = server.address();
  const req = http.get({
    hostname: '127.0.0.1',
    port: address.port,
    path
  }, (res) => {
    let body = '';
    res.setEncoding('utf8');
    res.on('data', chunk => { body += chunk; });
    res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: JSON.parse(body) }));
  });
  req.on('error', reject);
});

test('security headers are present on API responses', async () => {
  const server = createApp({ useMongoSessionStore: false }).listen(0);

  try {
    const response = await request(server, '/api/health');
    assert.equal(response.statusCode, 200);
    // Helmet headers
    assert.equal(response.headers['x-content-type-options'], 'nosniff');
    assert.equal(response.headers['x-frame-options'], 'SAMEORIGIN');
    assert.equal(response.headers['x-dns-prefetch-control'], 'off');
  } finally {
    server.close();
  }
});

test('rate limit headers are sent by general API limiter', async () => {
  const server = createApp({ useMongoSessionStore: false }).listen(0);

  try {
    const response = await request(server, '/api/health');
    assert.equal(response.statusCode, 200);
    // Rate limit headers from express-rate-limit
    assert.ok(response.headers['ratelimit-limit'] || response.headers['x-ratelimit-limit']);
  } finally {
    server.close();
  }
});
