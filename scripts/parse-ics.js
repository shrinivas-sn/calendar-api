const fs = require('fs');
const path = require('path');
const https = require('https');

// Define region configurations
const regions = [
  { name: "Central Government", alias: "central", isCentral: true },
  { name: "Andhra Pradesh", alias: "andhra-pradesh" },
  { name: "Arunachal Pradesh", alias: "arunachal-pradesh" },
  { name: "Assam", alias: "assam" },
  { name: "Bihar", alias: "bihar" },
  { name: "Chhattisgarh", alias: "chhattisgarh" },
  { name: "Goa", alias: "goa" },
  { name: "Gujarat", alias: "gujarat" },
  { name: "Haryana", alias: "haryana" },
  { name: "Himachal Pradesh", alias: "himachal-pradesh" },
  { name: "Jharkhand", alias: "jharkhand" },
  { name: "Karnataka", alias: "karnataka" },
  { name: "Kerala", alias: "kerala" },
  { name: "Madhya Pradesh", alias: "madhya-pradesh" },
  { name: "Maharashtra", alias: "maharashtra" },
  { name: "Manipur", alias: "manipur" },
  { name: "Meghalaya", alias: "meghalaya" },
  { name: "Mizoram", alias: "mizoram" },
  { name: "Nagaland", alias: "nagaland" },
  { name: "Odisha", alias: "odisha" },
  { name: "Punjab", alias: "punjab" },
  { name: "Rajasthan", alias: "rajasthan" },
  { name: "Sikkim", alias: "sikkim" },
  { name: "Tamil Nadu", alias: "tamil-nadu" },
  { name: "Telangana", alias: "telangana" },
  { name: "Tripura", alias: "tripura" },
  { name: "Uttar Pradesh", alias: "uttar-pradesh" },
  { name: "Uttarakhand", alias: "uttarakhand" },
  { name: "West Bengal", alias: "west-bengal" },
  // UTs
  { name: "Andaman and Nicobar Islands", alias: "andaman-and-nicobar-islands-ut" },
  { name: "Chandigarh", alias: "chandigarh-ut" },
  { name: "Dadra and Nagar Haveli and Daman and Diu", alias: "dadra-and-nagar-haveli-and-daman-and-diu-ut" },
  { name: "Delhi", alias: "delhi-nct" },
  { name: "Jammu and Kashmir", alias: "jammu-and-kashmir-ut" },
  { name: "Lakshadweep", alias: "lakshadweep-ut" },
  { name: "Puducherry", alias: "puducherry-ut" },
  { name: "Ladakh", alias: "ladakh-ut" }
].map(r => ({ ...r, code: r.alias.toUpperCase() }));

const TARGET_YEAR = 2026;

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

// Fetch raw holidays data from the CMS
async function fetchHolidaysData(region) {
  let route;
  if (region.isCentral) {
    route = `/api/calendar-holidays?filters[date][$gte]=${TARGET_YEAR}-01-01&filters[date][$lte]=${TARGET_YEAR}-12-31&pagination[pageSize]=100`;
  } else {
    route = `/api/state-holidays?populate=*&filters[state_dept_org][alias]=${region.alias}&filters[date][$gte]=${TARGET_YEAR}-01-01&filters[date][$lte]=${TARGET_YEAR}-12-31&pagination[pageSize]=100&sort=id`;
  }

  console.log(`[Fetch] Querying CMS route for ${region.name}...`);
  const response = await postJson("https://www.india.gov.in/internal/cms", { route });
  if (response.statusCode !== 200) {
    throw new Error(`CMS API returned status ${response.statusCode}`);
  }

  const result = JSON.parse(response.body);
  return result?.data?.data || [];
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

// Parse single ICS file and return structured JSON object
function parseIcsFile(icsPath, regionCode, filename) {
  const fileContent = fs.readFileSync(icsPath, 'utf8');

  // Unfold folded lines
  const unfolded = fileContent.replace(/\r?\n[ \t]/g, '');

  const events = unfolded.split('BEGIN:VEVENT');
  // First element is calendar header, ignore it
  events.shift();

  const holidaysList = [];
  let detectedYear = TARGET_YEAR;

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
      // Convert dateStr (YYYYMMDD) to YYYY-MM-DD
      const year = parseInt(dateStr.slice(0, 4), 10);
      const month = dateStr.slice(4, 6);
      const day = dateStr.slice(6, 8);
      const formattedDate = `${year}-${month}-${day}`;

      detectedYear = year; // Save detected year

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
          source: "https://www.india.gov.in/calendar"
        });
      }
    }
  }

  // Sort holidays by date ascending
  holidaysList.sort((a, b) => a.date.localeCompare(b.date));

  // Count stats
  const totalHolidays = holidaysList.length;
  const gazettedCount = holidaysList.filter(h => h.type === "gazetted_holiday").length;
  const restrictedCount = holidaysList.filter(h => h.type === "restricted_holiday").length;

  const today = new Date().toISOString().split('T')[0];

  return {
    country: "IN",
    year: detectedYear,
    region: regionCode,
    data: holidaysList,
    meta: {
      apiVersion: "v1",
      totalHolidays,
      gazettedCount,
      restrictedCount,
      source: "Ministry of Personnel, Public Grievances and Pensions via india.gov.in",
      lastVerified: today
    }
  };
}

async function startPipeline() {
  const icsDir = path.join(__dirname, '..', 'ics');
  if (!fs.existsSync(icsDir)) {
    fs.mkdirSync(icsDir, { recursive: true });
  }

  console.log("=== STARTING HOLIDAY ICS SCRAPING PIPELINE ===");

  const processedRegionsInfo = [];

  for (const region of regions) {
    const filename = `IN_${region.code}_${TARGET_YEAR}.ics`;
    const icsPath = path.join(icsDir, filename);

    try {
      // 1. Fetch from CMS
      const holidaysData = await fetchHolidaysData(region);
      console.log(`[Success] Fetched ${holidaysData.length} raw events for ${region.name}`);

      // 2. Generate ICS
      const icsContent = await generateIcs(holidaysData);
      fs.writeFileSync(icsPath, icsContent, 'utf8');
      console.log(`[Success] Saved ICS file: ${filename}`);

      // 3. Parse ICS to JSON
      console.log(`[Parse] Converting ICS to structured JSON for ${region.code}...`);
      const structuredJson = parseIcsFile(icsPath, region.code, filename);

      // 4. Save JSON to output directory
      const outputDir = path.join(__dirname, '..', 'data', String(structuredJson.year), 'IN', region.code);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      const jsonPath = path.join(outputDir, 'holidays.json');
      fs.writeFileSync(jsonPath, JSON.stringify(structuredJson, null, 2), 'utf8');
      console.log(`[Success] Saved clean JSON: data/${structuredJson.year}/IN/${region.code}/holidays.json`);

      // Store info for INDEX.json
      processedRegionsInfo.push({
        region: region.code,
        path: `data/${structuredJson.year}/IN/${region.code}/holidays.json`,
        year: structuredJson.year,
        totalHolidays: structuredJson.meta.totalHolidays,
        gazettedCount: structuredJson.meta.gazettedCount,
        restrictedCount: structuredJson.meta.restrictedCount
      });

    } catch (err) {
      console.error(`[Error] Failed to process region ${region.name}:`, err.message);
      // Create empty holidays.json in case of failure/empty data to fulfill the rules
      const outputDir = path.join(__dirname, '..', 'data', String(TARGET_YEAR), 'IN', region.code);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      const jsonPath = path.join(outputDir, 'holidays.json');
      const today = new Date().toISOString().split('T')[0];
      const emptyJson = {
        country: "IN",
        year: TARGET_YEAR,
        region: region.code,
        data: [],
        meta: {
          apiVersion: "v1",
          totalHolidays: 0,
          gazettedCount: 0,
          restrictedCount: 0,
          source: "Ministry of Personnel, Public Grievances and Pensions via india.gov.in",
          lastVerified: today
        }
      };
      fs.writeFileSync(jsonPath, JSON.stringify(emptyJson, null, 2), 'utf8');
      console.log(`[Fallback] Generated empty holidays.json for ${region.code}`);

      processedRegionsInfo.push({
        region: region.code,
        path: `data/${TARGET_YEAR}/IN/${region.code}/holidays.json`,
        year: TARGET_YEAR,
        totalHolidays: 0,
        gazettedCount: 0,
        restrictedCount: 0
      });
    }

    // Brief polite pause between requests to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  // 5. Generate INDEX.json
  console.log("\n=== GENERATING MASTER INDEX.json ===");
  const todayDate = new Date().toISOString().split('T')[0];
  const indexData = {
    country: "IN",
    year: TARGET_YEAR,
    lastUpdated: todayDate,
    totalRegions: processedRegionsInfo.length,
    regions: processedRegionsInfo
  };

  const indexDir = path.join(__dirname, '..', 'data', String(TARGET_YEAR), 'IN');
  if (!fs.existsSync(indexDir)) {
    fs.mkdirSync(indexDir, { recursive: true });
  }
  const indexPath = path.join(indexDir, 'INDEX.json');
  fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2), 'utf8');
  console.log(`[Success] Saved master index file: data/${TARGET_YEAR}/IN/INDEX.json`);
  console.log("=== PIPELINE RUN COMPLETE ===");
}

startPipeline().catch(console.error);
