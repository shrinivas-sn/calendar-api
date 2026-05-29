# Backend Context — India Calendar API

This document serves as a high-density, one-stop technical context for developers or AI models to understand how the backend of the India Calendar API works and how it connects to the frontend.

---

## 1. Core Architecture
The backend is a **database-free REST API** serving pre-compiled static JSON holiday data. It operates in two phases:
1. **Offline Data Pipeline (ETL)**: Scrapes official government calendars, parses them, and stores them as static JSON files.
2. **Online Express Server**: Reads JSON from disk, performs runtime validation, merges national and state-specific holidays, and serves endpoints.

```
                  ┌────────────────────────────────────────┐
                  │          OFFLINE PIPELINE              │
                  │  CMS Scraper ──▶ ICS ──▶ Clean JSON    │
                  └───────────────────┬────────────────────┘
                                      │ (Committed to Git)
                                      ▼
                  ┌────────────────────────────────────────┐
                  │          EXPRESS SERVER                │
                  │  • Disk I/O (Read static JSON files)   │
                  │  • Runtime Merge & Deduplication       │
                  │  • Validation, CORS & Rate Limiting    │
                  └───────────────────┬────────────────────┘
                                      │ (HTTP REST /v1)
                                      ▼
                  ┌────────────────────────────────────────┐
                  │            REACT FRONTEND              │
                  │  Playground UI queries backend API     │
                  └────────────────────────────────────────┘
```

---

## 2. Monorepo File Structure & Layout
All backend code resides in the `/backend` folder:
- **`src/index.js`**: The Express.js application (routing, validation, merge logic, server configuration).
- **`scripts/parse-ics.js`**: Offline data-ingestion pipeline script.
- **`scripts/verify-data.js`**: Test script to validate JSON structure and data integrity before deploy.
- **`data/2026/IN/`**: Pre-generated holiday databases:
  - `INDEX.json`: Summary listing all regions and holiday counts.
  - `<REGION>/holidays.json`: Individual holiday JSON databases (e.g. `central`, `KA`, `MH`).

---

## 3. Data Pipeline & ETL Flow (`parse-ics.js`)
The data pipeline runs locally to fetch and format the calendar data. It follows this sequence:
1. **Fetch from CMS**: Makes `POST` requests to `https://www.india.gov.in/internal/cms` requesting specific Strapi-style endpoints for Central and State/UT-level calendars.
2. **Retrieve ICS**: Sends the raw events to `https://www.india.gov.in/api/calendar-ics` to generate a standard iCal (`.ics`) file.
3. **Parse and Clean**:
   - Parses the `.ics` events.
   - Cleans character strings (e.g., converting escaped characters like `\,` to `,`).
   - Standardizes date formats into `YYYY-MM-DD`.
   - Maps event types: standardizes government descriptions to `gazetted_holiday`, `restricted_holiday`, or `observance`.
   - Chronologically sorts and deduplicates events.
4. **Save**: Writes the final schema to `data/<year>/IN/<region_code>/holidays.json` and updates the master `INDEX.json`.

---

## 4. API Engine & Runtime Merge Logic (`src/index.js`)

### Validation Chain
When a request hits any endpoint, the input parameters are validated sequentially before any file system access:
- **Country**: Must be `IN` (other codes return `404`).
- **Year**: Verifies directory existence under `data/<year>` (missing returns `404`).
- **Region**: If specified, verifies region directory exists (missing returns `404`).
- **Date**: Validates format is exactly `YYYY-MM-DD` and verifies the calendar day is real (e.g. rejects `2026-02-30` with `400`).

### Runtime Holiday Merging & Deduplication
To serve state-level calendars, the API merges two files at runtime to keep data files small:
1. It reads the **Central Government** holiday list (`data/<year>/IN/central/holidays.json`).
2. It reads the specific **State/UT** holiday list (`data/<year>/IN/<region>/holidays.json`).
3. It combines the lists and filters out duplicates by creating a unique hash (`date_name`).
4. Central list entries are processed first (giving national holidays precedence), and state entries are skipped if a matching holiday already exists.
5. The merged dataset is sorted chronologically and returned.

---

## 5. API Route Specifications
All routes are prefixed with `/v1`:

1. **`GET /v1/holidays`**
   - *Query*: `?country=IN&year=2026&region=[code]` (region defaults to `central`).
   - *Returns*: Merged, sorted list of holidays for that year and region.
2. **`GET /v1/date/is-holiday`**
   - *Query*: `?country=IN&date=YYYY-MM-DD&region=[code]`.
   - *Returns*: Boolean indicator (`is_holiday`) along with matching holiday structures.
3. **`GET /v1/date/next-holiday`**
   - *Query*: `?country=IN&date=YYYY-MM-DD&region=[code]`.
   - *Returns*: Next holiday(s) chronologically. Rollover support checks the next year automatically if needed.
4. **`GET /v1/holidays/range`**
   - *Query*: `?country=IN&start=YYYY-MM-DD&end=YYYY-MM-DD&region=[code]`.
   - *Returns*: Chronological list of holidays in the range. Supports multi-year boundaries.
5. **`GET /v1/calendar`**
   - *Query*: `?country=IN&year=2026&region=[code]`.
   - *Returns*: Complete 365/366 day calendar tagging each day with its day-of-week, weekend status, holiday name/type, and `is_working_day`.

---

## 6. How Backend and Frontend Connect
The backend and frontend communicate via standard cross-origin JSON requests.

```
  React App (Frontend UI)                     Express API (Backend)
 ┌───────────────────────┐   HTTP Request    ┌───────────────────────┐
 │                       │──────────────────▶│ • CORS enabled        │
 │  Reads VITE_API_URL   │                   │ • Rate limiter (100)  │
 │  Calls API endpoints  │◀──────────────────│ • Returns JSON payload│
 │                       │   JSON Response   └───────────────────────┘
 └───────────────────────┘
```

- **CORS Config**: The backend uses the `cors` package to allow requests from any origin. This ensures the frontend (hosted on Vercel) can make fetch calls without crossing origin blockers.
- **Port Mapping**: Local development uses port `3000` (Backend) and port `5173` (Vite Frontend). In production, the backend is hosted on Railway.
- **API URL Environment Variable**: The React frontend uses `VITE_API_URL` to define which backend to talk to.
  - **Local**: `http://localhost:3000`
  - **Production**: `https://calendar-api-production-a697.up.railway.app`
- **Railway Deployment Scoping**: Railway is configured with a root directory build selector of `/backend`. Only changes inside the backend folder trigger a deploy, and the static JSON database is checked directly into Git to act as the production data store.
