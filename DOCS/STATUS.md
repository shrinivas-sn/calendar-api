# Project Status — India Calendar API

**Last updated:** 09/10/2026  
**Workspace:** `E:\OSC\api-projects\projects\calendar-api`  
**Live API:** `https://calendar-api-d7a8.onrender.com` (Render free plan, auto-deploys from `main`)  
**Frontend:** `https://calendar-api-web.vercel.app` (Vercel, React 19 + Tailwind v3 + SSG)

## Current State
- The backend version at `39ba25e` is live (merged 09/10/2026): 56 tests (`npm test`), non-breaking API fixes,
  opt-in `scope=state` / `restricted=working`, safe `backend/scripts/fetch-holidays.js`, CI tests, monthly data job.
- Verified live 09/10/2026: `region=KA&scope=state` → 41 items; default `region=KA` → 87 (unchanged);
  repeated `country` → 400 instead of a crash.
- Monthly data job (`.github/workflows/data-update.yml`, 1st of each month) ran on GitHub: success
  (2026 unchanged, 2027 not ready). Repo setting lets Actions open its PR.
- SEO basics live: real routes, prerendered pages, per-page meta/canonical/JSON-LD, sitemap, robots.
- `main` includes portal cleanup and the calendar, status, playground, spacing, and mobile fixes
  recorded in `DOCS/WORK/2026-10-09/WORK.md`. Live frontend deployment remains to be verified.

## Blockers / In Flight
- 2027 data: no state has published yet (checked 08/10/2026). The monthly job adds it when all 37 are out,
  and fails (GitHub emails) if still incomplete in December.
  Manual: `node backend/scripts/fetch-holidays.js --year YYYY`, then `npm --prefix backend run verify -- --year YYYY`.
- Frontend: seven-page build and 56 backend tests pass; mobile measurements in `MOBILE.md`.
  Lint has 22 existing errors (26 before this pass), not a new regression.
- Backend plan `PLAN.md` stays open only for Phase 4 (2027 data); 13 plan issues logged there.

## Next up (start here)
1. Verify the Vercel build and live portal after the `main` push.
2. Let the monthly job check for 2027 data, or run the documented manual fetch when published.
3. Public-apis submission: Calendar PR #7591 already submitted (`api.json`); LGD and GST PRs per `E:\OSC\api-projects\SUBMISSION-READINESS.md`.
