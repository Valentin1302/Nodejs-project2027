import assert from 'assert';
import nock from 'nock';
import { getJson, postJson, putJson, patchJson, deleteJson } from '../src/utils/http';

describe('http util: request helpers', () => {
  const base = 'https://api.example.com';

  afterEach(() => {
    nock.cleanAll();
    nock.abortPendingRequests();
  });

  it('returns parsed JSON on 200 OK', async () => {
    const payload = { ok: true, message: 'hello' };
    nock(base).get('/test').reply(200, payload, { 'Content-Type': 'application/json' });

    const data = await getJson<typeof payload>(`${base}/test`);
    assert.deepStrictEqual(data, payload);
  });

  it('throws on non-2xx with body included', async () => {
    nock(base).get('/fail').reply(404, { error: 'not found' }, { 'Content-Type': 'application/json' });

    let threw = false;
    try {
      await getJson(`${base}/fail`);
    } catch (e: any) {
      threw = true;
      assert.equal(e.status, 404);
      assert.ok((e.body || '').includes('not found'));
    }
    assert.ok(threw, 'Expected getJson to throw on 404');
  });

  it('POST sends JSON body and returns response', async () => {
    const payload = { id: 123, name: 'Alice' };
    nock(base).post('/users', { name: 'Alice' }).reply(201, payload, { 'Content-Type': 'application/json' });
    const res = await postJson<typeof payload>(`${base}/users`, { name: 'Alice' });
    assert.deepStrictEqual(res, payload);
  });

  it('PUT updates resource and returns payload', async () => {
    const payload = { id: 1, name: 'Bob Updated' };
    nock(base).put('/users/1', { name: 'Bob Updated' }).reply(200, payload, { 'Content-Type': 'application/json' });
    const res = await putJson<typeof payload>(`${base}/users/1`, { name: 'Bob Updated' });
    assert.deepStrictEqual(res, payload);
  });

  it('PATCH partially updates resource', async () => {
    const payload = { id: 1, name: 'Carol', email: 'c@example.com' };
    nock(base).patch('/users/1', { email: 'c@example.com' }).reply(200, payload, { 'Content-Type': 'application/json' });
    const res = await patchJson<typeof payload>(`${base}/users/1`, { email: 'c@example.com' });
    assert.deepStrictEqual(res, payload);
  });

  it('DELETE returns status or body', async () => {
    nock(base).delete('/users/1').reply(204);
    const res = await deleteJson(`${base}/users/1`);
    assert.equal(res, '');
  });
});
