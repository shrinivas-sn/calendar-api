# Project Status — India Calendar API

**Last updated:** 08/10/2026  
**Workspace:** `E:\OSC\api-projects\projects\calendar-api`  
**Live API:** `https://calendar-api-d7a8.onrender.com` (Render, auto-deploys from `main`)  
**Frontend:** `https://calendar-api-web.vercel.app` (Vercel, React 19 + Tailwind v3 + SSG)

## Current State
- Relocated into `E:\OSC\api-projects\projects\calendar-api`; git history and remotes preserved.
- Deployed: `develop` and `main` pushed to `origin` (`97671a5`), auto-deploying to Render & Vercel.
- All 6 OSC SEO & Indexing Invariants PASS:
  1. Real URL routes (`/`, `/playground`, `/docs`, `/guides`, `/guides/:id`, `/status`, `404`).
  2. Static Prerendering (SSG) via `scripts/prerender.mjs` rendering full static HTML into `dist/`.
  3. Unique per-page meta tags, canonical URLs, and Schema.org `WebAPI` JSON-LD.
  4. Automated `sitemap.xml` build generator with canonical URL paths.
  5. `robots.txt` directive referencing sitemap.
  6. Vercel rewrites configured with negative-lookahead static asset exemption.
- Anti-slop UI polish complete across all pages (asymmetric hero, zero fake macOS widgets, disciplined palette, zero `transition-all`).
- Backend operational on Express 5 (`express@5.2.1`) with JSON error envelope, rate limiting, and CORS.
- Registered in `E:\OSC\api-projects\SUBMISSION-READINESS.md` along with LGD and GST APIs.

## Blockers / In Flight
- Production hardening on branch `harden/api` (NOT pushed, NOT live): see root `PLAN.md`.
  Phases 1–3 done: 42 tests (`npm test`), non-breaking API fixes, safe data scripts, CI workflow, docs.
- Data refresh: `node backend/scripts/parse-ics.js --year YYYY` then `npm --prefix backend run verify -- --year YYYY` (all-or-nothing; writes nothing on any failure).
- 2027 data BLOCKED: central 2027 published (49) but source flaky (504); states not published yet (0 each). Re-run weekly from 01/11/2026; deadline 15/12/2026.
- Plan issues logged: 9, see `PLAN.md` → Plan issues (6 = old script wiped working-copy data during a test, restored; 9 = 2027 blocked).

## Next up (start here)
1. Owner: review branch `harden/api`, push it (CI runs), then merge to `main` (= live deploy on Render).
2. From 01/11/2026 weekly: `node backend/scripts/parse-ics.js --year 2027` until it succeeds (PLAN.md Phase 4).
3. Public-apis submission: Calendar PR #7591 already submitted (`api.json`); LGD and GST PRs per `E:\OSC\api-projects\SUBMISSION-READINESS.md`.
