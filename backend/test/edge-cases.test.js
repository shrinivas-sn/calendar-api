'use strict';

// Edge cases against the real data, read-only. Years are derived from the data
// folders so these tests keep working when a new year is added.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const app = require('../src/index');
const { startServer, getJson } = require('./helpers');

const years = fs.readdirSync(path.join(__dirname, '..', 'data'))
  .filter((name) => /^\d{4}$/.test(name)).map(Number).sort();
const earliest = years[0];
const latest = years[years.length - 1];

let server;
before(async () => { server = await startServer(app); });
after(() => server.close());

test('S6: a range spanning more than 5 calendar years returns 400', async () => {
  const { status, body } = await getJson(server.baseUrl,
    `/v1/holidays/range?country=IN&start=${latest - 5}-01-01&end=${latest}-12-31`);
  assert.equal(status, 400);
  assert.match(body.message, /more than 5 calendar years/);
});

test('S6: a range of exactly 5 calendar years is accepted', async () => {
  const { status } = await getJson(server.baseUrl,
    `/v1/holidays/range?country=IN&start=${latest - 4}-01-01&end=${latest}-12-31`);
  assert.equal(status, 200);
});

test('S7: next-holiday on the last data year\'s 31 Dec names the year without data', async () => {
  const { status, body } = await getJson(server.baseUrl,
    `/v1/date/next-holiday?country=IN&date=${latest}-12-31`);
  assert.equal(status, 200);
  assert.deepEqual(body.data, []);
  assert.deepEqual(body.meta.yearsWithoutData, [latest + 1]);
});

test('S7: next-holiday with a result carries no yearsWithoutData key', async () => {
  const { body } = await getJson(server.baseUrl, `/v1/date/next-holiday?country=IN&date=${latest}-01-01`);
  assert.ok(body.data.length > 0);
  assert.equal('yearsWithoutData' in body.meta, false);
});

test('S8: a range touching a year without data keeps its data and names that year', async () => {
  const partial = await getJson(server.baseUrl,
    `/v1/holidays/range?country=IN&start=${earliest - 1}-12-01&end=${earliest}-01-31`);
  const full = await getJson(server.baseUrl,
    `/v1/holidays/range?country=IN&start=${earliest}-01-01&end=${earliest}-01-31`);
  assert.equal(partial.status, 200);
  assert.deepEqual(partial.body.data, full.body.data);
  assert.deepEqual(partial.body.meta.yearsWithoutData, [earliest - 1]);
  assert.equal('yearsWithoutData' in full.body.meta, false);
});

test('S9: lowercase region returns the same data as uppercase and echoes uppercase', async () => {
  const lower = await getJson(server.baseUrl, `/v1/holidays?country=IN&year=${latest}&region=ka`);
  const upper = await getJson(server.baseUrl, `/v1/holidays?country=IN&year=${latest}&region=KA`);
  assert.equal(lower.status, 200);
  assert.equal(lower.body.region, 'KA');
  assert.deepEqual(lower.body.data, upper.body.data);
});

test('S9: region=Central is accepted as central', async () => {
  const { status, body } = await getJson(server.baseUrl, `/v1/holidays?country=IN&year=${latest}&region=Central`);
  assert.equal(status, 200);
  assert.equal(body.region, 'central');
});

test('S9: a malformed region is still 400', async () => {
  const { status } = await getJson(server.baseUrl, `/v1/holidays?country=IN&year=${latest}&region=k1`);
  assert.equal(status, 400);
});

test('S11: 200 responses are cacheable for an hour; errors are not', async () => {
  const ok = await getJson(server.baseUrl, `/v1/holidays?country=IN&year=${latest}`);
  assert.equal(ok.headers.get('cache-control'), 'public, max-age=3600');
  const bad = await getJson(server.baseUrl, '/v1/holidays?country=IN&year=abcd');
  assert.equal(bad.status, 400);
  assert.equal(bad.headers.get('cache-control'), null);
});
