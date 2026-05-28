# Agent 2 — Backend Coding Agent

## Status: ACTIVE

## Project Context
We are building a free, open-source Indian Calendar API.
No login, no API key required — completely free and open.
Agent 1 has already completed the data pipeline.
All holiday JSON files are ready in the data/ folder.

## Tech Stack
- Runtime: Node.js
- Framework: Express
- No database — API reads directly from JSON files
- Language: JavaScript

## Project Folder Structure
india-calendar-api/
├── data/
│   └── 2026/
│       └── IN/
│           ├── central/
│           │   └── holidays.json
│           ├── KA/
│           │   └── holidays.json
│           ├── MH/
│           │   └── holidays.json
│           └── ... (all states + UTs)
├── src/
│   └── index.js        ← main API file you will create
├── package.json
├── .gitignore
└── README.md

## Your Job
Build a Node.js + Express REST API that:
1. Reads holiday data from the JSON files in data/ folder
2. Serves the data through clean REST endpoints
3. Handles errors gracefully
4. Returns consistent JSON responses

---

## Endpoints to Build

### 1 — Get all central holidays
GET /v1/holidays?country=IN&year=2026
- Reads from: `data/2026/IN/central/holidays.json`
- Returns all holidays for central government

### 2 — Get state holidays (central + state merged)
GET /v1/holidays?country=IN&year=2026&region=KA
- Reads from: `data/2026/IN/central/holidays.json` + `data/2026/IN/KA/holidays.json`
- Merges both arrays
- Removes duplicates (same date + same name)
- Sorts by date ascending

### 3 — Check if a date is a holiday
GET /v1/date/is-holiday?country=IN&date=2026-01-26
- Reads from: `data/2026/IN/central/holidays.json`
- Returns whether the date is a holiday or not
- If region is passed, checks state holidays too

### 4 — Get next holiday after a date
GET /v1/date/next-holiday?country=IN&date=2026-01-01
- Reads central holidays
- Finds the next holiday after the given date
- If region passed, includes state holidays too

### 5 — Get holidays between a date range
GET /v1/holidays/range?country=IN&start=2026-01-01&end=2026-06-30
- Filters holidays between start and end date (inclusive)
- Works with region param too

### 6 — Get full calendar (all 365 days)
GET /v1/calendar?country=IN&year=2026&region=KA
- Does NOT need extra data files
- Generate all 365 days of the year in code
- For each day inject holiday data if date matches
- Each day object looks like this:
```json
{
  "date": "2026-01-26",
  "day": "Monday",
  "is_weekend": false,
  "is_holiday": true,
  "holiday_name": "Republic Day",
  "holiday_type": "gazetted_holiday",
  "is_working_day": false
}
```
- Weekend = Saturday or Sunday
- is_working_day = false if is_weekend OR is_holiday

---

## Response Format
Every endpoint must return this wrapper:
```json
{
  "country": "IN",
  "year": 2026,
  "region": "KA",
  "data": [ ... ],
  "meta": {
    "apiVersion": "v1",
    "totalResults": 25,
    "generatedAt": "2026-05-28T07:00:00Z"
  }
}
```

## Error Response Format
```json
{
  "error": true,
  "message": "Region not found",
  "status": 404
}
```

---

## Error Handling Rules
- If year folder does not exist → 404 with message "Data not available for this year"
- If region folder does not exist → 404 with message "Region not found"
- If date format is wrong → 400 with message "Invalid date format. Use YYYY-MM-DD"
- If country is not IN → 404 with message "Only IN is supported in v1"
- Always wrap in try/catch — never crash the server

---

## Validation Rules
- `country` param → must be "IN" (only supported country in v1)
- `year` param → must be a valid 4 digit number
- `region` param → must be uppercase 2 letter code or "central"
- `date` param → must be valid YYYY-MM-DD format
- `start` and `end` params → must be valid YYYY-MM-DD format
- If required param is missing → return 400 with clear message

---

## File: src/index.js
- All API logic goes in this one file for v1
- Use express.Router() to organize routes
- Read JSON files using fs.readFileSync
- Parse JSON using JSON.parse
- Use path.join(__dirname, '..', 'data', year, 'IN', region, 'holidays.json')

## File: .gitignore
node_modules/
.env

## File: package.json scripts section
```json
"scripts": {
  "start": "node src/index.js",
  "dev": "nodemon src/index.js"
}
```

---

## Rate Limiting
Add basic rate limiting using express-rate-limit package:
- Max 100 requests per 15 minutes per IP
- Return 429 status when limit exceeded
- Message: "Too many requests, please try again later"

Install: npm install express-rate-limit

---

## CORS
Enable CORS so any website/app can call this API freely:
Install: npm install cors
Add: app.use(cors()) before all routes

---

## Final Checklist Before Done
- [ ] All 6 endpoints working
- [ ] Error handling on every endpoint
- [ ] Validation on all params
- [ ] Rate limiting added
- [ ] CORS enabled
- [ ] Server starts with npm run dev
- [ ] Server starts with npm start
- [ ] No hardcoded paths — always use path.join
- [ ] Tested every endpoint with sample requests