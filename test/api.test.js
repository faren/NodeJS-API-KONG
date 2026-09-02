const assert = require('node:assert/strict');
const test = require('node:test');
const request = require('supertest');

const app = require('../src/app');

test('health endpoint returns service status', async () => {
  const response = await request(app).get('/health').expect(200);

  assert.equal(response.body.status, 'ok');
  assert.equal(response.body.service, 'nodejs-api-kong-modern');
});

test('customers endpoint returns original PoC data', async () => {
  const response = await request(app).get('/api/v1/customers').expect(200);

  assert.equal(response.body.length, 2);
  assert.equal(response.body[0].id, 5);
});

test('customer lookup uses customer id, not array index', async () => {
  const response = await request(app).get('/api/v1/customers/5').expect(200);

  assert.equal(response.body.first_name, 'Dodol');
});

test('missing customer returns 404', async () => {
  const response = await request(app).get('/api/v1/customers/999').expect(404);

  assert.equal(response.body.message, 'Customer not found');
});
