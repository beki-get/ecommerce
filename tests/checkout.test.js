// tests/checkout.test.js
test('POST /api/checkout should create order', async () => {
  const response = await request(app)
    .post('/api/checkout')
    .set('Authorization', `Bearer ${testToken}`)
    .send({
      items: [{ productId: '123', quantity: 1 }],
      address: { street: 'Test St', city: 'Test City', zip: '12345' },
      paymentMethod: 'cod'
    });
  assert.strictEqual(response.status, 201);
});