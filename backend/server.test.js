const request = require('supertest');
const app = require('./server');

describe('Transaction API', () => {
  it('should process valid VISA transaction', async () => {
    const res = await request(app)
      .post('/processTransaction')
      .send({ transaction: '104VISA20522.00310BURGERBARN' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('version', '0.1');
    expect(res.body).toHaveProperty('network', 'VISA');
    expect(res.body).toHaveProperty('amount', '2200');
    expect(res.body).toHaveProperty('transaction_descriptor', '00002200');
    expect(res.body).toHaveProperty('merchant', 'BURGERBARN');
  });

  it('should process valid DISCOVER transaction', async () => {
    const res = await request(app)
      .post('/processTransaction')
      .send({ transaction: '309SMAINFRMR108DISCOVER2070100.95' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('network', 'DISCOVER');
    expect(res.body).toHaveProperty('amount', '10095');
    expect(res.body).toHaveProperty('transaction_descriptor', 'DIFFFF');
  });

  it('should return error for invalid transaction format', async () => {
    const res = await request(app)
      .post('/processTransaction')
      .send({ transaction: 'invalid' });

    expect(res.status).toBe(400);
  });

  it('should retrieve all transactions', async () => {
    await request(app)
      .post('/processTransaction')
      .send({ transaction: '104VISA20522.00310BURGERBARN' });

    const res = await request(app).get('/transactions');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});