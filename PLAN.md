# PLAN — API production hardening (tests, safe fixes, safe data pipeline, 2027 data)

**Written 08/10/2026.** Temporary file — deleted when this closes.

**Goal:** Make the live holiday API safe to rely on monthly: automated tests and CI around every
`/v1` route, non-breaking fixes for the crash/leak/edge-case gaps, a data pipeline that can never
wipe good data and takes the year as input, and 2027 data loaded before 31/12/2026.
**Why:** A real user reported they will use the API monthly (owner, 08/10/2026). The review in
this session found zero tests, a 500 crash on repeated `country`, a pipeline that overwrites data
with empty files on failure, a hardcoded `TARGET_YEAR = 2026`, and no data after 31/12/2026.
**What this changes:** `backend/src/index.js`, `backend/scripts/parse-ics.js`,
`backend/scripts/verify-data.js`, new `backend/config/regions.js`, new `backend/test/`,
`backend/package.json`, root `package.json`, new `.github/workflows/test.yml`,
`frontend/src/content/guidesData.js`, `frontend/src/pages/DocsPage.jsx`, `DOCS/CONTEXT/BACKEND.md`,
new `backend/data/2027/` (Phase 4).
**Done means:** `npm test` (root) passes with every scenario row below `proven`, CI is green on
GitHub, every response that returned 200 before this plan returns the same `data` items with the
same field values (only additive fields/headers), and `GET /v1/holidays?country=IN&year=2027`
returns 200 on the live API.
**Out of scope:**
- Changing which holidays a state query returns (central + state merge stays as is).
- Changing `/v1/calendar` so restricted holidays count as working days.
- An opt-in "state only" query option — wait for the user's reply about how they use the API.
- Fixing `"region": ["IN"]` inside data records (changes existing values).
- Moving hosting, API keys, monitoring, scheduled automation for future years.
- The frontend `src/data/regions.js` list (separate build; not merged with backend config).

---

## Read this first

1. `git fetch origin && git status` — work on branch `harden/api` (create from `main` if missing:
   `git switch -c harden/api`). Never commit to `main` directly: `main` auto-deploys to Render.
2. Read only: `DOCS/STATUS.md`, this file's rules, your current task, the last Progress Log entry.
   Do not read `DOCS/EXTRA/` (raw `.ics` files and AI prompts) or `backend/data/**` whole —
   query them with `node -e` when you need a count.
3. Detect the environment — commands, never remembered values:

| Check | Command | Pass looks like |
|---|---|---|
| Node version | `node -v` | `v20` or higher (`package.json` engines `>=20`) |
| Backend deps installed | `node -e "require.resolve('express',{paths:['backend']})"` | exits 0; else run `npm install --prefix backend` |
| Test runner | `node --test --help` | prints usage (built-in `node:test`, no extra package) |
| Data years present | `ls backend/data` | year folders such as `2026` |
| Gov source reachable (Phase 4) | see Task 4.1 | JSON with `data.data` array |

4. A task's **Where:** uses search text, not line numbers. If the text is missing, the code moved:
   find the equivalent, apply the same intent, and log it under Plan issues.

## Facts verified while planning

| Fact | Source | Checked on |
|---|---|---|
| No database; data is JSON files `backend/data/<year>/IN/<region>/holidays.json`, read with `fs.readFileSync` per request | `backend/src/index.js` search `function loadHolidaysFile` | 08/10/2026 |
| Only `2026` data exists; 37 regions (central + 36), all non-empty (16–88 items) | `ls backend/data`; node count loop over files | 08/10/2026 |
| Installed: express 5.2.1, express-rate-limit 8.5.2, cors 2.8.6 (in `backend/node_modules`; root has none) | reading each `backend/node_modules/<pkg>/package.json` | 08/10/2026 |
| Node v22.15.0 locally; built-in `node:test` and global `fetch` available | `node -v` | 08/10/2026 |
| No tests and no `.github/` folder exist | `git ls-files`; `ls .github` → not found | 08/10/2026 |
| `?country=IN&country=IN` → **500** `"country.toUpperCase is not a function"` (crash + internal message leak) | local run via `app.listen(0)` + fetch | 08/10/2026 |
| `?region=KA&region=KA` → 400 (array fails regex) ; `?year=2026&year=2027` → 400 ; `date[a]=1` → 400 "Missing required parameter: date" | same local run | 08/10/2026 |
| `?region=ka` → 400 "Region parameter must be uppercase…"; `?country=in` → 200 and echoes `"country":"in"` | same local run | 08/10/2026 |
| `next-holiday?date=2026-12-31` → 200 with `data: []`, no hint that 2027 data is missing | same local run + live Render | 08/10/2026 |
| `holidays/range` 2025-12-01..2026-01-31 → 200, `year: 2025`, silently omits 2025; `0001-01-01..9999-12-31` → 200 (loops every year) | same local run | 08/10/2026 |
| `region=KA` returns 87 items (KA file 41 + central 50, exact-name dedupe) | local run | 08/10/2026 |
| Route `catch` blocks send `err.message` to the client | `backend/src/index.js` search `return sendError(res, err.message, err.status \|\| 500);` | 08/10/2026 |
| Terminal error handler already sends generic "Internal Server Error" for ≥500 | `backend/src/index.js` search `Terminal error handler` | 08/10/2026 |
| `parse-ics.js` hardcodes `TARGET_YEAR = 2026` and on any fetch error writes an empty `holidays.json` over existing data | `backend/scripts/parse-ics.js` search `[Fallback] Generated empty holidays.json` | 08/10/2026 |
| `parse-ics.js` runs `startPipeline()` at module load (cannot be required by tests) | search `startPipeline().catch(console.error);` | 08/10/2026 |
| `verify-data.js` hardcodes `TARGET_YEAR = 2026` and its own region list | `backend/scripts/verify-data.js` search `const regions = [` | 08/10/2026 |
| Gov source `POST https://www.india.gov.in/internal/cms` returned an HTML error page (edge "An error occurred while processing your request") for 2026 and 2027, 3 of 3 requests | curl in this session | 08/10/2026 |
| Live API is Render `https://calendar-api-d7a8.onrender.com`; Vercel `/v1/...` returns 404 | curl; `api.json` `api_base_url` | 08/10/2026 |
| Guide's jq filter uses `.type=="gazetted"`; real value is `gazetted_holiday` | `frontend/src/content/guidesData.js` search `select(.type=="gazetted")` | 08/10/2026 |
| Latest GitHub Actions majors: `actions/checkout` v7, `actions/setup-node` v7 | `gh api repos/actions/<name>/releases/latest` → v7.0.1, v7.1.0 | 08/10/2026 |
| Holiday `type` values: `gazetted_holiday`, `restricted_holiday`, `observance` | `backend/scripts/verify-data.js` search `validTypes` | 08/10/2026 |

## Rules for every task

- Never change an existing 200 response's `data` items or existing field values; only add fields,
  meta keys or headers. The characterization tests from Task 1.2 enforce this.
- Never hardcode a year or a region list in code: years come from `backend/data` folders or a CLI
  argument; regions come from `backend/config/regions.js`.
- No new runtime or dev dependencies; tests use `node:test`, `node:assert/strict` and global `fetch`.
- One task, one commit, on branch `harden/api`. Commit messages end with the session attribution lines.
- Never push, merge to `main`, or deploy without the owner's explicit OK (merge to `main` = live deploy).
- Never run `parse-ics.js` against real `backend/data` except in Task 4.2.
- Tests must never write inside `backend/data`; fixtures go in a temp dir from `fs.mkdtempSync(os.tmpdir())`.

## Failure handling

| Situation | Do this |
|---|---|
| `Cannot find module 'express'` | `npm install --prefix backend`, rerun. |
| A characterization test (Task 1.2) fails after a later task | The later change broke existing behaviour — revert that change and redo it; never edit the characterization assertion. |
| Port in use | Tests use `app.listen(0)`; never a fixed port. |
| Gov source still returns HTML error (Phase 4) | Stop Phase 4, log it, follow Task 4.1's fallback. |
| Anything else fails | Fix and retry at most three times. Then set the work aside, record the real output in the Progress Log, and continue with the next independent task. |
| The plan itself looks wrong | Follow **Plan issues** below — decide by impact, never freeze the whole plan. |
| Owner-only actions | Pushing, merging to `main`, publishing 2027 data, contacting the user — ask once, continue other tasks. |

---

## Phase 1 — Tests and non-breaking API fixes

**Purpose:** Lock today's behaviour with tests, then fix the crash, leak and edge cases test-first.
**Starts when:** now
**Re-check first:** none

### Task 1.1 — Scenario table via the test-plan method

**Goal:** A scenario table (ID, surface, must prove, forbidden evidence, level, test, status) for all six routes plus the two scripts.
**Why:** The project has no testing method; this fixes what each test must prove before writing tests.
**Where:** `DOCS/WORK/2026-10-08/WORK.md` (new; search text: `## Test scenarios`)
**Do:**
- [ ] Run the `test-plan` skill scoped to `backend/` for this plan's scope.
- [ ] Record the table under `## Test scenarios`; include at minimum ids S1–S14 in Task 1.2–1.8 and 2.x below.
- [ ] Add the row for `DOCS/WORK/2026-10-08/` to `DOCS/README.md` index (Status `active`, Load-bearing `yes`, Touches `backend/`).
**Test first:** n/a — produces the test list.
**Verify:** Manual: every route in `backend/src/index.js` (`v1Router.get(` matches) has at least one row.
**Don't touch:** any code.
**If it fails:** write the table by hand from the S-ids in this plan.
**Commit:** `docs: add test scenario table for API hardening`

### Task 1.2 — Test harness and characterization tests

**Goal:** `npm test` runs and locks current 200 responses.
**Why:** Guarantees later fixes do not change what the existing user receives.
**Where:** new `backend/test/helpers.js`, new `backend/test/characterization.test.js`, `backend/package.json` (search text: `"verify":`), root `package.json` (search text: `"start":`)
**Do:**
- [ ] `backend/package.json` scripts: add `"test": "node --test test/"`.
- [ ] Root `package.json` scripts: add `"test": "npm --prefix backend test"`.
- [ ] `helpers.js` exports `async function startServer(app)` → `{ baseUrl, close }` using `app.listen(0)`, and `async function getJson(baseUrl, path)` → `{ status, headers, body }`.
- [ ] Characterization (S1): for each URL below, assert status, `body.country`, `body.year`, `body.region`, `body.data.length`, and deep-equal of `data` items **after stripping keys added by this plan (`level`)**:
  `holidays?country=IN&year=2026`, `holidays?country=IN&year=2026&region=KA` (87 items),
  `date/is-holiday?country=IN&date=2026-01-26`, `date/next-holiday?country=IN&date=2026-01-01`,
  `holidays/range?country=IN&start=2026-01-01&end=2026-06-30`, `calendar?country=IN&year=2026&region=KA` (365 items).
- [ ] Expected `data` for each URL is snapshotted once into `backend/test/fixtures/characterization.json` by a one-off script run **before any code change** (commit the fixture). The test compares against it.
**Test first:** this task is the tests; they must pass against the unchanged code.
**Verify:** `npm test` → `# fail 0`.
**Don't touch:** `backend/src/**`. May-change list: none.
**If it fails:** if a characterization test fails on unchanged code, the snapshot is wrong — regenerate it from unchanged code only.
**Commit:** `test(api): add node:test harness and characterization snapshots`

### Task 1.3 — `createApp({ dataDir })`, in-memory data, missing/corrupt file handling

**Goal:** Data loads once per process from a configurable directory; missing or corrupt files return an honest error.
**Why:** Per-request disk reads are slow; a missing region file today returns `[]`, which looks like "no holidays".
**Where:** `backend/src/index.js` (search text: `function loadHolidaysFile`), `api/index.js`
**Do:**
- [ ] Wrap app setup in `function createApp({ dataDir = process.env.CALENDAR_DATA_DIR || path.join(__dirname, '..', 'data') } = {})`; `module.exports = createApp(); module.exports.createApp = createApp;` so `api/index.js` and `npm start` keep working unchanged.
- [ ] Cache parsed files in a `Map` keyed `${year}/${region}` on first read (lazy, per process).
- [ ] Region folder exists but `holidays.json` missing → 503 `"Holiday data unavailable for this region"`.
- [ ] `holidays.json` unparseable → log the error with file path via `console.error`, respond 503 with the same message (no parser text).
- [ ] Year/region existence checks keep using folder existence (no hardcoded list).
**Test first:** `backend/test/data-errors.test.js` (S2, S3) with a temp fixture dir: missing file → 503 + generic message; corrupt JSON → 503, body has no `Unexpected token`.
**Verify:** `npm test` → `# fail 0`.
**Don't touch:** response shapes of successful requests. May-change list: none.
**If it fails:** keep per-request reads but still add the 503 behaviour; log under Plan issues.
**Commit:** `feat(api): configurable data dir, cached loads, 503 on missing or corrupt data`

### Task 1.4 — Reject repeated/nested query params; stop leaking errors

**Goal:** Any non-string query value returns 400; route errors never send internal messages.
**Why:** `?country=IN&country=IN` currently crashes with a 500 that reveals code internals.
**Where:** `backend/src/index.js` (search text: `const v1Router = express.Router();` and every `return sendError(res, err.message, err.status || 500);`)
**Do:**
- [ ] Add `v1Router.use` middleware: for each key in `req.query`, if `typeof value !== 'string'` → 400 `` `Parameter '${key}' must be given once as plain text` ``.
- [ ] Replace each route `catch (err) { return sendError(res, err.message, ...) }` with `catch (err) { return next(err); }` (add `next` to the handler signature) so the terminal handler answers.
**Test first:** `backend/test/params.test.js` (S4, S5): `country=IN&country=IN` → 400; `region=KA&region=KA` → 400; `date[a]=1` → 400; forced internal error (fixture with corrupt central file served via a route that previously leaked) → body.message is `Internal Server Error` or the 503 text, never a JS error string.
**Verify:** `npm test` → `# fail 0`.
**Don't touch:** validation messages that already exist. May-change list: none.
**If it fails:** fall back to per-route `typeof` checks; log it.
**Commit:** `fix(api): reject repeated query params and stop leaking internal errors`

### Task 1.5 — Range span cap and missing-year notice

**Goal:** Ranges longer than the cap are rejected; partial ranges and year-end next-holiday say which years lack data.
**Why:** Unbounded loops, and silent empty/partial answers look like "no holidays".
**Where:** `backend/src/index.js` (search text: `v1Router.get('/holidays/range'` and `v1Router.get('/date/next-holiday'`)
**Do:**
- [ ] Module constant `const MAX_RANGE_YEARS = 5;` — `endYear - startYear + 1 > MAX_RANGE_YEARS` → 400 `` `Range cannot span more than ${MAX_RANGE_YEARS} calendar years` ``.
- [ ] Range: collect years in the range without a data folder; when non-empty add `meta.yearsWithoutData: [..numbers]`. Omit the key when empty.
- [ ] Next-holiday: when result is empty and the next year's folder is missing, add `meta.yearsWithoutData: [nextYear]`.
- [ ] Extend `sendSuccess` with an optional `extraMeta` object merged into `meta` (existing keys unchanged).
**Test first:** `backend/test/edge-cases.test.js` (S6–S8): 2020-01-01..2026-12-31 → 400; 2025-12-01..2026-01-31 → 200 with `yearsWithoutData: [2025]` and same data as before; next-holiday 2026-12-31 → `data: []` and `yearsWithoutData` contains `2027` (derive expected year from the latest folder + 1, not a literal).
**Verify:** `npm test` → `# fail 0`.
**Don't touch:** `data` arrays. May-change list: none.
**If it fails:** ship the cap alone; log the meta part.
**Commit:** `feat(api): cap range span and report years without data`

### Task 1.6 — Case-insensitive region

**Goal:** `region=ka` behaves like `region=KA`.
**Why:** Lowercase is a likely client mistake; today it is a 400, so accepting it breaks nothing.
**Where:** `backend/src/index.js` (search text: `function validateRegion`)
**Do:**
- [ ] Normalize `region` before validation: two letters any case → uppercase; `central` matched case-insensitively → `central`. Use the normalized value everywhere (incl. response `region`).
**Test first:** S9: `region=ka` → 200, `body.region === 'KA'`, same data as `KA`; `region=Central` → 200 `central`; `region=k1` → 400.
**Verify:** `npm test` → `# fail 0`.
**Don't touch:** `country` echo behaviour.
**If it fails:** revert; log.
**Commit:** `feat(api): accept region codes in any case`

### Task 1.7 — Per-holiday `level` field

**Goal:** Every holiday item carries `level: "state"` or `level: "central"`.
**Why:** Lets the user filter to their state's own list without any change to today's results.
**Where:** `backend/src/index.js` (search text: `function loadAndMergeHolidays`)
**Do:**
- [ ] `level` = `"state"` when the item's `date`+`name` appears in the requested state's own file, else `"central"`. For `region` absent/`central`, all `"central"`.
- [ ] Applies wherever items are returned: holidays, is-holiday `holidays[]`, next-holiday, range. `/calendar` rows are unchanged (they are day rows, not holiday items).
- [ ] Do not mutate cached objects — return copies.
**Test first:** S10: `region=KA` → every item has `level`; count of `level==='state'` equals the KA file's item count (read from file in the test); characterization tests still pass.
**Verify:** `npm test` → `# fail 0`.
**Don't touch:** item order, dedupe rule.
**If it fails:** revert; log.
**Commit:** `feat(api): tag each holiday with its source level`

### Task 1.8 — Cache-Control on successful responses

**Goal:** 200 responses under `/v1` send `Cache-Control: public, max-age=3600`.
**Why:** Data changes a few times a year; caching cuts load and latency.
**Where:** `backend/src/index.js` (search text: `function sendSuccess`)
**Do:**
- [ ] Set the header in `sendSuccess` only; errors get no cache header.
**Test first:** S11: 200 → header equals `public, max-age=3600`; 400 → header absent.
**Verify:** `npm test` → `# fail 0`.
**Don't touch:** `/health`, `/`.
**If it fails:** revert; log.
**Commit:** `feat(api): add cache headers to successful responses`

### Checkpoint — Phase 1

- [ ] Full verification: `npm test` → `# fail 0`; `node backend/src/index.js` starts and `curl localhost:3000/v1/holidays?country=IN&year=2026` → 200.
- [ ] Commit made for every task in this phase.
- [ ] Status file updated: Phase 1 done on branch `harden/api`, not pushed.
- [ ] Progress Log entry added.

A new session may start here.

---

## Phase 2 — Safe data scripts

**Purpose:** The yearly data refresh can never wipe data and needs no code edits per year.
**Starts when:** Phase 1 checkpoint passed (independent; may run in parallel if needed).
**Re-check first:** `parse-ics.js` still matches the anchors above.

### Task 2.1 — Single region config

**Goal:** One region list used by both scripts.
**Why:** Two hand-kept lists drift.
**Where:** new `backend/config/regions.js`; `backend/scripts/parse-ics.js` (search text: `const regions = [`); `backend/scripts/verify-data.js` (search text: `const regions = [`)
**Do:**
- [ ] Move the 37 `{ name, alias, code, isCentral? }` entries from `parse-ics.js` into `backend/config/regions.js` (`module.exports = [...]`), unchanged.
- [ ] Both scripts `require('../config/regions')`; `verify-data.js` uses `regions.map(r => r.code)`.
**Test first:** S12: `backend/test/regions.test.js` — 37 entries, unique codes, exactly one `isCentral`, and the set of codes equals the region folders in the newest year under `backend/data`.
**Verify:** `npm test` → `# fail 0`; `npm --prefix backend run verify` → `[SUCCESS]`.
**Don't touch:** frontend `src/data/regions.js`.
**If it fails:** revert; log.
**Commit:** `refactor(data): share one region list between scripts`

### Task 2.2 — `parse-ics.js`: year argument, all-or-nothing writes, loud failure

**Goal:** `node scripts/parse-ics.js --year <YYYY>` writes data only if every region succeeds with ≥1 holiday.
**Why:** Today a source outage silently replaces all data with empty files.
**Where:** `backend/scripts/parse-ics.js` (search text: `const TARGET_YEAR = 2026;`, `[Fallback] Generated empty holidays.json`)
**Do:**
- [ ] Remove `TARGET_YEAR`; parse `--year` (required, `/^\d{4}$/`); missing/invalid → print usage, exit 1.
- [ ] Fetch all regions into memory first. If any region throws, returns non-JSON, returns 0 items, or returns `meta.pagination.total` greater than items received → print the failing regions, exit 1, **write nothing**.
- [ ] Only after all succeed: write ICS + JSON + `INDEX.json`; print `region: oldCount → newCount` per region.
- [ ] Delete the empty-file fallback branch entirely.
- [ ] Export `parseIcsFile` and guard `startPipeline` with `if (require.main === module)`.
- [ ] Pass the year into `parseIcsFile` instead of reading a global.
**Test first:** S13: `backend/test/parse-ics.test.js` — `parseIcsFile` on a tiny fixture `.ics` (folded line, escaped comma, gazetted/restricted/other description) → expected JSON; a test that runs the script with no `--year` → exit code 1. Network is not called in tests.
**Verify:** `npm test` → `# fail 0`; `node backend/scripts/parse-ics.js` → usage + exit 1; `git status backend/data` → clean.
**Don't touch:** `backend/data/**`, the CMS route strings, the output JSON shape.
**If it fails:** revert; log.
**Commit:** `fix(data): require --year and never overwrite data on a failed fetch`

### Task 2.3 — `verify-data.js`: any year, empty data is an error

**Goal:** `npm --prefix backend run verify` checks every year folder (or `--year YYYY`).
**Why:** Removes the second hardcoded year; empty files must fail.
**Where:** `backend/scripts/verify-data.js` (search text: `const TARGET_YEAR = 2026;`)
**Do:**
- [ ] Years = `--year` if given, else every `/^\d{4}$/` folder in `backend/data`.
- [ ] Add error: `data` array empty.
- [ ] Add error: none of `-01-26`, `-08-15`, `-10-02` dates present in `central` for that year.
- [ ] Export a `verifyYear(baseDir, year)` returning `{ errors, warnings }`; guard CLI with `require.main === module`.
**Test first:** S14: fixture with an empty region file → errors > 0; real data 2026 → errors 0.
**Verify:** `npm --prefix backend run verify` → `[SUCCESS]`, exit 0.
**Don't touch:** `backend/data/**`.
**If it fails:** revert; log.
**Commit:** `fix(data): verify every year and reject empty region files`

### Checkpoint — Phase 2

- [ ] Full verification: `npm test` → `# fail 0`; `npm --prefix backend run verify` → `[SUCCESS]`.
- [ ] Commit made for every task in this phase.
- [ ] Status file updated: Phase 2 done; pipeline usage `node backend/scripts/parse-ics.js --year YYYY`.
- [ ] Progress Log entry added.

A new session may start here.

---

## Phase 3 — CI and docs

**Purpose:** Every push runs the tests; public docs match the API.
**Starts when:** Phase 2 checkpoint passed.
**Re-check first:** latest majors of `actions/checkout` and `actions/setup-node` via `gh api repos/actions/<name>/releases/latest --jq .tag_name`; use what it returns.

### Task 3.1 — GitHub Actions workflow

**Goal:** Tests and data verification run on every push and pull request.
**Why:** Stops a broken change reaching `main`, which deploys live.
**Where:** new `.github/workflows/test.yml`
**Do:**
- [ ] Triggers: `push`, `pull_request`. One job on `ubuntu-latest`, Node `22`.
- [ ] Steps: checkout; setup-node; `npm install --prefix backend`; `npm test`; `npm --prefix backend run verify`.
**Test first:** n/a — CI config; proven by a green run.
**Verify:** after the owner pushes the branch: `gh run list --branch harden/api --limit 1` → `completed success`.
**Don't touch:** Render/Vercel config.
**If it fails:** read `gh run view --log-failed`, fix, retry ≤3.
**Commit:** `ci: run API tests and data verification on push`

### Task 3.2 — Docs for new fields and the jq fix

**Goal:** Docs mention `level`, `meta.yearsWithoutData`, the range cap, 503, and the guide filter works.
**Why:** The guide filter currently returns nothing.
**Where:** `frontend/src/content/guidesData.js` (search text: `select(.type=="gazetted")` and `` \`"gazetted"\`, \`"restricted"\` ``), `frontend/src/pages/DocsPage.jsx` (search for the response-field documentation), `DOCS/CONTEXT/BACKEND.md` (search text: `merges two files at runtime`)
**Do:**
- [ ] jq filter → `select(.type=="gazetted_holiday")`; the prose type list → `gazetted_holiday`, `restricted_holiday`, `observance`.
- [ ] Add the new field, meta key, cap and 503 to DocsPage and BACKEND.md in the existing style.
**Test first:** n/a — documentation.
**Verify:** `npm --prefix frontend run build` → succeeds; Manual: `/docs` page shows `level`.
**Don't touch:** page layout or styles.
**If it fails:** revert; log.
**Commit:** `docs: document level field, range cap and fix guide jq filter`

### Checkpoint — Phase 3

- [ ] Full verification: `npm test` → `# fail 0`; frontend build succeeds.
- [ ] Commit made for every task in this phase.
- [ ] Status file updated: branch ready for owner review/push.
- [ ] Progress Log entry added.

A new session may start here.

---

## Phase 4 — 2027 data

**Purpose:** The API answers for 2027 before 31/12/2026.
**Starts when:** Phase 2 checkpoint passed **and** the gov source returns JSON (Task 4.1). Deadline: 15/12/2026.
**Re-check first:** whether the source still returns an HTML error; whether the 2027 calendars are published (non-zero items for `central`).

### Task 4.1 — Check the source

**Goal:** Know whether automated fetch works for 2027.
**Why:** The source failed 3/3 on 08/10/2026.
**Where:** `backend/scripts/parse-ics.js` (search text: `https://www.india.gov.in/internal/cms`)
**Do:**
- [ ] One request for `central` 2027 using the script's own route format; record status and first 200 chars.
**Test first:** n/a — external probe.
**Verify:** response parses as JSON with `data.data` length > 0.
**Don't touch:** anything.
**If it fails:** log it; owner decides between retrying weekly or entering data manually from the official DoPT office memorandum and state notifications. Do not invent a new scraping method without owner approval.
**Commit:** none — probe only.

### Task 4.2 — Fetch, verify and stage 2027

**Goal:** `backend/data/2027/IN/**` committed on branch, verified.
**Why:** Without it, the API has no answers from 01/01/2027.
**Where:** `backend/data/2027/` (new)
**Do:**
- [ ] `node backend/scripts/parse-ics.js --year 2027`.
- [ ] `npm --prefix backend run verify -- --year 2027`.
- [ ] `npm test`; then check `next-holiday?date=2026-12-31` now returns a 2027 holiday and no `yearsWithoutData`.
**Test first:** existing S7 test must now be updated only if it hardcoded 2027 (it must not — it derives from folders).
**Verify:** verify → `[SUCCESS]`; `npm test` → `# fail 0`.
**Don't touch:** `backend/data/2026/**`.
**If it fails:** script writes nothing by design; log output, return to Task 4.1 fallback.
**Commit:** `data: add 2027 holidays for central and 36 states/UTs`

### Checkpoint — Phase 4

- [ ] Full verification: `npm test`, verify, live `curl https://calendar-api-d7a8.onrender.com/v1/holidays?country=IN&year=2027` → 200 (after owner merges).
- [ ] Commit made for every task in this phase.
- [ ] Status file updated: 2027 live.
- [ ] Progress Log entry added.

A new session may start here.

---

## Plan issues

*(Append only. The executor records every place where reality differs from this plan —
before starting, or during a task. Decide by impact: a local difference with the same
intent is fixed, logged, and work continues; a difference that touches design, other
tasks, data, security, or anything public pauses only that step and flags the owner with
what to re-verify, while independent work continues; a plan that is wrong at its core
stops the phase with a proposed correction. Never rewrite a planned step silently —
amend it here and mark the task text "amended, see issue N". Surface every entry in the
status file and in the session's final message.)*

| # | When | Task | Plan said | Reality (evidence) | Impact | Action taken | Owner decision |
|---|---|---|---|---|---|---|---|
| 1 | 08/10/2026 | 1.2 | `"test": "node --test test/"` | Node 22 treats `test/` as a module path: `Cannot find module ...backend\test` | local | Used `"test": "node --test"` (default discovery, works on Node 20+). Side effect: helper files under `test/` are also counted as passing test files. | — |
| 2 | 08/10/2026 | 1.5 | Extend `sendSuccess` with optional `extraMeta` | Its `status` parameter had no caller passing it | local | Replaced the unused `status` param with `extraMeta`; always 200. | — |
| 3 | 08/10/2026 | 1.6 | Normalize region | Error text said "must be uppercase", now false | local | Message now `Region parameter must be a 2-letter state/UT code or 'central'` (error text only, no 200 change). | — |
| 4 | 08/10/2026 | 1.3 | 503 for missing/corrupt file | Missing **central** file in an existing year now also 503 (was `[]`) | local, same intent | Kept: an absent central list is broken data, not "no holidays". | — |
| 5 | 08/10/2026 | 2.2 | Export `parseIcsFile` | Parsing must happen before any write, so it takes text, not a path | local | Exported `parseIcs(icsText, regionCode, year)` and `runPipeline({ year, dataDir, icsDir, fetchIcs })` (fetch injectable for tests). Added `ics/` to `backend/.gitignore` (generated output). | — |
| 6 | 08/10/2026 | 2.2 | Write the S13 test first, see it fail | Requiring the OLD `parse-ics.js` ran the pipeline at load: gov source failed and it wrote empty files over all 37 `backend/data/2026` files in the working copy (`git diff --stat`: 38 files changed) | data — working copy only, never committed | Restored with `git checkout -- backend/data`, removed generated `backend/ics/`; `verify` → SUCCESS. Live proof of the bug this task fixes. | — |
| 7 | 08/10/2026 | 2.3 | S14 test red before the fix | Old `verify-data.js` calls `process.exit(0)` at load, so the new test file "passed" with no tests run (false green) | local | Rewrite exports `verifyYear` and only runs CLI under `require.main`; S14 now runs 4 real tests. | — |
| 8 | 08/10/2026 | 3.1 | Verify with a green GitHub run | Branch not pushed (owner-only) | local | Workflow committed; hosted run pending owner push. | pending |
| 9 | 08/10/2026 | 4.1/4.2 | Source returns JSON, then fetch 2027 | Node probe: central 2027 → 200, 49 items (total 49, 1 page); a second call → 504. Full run: central 504, all 36 states "0 holidays" → nothing written | data — 2027 blocked | States have not published 2027 yet; central is flaky. Re-run `node backend/scripts/parse-ics.js --year 2027` weekly from November; deadline 15/12/2026. curl is blocked by the edge but Node https gets through. | Owner: rerun weekly vs add a retry for 5xx vs publish central-only early (would need an all-or-nothing exception) |
| 10 | 08/10/2026 | owner request | Out of scope: data cleanup, scheduled automation | Owner asked for both ("make the data cleanup properly", monthly job) | scope | Added Phase 5 below: opt-in `scope=state` / `restricted=working` (defaults unchanged), `fetch-holidays.js` replacing `parse-ics.js`, monthly `data-update.yml`. `"region": ["IN"]` left as is (changing it changes every response). | owner approved 08/10/2026 |
| 11 | 08/10/2026 | 5.x | Direct JSON mapping matches saved data | First live run flagged AS and JH as changed: my `.trim()` removed trailing spaces from 5 names ("Magh Bihu ") | data — would have changed published names | Removed the trim; names kept exactly as published; rerun → 2026 unchanged for all 37. | — |
| 12 | 08/10/2026 | 5.x | 3 quick attempts per request | Live: UP and UK still 504 after 3 attempts | local | Waits 3s/10s/30s (4 attempts) plus a final pass after 60s for failed regions; rerun clean. | — |
| 13 | 08/10/2026 | 5.x | CI opens a pull request | Repo setting `can_approve_pull_request_reviews: false` (`gh api repos/shrinivas-sn/calendar-api/actions/permissions/workflow`) blocks Actions from creating PRs | owner setting | Workflow written to need it; owner must tick "Allow GitHub Actions to create and approve pull requests". Without it the branch is still pushed and the run fails, so GitHub emails. | pending |

---

## Owner inputs

- Approve pushing branch `harden/api` and merging to `main` (live deploy on Render).
- Phase 4 fallback choice if the gov source keeps failing: keep retrying vs manual entry.
- Optional: ask the LinkedIn user how they use the API (decides the out-of-scope items).

---

## Decisions

- Tests use built-in `node:test` + `fetch`, no new dependency. *(assumed)*
- Work on branch `harden/api`; `main` deploys live. *(assumed)*
- Range cap `MAX_RANGE_YEARS = 5`. *(assumed)*
- Missing/corrupt region file → 503 `"Holiday data unavailable for this region"`. *(assumed)*
- `Cache-Control: public, max-age=3600` on 200 only. *(assumed)*
- `level: "state"` means the item is in the state's own file, even if central lists it too. *(assumed)*
- Lowercase region accepted and normalized to uppercase in the response. *(assumed)*
- Annual data refresh stays manual (owner, 08/10/2026: one year at a time is enough for now).
- Existing 200 results never change; state-only and restricted-as-working are later opt-in options (owner, 08/10/2026).

---

## Progress Log

*(Append only. Newest at the bottom. Never rewrite an entry — if it turned out wrong,
add a new one saying so. This log is what makes resuming cheap: a cold session reads
the last entry and knows exactly where to start.)*

### Phase 1 — 08/10/2026
Done:       Tasks 1.1–1.8: scenario table, node:test harness + characterization snapshots, createApp({dataDir}) with cached loads and 503 on missing/corrupt files, repeated-param 400 + no error leak, range cap (5 years) + meta.yearsWithoutData, case-insensitive region, per-item `level`, Cache-Control on 200.
Verified:   `npm test` → # pass 30, # fail 0. `PORT=3917 node backend/src/index.js` → `/v1/holidays?country=IN&year=2026` 200; `country=IN&country=IN` → 400 "Parameter 'country' must be given once as plain text". `require('./api/index.js')` → function with createApp.
Surprises:  Test command path form fails on Node 22 (issue 1). Earlier chat claim that repeated region crashes was wrong — only repeated country did.
Next:       Phase 2, Task 2.1 — create backend/config/regions.js.
Commit:     b76addf, a9379d1, b870807, eb1dda4, 242124f, ff8c60d, a3a18cc, 3a08784 (+ this checkpoint)

### Phase 2 — 08/10/2026
Done:       Tasks 2.1–2.3: `backend/config/regions.js` shared by both scripts; `parse-ics.js --year YYYY`, all-or-nothing (fails on any region error, 0 holidays, wrong-year date, or incomplete page; writes nothing); `verify-data.js` checks every year folder or `--year`, rejects empty files and a central list missing 01-26/08-15/10-02.
Verified:   `npm test` → # pass 42, # fail 0. `npm --prefix backend run verify` → Years Checked: 2026, Total Errors: 0, [SUCCESS]. `node backend/scripts/parse-ics.js` → usage, exit 1. `git status` clean for backend/data.
Surprises:  Issue 6 — the old script wiped the working-copy data the moment a test loaded it (restored from git). Issue 7 — old verify script gave a false green.
Next:       Phase 3, Task 3.1 — .github/workflows/test.yml.
Commit:     8b9af2b, b11cf2a, and the 2.3 commit (+ this checkpoint)

### Phase 3 — 08/10/2026
Done:       3.1 `.github/workflows/test.yml` (checkout@v7, setup-node@v7, Node 22, contents: read, no cache — no lockfile); 3.2 DocsPage documents `level`, `yearsWithoutData`, cache header, 400 repeat-param, 400 range cap, 503, 500; guide jq filter and type list use `gazetted_holiday`; BACKEND.md updated.
Verified:   `npm --prefix frontend run build` → built, "Successfully rendered 7 pages"; built `dist/docs/index.html` contains `yearsWithoutData`, "unavailable for this region", "5 calendar years"; guides contain `select(.type==&quot;gazetted_holiday&quot;)`. Hosted CI run: not yet (issue 8).
Surprises:  none.
Next:       Owner pushes `harden/api`; check `gh run list --branch harden/api --limit 1` → success.
Commit:     5e2444c, c1278ba

### Phase 4 — 08/10/2026 (blocked, see issue 9)
Done:       4.1 probe: source reachable from Node (curl blocked); central 2027 published (49). 4.2 run: 37/37 failed (central 504, states 0 holidays) → nothing written, `git status` clean.
Verified:   script output "37 of 37 regions failed. Nothing was written."; `git status --short` → no data changes.
Surprises:  The old script, run today, would have written 37 empty 2027 files and the API would have answered "not a holiday" for every 2027 date.
Next:       From 01/11/2026, weekly: `node backend/scripts/parse-ics.js --year 2027`; when it succeeds, `npm --prefix backend run verify -- --year 2027`, `npm test`, commit `data: add 2027 holidays for central and 36 states/UTs`. Deadline 15/12/2026.
Commit:     not committed (nothing to commit)

### Phase 5 (owner-requested) — 08/10/2026
Done:       Opt-in `scope=state` and `restricted=working`; `backend/scripts/fetch-holidays.js` (direct CMS JSON, retries + final pass, all pages, not-ready exit 2, rewrites only changed regions) replaces `parse-ics.js`; `.github/workflows/data-update.yml` monthly (1st, 03:30 UTC) for this year + next year, opens one PR on `data-update`; docs page, README, BACKEND.md, APP-OVERVIEW.md updated.
Verified:   `npm test` → # pass 56, # fail 0 (characterization snapshots unchanged). Live run on a data copy: 2026 unchanged (37/37), 2027 not-ready (36 states). Frontend build → 7 pages; docs page has 5 `scope` rows, 1 `restricted` row.
Surprises:  Issue 11 (trim would have changed 5 published names), issue 12 (source 504s outlast 3 quick retries).
Next:       Push; CI green; owner enables the Actions PR setting; merge `harden/api` → `main`; then trigger `gh workflow run data-update.yml` once to prove it on GitHub's servers.
Commit:     ba14fb2, 06245f3, b08cf11, 41d1ace (+ this record)
