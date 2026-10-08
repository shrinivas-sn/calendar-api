'use strict';

// S17: scope=state returns only the region's own list (no central merge, no
// cross-list duplicates). S18: restricted=working on /calendar counts days that
// only have restricted holidays as working days. Defaults are unchanged (S1).
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const app = require('../src/index');
const { startServer, getJson } = require('./helpers');

const dataDir = path.join(__dirname, '..', 'data');
const latest = Math.max(...fs.readdirSync(dataDir).filter((n) => /^\d{4}$/.test(n)).map(Number));
const readList = (region) =>
  JSON.parse(fs.readFileSync(path.join(dataDir, String(latest), 'IN', region, 'holidays.json'), 'utf8')).data;

let server;
before(async () => { server = await startServer(app); });
after(() => server.close());

test('S17: scope=state returns exactly the state file, sorted, tagged state', async () => {
  const { status, body } = await getJson(server.baseUrl, `/v1/holidays?country=IN&year=${latest}&region=KA&scope=state`);
  assert.equal(status, 200);
  const file = readList('KA');
  assert.equal(body.data.length, file.length);
  assert.deepEqual(body.data.map(({ level, ...h }) => h), [...file].sort((a, b) => a.date.localeCompare(b.date)));
  assert.ok(body.data.every((h) => h.level === 'state'));
});

test('S17: scope=all (explicit) equals the default response', async () => {
  const dflt = await getJson(server.baseUrl, `/v1/holidays?country=IN&year=${latest}&region=KA`);
  const all = await getJson(server.baseUrl, `/v1/holidays?country=IN&year=${latest}&region=KA&scope=all`);
  assert.deepEqual(all.body.data, dflt.body.data);
});

test('S17: scope=state with central region returns the central list', async () => {
  const { body } = await getJson(server.baseUrl, `/v1/holidays?country=IN&year=${latest}&scope=state`);
  assert.equal(body.data.length, readList('central').length);
});

test('S17: scope=state applies to is-holiday, next-holiday, range and calendar', async () => {
  const kaDates = new Set(readList('KA').map((h) => h.date));
  const centralOnly = readList('central').find((h) => !kaDates.has(h.date));
  assert.ok(centralOnly, 'fixture: a central-only date exists');
  const isH = await getJson(server.baseUrl, `/v1/date/is-holiday?country=IN&date=${centralOnly.date}&region=KA&scope=state`);
  assert.equal(isH.body.data[0].is_holiday, false);
  const isAll = await getJson(server.baseUrl, `/v1/date/is-holiday?country=IN&date=${centralOnly.date}&region=KA`);
  assert.equal(isAll.body.data[0].is_holiday, true);

  const range = await getJson(server.baseUrl, `/v1/holidays/range?country=IN&start=${latest}-01-01&end=${latest}-12-31&region=KA&scope=state`);
  assert.equal(range.body.data.length, readList('KA').length);

  const next = await getJson(server.baseUrl, `/v1/date/next-holiday?country=IN&date=${latest}-01-01&region=KA&scope=state`);
  assert.ok(next.body.data.every((h) => h.level === 'state'));

  const cal = await getJson(server.baseUrl, `/v1/calendar?country=IN&year=${latest}&region=KA&scope=state`);
  assert.equal(cal.body.data.find((d) => d.date === centralOnly.date).is_holiday, false);
});

test('S17: an unknown scope is 400', async () => {
  const { status, body } = await getJson(server.baseUrl, `/v1/holidays?country=IN&year=${latest}&region=KA&scope=xyz`);
  assert.equal(status, 400);
  assert.match(body.message, /scope/);
});

test('S18: restricted=working makes restricted-only weekdays working days', async () => {
  const dflt = await getJson(server.baseUrl, `/v1/calendar?country=IN&year=${latest}&region=KA`);
  const opt = await getJson(server.baseUrl, `/v1/calendar?country=IN&year=${latest}&region=KA&restricted=working`);
  assert.equal(opt.status, 200);
  let flipped = 0;
  dflt.body.data.forEach((day, i) => {
    const o = opt.body.data[i];
    const restrictedOnly = day.is_holiday && day.holiday_type.split(' / ').every((t) => t === 'restricted_holiday');
    // Only the working-day flag may differ, and only on restricted-only weekdays.
    assert.deepEqual({ ...o, is_working_day: day.is_working_day }, day);
    if (restrictedOnly && !day.is_weekend) {
      assert.equal(o.is_working_day, true, day.date);
      flipped++;
    } else {
      assert.equal(o.is_working_day, day.is_working_day, day.date);
    }
  });
  assert.ok(flipped > 0);
});

test('S18: restricted=holiday equals the default; unknown value is 400', async () => {
  const dflt = await getJson(server.baseUrl, `/v1/calendar?country=IN&year=${latest}&region=KA`);
  const same = await getJson(server.baseUrl, `/v1/calendar?country=IN&year=${latest}&region=KA&restricted=holiday`);
  assert.deepEqual(same.body.data, dflt.body.data);
  const bad = await getJson(server.baseUrl, `/v1/calendar?country=IN&year=${latest}&region=KA&restricted=yes`);
  assert.equal(bad.status, 400);
});
