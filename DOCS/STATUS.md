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
- Branch `harden/api` ready to merge (pushed; not live until merged to `main`). See root `PLAN.md`.
  Done: 56 tests, non-breaking API fixes, opt-in `scope=state` / `restricted=working`, safe `fetch-holidays.js`, CI tests, monthly data job, docs.
- Data refresh: automatic on the 1st of each month (`.github/workflows/data-update.yml`) — opens a PR when data changed.
  Manual: `node backend/scripts/fetch-holidays.js --year YYYY` then `npm --prefix backend run verify -- --year YYYY`.
- 2027 data: not published yet by any state (live check 08/10/2026); central is out. The monthly job adds it when all 37 are out; it fails (emails) if still incomplete in December.
- Owner setting needed: GitHub repo → Settings → Actions → General → "Allow GitHub Actions to create and approve pull requests" (currently off), or the monthly job cannot open its PR.
- Plan issues logged: 13, see `PLAN.md` → Plan issues.

## Next up (start here)
1. Merge `harden/api` → `main` (= live deploy on Render), after CI is green.
2. Enable the Actions PR setting above, then run `gh workflow run data-update.yml` once and check it succeeds.
3. Public-apis submission: Calendar PR #7591 already submitted (`api.json`); LGD and GST PRs per `E:\OSC\api-projects\SUBMISSION-READINESS.md`.
