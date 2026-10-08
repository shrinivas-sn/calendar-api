// Fetches one year of holidays for every region from india.gov.in and updates
// data/<year>/IN/<region>/holidays.json plus INDEX.json.
//
// Usage: node scripts/fetch-holidays.js --year 2027
//
// Exit codes (the monthly GitHub job relies on these):
//   0  updated or unchanged
//   2  not ready: at least one region has not published this year yet
//   1  error: the source failed, or returned something that fails a check
//
// Nothing is written unless every region succeeds. Only regions whose holidays
// actually changed are rewritten, so a run with no real change touches no file.
const fs = require('fs');
const path = require('path');
const https = require('https');

const regions = require('../config/regions');

const DATA_DIR = path.join(__dirname, '..', 'data');
const CMS_URL = 'https://www.india.gov.in/internal/cms';
const SOURCE_URL = 'https://www.india.gov.in/calendar';
const SOURCE_NAME = 'Ministry of Personnel, Public Grievances and Pensions via india.gov.in';
const PAGE_SIZE = 100;
// The source returns intermittent 5xx and HTML error pages; retry those, never 4xx.
// Seen on 08/10/2026: three quick attempts were not enough, so waits grow.
const RETRY_DELAYS_MS = [3000, 10000, 30000];
// Regions that still failed get one more full try after this pause.
const FINAL_PASS_DELAY_MS = 60000;
const PAUSE_BETWEEN_REGIONS_MS = 300;

const EXIT = { ok: 0, error: 1, notReady: 2 };

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Returns the --year value as a number, or null when missing or not 4 digits.
function parseYearArg(argv) {
  const i = argv.indexOf('--year');
  const value = i >= 0 ? argv[i + 1] : undefined;
  return /^\d{4}$/.test(value || '') ? Number(value) : null;
}

// One POST to the CMS. Resolves { statusCode, body }; rejects on network errors.
function postCms(route) {
  return new Promise((resolve, reject) => {
    const dataStr = JSON.stringify({ route });
    const parsedUrl = new URL(CMS_URL);
    const req = https.request({
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname,
      method: 'POST',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataStr),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });
    req.on('timeout', () => req.destroy(new Error('request timed out after 30s')));
    req.on('error', reject);
    req.write(dataStr);
    req.end();
  });
}

class RetryableError extends Error {}

// Fetches one page and returns the parsed CMS JSON, retrying transient failures.
async function fetchPage(route, { post = postCms, delays = RETRY_DELAYS_MS, wait = sleep } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      let response;
      try {
        response = await post(route);
      } catch (err) {
        throw new RetryableError(`network error: ${err.message}`);
      }
      if (response.statusCode >= 500) {
        throw new RetryableError(`CMS returned status ${response.statusCode}`);
      }
      if (response.statusCode !== 200) {
        throw new Error(`CMS returned status ${response.statusCode}`);
      }
      try {
        return JSON.parse(response.body);
      } catch {
        throw new RetryableError(`CMS returned non-JSON: ${response.body.slice(0, 80).replace(/\s+/g, ' ')}`);
      }
    } catch (err) {
      if (!(err instanceof RetryableError) || attempt >= delays.length) {
        throw new Error(err.message + (attempt > 0 ? ` (after ${attempt + 1} attempts)` : ''));
      }
      await wait(delays[attempt]);
    }
  }
}

function regionRoute(region, year, page) {
  const range = `filters[date][$gte]=${year}-01-01&filters[date][$lte]=${year}-12-31`;
  const paging = `pagination[pageSize]=${PAGE_SIZE}&pagination[page]=${page}`;
  if (region.isCentral) {
    return `/api/calendar-holidays?${range}&${paging}`;
  }
  return `/api/state-holidays?populate=*&filters[state_dept_org][alias]=${region.alias}&${range}&${paging}&sort=id`;
}

// Every raw CMS item for one region and year, across all pages.
async function fetchRegionItems(region, year, options) {
  const items = [];
  for (let page = 1; ; page++) {
    const result = await fetchPage(regionRoute(region, year, page), options);
    const pageItems = result?.data?.data;
    if (!Array.isArray(pageItems)) {
      throw new Error('CMS response has no data.data list');
    }
    items.push(...pageItems);
    const pagination = result?.data?.meta?.pagination;
    if (!pagination || page >= pagination.pageCount) {
      if (pagination && pagination.total !== items.length) {
        throw new Error(`CMS reported ${pagination.total} holidays but returned ${items.length}`);
      }
      return items;
    }
  }
}

function mapType(holidayType) {
  const t = String(holidayType || '').toLowerCase();
  if (t.includes('gazetted')) return 'gazetted_holiday';
  if (t.includes('restricted')) return 'restricted_holiday';
  return 'observance';
}

// Raw CMS items -> the holiday records stored in holidays.json. Same fields and
// values the earlier ICS-based pipeline produced (checked against all 2026 files).
function toHolidays(items) {
  const holidays = [];
  for (const item of items) {
    const a = item?.attributes || {};
    // Names are kept exactly as published (some end in a space): trimming would
    // change values existing API consumers already receive.
    const name = String(a.title || '');
    const date = String(a.date || '');
    if (!name.trim() ||!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error(`malformed holiday record: ${JSON.stringify(a).slice(0, 120)}`);
    }
    const isDuplicate = holidays.some(h => h.date === date && h.name.toLowerCase() === name.toLowerCase());
    if (!isDuplicate) {
      holidays.push({
        name,
        date,
        type: mapType(a.holiday_type),
        region: ["IN"],
        description: `${a.holiday_type} Holiday`,
        source: SOURCE_URL
      });
    }
  }
  holidays.sort((x, y) => x.date.localeCompare(y.date));
  return holidays;
}

// Order-insensitive fingerprint of a holiday list, so a reorder is not a change.
function fingerprint(holidays) {
  return JSON.stringify(holidays.map(h => JSON.stringify([h.date, h.name, h.type, h.description])).sort());
}

function readExisting(dataDir, year, code) {
  try {
    const file = path.join(dataDir, String(year), 'IN', code, 'holidays.json');
    return JSON.parse(fs.readFileSync(file, 'utf8')).data;
  } catch {
    return null;
  }
}

function buildFile(holidays, regionCode, year, today) {
  return {
    country: "IN",
    year,
    region: regionCode,
    data: holidays,
    meta: {
      apiVersion: "v1",
      totalHolidays: holidays.length,
      gazettedCount: holidays.filter(h => h.type === "gazetted_holiday").length,
      restrictedCount: holidays.filter(h => h.type === "restricted_holiday").length,
      source: SOURCE_NAME,
      lastVerified: today
    }
  };
}

// Returns { status: 'updated' | 'unchanged' | 'not-ready' | 'error', failures, notReady, changed }.
async function runYear({
  year,
  dataDir = DATA_DIR,
  fetchItems = fetchRegionItems,
  pause = () => sleep(PAUSE_BETWEEN_REGIONS_MS),
  finalPassDelay = () => sleep(FINAL_PASS_DELAY_MS),
  today = new Date().toISOString().split('T')[0],
  log = console.log,
}) {
  log(`=== FETCHING ${year} HOLIDAYS FOR ${regions.length} REGIONS ===`);

  // 1. Fetch and check everything in memory.
  const results = [];
  const notReady = [];
  let failed = [];
  const fetchOne = async (region) => {
    const holidays = toHolidays(await fetchItems(region, year));
    if (holidays.length === 0) {
      notReady.push(region.code);
      return;
    }
    const wrongYear = holidays.find(h => !h.date.startsWith(`${year}-`));
    if (wrongYear) throw new Error(`holiday dated ${wrongYear.date} is outside ${year}`);
    results.push({ region, holidays });
  };
  for (const region of regions) {
    try {
      await fetchOne(region);
    } catch (err) {
      failed.push({ region, message: err.message });
    }
    await pause();
  }
  // One more full try for regions that failed, after the source has had a rest.
  if (failed.length > 0) {
    log(`[Retry] ${failed.map(f => f.region.code).join(', ')} failed; trying once more shortly.`);
    await finalPassDelay();
    const stillFailed = [];
    for (const { region } of failed) {
      try {
        await fetchOne(region);
      } catch (err) {
        stillFailed.push({ region, message: err.message });
      }
      await pause();
    }
    failed = stillFailed;
  }
  // Keep the configured region order in the index and logs.
  results.sort((x, y) => regions.indexOf(x.region) - regions.indexOf(y.region));
  const failures = failed.map(f => `${f.region.code}: ${f.message}`);

  if (failures.length > 0) {
    failures.forEach(f => log(`[FAIL] ${f}`));
    log(`RESULT ${year}: error — ${failures.length} region(s) failed. Nothing was written.`);
    return { status: 'error', failures, notReady, changed: [] };
  }
  if (notReady.length > 0) {
    log(`RESULT ${year}: not-ready — not published yet for ${notReady.length} region(s): ${notReady.join(', ')}. Nothing was written.`);
    return { status: 'not-ready', failures, notReady, changed: [] };
  }

  // 2. Write only regions whose holidays changed.
  const changed = [];
  for (const { region, holidays } of results) {
    const existing = readExisting(dataDir, year, region.code);
    if (existing && fingerprint(existing) === fingerprint(holidays)) continue;
    const outputDir = path.join(dataDir, String(year), 'IN', region.code);
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'holidays.json'),
      JSON.stringify(buildFile(holidays, region.code, year, today), null, 2), 'utf8');
    changed.push(region.code);
    log(`[Write] ${region.code}: ${existing ? existing.length : 0} -> ${holidays.length} holidays`);
  }

  if (changed.length === 0) {
    log(`RESULT ${year}: unchanged — all ${regions.length} regions match the saved data.`);
    return { status: 'unchanged', failures, notReady, changed };
  }

  const indexData = {
    country: "IN",
    year,
    lastUpdated: today,
    totalRegions: results.length,
    regions: results.map(({ region, holidays }) => {
      const file = buildFile(holidays, region.code, year, today);
      return {
        region: region.code,
        path: `data/${year}/IN/${region.code}/holidays.json`,
        year,
        totalHolidays: file.meta.totalHolidays,
        gazettedCount: file.meta.gazettedCount,
        restrictedCount: file.meta.restrictedCount
      };
    })
  };
  fs.writeFileSync(path.join(dataDir, String(year), 'IN', 'INDEX.json'), JSON.stringify(indexData, null, 2), 'utf8');
  log(`RESULT ${year}: updated — ${changed.length} region(s) changed: ${changed.join(', ')}.`);
  return { status: 'updated', failures, notReady, changed };
}

module.exports = { runYear, toHolidays, fetchRegionItems, fetchPage, parseYearArg, EXIT };

if (require.main === module) {
  const year = parseYearArg(process.argv);
  if (!year) {
    console.error('Usage: node scripts/fetch-holidays.js --year <YYYY>');
    process.exit(EXIT.error);
  }
  runYear({ year })
    .then(({ status }) => {
      process.exitCode = status === 'error' ? EXIT.error : status === 'not-ready' ? EXIT.notReady : EXIT.ok;
    })
    .catch((err) => { console.error(err); process.exitCode = EXIT.error; });
}
