// Fetches one year of holidays for every region from india.gov.in and writes
// data/<year>/IN/<region>/holidays.json plus INDEX.json.
//
// Usage: node scripts/parse-ics.js --year 2027
//
// All or nothing: every region is fetched and parsed in memory first. If any region
// fails, returns no holidays, or returns dates outside the year, nothing is written
// and the script exits 1. Existing data is never replaced by an empty or partial run.
const fs = require('fs');
const path = require('path');
const https = require('https');

const regions = require('../config/regions');

const DATA_DIR = path.join(__dirname, '..', 'data');
const ICS_DIR = path.join(__dirname, '..', 'ics');
const SOURCE_URL = 'https://www.india.gov.in/calendar';
const SOURCE_NAME = 'Ministry of Personnel, Public Grievances and Pensions via india.gov.in';

// Returns the --year value as a number, or null when missing or not 4 digits.
function parseYearArg(argv) {
  const i = argv.indexOf('--year');
  const value = i >= 0 ? argv[i + 1] : undefined;
  return /^\d{4}$/.test(value || '') ? Number(value) : null;
}

// Helper to make POST requests
function postJson(url, payload) {
  return new Promise((resolve, reject) => {
    const dataStr = JSON.stringify(payload);
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataStr),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseBody
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(dataStr);
    req.end();
  });
}

// Fetch raw holidays data from the CMS. Throws on anything but a complete JSON list.
async function fetchHolidaysData(region, year) {
  let route;
  if (region.isCentral) {
    route = `/api/calendar-holidays?filters[date][$gte]=${year}-01-01&filters[date][$lte]=${year}-12-31&pagination[pageSize]=100`;
  } else {
    route = `/api/state-holidays?populate=*&filters[state_dept_org][alias]=${region.alias}&filters[date][$gte]=${year}-01-01&filters[date][$lte]=${year}-12-31&pagination[pageSize]=100&sort=id`;
  }

  console.log(`[Fetch] Querying CMS route for ${region.name}...`);
  const response = await postJson("https://www.india.gov.in/internal/cms", { route });
  if (response.statusCode !== 200) {
    throw new Error(`CMS API returned status ${response.statusCode}`);
  }

  let result;
  try {
    result = JSON.parse(response.body);
  } catch {
    throw new Error(`CMS API returned non-JSON: ${response.body.slice(0, 80).replace(/\s+/g, ' ')}`);
  }
  const items = result?.data?.data;
  if (!Array.isArray(items)) {
    throw new Error('CMS API response has no data.data list');
  }
  // One page of 100 is requested. If the source holds more, refuse rather than drop some.
  const total = result?.data?.meta?.pagination?.total;
  if (typeof total === 'number' && total > items.length) {
    throw new Error(`CMS API has ${total} holidays but returned ${items.length}; pagination needed`);
  }
  return items;
}

// Generate ICS string from raw holidays array
async function generateIcs(holidays) {
  if (!holidays || holidays.length === 0) {
    return [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "CALSCALE:GREGORIAN",
      "PRODID:npi-calendar",
      "METHOD:PUBLISH",
      "END:VCALENDAR"
    ].join("\r\n");
  }

  const response = await postJson("https://www.india.gov.in/api/calendar-ics", { holidays });
  if (response.statusCode !== 200) {
    throw new Error(`ICS API returned status ${response.statusCode}`);
  }

  return response.body;
}

// Default fetcher: raw holidays -> ICS text. Pauses briefly to be polite to the source.
async function fetchIcsFromSource(region, year) {
  const holidays = await fetchHolidaysData(region, year);
  const icsText = await generateIcs(holidays);
  await new Promise(resolve => setTimeout(resolve, 300));
  return icsText;
}

// Parse ICS text and return the structured JSON object written to holidays.json
function parseIcs(icsText, regionCode, year) {
  // Unfold folded lines
  const unfolded = icsText.replace(/\r?\n[ \t]/g, '');

  const events = unfolded.split('BEGIN:VEVENT');
  // First element is calendar header, ignore it
  events.shift();

  const holidaysList = [];

  for (const event of events) {
    let summary = '';
    let dateStr = '';
    let description = '';

    const lines = event.split(/\r?\n/);
    for (const line of lines) {
      if (line.startsWith('SUMMARY:')) {
        summary = line.substring(8).replace(/\\,/g, ',');
      } else if (line.startsWith('DTSTART;VALUE=DATE:')) {
        dateStr = line.substring(19).trim(); // YYYYMMDD
      } else if (line.startsWith('DESCRIPTION:')) {
        description = line.substring(12).trim();
      }
    }

    if (summary && dateStr) {
      const formattedDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;

      // Map type
      let mappedType = "observance";
      if (description.toLowerCase().includes("gazetted")) {
        mappedType = "gazetted_holiday";
      } else if (description.toLowerCase().includes("restricted")) {
        mappedType = "restricted_holiday";
      }

      // Check for duplicates
      const isDuplicate = holidaysList.some(h =>
        h.date === formattedDate &&
        h.name.toLowerCase() === summary.toLowerCase()
      );

      if (!isDuplicate) {
        holidaysList.push({
          name: summary,
          date: formattedDate,
          type: mappedType,
          region: ["IN"],
          description: description,
          source: SOURCE_URL
        });
      }
    }
  }

  // Sort holidays by date ascending
  holidaysList.sort((a, b) => a.date.localeCompare(b.date));

  return {
    country: "IN",
    year,
    region: regionCode,
    data: holidaysList,
    meta: {
      apiVersion: "v1",
      totalHolidays: holidaysList.length,
      gazettedCount: holidaysList.filter(h => h.type === "gazetted_holiday").length,
      restrictedCount: holidaysList.filter(h => h.type === "restricted_holiday").length,
      source: SOURCE_NAME,
      lastVerified: new Date().toISOString().split('T')[0]
    }
  };
}

function countExisting(dataDir, year, code) {
  try {
    const file = path.join(dataDir, String(year), 'IN', code, 'holidays.json');
    return JSON.parse(fs.readFileSync(file, 'utf8')).data.length;
  } catch {
    return 0;
  }
}

// Returns { ok, failures }. Writes files only when ok is true.
async function runPipeline({ year, dataDir = DATA_DIR, icsDir = ICS_DIR, fetchIcs = fetchIcsFromSource }) {
  console.log(`=== FETCHING ${year} HOLIDAYS FOR ${regions.length} REGIONS ===`);

  // 1. Fetch and parse everything in memory.
  const results = [];
  const failures = [];
  for (const region of regions) {
    try {
      const icsText = await fetchIcs(region, year);
      const parsed = parseIcs(icsText, region.code, year);
      if (parsed.data.length === 0) {
        throw new Error('source returned 0 holidays');
      }
      const wrongYear = parsed.data.find(h => !h.date.startsWith(`${year}-`));
      if (wrongYear) {
        throw new Error(`holiday dated ${wrongYear.date} is outside ${year}`);
      }
      results.push({ region, icsText, parsed });
      console.log(`[OK] ${region.code}: ${parsed.data.length} holidays`);
    } catch (err) {
      failures.push(`${region.code}: ${err.message}`);
      console.error(`[FAIL] ${region.code}: ${err.message}`);
    }
  }

  if (failures.length > 0) {
    console.error(`\n${failures.length} of ${regions.length} regions failed. Nothing was written.`);
    return { ok: false, failures };
  }

  // 2. Every region succeeded: write ICS, JSON and the index.
  fs.mkdirSync(icsDir, { recursive: true });
  const indexRegions = [];
  for (const { region, icsText, parsed } of results) {
    const before = countExisting(dataDir, year, region.code);
    fs.writeFileSync(path.join(icsDir, `IN_${region.code}_${year}.ics`), icsText, 'utf8');
    const outputDir = path.join(dataDir, String(year), 'IN', region.code);
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, 'holidays.json'), JSON.stringify(parsed, null, 2), 'utf8');
    console.log(`[Write] ${region.code}: ${before} -> ${parsed.data.length} holidays`);
    indexRegions.push({
      region: region.code,
      path: `data/${year}/IN/${region.code}/holidays.json`,
      year,
      totalHolidays: parsed.meta.totalHolidays,
      gazettedCount: parsed.meta.gazettedCount,
      restrictedCount: parsed.meta.restrictedCount
    });
  }

  const indexData = {
    country: "IN",
    year,
    lastUpdated: new Date().toISOString().split('T')[0],
    totalRegions: indexRegions.length,
    regions: indexRegions
  };
  fs.writeFileSync(path.join(dataDir, String(year), 'IN', 'INDEX.json'), JSON.stringify(indexData, null, 2), 'utf8');
  console.log(`=== DONE: data/${year}/IN written. Next: npm run verify -- --year ${year} ===`);
  return { ok: true, failures: [] };
}

module.exports = { parseIcs, runPipeline, parseYearArg };

if (require.main === module) {
  const year = parseYearArg(process.argv);
  if (!year) {
    console.error('Usage: node scripts/parse-ics.js --year <YYYY>');
    process.exit(1);
  }
  runPipeline({ year })
    .then(({ ok }) => { process.exitCode = ok ? 0 : 1; })
    .catch((err) => { console.error(err); process.exitCode = 1; });
}
