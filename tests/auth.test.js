const { test } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../app');

test('POST /api/login should return token', async () => {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email: 'bereketgetayea@gmail.com', password: 'bereket65' });

  assert.strictEqual(response.status, 200);
  assert(response.body.token); // Check if token exists
});