'use strict';

// S13: the data pipeline takes the year as input, parses ICS correctly, and never
// writes anything unless every region succeeded. No network calls: fetching is
// injected.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { parseIcs, runPipeline } = require('../scripts/parse-ics');
const regions = require('../config/regions');

const SCRIPT = path.join(__dirname, '..', 'scripts', 'parse-ics.js');

function ics(year, events) {
  const body = events.map(([date, summary, description]) => [
    'BEGIN:VEVENT', `DTSTART;VALUE=DATE:${date.replace(/-/g, '')}`,
    `SUMMARY:${summary}`, `DESCRIPTION:${description}`, 'END:VEVENT',
  ].join('\r\n'));
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', ...body, 'END:VCALENDAR'].join('\r\n');
}

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'calendar-pipeline-test-'));
}

test('S13: running without --year prints usage and exits 1', () => {
  const run = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
  assert.equal(run.status, 1);
  assert.match(run.stderr, /--year/);
});

test('S13: an invalid --year exits 1', () => {
  const run = spawnSync(process.execPath, [SCRIPT, '--year', '27'], { encoding: 'utf8' });
  assert.equal(run.status, 1);
});

test('S13: parseIcs unfolds lines, unescapes commas and maps types', () => {
  const text = [
    'BEGIN:VCALENDAR',
    'BEGIN:VEVENT', 'DTSTART;VALUE=DATE:20270126', 'SUMMARY:Republic', '  Day', 'DESCRIPTION:Gazetted Holiday', 'END:VEVENT',
    'BEGIN:VEVENT', 'DTSTART;VALUE=DATE:20270101', 'SUMMARY:New Year\, Day', 'DESCRIPTION:Restricted Holiday', 'END:VEVENT',
    'BEGIN:VEVENT', 'DTSTART;VALUE=DATE:20270202', 'SUMMARY:Some Day', 'DESCRIPTION:Other', 'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const out = parseIcs(text, 'KA', 2027);
  assert.equal(out.year, 2027);
  assert.equal(out.region, 'KA');
  assert.deepEqual(out.data.map((h) => [h.date, h.name, h.type]), [
    ['2027-01-01', 'New Year, Day', 'restricted_holiday'],
    ['2027-01-26', 'Republic Day', 'gazetted_holiday'],
    ['2027-02-02', 'Some Day', 'observance'],
  ]);
  assert.equal(out.meta.totalHolidays, 3);
  assert.equal(out.meta.gazettedCount, 1);
  assert.equal(out.meta.restrictedCount, 1);
});

test('S13: one failing region means nothing is written', async () => {
  const dataDir = tempDir();
  const icsDir = tempDir();
  try {
    const result = await runPipeline({
      year: 2027, dataDir, icsDir,
      fetchIcs: async (region) => {
        if (region.code === 'KA') throw new Error('source returned non-JSON');
        return ics(2027, [['2027-01-26', 'Republic Day', 'Gazetted Holiday']]);
      },
    });
    assert.equal(result.ok, false);
    assert.ok(result.failures.some((f) => f.startsWith('KA:')));
    assert.deepEqual(fs.readdirSync(dataDir), []);
    assert.deepEqual(fs.readdirSync(icsDir), []);
  } finally {
    fs.rmSync(dataDir, { recursive: true, force: true });
    fs.rmSync(icsDir, { recursive: true, force: true });
  }
});

test('S13: a region with zero holidays or a wrong-year date counts as a failure', async () => {
  const dataDir = tempDir();
  try {
    const result = await runPipeline({
      year: 2027, dataDir, icsDir: dataDir,
      fetchIcs: async (region) => {
        if (region.code === 'GA') return ics(2027, []);
        if (region.code === 'GJ') return ics(2026, [['2026-01-26', 'Republic Day', 'Gazetted Holiday']]);
        return ics(2027, [['2027-01-26', 'Republic Day', 'Gazetted Holiday']]);
      },
    });
    assert.equal(result.ok, false);
    assert.ok(result.failures.some((f) => f.startsWith('GA:')));
    assert.ok(result.failures.some((f) => f.startsWith('GJ:')));
    assert.deepEqual(fs.readdirSync(dataDir), []);
  } finally {
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
});

test('S13: when every region succeeds, all files and INDEX.json are written', async () => {
  const dataDir = tempDir();
  const icsDir = tempDir();
  try {
    const result = await runPipeline({
      year: 2027, dataDir, icsDir,
      fetchIcs: async () => ics(2027, [['2027-01-26', 'Republic Day', 'Gazetted Holiday']]),
    });
    assert.equal(result.ok, true);
    for (const r of regions) {
      const file = path.join(dataDir, '2027', 'IN', r.code, 'holidays.json');
      assert.equal(JSON.parse(fs.readFileSync(file, 'utf8')).data.length, 1, r.code);
    }
    const index = JSON.parse(fs.readFileSync(path.join(dataDir, '2027', 'IN', 'INDEX.json'), 'utf8'));
    assert.equal(index.year, 2027);
    assert.equal(index.totalRegions, regions.length);
    assert.equal(fs.readdirSync(icsDir).length, regions.length);
  } finally {
    fs.rmSync(dataDir, { recursive: true, force: true });
    fs.rmSync(icsDir, { recursive: true, force: true });
  }
});
