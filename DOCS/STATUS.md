# Project Status — India Calendar API

**Last updated:** 09/10/2026  
**Workspace:** `E:\OSC\api-projects\projects\calendar-api`  
**Live API:** `https://calendar-api-d7a8.onrender.com` (Render free plan, auto-deploys from `main`)  
**Frontend:** `https://calendar-api-web.vercel.app` (Vercel, React 19 + Tailwind v3 + SSG)

## Current State
- `main` at `39ba25e` is live (merged 09/10/2026): 56 tests (`npm test`), non-breaking API fixes,
  opt-in `scope=state` / `restricted=working`, safe `backend/scripts/fetch-holidays.js`, CI tests, monthly data job.
- Verified live 09/10/2026: `region=KA&scope=state` → 41 items; default `region=KA` → 87 (unchanged);
  repeated `country` → 400 instead of a crash.
- Monthly data job (`.github/workflows/data-update.yml`, 1st of each month) ran on GitHub: success
  (2026 unchanged, 2027 not ready). Repo setting lets Actions open its PR.
- SEO basics live: real routes, prerendered pages, per-page meta/canonical/JSON-LD, sitemap, robots.
- Portal still has AI-slop and false claims (Status page, Docs "sub-50ms", Home ICS card, raw markdown in guides);
  fix is planned in `PLAN-frontend-deslop.md`, not started.

## Blockers / In Flight
- 2027 data: no state has published yet (checked 08/10/2026). The monthly job adds it when all 37 are out,
  and fails (GitHub emails) if still incomplete in December.
  Manual: `node backend/scripts/fetch-holidays.js --year YYYY`, then `npm --prefix backend run verify -- --year YYYY`.
- Frontend de-slop plan: frontend/src only; dry run 09/10/2026 built clean, all checks 0, lint 31→26.
- Backend plan `PLAN.md` stays open only for Phase 4 (2027 data); 13 plan issues logged there.

## Next up (start here)
1. Run `PLAN-frontend-deslop.md` exactly (any executor) on branch `frontend-deslop`; owner reviews the branch before merge.
2. Review its Phase 5 mobile report and decide fixes.
3. Public-apis submission: Calendar PR #7591 already submitted (`api.json`); LGD and GST PRs per `E:\OSC\api-projects\SUBMISSION-READINESS.md`.
