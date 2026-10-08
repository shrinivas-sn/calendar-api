// Checks the holiday data files for schema, sorting, counts and completeness.
//
// Usage: node scripts/verify-data.js              (every year folder under data/)
//        node scripts/verify-data.js --year 2027  (one year)
//
// Exits 1 when any check fails.
const fs = require('fs');
const path = require('path');

const regions = require('../config/regions').map(r => r.code);

const DATA_DIR = path.join(__dirname, '..', 'data');
const VALID_TYPES = ["gazetted_holiday", "restricted_holiday", "observance"];
const SOURCE_URL = "https://www.india.gov.in/calendar";
// Fixed-date national holidays every central list must contain (month-day).
const NATIONAL_HOLIDAYS = ["01-26", "08-15", "10-02"];

// Returns { errors, warnings } as arrays of messages for one year.
function verifyYear(dataDir, year) {
  const errors = [];
  const warnings = [];
  const baseDir = path.join(dataDir, String(year), 'IN');

  if (!fs.existsSync(baseDir)) {
    errors.push(`Base directory does not exist: ${baseDir}`);
    return { errors, warnings };
  }

  // 1. Verify INDEX.json
  const indexPath = path.join(baseDir, 'INDEX.json');
  if (!fs.existsSync(indexPath)) {
    errors.push("INDEX.json is missing!");
  } else {
    try {
      const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      if (index.country !== "IN") {
        errors.push(`INDEX.json country is not 'IN': ${index.country}`);
      }
      if (index.year !== year) {
        errors.push(`INDEX.json year is not ${year}: ${index.year}`);
      }
      if (index.totalRegions !== regions.length) {
        errors.push(`INDEX.json totalRegions count mismatch: expected ${regions.length}, found ${index.totalRegions}`);
      }
    } catch (err) {
      errors.push(`Failed to parse INDEX.json: ${err.message}`);
    }
  }

  // 2. Verify each region folder
  for (const region of regions) {
    const jsonPath = path.join(baseDir, region, 'holidays.json');

    if (!fs.existsSync(jsonPath)) {
      errors.push(`[${region}] holidays.json is missing`);
      continue;
    }

    let content;
    try {
      content = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    } catch (err) {
      errors.push(`[${region}] Failed to parse JSON: ${err.message}`);
      continue;
    }

    // Validate schema
    if (content.country !== "IN") {
      errors.push(`[${region}] country must be 'IN', got: ${content.country}`);
    }
    if (content.year !== year) {
      errors.push(`[${region}] year must be ${year}, got: ${content.year}`);
    }
    if (content.region !== region) {
      errors.push(`[${region}] region code mismatch, got: ${content.region}`);
    }

    // Validate data array
    if (!Array.isArray(content.data)) {
      errors.push(`[${region}] 'data' field must be an array`);
      continue;
    }
    if (content.data.length === 0) {
      errors.push(`[${region}] data is empty (a failed fetch, not a year without holidays)`);
    }

    // Check dates sorting and format
    let lastDate = "";
    const seenNamesAndDates = new Set();

    for (const holiday of content.data) {
      const { date, name } = holiday;

      // Check format YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        errors.push(`[${region}] Invalid date format: ${date}`);
      }

      // Check year match
      if (date && !date.startsWith(String(year))) {
        errors.push(`[${region}] Holiday date does not match year ${year}: ${date}`);
      }

      // Check ascending sort
      if (lastDate && date.localeCompare(lastDate) < 0) {
        errors.push(`[${region}] Holidays are not sorted by date ascending: ${lastDate} -> ${date}`);
      }
      lastDate = date;

      // Check duplicate
      const uniqueKey = `${date}_${name.toLowerCase()}`;
      if (seenNamesAndDates.has(uniqueKey)) {
        warnings.push(`[${region}] Duplicate holiday entry detected: "${name}" on ${date}`);
      }
      seenNamesAndDates.add(uniqueKey);

      // Check holiday type
      if (!VALID_TYPES.includes(holiday.type)) {
        errors.push(`[${region}] Invalid holiday type: ${holiday.type}`);
      }

      // Check source
      if (holiday.source !== SOURCE_URL) {
        errors.push(`[${region}] Source URL mismatch: ${holiday.source}`);
      }
    }

    // The central list must carry the fixed national holidays.
    if (region === 'central') {
      const dates = new Set(content.data.map(h => h.date));
      for (const monthDay of NATIONAL_HOLIDAYS) {
        if (!dates.has(`${year}-${monthDay}`)) {
          errors.push(`[central] National holiday ${year}-${monthDay} is missing`);
        }
      }
    }

    // Validate meta block
    const meta = content.meta;
    if (!meta) {
      errors.push(`[${region}] Missing 'meta' block`);
    } else {
      if (meta.apiVersion !== "v1") {
        errors.push(`[${region}] meta.apiVersion must be 'v1', got: ${meta.apiVersion}`);
      }
      if (meta.totalHolidays !== content.data.length) {
        errors.push(`[${region}] meta.totalHolidays count mismatch: meta=${meta.totalHolidays}, actual=${content.data.length}`);
      }
      const gazettedCount = content.data.filter(h => h.type === "gazetted_holiday").length;
      const restrictedCount = content.data.filter(h => h.type === "restricted_holiday").length;
      if (meta.gazettedCount !== gazettedCount) {
        errors.push(`[${region}] meta.gazettedCount mismatch: meta=${meta.gazettedCount}, actual=${gazettedCount}`);
      }
      if (meta.restrictedCount !== restrictedCount) {
        errors.push(`[${region}] meta.restrictedCount mismatch: meta=${meta.restrictedCount}, actual=${restrictedCount}`);
      }
    }
  }

  return { errors, warnings };
}

// Years named by --year, else every 4-digit folder under the data directory.
function yearsToCheck(argv, dataDir) {
  const i = argv.indexOf('--year');
  if (i >= 0) {
    const value = argv[i + 1];
    return /^\d{4}$/.test(value || '') ? [Number(value)] : null;
  }
  return fs.readdirSync(dataDir).filter(name => /^\d{4}$/.test(name)).map(Number).sort();
}

module.exports = { verifyYear };

if (require.main === module) {
  const years = yearsToCheck(process.argv, DATA_DIR);
  if (!years || years.length === 0) {
    console.error('Usage: node scripts/verify-data.js [--year <YYYY>]  (no year folders found, or invalid --year)');
    process.exit(1);
  }

  let totalErrors = 0;
  let totalWarnings = 0;
  for (const year of years) {
    console.log(`=== VERIFYING ${year} ===`);
    const { errors, warnings } = verifyYear(DATA_DIR, year);
    errors.forEach(e => console.error(`[FAIL] ${e}`));
    warnings.forEach(w => console.warn(`[WARN] ${w}`));
    totalErrors += errors.length;
    totalWarnings += warnings.length;
  }

  console.log("\n=== VALIDATION SUMMARY ===");
  console.log(`Years Checked: ${years.join(', ')}`);
  console.log(`Total Regions Checked per year: ${regions.length}`);
  console.log(`Total Errors: ${totalErrors}`);
  console.log(`Total Warnings: ${totalWarnings}`);

  if (totalErrors === 0) {
    console.log("[SUCCESS] All data validation checks passed successfully! 🎉");
  } else {
    console.error("[FAILURE] One or more data validation checks failed. Please fix the errors above.");
    process.exit(1);
  }
}
