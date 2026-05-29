# India Calendar API - Project Overview & Context

This document provides complete technical and business context for the **India Calendar API** project. It is designed to help any incoming developer or AI coding assistant understand the application's structure, architecture, and current state.

---

## 1. Executive Summary & Value Proposition

### The Problem
Developers building Indian apps (e.g., HR portals, fintech platforms, scheduling software, e-commerce) need accurate calendar data including national (Central) and regional (State/UT) public holidays, festivals, and working days.
Existing global services (e.g., Calendarific, Holiday API, AbstractAPI) require signups, rate-limit free tiers, or completely lack detailed Indian state-level holiday data. Open-source options (like Nager.Date) do not support India (`IN`).

### The Solution
A **free, open-source, no-login-required REST API** specifically built for Indian calendar data with state-level holiday support.
* **Zero Friction**: No API keys, no registrations, no limits.
* **India-First**: Covers Central government, all 28 States, and all 8 Union Territories (37 regions total).
* **Accurate Data**: Fetched directly from official government sources (`india.gov.in`).
* **Static File Architecture**: High performance and zero database overhead by serving pre-compiled static JSON files.

---

## 2. Technical Architecture & Data Flow

The project is designed in two isolated phases:

```
+-----------------------------------------------------------+
|                   PHASE 1: Data Pipeline                  |
|  Government CMS API -> Raw .ics -> Deduplicated JSON      |
+-----------------------------------------------------------+
                              |
                              v (Static Files)
+-----------------------------------------------------------+
|                   PHASE 2: Backend API                    |
|  Node.js + Express Server -> CDN Caching -> Client Apps   |
+-----------------------------------------------------------+
```

### Phase 1: Data Collection & Parsing (Completed - Agent 1)
1. **CMS Fetch**: The scraper queries the official portal's internal GraphQL/REST endpoints to retrieve raw holiday lists for each state/UT.
2. **ICS Generation**: The scraper POSTs the list to the official `api/calendar-ics` generator to retrieve a standard `.ics` (iCal) calendar file.
3. **Local Storage**: The raw iCal files are saved under `ics/` as `IN_<REGION_CODE>_2026.ics`.
4. **Deduplication & Conversion**:
   - The parser unfolds the iCal file, splits it by `BEGIN:VEVENT`, and extracts summaries, dates, and descriptions.
   - Cleans the holiday names and converts dates to `YYYY-MM-DD`.
   - Programmatically removes duplicates (common on regional government calendars).
   - Classifies holiday types (`Gazetted Holiday` -> `gazetted_holiday`, `Restricted Holiday` -> `restricted_holiday`, others -> `observance`).
   - Sorts the holidays chronologically ascending.
5. **JSON DB Output**: Saves structured JSON files to `data/2026/IN/<REGION_CODE>/holidays.json`.
6. **Index Compilation**: Creates a master `INDEX.json` mapping regions, files, and statistics.

### Phase 2: Backend REST API (Pending - Agent 2)
A lightweight Node.js + Express API server will read from the `data/` directory and serve clean JSON endpoints.

---

## 3. Directory & Folder Structure

```
calendar-api/
├── data/                               # Static JSON databases
│   └── 2026/
│       └── IN/
│           ├── INDEX.json              # Master index file of all regions
│           ├── central/
│           │   └── holidays.json       # Central government holidays
│           ├── KA/
│           │   └── holidays.json       # Karnataka state holidays
│           ├── MH/
│           │   └── holidays.json       # Maharashtra state holidays
│           └── ...                     # Rest of the 37 States + UTs
├── ics/                                # Raw downloaded .ics (iCal) backups
│   ├── IN_central_2026.ics
│   ├── IN_KA_2026.ics
│   └── ...
├── scripts/                            # Pipeline utility scripts
│   ├── parse-ics.js                    # The scraper & parser pipeline script
│   └── verify-data.js                  # Validator to check JSON schema and sort orders
├── DOCS/
│   └── APP-CONTEXT/
│       └── PROJECT-OVERVIEW.md         # This document
├── package.json
└── README.md
```

---

## 4. REST API Schema & Target Endpoints

### Expected Endpoints (Phase 2)
* `GET /v1/holidays?country=IN&year=2026`
* `GET /v1/holidays?country=IN&year=2026&region=KA`
* `GET /v1/date/is-holiday?country=IN&date=2026-01-26`
* `GET /v1/date/next-holiday?country=IN&date=2026-01-01`

### Sample Regional JSON Format (`holidays.json`)
```json
{
  "country": "IN",
  "year": 2026,
  "region": "KA",
  "data": [
    {
      "name": "Ugadi Festival",
      "date": "2026-03-19",
      "type": "gazetted_holiday",
      "region": ["IN"],
      "description": "Gazetted Holiday",
      "source": "https://www.india.gov.in/calendar"
    }
  ],
  "meta": {
    "apiVersion": "v1",
    "totalHolidays": 41,
    "gazettedCount": 25,
    "restrictedCount": 16,
    "source": "Ministry of Personnel, Public Grievances and Pensions via india.gov.in",
    "lastVerified": "2026-05-28"
  }
}
```

### Sample Master Index Format (`INDEX.json`)
```json
{
  "country": "IN",
  "year": 2026,
  "lastUpdated": "2026-05-28",
  "totalRegions": 37,
  "regions": [
    {
      "region": "central",
      "path": "data/2026/IN/central/holidays.json",
      "year": 2026,
      "totalHolidays": 50,
      "gazettedCount": 17,
      "restrictedCount": 33
    },
    {
      "region": "KA",
      "path": "data/2026/IN/KA/holidays.json",
      "year": 2026,
      "totalHolidays": 41,
      "gazettedCount": 25,
      "restrictedCount": 16
    }
  ]
}
```

---

## 5. Deployment Strategy
* **Hosting**: The backend Express app can be deployed on Render, Railway, fly.io, or as static files served via a serverless platform (e.g., Vercel, Netlify, Cloudflare Workers) since it relies entirely on JSON files.
* **Caching**: Configure aggressive CDN caching (e.g., Cloudflare) on `/v1/...` routes since holiday lists only change when a new year starts or in case of rare government updates.
* **Rate Limiting**: Basic Express rate-limiting middleware to protect the service from scrapers/abuse.

---

## 6. How to Run the Pipeline
1. Clone the project.
2. Run the scraping/parsing process:
   ```bash
   node scripts/parse-ics.js
   ```
3. Run the validation checks:
   ```bash
   node scripts/verify-data.js
   ```

---

## 7. Incoming Agent Status
* **Agent 1 (Data Pipeline)**: **COMPLETE**. Script implemented, data parsed, cleaned, validated (0 errors, 0 warnings), and saved inside the `data/` folder.
* **Agent 2 (Backend API)**: **READY**. Ready to initialize Express server, configure routing, and serve validation responses.
