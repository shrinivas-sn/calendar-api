const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DEFAULT_DATA_DIR = path.join(__dirname, '..', 'data');
// Longest span /v1/holidays/range accepts, counted in calendar years (2025-12-01 to
// 2026-01-31 is 2). Bounds the work one request can cause.
const MAX_RANGE_YEARS = 5;

// A region's data file is missing or unreadable. 503, not an empty list, so a broken
// file never looks like "no holidays". expose: the message is safe to send to clients.
class DataUnavailableError extends Error {
  constructor() {
    super('Holiday data unavailable for this region');
    this.status = 503;
    this.expose = true;
  }
}

// Builds the app around one data directory. The default export below uses the real
// data; tests pass a temporary directory.
function createApp({ dataDir = process.env.CALENDAR_DATA_DIR || DEFAULT_DATA_DIR } = {}) {
  const app = express();
  app.disable('x-powered-by');

  // Trust first proxy hop (Vercel / Render)
  app.set('trust proxy', 1);

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
  // extraMeta adds keys to meta; it never replaces the standard ones.
  function sendSuccess(res, country, year, region, data, extraMeta = {}) {
    return res.status(200).json({
      country,
      year: year ? parseInt(year, 10) : null,
      region: region || 'central',
      data,
      meta: {
        apiVersion: "v1",
        totalResults: Array.isArray(data) ? data.length : 1,
        generatedAt: new Date().toISOString(),
        ...extraMeta
      }
    });
  }

  // Parsed files, kept for the life of the process. Data only changes on deploy.
  const fileCache = new Map();

  function yearHasData(year) {
    return fs.existsSync(path.join(dataDir, String(year)));
  }

  // Helper to load holiday data from local JSON files
  function loadHolidaysFile(year, region) {
    const key = `${year}/${region}`;
    if (fileCache.has(key)) return fileCache.get(key);
    const filePath = path.join(dataDir, String(year), 'IN', region, 'holidays.json');
    let holidays;
    try {
      holidays = JSON.parse(fs.readFileSync(filePath, 'utf8')).data || [];
    } catch (err) {
      console.error(`Cannot load ${filePath}: ${err.message}`);
      throw new DataUnavailableError();
    }
    fileCache.set(key, holidays);
    return holidays;
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
    if (!yearHasData(year)) {
      return { valid: false, message: "Data not available for this year", status: 404 };
    }
    return { valid: true };
  }

  function validateRegion(year, region) {
    if (!region) return { valid: true };
    if (region !== 'central' && !/^[A-Z]{2}$/.test(region)) {
      return { valid: false, message: "Region parameter must be uppercase 2-letter code or 'central'", status: 400 };
    }
    const regionDir = path.join(dataDir, String(year), 'IN', region);
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

  // Repeated (?a=1&a=2) or nested (?a[b]=1) params arrive as arrays/objects. Reject
  // them up front so no handler ever calls a string method on a non-string.
  v1Router.use((req, res, next) => {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value !== 'string') {
        return sendError(res, `Parameter '${key}' must be given once as plain text`, 400);
      }
    }
    next();
  });

  // 1 & 2: GET /v1/holidays
  v1Router.get('/holidays', (req, res, next) => {
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
      return next(err);
    }
  });

  // 3: GET /v1/date/is-holiday
  v1Router.get('/date/is-holiday', (req, res, next) => {
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
      return next(err);
    }
  });

  // 4: GET /v1/date/next-holiday
  v1Router.get('/date/next-holiday', (req, res, next) => {
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
      const nextYear = currentYear + 1;
      
      // If no holidays left in this year, check next year
      if (upcoming.length === 0) {
        if (yearHasData(nextYear)) {
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
        // An empty answer because next year's data is not published yet must say so.
        const extraMeta = yearHasData(nextYear) ? {} : { yearsWithoutData: [nextYear] };
        return sendSuccess(res, country, year, region, [], extraMeta);
      }
    } catch (err) {
      return next(err);
    }
  });

  // 5: GET /v1/holidays/range
  v1Router.get('/holidays/range', (req, res, next) => {
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
      if (endYear - startYear + 1 > MAX_RANGE_YEARS) {
        return sendError(res, `Range cannot span more than ${MAX_RANGE_YEARS} calendar years`, 400);
      }
      
      let hasAnyData = false;
      let mergedHolidays = [];
      const yearsWithoutData = [];
      
      for (let y = startYear; y <= endYear; y++) {
        if (!yearHasData(y)) {
          yearsWithoutData.push(y);
        } else {
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
      
      const extraMeta = yearsWithoutData.length ? { yearsWithoutData } : {};
      return sendSuccess(res, country, startYear, region, finalFiltered, extraMeta);
    } catch (err) {
      return next(err);
    }
  });

  // 6: GET /v1/calendar
  v1Router.get('/calendar', (req, res, next) => {
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
      return next(err);
    }
  });

  // Register the router
  app.use('/v1', v1Router);

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: "ok",
      service: "calendar-api",
      timestamp: new Date().toISOString()
    });
  });

  // Root route/health check
  app.get('/', (req, res) => {
    res.json({
      status: "online",
      message: "Welcome to the Indian Calendar API",
      docs: "/v1/holidays?country=IN&year=2026"
    });
  });

  // Wildcard 404 handler — 2 args, so this is a request handler and never sees errors
  app.use((req, res) => {
    sendError(res, "Endpoint not found", 404);
  });

  // Terminal error handler. Must be exactly 4 args and registered last: Express tells
  // request handlers from error handlers by arity alone. Without it, anything thrown in
  // middleware (express.json() on a malformed body being the easy case) falls through to
  // finalhandler, which answers in HTML — and leaks a stack trace unless NODE_ENV=production.
  // The per-route try/catch blocks above cover route bodies only, not middleware.
  app.use((err, req, res, next) => {
    const status = err.status || err.statusCode || 500;
    if (status >= 500 && !err.expose) console.error(err);
    sendError(res, status >= 500 && !err.expose ? "Internal Server Error" : err.message, status);
  });

  return app;
}

const app = createApp();

// Start server when run directly; export app for Vercel / testing
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
module.exports.createApp = createApp;
