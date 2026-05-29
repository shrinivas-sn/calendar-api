# Project Architecture & Context: India Calendar API

This document provides a comprehensive technical overview of the complete **India Calendar API** codebase. It outlines the design, monorepo structure, data ingestion pipeline, API backend, frontend UI portal, and deployment layout.

---

## 1. Project Overview & Business Value

### The Market Gap
Developers building applications for the Indian market face challenges integrating local holiday data. Existing APIs (like Calendarific or Holiday API) require paid plans, signups, or do not offer state-level resolution. Open-source libraries like `Nager.Date` do not support India (`IN`) due to its complex holiday structure.

### The Solution
This project is a **truly free, open-source, keyless REST API** serving Indian holiday calendars (Central Government + 36 States & UTs). It is built as a lightweight, database-free application serving static JSON files generated from official sources.

* **Live API Production URL**: `https://calendar-api-production-a697.up.railway.app`
* **Live Frontend UI URL**: `https://calendar-api-web.vercel.app`
* **Zero Friction**: No API keys, no registrations, no limits.
* **India-First**: Covers Central government, all 28 States, and all 8 Union Territories (37 regions total).
* **Accurate Data**: Fetched directly from official government sources (`india.gov.in`).
* **Static File Architecture**: High performance and zero database overhead by serving pre-compiled static JSON files.

---

## 2. Monorepo Architecture

The codebase is organized as a monorepo with separate backend and frontend projects:

```
calendar-api/
├── backend/                  # REST API server & Data pipeline
│   ├── data/                 # Ingested JSON holiday databases
│   ├── ics/                  # Backup iCal calendar files
│   ├── scripts/              # Data collection pipelines
│   │   ├── parse-ics.js      # Scraper/Parser script
│   │   └── verify-data.js    # Data validator
│   ├── src/
│   │   └── index.js          # Node.js + Express server code
│   └── package.json
│
├── frontend/                 # React UI Playground & Portal
│   ├── src/
│   │   ├── App.jsx           # Main UI dashboard and query builder
│   │   └── index.css         # Styling system
│   └── package.json
│
└── README.md                 # Main entry documentation
```

---

## 3. Data Pipeline & Storage (`/backend`)

The holiday data is stored statically as JSON, avoiding database lookup times and infrastructure costs.

### Ingestion Flow (`backend/scripts/parse-ics.js`)
1. **CMS API Extraction**: Queries the official government portal (`india.gov.in/calendar`) via an internal CMS route `/internal/cms`.
2. **ICS Generation**: Sends the raw JSON list of holidays to the portal's `/api/calendar-ics` endpoint to download the standard iCal file.
3. **Backup Storage**: Saves `.ics` files under `backend/ics/` (e.g. `IN_KA_2026.ics`).
4. **Parsing**:
   - Parses the iCal events (vevent) line-by-line.
   - Cleans the summary (replaces `\,` with `,`).
   - Converts dates to `YYYY-MM-DD`.
   - Programmatically filters out duplicate events.
   - Standardizes type mapping (`Gazetted Holiday` -> `gazetted_holiday`, `Restricted Holiday` -> `restricted_holiday`, others -> `observance`).
5. **Output**: Writes sorted, structured JSON files to `backend/data/<year>/IN/<region>/holidays.json` (where `<region>` is the 2-letter uppercase code or `central`).
6. **Index Creation**: Compiles a master list of all processed regions at `backend/data/<year>/IN/INDEX.json`.

---

## 4. REST API Implementation (`backend/src/index.js`)

The backend is built with **Node.js + Express** and runs on port `3000` by default.

### Features
* **CORS & Rate Limiting**: Enabled via standard CORS middleware and `express-rate-limit` (limiting each IP to 100 requests per 15 minutes).
* **Zero Database Overhead**: Standard Node `fs` reads pre-generated JSON files.
* **On-the-Fly Merging**:
  - When a user requests a state calendar (e.g., `region=KA`), the API automatically reads both the `central` calendar and the state (`KA`) calendar.
  - It merges them at runtime, filters out duplicate entries (e.g., Republic Day which appears on both lists), and returns a single sorted chronological list.

### Core Endpoints
1. **Fetch Holidays List**
   `GET https://calendar-api-production-a697.up.railway.app/v1/holidays?country=IN&year=2026[&region=KA]`
   Returns the holiday list for the year. Region defaults to `central` if omitted.
2. **Check Holiday Status**
   `GET https://calendar-api-production-a697.up.railway.app/v1/date/is-holiday?country=IN&date=2026-01-26[&region=KA]`
   Checks if a specific date is a holiday and returns matches.
3. **Get Next Holiday**
   `GET https://calendar-api-production-a697.up.railway.app/v1/date/next-holiday?country=IN&date=2026-01-01[&region=KA]`
   Identifies the next holiday. Automatically rolls over into the next year if needed.
4. **Date Range Query**
   `GET https://calendar-api-production-a697.up.railway.app/v1/holidays/range?country=IN&start=2026-01-01&end=2026-06-30[&region=KA]`
   Filters holidays within a custom range, supporting multi-year queries.
5. **Calendar Utility**
   `GET https://calendar-api-production-a697.up.railway.app/v1/calendar?country=IN&year=2026[&region=KA]`
   Generates a full 365/366 day layout tagged with weekends, holidays, and working-day classifications.

---

## 5. Frontend Client Portal (`/frontend`)

The UI is built with **React (Vite)** and serves as a developer documentation portal and interactive playground.

* **Live Link**: `https://calendar-api-web.vercel.app`
* **Playground Interface**: Allows developers to dynamically configure queries (picking region, endpoint, parameters) and make API calls in real-time.
* **Visual Display**: Renders an interactive calendar displaying holiday indicators directly on the dates.
* **Environment Configuration**: Set `VITE_API_URL` to target the active server (defaults to local port 3000 in development, mapped to `https://calendar-api-production-a697.up.railway.app` in production).

---

## 6. Deployment & Operations

### Backend (Express API)
* Deployed on **Railway** (`https://calendar-api-production-a697.up.railway.app`) targeting the `/backend` root directory.
* A CDN (e.g., Cloudflare) is configured with caching headers since the calendar JSON database is static and changes very rarely.

### Frontend (Vite Client)
* Deployed on **Vercel** (`https://calendar-api-web.vercel.app`) targeting the `/frontend` root directory.
* Requires the environment variable `VITE_API_URL` configured to the live backend Railway URL.
