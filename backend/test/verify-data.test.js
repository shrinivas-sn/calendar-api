'use strict';

// S14: the data checker covers any year and treats an empty region file as an error.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { verifyYear } = require('../scripts/verify-data');
const regions = require('../config/regions');
const { makeDataDir } = require('./fixture-data');

const realDataDir = path.join(__dirname, '..', 'data');
const realYears = fs.readdirSync(realDataDir).filter((n) => /^\d{4}$/.test(n)).map(Number);

// A minimal valid year: every region has one Republic Day item; central also has
// 15 Aug and 2 Oct.
function validYearFiles(year, overrides = {}) {
  const item = (date, name) => ({
    name, date, type: 'gazetted_holiday', region: ['IN'], description: 'Gazetted Holiday',
    source: 'https://www.india.gov.in/calendar',
  });
  const files = {};
  for (const r of regions) {
    const data = r.isCentral
      ? [item(`${year}-01-26`, 'Republic Day'), item(`${year}-08-15`, 'Independence Day'), item(`${year}-10-02`, 'Gandhi Jayanti')]
      : [item(`${year}-01-26`, 'Republic Day')];
    const content = overrides[r.code] || data;
    files[`${year}/IN/${r.code}/holidays.json`] = JSON.stringify({
      country: 'IN', year, region: r.code, data: content,
      meta: {
        apiVersion: 'v1', totalHolidays: content.length,
        gazettedCount: content.filter((h) => h.type === 'gazetted_holiday').length, restrictedCount: 0,
      },
    });
  }
  files[`${year}/IN/INDEX.json`] = JSON.stringify({ country: 'IN', year, totalRegions: regions.length });
  return files;
}

test('S14: every real data year passes', () => {
  for (const year of realYears) {
    const { errors } = verifyYear(realDataDir, year);
    assert.deepEqual(errors, [], `year ${year}`);
  }
});

test('S14: a valid fixture year passes', () => {
  const dir = makeDataDir(validYearFiles(2031));
  try {
    assert.deepEqual(verifyYear(dir.root, 2031).errors, []);
  } finally {
    dir.cleanup();
  }
});

test('S14: an empty region file is an error', () => {
  const dir = makeDataDir(validYearFiles(2031, { KA: [] }));
  try {
    const { errors } = verifyYear(dir.root, 2031);
    assert.ok(errors.some((e) => e.includes('[KA]') && /empty/i.test(e)), errors.join('\n'));
  } finally {
    dir.cleanup();
  }
});

test('S14: central without a fixed national holiday is an error', () => {
  const dir = makeDataDir(validYearFiles(2031, {
    central: [{
      name: 'Republic Day', date: '2031-01-26', type: 'gazetted_holiday', region: ['IN'],
      description: 'Gazetted Holiday', source: 'https://www.india.gov.in/calendar',
    }],
  }));
  try {
    const { errors } = verifyYear(dir.root, 2031);
    assert.ok(errors.some((e) => e.includes('2031-08-15')), errors.join('\n'));
  } finally {
    dir.cleanup();
  }
});
