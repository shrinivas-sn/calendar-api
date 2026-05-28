## Goal

Build a **free, open-source Calendar Data API** that anyone can use to fetch reliable calendar information such as:

- Public holidays (country/state/region)
- Events and observances (festivals, international days, awareness days)
- Weekend rules and working-day calendars
- School / government calendars (where publicly available)
- Custom “special days” datasets (community contributed)

## What the API should provide (core features)

- **Holiday endpoints**
    - Query by **country + year**
    - Filter by **region/state** (if applicable)
    - Holiday metadata: name, date, type (public/bank/optional), region, description
- **Events / Observances endpoints**
    - Fixed-date events (e.g., “New Year’s Day”)
    - Floating events (e.g., “2nd Sunday of May”)
    - Lunar/astronomical events where possible (with clear calculation rules)
- **Date utilities**
    - Check if a date is a holiday / weekend
    - Next holiday after a date
    - List holidays between a date range
- **Time zone correctness**
    - Always return dates in ISO format
    - Be explicit about whether values are “date-only” vs datetime
- **Quality + trust**
    - Source references for datasets (links to government/public sources when available)
    - Versioning and changelog

## Suggested API design (simple and developer-friendly)

- **REST-first** (easy for everyone), optional GraphQL later
- Use **JSON** responses
- Add **versioning** in the URL:
    - `/v1/...`
- Consistent naming and filtering:
    - `country=IN`
    - `year=2026`
    - `region=KA`

### Example endpoints

- `GET /v1/holidays?country=IN&year=2026`
- `GET /v1/holidays?country=IN&year=2026&region=KA`
- `GET /v1/events?country=IN&year=2026`
- `GET /v1/date/is-holiday?country=IN&date=2026-01-26`
- `GET /v1/date/next-holiday?country=IN&date=2026-01-01`
- `GET /v1/holidays/range?country=IN&start=2026-01-01&end=2026-12-31`

## Response format (example)

```json
{
  "country": "IN",
  "year": 2026,
  "region": "KA",
  "data": [
    {
      "name": "Republic Day",
      "date": "2026-01-26",
      "type": "public_holiday",
      "region": ["IN"],
      "description": "National holiday in India.",
      "sources": ["https://..."]
    }
  ],
  "meta": {
    "apiVersion": "v1",
    "generatedAt": "2026-05-28T07:00:00Z"
  }
}
```

## Data sources (important)

- Prefer **official** sources (government portals, public calendars).
- If official sources are not available, use reputable community sources and clearly label them.
- Keep a `sources/` folder in the repo with links and notes:
    - dataset name
    - source URL
    - last verified date
    - license notes

## How to fetch data for the API (short)

1) **Government / official holiday lists (best quality)**

- Download official holiday **HTML/PDF** pages.
- Convert into structured **CSV/JSON** and store in your dataset.

2) **Open datasets / community libraries (fastest to start)**

- Pull existing **JSON/CSV/ICS** sources (check license).
- Sync updates periodically into *your* dataset.

3) **ICS calendar feeds (good for events calendars)**

- Subscribe to public **.ics** URLs and convert events into JSON.

4) **Rule-based generation (repeating / calculable events)**

- Store rules (e.g., “2nd Sunday of May”, “relative to Easter”) and generate dates per year.

**Simple workflow**

- Start with 1–2 countries → build a master JSON dataset → add source links per entry → update yearly/monthly → API serves from that dataset (with caching).

## Open-source plan

- Host code on **GitHub** (MIT or Apache-2.0 license recommended for broad usage).
- Provide:
    - README with quick start
    - API docs (OpenAPI / Swagger)
    - Examples in cURL + JS + Python
    - Contribution guide ([CONTRIBUTING.md](http://CONTRIBUTING.md))
    - Code of Conduct

## Publishing the API for public use (free)

- **Deploy** on a free/low-cost platform:
    - Cloudflare Workers, Vercel, Render, [Fly.io](http://Fly.io), Railway (depends on needs)
- Add:
    - Rate limiting (to protect from abuse)
    - Caching (CDN + server-side)
    - Monitoring/logging
- Provide a public base URL:
    - `https://api.yourdomain.com/v1/...`

## Tech stack (simple options)

### Option A: Node.js + Express (easy)

- Express for routes
- Zod / Joi for request validation
- OpenAPI generator for documentation

### Option B: FastAPI (Python) (very clean)

- Automatic docs at `/docs` and `/redoc`
- Strong typing and validation

### Option C: Go (high performance)

- Great for a fast and lightweight API

## References: how APIs are built & published (to learn)

- **REST API fundamentals**
    - https://restfulapi.net/
- **OpenAPI / Swagger (API documentation standard)**
    - https://swagger.io/specification/
- **Postman learning center (testing APIs)**
    - https://learning.postman.com/
- **Express (Node.js)**
    - https://expressjs.com/
- **FastAPI (Python)**
    - https://fastapi.tiangolo.com/
- **API versioning best practices**
    - https://www.troyhunt.com/your-api-versioning-is-wrong-which-is/
- **Deploying**
    - Vercel (docs): https://vercel.com/docs
    - Cloudflare Workers (docs): https://developers.cloudflare.com/workers/

## Next steps (practical)

- Decide scope for **v1** (start with holidays + “is holiday” check).
- Pick one tech stack (Express or FastAPI).