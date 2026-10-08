'use strict';

// S12: one region list drives both data scripts and matches the data on disk.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const regions = require('../config/regions');

test('S12: 37 regions, unique codes, exactly one central entry', () => {
  assert.equal(regions.length, 37);
  assert.equal(new Set(regions.map((r) => r.code)).size, regions.length);
  assert.equal(regions.filter((r) => r.isCentral).length, 1);
  for (const r of regions) assert.ok(r.name && r.alias && r.code, JSON.stringify(r));
});

test('S12: region codes equal the region folders of the newest data year', () => {
  const dataDir = path.join(__dirname, '..', 'data');
  const latest = Math.max(...fs.readdirSync(dataDir).filter((n) => /^\d{4}$/.test(n)).map(Number));
  const folders = fs.readdirSync(path.join(dataDir, String(latest), 'IN'), { withFileTypes: true })
    .filter((d) => d.isDirectory()).map((d) => d.name);
  assert.deepEqual(new Set(regions.map((r) => r.code)), new Set(folders));
});
