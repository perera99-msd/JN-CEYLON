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
    res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(body) }));
  });
  req.on('error', reject);
});

test('health endpoint reports that the process is alive', async () => {
  const server = createApp({ useMongoSessionStore: false }).listen(0);

  try {
    const response = await request(server, '/api/health');
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.body, { status: 'ok' });
  } finally {
    server.close();
  }
});

test('readiness endpoint reports unavailable database before connection', async () => {
  const server = createApp({ useMongoSessionStore: false }).listen(0);

  try {
    const response = await request(server, '/api/ready');
    assert.equal(response.statusCode, 503);
    assert.deepEqual(response.body, {
      status: 'not ready',
      database: 'disconnected'
    });
  } finally {
    server.close();
  }
});