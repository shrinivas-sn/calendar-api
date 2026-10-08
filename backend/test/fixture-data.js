'use strict';

// Builds a throwaway data directory in the OS temp folder. Tests never write to
// backend/data.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

function makeDataDir(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'calendar-api-test-'));
  for (const [rel, content] of Object.entries(files)) {
    const full = path.join(root, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    if (content !== null) fs.writeFileSync(full, content);
  }
  return { root, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

function holidayFile(year, region, items) {
  return JSON.stringify({ country: 'IN', year, region, data: items });
}

module.exports = { makeDataDir, holidayFile };
