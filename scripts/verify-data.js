const fs = require('fs');
const path = require('path');

const regions = [
  "central", "AP", "AR", "AS", "BR", "CG", "GA", "GJ", "HR", "HP", "JH", "KA", "KL", "MP", "MH", "MN", "ML", "MZ", "NL", "OD", "PB", "RJ", "SK", "TN", "TS", "TR", "UP", "UK", "WB",
  "AN", "CH", "DN", "DL", "JK", "LD", "PY", "LA"
];

const TARGET_YEAR = 2026;

function runValidation() {
  console.log("=== STARTING DATA VALIDATION CHECKS ===");
  const baseDir = path.join(__dirname, '..', 'data', String(TARGET_YEAR), 'IN');

  if (!fs.existsSync(baseDir)) {
    console.error(`[FAIL] Base directory does not exist: ${baseDir}`);
    process.exit(1);
  }

  let totalErrors = 0;
  let totalWarnings = 0;

  // 1. Verify INDEX.json
  const indexPath = path.join(baseDir, 'INDEX.json');
  if (!fs.existsSync(indexPath)) {
    console.error("[FAIL] INDEX.json is missing!");
    totalErrors++;
  } else {
    try {
      const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      if (index.country !== "IN") {
        console.error(`[FAIL] INDEX.json country is not 'IN': ${index.country}`);
        totalErrors++;
      }
      if (index.year !== TARGET_YEAR) {
        console.error(`[FAIL] INDEX.json year is not ${TARGET_YEAR}: ${index.year}`);
        totalErrors++;
      }
      if (index.totalRegions !== regions.length) {
        console.error(`[FAIL] INDEX.json totalRegions count mismatch: expected ${regions.length}, found ${index.totalRegions}`);
        totalErrors++;
      }
      console.log("[PASS] INDEX.json basic structure verified.");
    } catch (err) {
      console.error(`[FAIL] Failed to parse INDEX.json: ${err.message}`);
      totalErrors++;
    }
  }

  // 2. Verify each region folder
  for (const region of regions) {
    const regionDir = path.join(baseDir, region);
    const jsonPath = path.join(regionDir, 'holidays.json');

    if (!fs.existsSync(regionDir)) {
      console.error(`[FAIL] Region directory is missing: ${region}`);
      totalErrors++;
      continue;
    }

    if (!fs.existsSync(jsonPath)) {
      console.error(`[FAIL] holidays.json is missing for region: ${region}`);
      totalErrors++;
      continue;
    }

    try {
      const content = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

      // Validate schema
      if (content.country !== "IN") {
        console.error(`[FAIL] [${region}] country must be 'IN', got: ${content.country}`);
        totalErrors++;
      }
      if (content.year !== TARGET_YEAR) {
        console.error(`[FAIL] [${region}] year must be ${TARGET_YEAR}, got: ${content.year}`);
        totalErrors++;
      }
      if (content.region !== region) {
        console.error(`[FAIL] [${region}] region code mismatch, got: ${content.region}`);
        totalErrors++;
      }

      // Validate data array
      if (!Array.isArray(content.data)) {
        console.error(`[FAIL] [${region}] 'data' field must be an array`);
        totalErrors++;
        continue;
      }

      // Check dates sorting and format
      let lastDate = "";
      let hasDuplicates = false;
      const seenNamesAndDates = new Set();

      for (let i = 0; i < content.data.length; i++) {
        const holiday = content.data[i];
        const date = holiday.date;
        const name = holiday.name;

        // Check format YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          console.error(`[FAIL] [${region}] Invalid date format: ${date}`);
          totalErrors++;
        }

        // Check year match
        if (date && !date.startsWith(String(TARGET_YEAR))) {
          console.error(`[FAIL] [${region}] Holiday date does not match targeted year ${TARGET_YEAR}: ${date}`);
          totalErrors++;
        }

        // Check ascending sort
        if (lastDate && date.localeCompare(lastDate) < 0) {
          console.error(`[FAIL] [${region}] Holidays are not sorted by date ascending: ${lastDate} -> ${date}`);
          totalErrors++;
        }
        lastDate = date;

        // Check duplicate
        const uniqueKey = `${date}_${name.toLowerCase()}`;
        if (seenNamesAndDates.has(uniqueKey)) {
          console.warn(`[WARN] [${region}] Duplicate holiday entry detected: "${name}" on ${date}`);
          totalWarnings++;
          hasDuplicates = true;
        }
        seenNamesAndDates.add(uniqueKey);

        // Check holiday type
        const validTypes = ["gazetted_holiday", "restricted_holiday", "observance"];
        if (!validTypes.includes(holiday.type)) {
          console.error(`[FAIL] [${region}] Invalid holiday type: ${holiday.type}`);
          totalErrors++;
        }

        // Check source
        if (holiday.source !== "https://www.india.gov.in/calendar") {
          console.error(`[FAIL] [${region}] Source URL mismatch: ${holiday.source}`);
          totalErrors++;
        }
      }

      // Validate meta block
      const meta = content.meta;
      if (!meta) {
        console.error(`[FAIL] [${region}] Missing 'meta' block`);
        totalErrors++;
      } else {
        if (meta.apiVersion !== "v1") {
          console.error(`[FAIL] [${region}] meta.apiVersion must be 'v1', got: ${meta.apiVersion}`);
          totalErrors++;
        }
        if (meta.totalHolidays !== content.data.length) {
          console.error(`[FAIL] [${region}] meta.totalHolidays count mismatch: meta=${meta.totalHolidays}, actual=${content.data.length}`);
          totalErrors++;
        }
        const gazettedCount = content.data.filter(h => h.type === "gazetted_holiday").length;
        const restrictedCount = content.data.filter(h => h.type === "restricted_holiday").length;
        if (meta.gazettedCount !== gazettedCount) {
          console.error(`[FAIL] [${region}] meta.gazettedCount mismatch: meta=${meta.gazettedCount}, actual=${gazettedCount}`);
          totalErrors++;
        }
        if (meta.restrictedCount !== restrictedCount) {
          console.error(`[FAIL] [${region}] meta.restrictedCount mismatch: meta=${meta.restrictedCount}, actual=${restrictedCount}`);
          totalErrors++;
        }
      }

    } catch (err) {
      console.error(`[FAIL] Failed to parse JSON for ${region}: ${err.message}`);
      totalErrors++;
    }
  }

  console.log("\n=== VALIDATION SUMMARY ===");
  console.log(`Total Regions Checked: ${regions.length}`);
  console.log(`Total Errors: ${totalErrors}`);
  console.log(`Total Warnings: ${totalWarnings}`);

  if (totalErrors === 0) {
    console.log("[SUCCESS] All data validation checks passed successfully! 🎉");
    process.exit(0);
  } else {
    console.error("[FAILURE] One or more data validation checks failed. Please fix the errors above.");
    process.exit(1);
  }
}

runValidation();
