'use strict';

// S2, S3: a missing or corrupt region file must not look like "no holidays".
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { createApp } = require('../src/index');
const { startServer, getJson } = require('./helpers');
const { makeDataDir, holidayFile } = require('./fixture-data');

const UNAVAILABLE = 'Holiday data unavailable for this region';
let server;
let data;

before(async () => {
  data = makeDataDir({
    '2026/IN/central/holidays.json': holidayFile(2026, 'central', [
      { name: 'Republic Day', date: '2026-01-26', type: 'gazetted_holiday' },
    ]),
    '2026/IN/KA/.keep': '',
    '2026/IN/MH/holidays.json': '{ not json',
  });
  server = await startServer(createApp({ dataDir: data.root }));
});
after(async () => { await server.close(); data.cleanup(); });

test('S2: region folder without holidays.json returns 503, not an empty list', async () => {
  const { status, body } = await getJson(server.baseUrl, '/v1/holidays?country=IN&year=2026&region=KA');
  assert.equal(status, 503);
  assert.deepEqual(body, { error: true, message: UNAVAILABLE, status: 503 });
});

test('S3: corrupt holidays.json returns 503 without parser text or paths', async () => {
  const { status, body } = await getJson(server.baseUrl, '/v1/holidays?country=IN&year=2026&region=MH');
  assert.equal(status, 503);
  assert.equal(body.message, UNAVAILABLE);
  const raw = JSON.stringify(body);
  assert.doesNotMatch(raw, /Unexpected|JSON|token/i);
  assert.ok(!raw.includes(data.root) && !raw.includes(path.sep + 'holidays.json'));
});

test('a valid fixture region still answers from the configured data dir', async () => {
  const { status, body } = await getJson(server.baseUrl, '/v1/holidays?country=IN&year=2026');
  assert.equal(status, 200);
  assert.equal(body.data.length, 1);
});
