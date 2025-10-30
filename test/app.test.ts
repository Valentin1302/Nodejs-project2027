import request from 'supertest';
import assert from 'assert';
import { app } from '../src/app';

describe('App functional tests', () => {
  it('GET / should return greeting', async () => {
    const res = await request(app).get('/');
    assert.equal(res.status, 200);
    assert.ok(res.text.includes('Hello, TypeScript + Express!'));
  });

  it('POST /animals should create an animal', async () => {
    const ProductData = {
      name: 'Lampe torche',
      description: 'Pratique pour allumer la lumière',
      price: 30,
      number: 5,
    };

    const res = await request(app)
      .post('/animals')
      .send(ProductData)
      .set('Accept', 'application/json');

    assert.equal(res.status, 201);
    assert.ok(res.body.created);
    assert.equal(res.body.created.type, ProductData.name);
    assert.equal(res.body.created.size, ProductData.description);
    assert.equal(res.body.created.genre, ProductData.price);
    assert.equal(res.body.created.age, ProductData.number);
  });
});
