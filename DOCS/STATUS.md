# Project Status — India Calendar API

**Last updated:** 28/09/2026  
**Workspace:** `E:\OSC\api-projects\projects\calendar-api`  
**Live API:** `https://calendar-api-d7a8.onrender.com` (Render, auto-deploys from `main`)  
**Frontend:** `https://calendar-api.vercel.app` (Vercel, React 19 + Tailwind v3 + SSG)

## Current State
- Deployed: `develop` and `main` pushed to `origin` (`3a1c9fe`), auto-deploying to Render & Vercel.
- All 6 OSC SEO & Indexing Invariants PASS:
  1. Real URL routes (`/`, `/playground`, `/docs`, `/guides`, `/guides/:id`, `/status`, `404`).
  2. Static Prerendering (SSG) via `scripts/prerender.mjs` rendering full static HTML into `dist/`.
  3. Unique per-page meta tags, canonical URLs, and Schema.org `WebAPI` JSON-LD.
  4. Automated `sitemap.xml` build generator with canonical URL paths.
  5. `robots.txt` directive referencing sitemap.
  6. Vercel rewrites configured with negative-lookahead static asset exemption.
- Anti-slop UI polish complete across all pages (asymmetric hero, zero fake macOS widgets, disciplined palette, zero `transition-all`).
- Backend operational on Express 5 (`express@5.2.1`) with JSON error envelope, rate limiting, and CORS.

## Blockers / In Flight
- None. System is stable and production build verified.

## Next up (start here)
1. Verify live Vercel and Render deployment outputs.
2. Prepare submission entry for `public-apis` directory / awesome lists.
