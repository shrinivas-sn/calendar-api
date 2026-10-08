'use strict';

// S13 (rewritten for the direct-JSON pipeline) and S19–S21:
// year is an argument; retries transient source errors; reads every page;
// writes nothing unless every region succeeds; "not published yet" is its own
// status; a run with no real change writes no file. No network: fetching is injected.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { runYear, toHolidays, fetchRegionItems, fetchPage } = require('../scripts/fetch-holidays');
const regions = require('../config/regions');

const SCRIPT = path.join(__dirname, '..', 'scripts', 'fetch-holidays.js');
const noPause = async () => {};
const noWait = async () => {};
const quiet = () => {};

const raw = (date, title, holiday_type = 'Gazetted') => ({ attributes: { date, title, holiday_type } });
const tempDir = () => fs.mkdtempSync(path.join(os.tmpdir(), 'calendar-fetch-test-'));
const cmsPage = (items, page = 1, pageCount = 1, total = items.length) =>
  ({ statusCode: 200, body: JSON.stringify({ data: { data: items, meta: { pagination: { page, pageCount, total } } } }) });
const everyRegion = (items) => async () => items;

test('S13: running without --year prints usage and exits 1', () => {
  const run = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
  assert.equal(run.status, 1);
  assert.match(run.stderr, /--year/);
});

test('S13: toHolidays maps fields and types, dedupes case-insensitively, sorts', () => {
  const out = toHolidays([
    raw('2027-01-26', 'Republic Day'),
    raw('2027-01-01', 'New Year Day', 'Restricted'),
    raw('2027-01-26', 'republic day'),
    raw('2027-02-02', 'Other Day', 'Something'),
  ]);
  const src = 'https://www.india.gov.in/calendar';
  assert.deepEqual(out, [
    { name: 'New Year Day', date: '2027-01-01', type: 'restricted_holiday', region: ['IN'], description: 'Restricted Holiday', source: src },
    { name: 'Republic Day', date: '2027-01-26', type: 'gazetted_holiday', region: ['IN'], description: 'Gazetted Holiday', source: src },
    { name: 'Other Day', date: '2027-02-02', type: 'observance', region: ['IN'], description: 'Something Holiday', source: src },
  ]);
});

test('S13: names are kept exactly as published (no trimming)', () => {
  assert.equal(toHolidays([raw('2027-01-14', 'Magh Bihu ')])[0].name, 'Magh Bihu ');
});

test('S19: a region that fails the first pass is retried once and can still succeed', async () => {
  const dataDir = tempDir();
  let kaCalls = 0;
  try {
    const result = await runYear({
      year: 2027, dataDir, pause: noPause, finalPassDelay: noPause, log: quiet,
      fetchItems: async (region) => {
        if (region.code === 'KA' && kaCalls++ === 0) throw new Error('CMS returned status 504 (after 4 attempts)');
        return [raw('2027-01-26', 'Republic Day')];
      },
    });
    assert.equal(result.status, 'updated');
    assert.equal(kaCalls, 2);
    const index = JSON.parse(fs.readFileSync(path.join(dataDir, '2027', 'IN', 'INDEX.json'), 'utf8'));
    assert.deepEqual(index.regions.map((r) => r.region), regions.map((r) => r.code));
  } finally {
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
});

test('S13: a malformed record is an error, not a silent skip', () => {
  assert.throws(() => toHolidays([raw('26-01-2027', 'Republic Day')]), /malformed/);
});

test('S19: transient 5xx and non-JSON are retried, then succeed', async () => {
  const responses = [
    { statusCode: 504, body: '<HTML>' },
    { statusCode: 200, body: '<HTML>error' },
    cmsPage([raw('2027-01-26', 'Republic Day')]),
  ];
  let calls = 0;
  const result = await fetchPage('/x', { post: async () => responses[calls++], wait: noWait });
  assert.equal(calls, 3);
  assert.equal(result.data.data.length, 1);
});

test('S19: gives up after the last retry with the real reason', async () => {
  let calls = 0;
  const post = async () => { calls++; return { statusCode: 504, body: '' }; };
  await assert.rejects(fetchPage('/x', { post, wait: noWait }), /504.*after 4 attempts/);
  assert.equal(calls, 4);
});

test('S19: a 4xx is not retried', async () => {
  let calls = 0;
  const post = async () => { calls++; return { statusCode: 403, body: '' }; };
  await assert.rejects(fetchPage('/x', { post, wait: noWait }), /403/);
  assert.equal(calls, 1);
});

test('S20: every page is read, and a short total is an error', async () => {
  const pages = {
    1: cmsPage([raw('2027-01-26', 'A')], 1, 2, 2),
    2: cmsPage([raw('2027-08-15', 'B')], 2, 2, 2),
  };
  const seen = [];
  const post = async (route) => {
    const page = Number(/pagination\[page\]=(\d+)/.exec(route)[1]);
    seen.push(page);
    return pages[page];
  };
  const items = await fetchRegionItems(regions[0], 2027, { post, wait: noWait });
  assert.deepEqual(seen, [1, 2]);
  assert.equal(items.length, 2);

  const short = async () => cmsPage([raw('2027-01-26', 'A')], 1, 1, 5);
  await assert.rejects(fetchRegionItems(regions[0], 2027, { post: short, wait: noWait }), /reported 5/);
});

test('S13: one failing region means nothing is written', async () => {
  const dataDir = tempDir();
  try {
    const result = await runYear({
      year: 2027, dataDir, pause: noPause, finalPassDelay: noPause, log: quiet,
      fetchItems: async (region) => {
        if (region.code === 'KA') throw new Error('CMS returned status 504 (after 3 attempts)');
        return [raw('2027-01-26', 'Republic Day')];
      },
    });
    assert.equal(result.status, 'error');
    assert.ok(result.failures.some((f) => f.startsWith('KA:')));
    assert.deepEqual(fs.readdirSync(dataDir), []);
  } finally {
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
});

test('S21: regions with no holidays yet give not-ready, and nothing is written', async () => {
  const dataDir = tempDir();
  try {
    const result = await runYear({
      year: 2027, dataDir, pause: noPause, finalPassDelay: noPause, log: quiet,
      fetchItems: async (region) => (region.isCentral ? [raw('2027-01-26', 'Republic Day')] : []),
    });
    assert.equal(result.status, 'not-ready');
    assert.equal(result.notReady.length, regions.length - 1);
    assert.deepEqual(fs.readdirSync(dataDir), []);
  } finally {
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
});

test('S13: a date outside the year is an error', async () => {
  const dataDir = tempDir();
  try {
    const result = await runYear({
      year: 2027, dataDir, pause: noPause, finalPassDelay: noPause, log: quiet,
      fetchItems: everyRegion([raw('2026-12-31', 'Wrong year')]),
    });
    assert.equal(result.status, 'error');
    assert.deepEqual(fs.readdirSync(dataDir), []);
  } finally {
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
});

test('S21: new year written; unchanged rerun writes nothing; one change rewrites one region', async () => {
  const dataDir = tempDir();
  const republic = raw('2027-01-26', 'Republic Day');
  const independence = raw('2027-08-15', 'Independence Day');
  try {
    const first = await runYear({
      year: 2027, dataDir, pause: noPause, finalPassDelay: noPause, log: quiet, today: '2026-11-01',
      fetchItems: everyRegion([republic, independence]),
    });
    assert.equal(first.status, 'updated');
    assert.equal(first.changed.length, regions.length);
    const index = JSON.parse(fs.readFileSync(path.join(dataDir, '2027', 'IN', 'INDEX.json'), 'utf8'));
    assert.equal(index.totalRegions, regions.length);

    // Same holidays in a different order, a month later: not a change.
    const kaFile = path.join(dataDir, '2027', 'IN', 'KA', 'holidays.json');
    const before = fs.readFileSync(kaFile, 'utf8');
    const second = await runYear({
      year: 2027, dataDir, pause: noPause, finalPassDelay: noPause, log: quiet, today: '2026-12-01',
      fetchItems: everyRegion([independence, republic]),
    });
    assert.equal(second.status, 'unchanged');
    assert.equal(fs.readFileSync(kaFile, 'utf8'), before);

    // Only Karnataka moves a date: only Karnataka is rewritten.
    const third = await runYear({
      year: 2027, dataDir, pause: noPause, finalPassDelay: noPause, log: quiet, today: '2027-01-01',
      fetchItems: async (region) => (region.code === 'KA'
        ? [republic, raw('2027-08-16', 'Independence Day')]
        : [republic, independence]),
    });
    assert.equal(third.status, 'updated');
    assert.deepEqual(third.changed, ['KA']);
    const ka = JSON.parse(fs.readFileSync(kaFile, 'utf8'));
    assert.equal(ka.data[1].date, '2027-08-16');
    assert.equal(ka.meta.lastVerified, '2027-01-01');
  } finally {
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
});
