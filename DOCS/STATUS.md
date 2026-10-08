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
- Production hardening in progress on branch `harden/api` (not pushed): see root `PLAN.md`.
  Phase 1 done (tests + non-breaking API fixes, `npm test` → 30 pass).
- 2026 data ends 31/12/2026; 2027 data not loaded. Gov source (`india.gov.in/internal/cms`) returned an HTML error 3/3 times on 08/10/2026.
- Plan issues logged: 4 (all local), see `PLAN.md` → Plan issues.

## Next up (start here)
1. Continue `PLAN.md` at the last Progress Log entry's `Next:` on branch `harden/api`.
2. Owner: approve pushing `harden/api` and merging to `main` (merge = live deploy on Render).
3. Public-apis submission: Calendar PR #7591 already submitted (`api.json`); LGD and GST PRs per `E:OSCapi-projectsSUBMISSION-READINESS.md`.
