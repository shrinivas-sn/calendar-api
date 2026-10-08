# 08/10/2026 — API production hardening

Executes `PLAN.md` (root). Review findings, decisions and verification for the hardening work.

## Surfaces

| Surface ID | Inputs and callers | Outputs and observers | State kept | External effects | Dependencies | Start, stop, install, update, remove | Evidence or unknown |
| --- | --- | --- | --- | --- | --- | --- | --- |
| R-holidays | `GET /v1/holidays` query `country, year, region`; external API consumers | JSON envelope `{country,year,region,data,meta}` | none (reads files) | none | `backend/data/<year>/IN/<region>/holidays.json` | `npm start` / Render | `backend/src/index.js` `v1Router.get('/holidays'` |
| R-is-holiday | `GET /v1/date/is-holiday` `country, date, region` | envelope, `data[0].is_holiday` | none | none | same data files | same | `v1Router.get('/date/is-holiday'` |
| R-next | `GET /v1/date/next-holiday` `country, date, region` | envelope, next date's holidays | none | none | data for year and year+1 | same | `v1Router.get('/date/next-holiday'` |
| R-range | `GET /v1/holidays/range` `country, start, end, region` | envelope, holidays in range | none | none | data for every year in range | same | `v1Router.get('/holidays/range'` |
| R-calendar | `GET /v1/calendar` `country, year, region` | 365/366 day rows | none | none | data for year | same | `v1Router.get('/calendar'` |
| R-mw | all routes: rate limiter, CORS, error handler | 429 / error envelope | in-memory rate-limit counters | none | express-rate-limit 8.5.2 | per process | `const limiter = rateLimit(` |
| P-parse | `node scripts/parse-ics.js`; owner, yearly | files under `backend/data/<year>`, `backend/ics` | none | network POST to india.gov.in; writes files | gov CMS endpoint | manual run | `backend/scripts/parse-ics.js` |
| P-verify | `npm --prefix backend run verify` | exit code + log | none | none | data files | manual / CI | `backend/scripts/verify-data.js` |

## Failure questions (summary)

- **Invalid or hostile input** — applies to all routes: repeated params (S4), nested params (S4), unbounded range (S6), lowercase region (S9).
- **Dependency trouble** — applies: missing/corrupt data file (S2, S3), missing next year (S7), partial range (S8); gov source down for P-parse (S13).
- **Concurrency and ordering** — n/a: routes are read-only over immutable files; cache is fill-once per key.
- **Interruption and restart** — applies to P-parse: a failure mid-run must leave data untouched (S13).
- **Resources left behind** — applies to tests only: servers closed, temp dirs removed (harness).
- **Update and old state** — applies: existing 200 results must not change (S1).
- **Platform and environment** — applies: `CALENDAR_DATA_DIR` vs default path; Vercel/Render both `require` the app (S1 runs via `createApp`, `api/index.js` keeps default export).
- **Secrets and permissions** — n/a: no auth, no secrets, public keyless data. Error bodies must not leak internals (S5).

## Test scenarios

| ID | Surface | Must prove | Forbidden evidence | Level | Test | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| S1 | all routes | Every 200 response captured before the work returns the same `data` items and field values afterwards (additive keys excepted). | Snapshot regenerated after a code change; comparing only counts. | integration (HTTP) | ../../../backend/test/characterization.test.js | unproven | — |
| S2 | R-holidays | A region folder with no `holidays.json` returns 503 with a generic message, not `[]`. | Asserting only the status code. | integration | ../../../backend/test/data-errors.test.js | unproven | — |
| S3 | R-holidays | A corrupt `holidays.json` returns 503 and the body has no parser text or file path. | Testing only a valid file. | integration | ../../../backend/test/data-errors.test.js | unproven | — |
| S4 | R-mw / all | Repeated or nested query params (`country`, `region`, `date[a]`) return 400, never 500. | Checking a single param only. | integration | ../../../backend/test/params.test.js | unproven | — |
| S5 | R-mw | An unhandled exception in a route returns the error envelope with `Internal Server Error`, no JS error text (registry api-endpoint/error-response-no-internal-detail). | Testing only a handled validation error. | integration | ../../../backend/test/params.test.js | unproven | — |
| S6 | R-range | A range longer than `MAX_RANGE_YEARS` calendar years returns 400. | A default limit assumed without a request exceeding it. | integration | ../../../backend/test/edge-cases.test.js | unproven | — |
| S7 | R-next | On the last data year's 31 Dec, the response says which year has no data (`meta.yearsWithoutData`), computed from folders. | A hardcoded year literal in the test. | integration | ../../../backend/test/edge-cases.test.js | unproven | — |
| S8 | R-range | A range touching a year without data returns the available data unchanged plus `meta.yearsWithoutData`. | Asserting only the meta key. | integration | ../../../backend/test/edge-cases.test.js | unproven | — |
| S9 | R-holidays | `region=ka` returns the same data as `region=KA` and echoes `KA`; `k1` is 400. | Only testing uppercase input. | integration | ../../../backend/test/edge-cases.test.js | unproven | — |
| S10 | R-holidays | With a state region, items marked `level: "state"` match the state file's item count exactly. | Asserting only that the key exists. | integration | ../../../backend/test/level.test.js | unproven | — |
| S11 | R-mw | 200 responses carry `Cache-Control: public, max-age=3600`; error responses do not. | Checking only a 200. | integration | ../../../backend/test/edge-cases.test.js | unproven | — |
| S12 | P-parse / P-verify | One region list: 37 unique codes, one central, equal to the newest year's region folders. | Counting entries only. | unit | ../../../backend/test/regions.test.js | unproven | — |
| S13 | P-parse | No `--year` exits 1; `parseIcsFile` turns folded/escaped ICS into the expected JSON; failure paths write nothing. | Calling the real network in tests. | unit + process | ../../../backend/test/parse-ics.test.js | unproven | — |
| S14 | P-verify | An empty region file is an error; the real data passes. | Running only against valid data. | unit | ../../../backend/test/verify-data.test.js | unproven | — |
| S15 | R-mw | Request 101 within the window gets 429 with the error envelope (registry api-endpoint/rate-limit-enforced). | The library being present in the middleware chain. | integration | ../../../backend/test/params.test.js | unproven | — |
| S16 | R-mw | CORS wildcard and method restriction (registry api-endpoint/method-and-cors-restricted). | A wildcard accepted with no stated contract. | — | — | n/a | Reason: public, keyless, read-only data documented as CORS "Yes"; wildcard is the intended contract; undeclared methods fall to the JSON 404 handler. |

**Boundary of proof:** all rows are local HTTP tests against `app.listen(0)`; they do not prove Render/Vercel routing, cold starts, or that the gov source works. CI proof needs a hosted run on GitHub.

## Plan issues / decisions

- 08/10/2026: earlier chat claimed `?region=KA&region=KA` → 500; measured 400. Only repeated `country` gives 500. Plan facts already reflect the measurement.
