import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { loadWinners } from '../assets/js/data.js';
import { CONFIG } from '../assets/js/config.js';

const demo = JSON.parse(readFileSync(new URL('../assets/data/demo.json', import.meta.url)));
const response = body => ({ ok: true, json: async () => body });

test('Healthy empty API retains labeled preview requested by the operator', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async url => {
    calls.push(url);
    return response(url === CONFIG.apiUrl ? { ok: true, winners: [] } : demo);
  });
  const result = await loadWinners({ refresh: true });
  assert.equal(result.demo, true);
  assert.equal(result.winners.length, 11);
  assert.equal(calls[0], CONFIG.apiUrl);
  assert.match(calls[1], /demo\.json$/);
});

test('Published API rows replace samples completely', async t => {
  const calls = [];
  const row = { ...demo.winners[0], id: 'api-row', name: 'API row' };
  t.mock.method(globalThis, 'fetch', async url => {
    calls.push(url); return response({ ok: true, winners: [row] });
  });
  const result = await loadWinners({ refresh: true });
  assert.equal(result.demo, false);
  assert.deepEqual(result.winners.map(w => w.id), ['api-row']);
  assert.deepEqual(calls, [CONFIG.apiUrl]);
});

test('Failed or malformed API never silently displays samples', async t => {
  for (const body of [{ ok: false, winners: [] }, { ok: true, winners: null }]) {
    let count = 0;
    const mock = t.mock.method(globalThis, 'fetch', async () => { count++; return response(body); });
    await assert.rejects(loadWinners({ refresh: true }));
    assert.equal(count, 1); mock.mock.restore();
  }
  let count = 0;
  t.mock.method(globalThis, 'fetch', async () => { count++; throw new Error('Network unavailable'); });
  await assert.rejects(loadWinners({ refresh: true }));
  assert.equal(count, 1);
});

test('A participants-only API response does not trigger sample award winners', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async url => {
    calls.push(url);
    return response({ok: true, winners: [{...demo.winners[0], id: 'participant', award: '미수상'}]});
  });
  const result = await loadWinners({refresh: true});
  assert.equal(result.demo, false);
  assert.deepEqual(result.winners.map(w => w.award), ['participant']);
  assert.deepEqual(calls, [CONFIG.apiUrl]);
});
