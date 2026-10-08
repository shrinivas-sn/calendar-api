'use strict';

// S10: every holiday says whether it is on the state's own list. Filtering
// level === "state" must give exactly that state's list.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const app = require('../src/index');
const { startServer, getJson } = require('./helpers');

const dataDir = path.join(__dirname, '..', 'data');
const latest = Math.max(...fs.readdirSync(dataDir).filter((n) => /^\d{4}$/.test(n)).map(Number));
const region = 'KA';
const stateFile = JSON.parse(fs.readFileSync(path.join(dataDir, String(latest), 'IN', region, 'holidays.json'), 'utf8'));
const stateKeys = new Set(stateFile.data.map((h) => `${h.date}_${h.name}`));

let server;
before(async () => { server = await startServer(app); });
after(() => server.close());

test('S10: state query tags items, and level=state matches the state file exactly', async () => {
  const { body } = await getJson(server.baseUrl, `/v1/holidays?country=IN&year=${latest}&region=${region}`);
  assert.ok(body.data.every((h) => h.level === 'state' || h.level === 'central'));
  const tagged = body.data.filter((h) => h.level === 'state').map((h) => `${h.date}_${h.name}`);
  assert.deepEqual(new Set(tagged), stateKeys);
  assert.equal(tagged.length, stateKeys.size);
});

test('S10: central query tags every item central', async () => {
  const { body } = await getJson(server.baseUrl, `/v1/holidays?country=IN&year=${latest}`);
  assert.ok(body.data.length > 0);
  assert.ok(body.data.every((h) => h.level === 'central'));
});

test('S10: is-holiday, next-holiday and range items carry level too', async () => {
  const paths = [
    `/v1/date/next-holiday?country=IN&date=${latest}-01-01&region=${region}`,
    `/v1/holidays/range?country=IN&start=${latest}-01-01&end=${latest}-03-31&region=${region}`,
  ];
  for (const p of paths) {
    const { body } = await getJson(server.baseUrl, p);
    assert.ok(body.data.length > 0, p);
    assert.ok(body.data.every((h) => typeof h.level === 'string'), p);
  }
  const first = (await getJson(server.baseUrl, `/v1/holidays?country=IN&year=${latest}&region=${region}`)).body.data[0];
  const { body } = await getJson(server.baseUrl, `/v1/date/is-holiday?country=IN&date=${first.date}&region=${region}`);
  assert.ok(body.data[0].holidays.every((h) => typeof h.level === 'string'));
});

test('S10: /calendar day rows are unchanged (no level key)', async () => {
  const { body } = await getJson(server.baseUrl, `/v1/calendar?country=IN&year=${latest}&region=${region}`);
  assert.equal('level' in body.data[0], false);
});
