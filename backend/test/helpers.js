'use strict';

// Starts an app on a random free port so tests never collide on a fixed one.
function startServer(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve({ baseUrl, close: () => new Promise((r) => server.close(r)) });
    });
  });
}

async function getJson(baseUrl, path) {
  const res = await fetch(baseUrl + path);
  return { status: res.status, headers: res.headers, body: await res.json() };
}

// The URLs whose 200 responses must never change for existing consumers.
const CHARACTERIZATION_URLS = [
  '/v1/holidays?country=IN&year=2026',
  '/v1/holidays?country=IN&year=2026&region=KA',
  '/v1/date/is-holiday?country=IN&date=2026-01-26',
  '/v1/date/next-holiday?country=IN&date=2026-01-01',
  '/v1/holidays/range?country=IN&start=2026-01-01&end=2026-06-30',
  '/v1/calendar?country=IN&year=2026&region=KA',
];

// Keys this hardening work adds on top of the original response. Stripped before
// comparing so additive fields never count as a change.
const ADDED_ITEM_KEYS = ['level'];

function stripAdded(value) {
  if (Array.isArray(value)) return value.map(stripAdded);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (!ADDED_ITEM_KEYS.includes(k)) out[k] = stripAdded(v);
    }
    return out;
  }
  return value;
}

module.exports = { startServer, getJson, CHARACTERIZATION_URLS, stripAdded };
