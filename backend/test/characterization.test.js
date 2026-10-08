'use strict';

// S1: responses captured before the hardening work must stay identical for existing
// consumers. Only keys listed in helpers.ADDED_ITEM_KEYS may appear on top.
// Never regenerate the fixture after a code change.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/index');
const { startServer, getJson, CHARACTERIZATION_URLS, stripAdded } = require('./helpers');
const expected = require('./fixtures/characterization.json');

let server;
before(async () => { server = await startServer(app); });
after(() => server.close());

for (const url of CHARACTERIZATION_URLS) {
  test(`unchanged 200 response: ${url}`, async () => {
    const { status, body } = await getJson(server.baseUrl, url);
    const want = expected[url];
    assert.equal(status, 200);
    assert.equal(body.country, want.country);
    assert.equal(body.year, want.year);
    assert.equal(body.region, want.region);
    assert.equal(body.meta.totalResults, want.totalResults);
    assert.deepEqual(stripAdded(body.data), want.data);
  });
}
