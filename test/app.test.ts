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
    const animalData = {
      organizationId: 'org123',
      type: 'Cat',
      size: 'Small',
      genre: 'Female',
      age: 'Kitten',
      description: 'A cute kitten',
      status: 'Available',
    };

    const res = await request(app)
      .post('/animals')
      .send(animalData)
      .set('Accept', 'application/json');

    assert.equal(res.status, 201);
    assert.ok(res.body.created);
    assert.equal(res.body.created.type, animalData.type);
    assert.equal(res.body.created.size, animalData.size);
    assert.equal(res.body.created.genre, animalData.genre);
    assert.equal(res.body.created.age, animalData.age);
    assert.equal(res.body.created.description, animalData.description);
    assert.equal(res.body.created.status, animalData.status);
  });
});
