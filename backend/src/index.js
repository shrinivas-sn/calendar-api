const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Express Rate Limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: true,
    message: "Too many requests, please try again later",
    status: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// JSON Parsing middleware
app.use(express.json());

// Helper to send error response
function sendError(res, message, status = 500) {
  return res.status(status).json({
    error: true,
    message,
    status
  });
}

// Helper to send success response
function sendSuccess(res, country, year, region, data, status = 200) {
  return res.status(status).json({
    country,
    year: year ? parseInt(year, 10) : null,
    region: region || 'central',
    data,
    meta: {
      apiVersion: "v1",
      totalResults: Array.isArray(data) ? data.length : 1,
      generatedAt: new Date().toISOString()
    }
  });
}

// Helper to load holiday data from local JSON files
function loadHolidaysFile(year, region) {
  const filePath = path.join(__dirname, '..', 'data', String(year), 'IN', region, 'holidays.json');
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(content);
  return parsed.data || [];
}

// Helper to load and merge holidays
function loadAndMergeHolidays(year, region) {
  const central = loadHolidaysFile(year, 'central');
  if (!region || region === 'central') {
    const holidays = [...central];
    holidays.sort((a, b) => a.date.localeCompare(b.date));
    return holidays;
  }
  
  const state = loadHolidaysFile(year, region);
  const seen = new Set();
  const merged = [];
  
  for (const h of central) {
    const key = `${h.date}_${h.name}`;
    seen.add(key);
    merged.push(h);
  }
  
  for (const h of state) {
    const key = `${h.date}_${h.name}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(h);
    }
  }
  
  merged.sort((a, b) => a.date.localeCompare(b.date));
  return merged;
}

// Validation helpers
function validateCountry(country) {
  if (!country) {
    return { valid: false, message: "Missing required parameter: country", status: 400 };
  }
  if (country.toUpperCase() !== 'IN') {
    return { valid: false, message: "Only IN is supported in v1", status: 404 };
  }
  return { valid: true };
}

function validateYear(year) {
  if (!year) {
    return { valid: false, message: "Missing required parameter: year", status: 400 };
  }
  if (!/^\d{4}$/.test(year)) {
    return { valid: false, message: "Invalid year format. Use a 4-digit number", status: 400 };
  }
  const yearDir = path.join(__dirname, '..', 'data', String(year));
  if (!fs.existsSync(yearDir)) {
    return { valid: false, message: "Data not available for this year", status: 404 };
  }
  return { valid: true };
}

function validateRegion(year, region) {
  if (!region) return { valid: true };
  if (region !== 'central' && !/^[A-Z]{2}$/.test(region)) {
    return { valid: false, message: "Region parameter must be uppercase 2-letter code or 'central'", status: 400 };
  }
  const regionDir = path.join(__dirname, '..', 'data', String(year), 'IN', region);
  if (!fs.existsSync(regionDir)) {
    return { valid: false, message: "Region not found", status: 404 };
  }
  return { valid: true };
}

function isValidDateFormat(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr);
  return d instanceof Date && !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === dateStr;
}

// Create routes using express.Router()
const v1Router = express.Router();

// 1 & 2: GET /v1/holidays
v1Router.get('/holidays', (req, res) => {
  try {
    const { country, year, region } = req.query;
    
    // Country check
    const countryVal = validateCountry(country);
    if (!countryVal.valid) {
      return sendError(res, countryVal.message, countryVal.status);
    }
    
    // Year check
    const yearVal = validateYear(year);
    if (!yearVal.valid) {
      return sendError(res, yearVal.message, yearVal.status);
    }
    
    // Region check
    const regionVal = validateRegion(year, region);
    if (!regionVal.valid) {
      return sendError(res, regionVal.message, regionVal.status);
    }
    
    const holidays = loadAndMergeHolidays(year, region);
    return sendSuccess(res, country, year, region, holidays);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
});

// 3: GET /v1/date/is-holiday
v1Router.get('/date/is-holiday', (req, res) => {
  try {
    const { country, date, region } = req.query;
    
    // Country check
    const countryVal = validateCountry(country);
    if (!countryVal.valid) {
      return sendError(res, countryVal.message, countryVal.status);
    }
    
    // Date check
    if (!date) {
      return sendError(res, "Missing required parameter: date", 400);
    }
    if (!isValidDateFormat(date)) {
      return sendError(res, "Invalid date format. Use YYYY-MM-DD", 400);
    }
    
    const year = date.split('-')[0];
    
    // Year check (derived from date)
    const yearVal = validateYear(year);
    if (!yearVal.valid) {
      return sendError(res, yearVal.message, yearVal.status);
    }
    
    // Region check
    const regionVal = validateRegion(year, region);
    if (!regionVal.valid) {
      return sendError(res, regionVal.message, regionVal.status);
    }
    
    const holidays = loadAndMergeHolidays(year, region);
    const matches = holidays.filter(h => h.date === date);
    
    const isHoliday = matches.length > 0;
    const responseData = [
      {
        date,
        is_holiday: isHoliday,
        holidays: matches
      }
    ];
    
    return sendSuccess(res, country, year, region, responseData);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
});

// 4: GET /v1/date/next-holiday
v1Router.get('/date/next-holiday', (req, res) => {
  try {
    const { country, date, region } = req.query;
    
    // Country check
    const countryVal = validateCountry(country);
    if (!countryVal.valid) {
      return sendError(res, countryVal.message, countryVal.status);
    }
    
    // Date check
    if (!date) {
      return sendError(res, "Missing required parameter: date", 400);
    }
    if (!isValidDateFormat(date)) {
      return sendError(res, "Invalid date format. Use YYYY-MM-DD", 400);
    }
    
    const year = date.split('-')[0];
    
    // Year check (derived from date)
    const yearVal = validateYear(year);
    if (!yearVal.valid) {
      return sendError(res, yearVal.message, yearVal.status);
    }
    
    // Region check
    const regionVal = validateRegion(year, region);
    if (!regionVal.valid) {
      return sendError(res, regionVal.message, regionVal.status);
    }
    
    let currentYear = parseInt(year, 10);
    let holidays = loadAndMergeHolidays(currentYear, region);
    let upcoming = holidays.filter(h => h.date > date);
    
    // If no holidays left in this year, check next year
    if (upcoming.length === 0) {
      const nextYear = currentYear + 1;
      const nextYearDir = path.join(__dirname, '..', 'data', String(nextYear));
      if (fs.existsSync(nextYearDir)) {
        try {
          const nextYearHolidays = loadAndMergeHolidays(nextYear, region);
          upcoming = nextYearHolidays.filter(h => h.date > date);
          currentYear = nextYear;
        } catch (e) {
          // ignore error
        }
      }
    }
    
    if (upcoming.length > 0) {
      const nextDate = upcoming[0].date;
      const matching = upcoming.filter(h => h.date === nextDate);
      return sendSuccess(res, country, currentYear, region, matching);
    } else {
      return sendSuccess(res, country, year, region, []);
    }
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
});

// 5: GET /v1/holidays/range
v1Router.get('/holidays/range', (req, res) => {
  try {
    const { country, start, end, region } = req.query;
    
    // Country check
    const countryVal = validateCountry(country);
    if (!countryVal.valid) {
      return sendError(res, countryVal.message, countryVal.status);
    }
    
    // Date check
    if (!start || !end) {
      return sendError(res, "Missing required parameters: start and end", 400);
    }
    if (!isValidDateFormat(start) || !isValidDateFormat(end)) {
      return sendError(res, "Invalid date format. Use YYYY-MM-DD", 400);
    }
    if (start > end) {
      return sendError(res, "Start date cannot be after end date", 400);
    }
    
    const startYear = parseInt(start.split('-')[0], 10);
    const endYear = parseInt(end.split('-')[0], 10);
    
    let hasAnyData = false;
    let mergedHolidays = [];
    
    for (let y = startYear; y <= endYear; y++) {
      const yearDir = path.join(__dirname, '..', 'data', String(y));
      if (fs.existsSync(yearDir)) {
        // Validate region for this year if region is requested
        const regionVal = validateRegion(y, region);
        if (!regionVal.valid) {
          return sendError(res, `${regionVal.message} for year ${y}`, regionVal.status);
        }
        hasAnyData = true;
        const yearHolidays = loadAndMergeHolidays(y, region);
        mergedHolidays = mergedHolidays.concat(yearHolidays);
      }
    }
    
    if (!hasAnyData) {
      return sendError(res, "Data not available for the requested year range", 404);
    }
    
    const filtered = mergedHolidays.filter(h => h.date >= start && h.date <= end);
    const seen = new Set();
    const finalFiltered = [];
    for (const h of filtered) {
      const key = `${h.date}_${h.name}`;
      if (!seen.has(key)) {
        seen.add(key);
        finalFiltered.push(h);
      }
    }
    finalFiltered.sort((a, b) => a.date.localeCompare(b.date));
    
    return sendSuccess(res, country, startYear, region, finalFiltered);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
});

// 6: GET /v1/calendar
v1Router.get('/calendar', (req, res) => {
  try {
    const { country, year, region } = req.query;
    
    // Country check
    const countryVal = validateCountry(country);
    if (!countryVal.valid) {
      return sendError(res, countryVal.message, countryVal.status);
    }
    
    // Year check
    const yearVal = validateYear(year);
    if (!yearVal.valid) {
      return sendError(res, yearVal.message, yearVal.status);
    }
    
    // Region check
    const regionVal = validateRegion(year, region);
    if (!regionVal.valid) {
      return sendError(res, regionVal.message, regionVal.status);
    }
    
    const yearInt = parseInt(year, 10);
    const holidays = loadAndMergeHolidays(yearInt, region);
    
    // Create map of holidays for O(1) lookup
    const holidayMap = new Map();
    for (const h of holidays) {
      if (!holidayMap.has(h.date)) {
        holidayMap.set(h.date, []);
      }
      holidayMap.get(h.date).push(h);
    }
    
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const calendar = [];
    const startUTC = new Date(Date.UTC(yearInt, 0, 1));
    
    const isLeap = (yearInt % 4 === 0 && yearInt % 100 !== 0) || (yearInt % 400 === 0);
    const totalDays = isLeap ? 366 : 365;
    
    let current = new Date(startUTC);
    for (let i = 0; i < totalDays; i++) {
      const dateStr = current.toISOString().slice(0, 10);
      const utcDay = current.getUTCDay();
      const isWeekend = (utcDay === 0 || utcDay === 6);
      
      const matches = holidayMap.get(dateStr) || [];
      const isHoliday = matches.length > 0;
      const holidayName = isHoliday ? matches.map(h => h.name).join(' / ') : null;
      const holidayType = isHoliday ? matches.map(h => h.type).join(' / ') : null;
      const isWorkingDay = !(isWeekend || isHoliday);
      
      calendar.push({
        date: dateStr,
        day: daysOfWeek[utcDay],
        is_weekend: isWeekend,
        is_holiday: isHoliday,
        holiday_name: holidayName,
        holiday_type: holidayType,
        is_working_day: isWorkingDay
      });
      
      current.setUTCDate(current.getUTCDate() + 1);
    }
    
    return sendSuccess(res, country, year, region, calendar);
  } catch (err) {
    return sendError(res, err.message, err.status || 500);
  }
});

// Register the router
app.use('/v1', v1Router);

// Root route/health check
app.get('/', (req, res) => {
  res.json({
    status: "online",
    message: "Welcome to the Indian Calendar API",
    docs: "/v1/holidays?country=IN&year=2026"
  });
});

// Wildcard 404 handler
app.use((req, res) => {
  sendError(res, "Endpoint not found", 404);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
