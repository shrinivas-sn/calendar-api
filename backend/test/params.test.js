'use strict';

// S4: repeated or nested query params are a client error, never a crash.
// S5: an unexpected exception never sends JS error text to the client.
// S15: the rate limit actually trips.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../src/index');
const { startServer, getJson } = require('./helpers');
const { makeDataDir, holidayFile } = require('./fixture-data');

let server;
let data;

before(async () => {
  data = makeDataDir({
    '2026/IN/central/holidays.json': holidayFile(2026, 'central', [
      { name: 'Republic Day', date: '2026-01-26', type: 'gazetted_holiday' },
    ]),
    // `data` is not an array: makes the merge code throw an unexpected TypeError.
    '2025/IN/central/holidays.json': JSON.stringify({ data: 5 }),
  });
  server = await startServer(createApp({ dataDir: data.root }));
});
after(async () => { await server.close(); data.cleanup(); });

for (const [label, query] of [
  ['country twice', 'country=IN&country=IN&year=2026'],
  ['region twice', 'country=IN&year=2026&region=KA&region=KA'],
  ['year twice', 'country=IN&year=2026&year=2026'],
]) {
  test(`S4: ${label} returns 400`, async () => {
    const { status, body } = await getJson(server.baseUrl, `/v1/holidays?${query}`);
    assert.equal(status, 400);
    assert.equal(body.error, true);
    assert.match(body.message, /must be given once/);
  });
}

test('S4: nested param date[a]=1 returns 400', async () => {
  const { status, body } = await getJson(server.baseUrl, '/v1/date/is-holiday?country=IN&date[a]=1');
  assert.equal(status, 400);
  assert.match(body.message, /date/);
});

test('S5: unexpected exception returns a generic 500', async () => {
  const { status, body } = await getJson(server.baseUrl, '/v1/holidays?country=IN&year=2025');
  assert.equal(status, 500);
  assert.deepEqual(body, { error: true, message: 'Internal Server Error', status: 500 });
});

test('S15: request beyond the rate limit gets 429 with the error envelope', async () => {
  // A fresh app so earlier tests do not use up its window.
  const fresh = await startServer(createApp({ dataDir: data.root }));
  try {
    let last;
    for (let i = 0; i < 101; i++) last = await getJson(fresh.baseUrl, '/health');
    assert.equal(last.status, 429);
    assert.equal(last.body.error, true);
    assert.equal(last.body.status, 429);
  } finally {
    await fresh.close();
  }
});
