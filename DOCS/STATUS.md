# Project Status — India Calendar API

**Last updated:** 28/09/2026  
**Workspace:** `E:\OSC\api-projects\projects\calendar-api`  
**Live API:** `https://calendar-api-d7a8.onrender.com` (Render, auto-deploys from `main`)  
**Frontend:** `https://calendar-api.vercel.app` (Vercel, React 19 + Tailwind v3 + SSG)

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
- None. All quality gates pass and working tree is clean.

## Next up (start here)
1. In `E:\OSC\api-projects\projects\public-apis-fork`, branch off `upstream/master` and create the 3 PRs for Calendar, LGD, and GST APIs using `SUBMISSION-READINESS.md`.
