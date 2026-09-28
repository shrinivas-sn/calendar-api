# PLAN — Frontend Standards & Anti-Slop UI Upgrade

**Written 28/09/2026.** Temporary file — deleted when this closes.

**Goal:** Upgrade the India Calendar API frontend portal to 100% OSC standards (SSG prerendering, technical guides hub, sitemap, robots.txt, 404 page, Vercel routing) while purging AI-slop signatures for a clean developer-first aesthetic.
**Why:** Standardize `calendar-api` with `E:\OSC` invariants in `DOCS/SEO-AND-INDEXING-GUIDE.md` and `CONVENTIONS.md`, ensuring full search indexability, rich guide content, and crisp UI styling.
**What this changes:** `frontend/src/`, `frontend/scripts/`, `frontend/package.json`, `frontend/vercel.json`, `DOCS/STATUS.md`.
**Done means:** `npm run build` in `frontend/` succeeds with full SSG prerendering of all routes (`/`, `/playground`, `/docs`, `/guides`, `/guides/:id`, `/status`), generating compliant `dist/sitemap.xml` and `dist/robots.txt`, with all AI-slop patterns removed and verified via local preview.
**Out of scope:** Backend Express route logic, holiday ICS/JSON datasets, external API URLs.

---

## Read this first

1. Workspace root for this plan is `E:\OSC\api-projects\projects\calendar-api`.
2. Read only: `DOCS/STATUS.md`, `DOCS/CONTEXT/STACK-CONTEXT.md`, and this plan's current task.
3. Detect the environment:

| Check | Command | Pass looks like |
|---|---|---|
| Git working branch | `git branch --show-current` | `develop` |
| Node & npm versions | `node -v; npm -v` | Node 18+ and npm 9+ |
| Dependencies installed | `npm list --depth=0` in `frontend/` | `react-router-dom`, `tailwindcss`, `vite` present |

4. A task's **Where:** uses search text or relative file paths. If code moved, apply the same intent and record it in Plan issues.

---

## Facts verified while planning

| Fact | Source | Checked on |
|---|---|---|
| Frontend stack is React 19 + Tailwind v3 + Vite 8 | `frontend/package.json` | 28/09/2026 |
| Tailwind slate scale has custom remapped tokens (`slate-400` -> `#e2e8f0`, `slate-500` -> `#cbd5e1`) | `DOCS/CONTEXT/STACK-CONTEXT.md` | 28/09/2026 |
| Zero `transition-all` exists in repo; accessibility baseline is set | `DOCS/CONTEXT/STACK-CONTEXT.md` | 28/09/2026 |
| OSC SEO standard requires SSG prerender, guides hub (`/guides/:id`), sitemap.xml, robots.txt, 404 page | `E:\OSC\DOCS\SEO-AND-INDEXING-GUIDE.md` | 28/09/2026 |
| Deployed production frontend host is on Vercel | `DOCS/CONTEXT/frontend.md` | 28/09/2026 |

---

## Rules for every task

- Never re-introduce `transition-all` — name specific properties (`transition-[transform,box-shadow,background-color]`).
- Do not introduce Tailwind v4 syntax (`@theme`, `@import "tailwindcss"`) — preserve Tailwind v3 configuration.
- Preserve the established saffron accent identity (`#ea580c` / `saffron-500` / `saffron-600`) while eliminating generic multi-color gradient fills.
- Retain functional effects: sticky navbar `backdrop-blur-md` and brand `glow-backdrop` in `App.jsx` are retained as brand identity.
- Every new page route must be compatible with both client-side React Router and headless Vite SSR prerendering.
- Commit each completed task card with a clear, targeted git commit message.

---

## Failure handling

| Situation | Do this |
|---|---|
| Vite SSR fails on `react-router-dom` exports during prerender | Ensure `MemoryRouter` is used during SSR and `AppContent` is exported cleanly separated from `BrowserRouter`. |
| Prerender fails on missing `dist/index.html` template | Ensure `vite build` runs before `node scripts/prerender.mjs` in package.json build script. |
| Anything else fails | Fix and retry at most three times. Then set the work aside, record the real output in the Progress Log, and continue with the next independent task. |
| The plan itself looks wrong | Follow Plan issues below — decide by impact, never freeze the whole plan. |

---

## Plan issues

*(Log any unexpected behaviors or divergences here during execution)*

---

## Owner inputs

None required. All data sources, URLs, and architecture decisions are verified locally.

---

## Decisions

- *Technical Guides Content*: 3 comprehensive articles covering Gazetted vs Restricted holidays, HRMS leave automation workflows, and Multi-language API integration recipes *(assumed)*.
- *SSG Prerender Strategy*: Pure Node Vite SSR script (`scripts/prerender.mjs`) executing post-build, outputting static HTML into `dist/<route>/index.html` *(assumed)*.
- *Visual Styling Direction*: Refined saffron developer dark-mode; replace rainbow gradients with solid high-contrast buttons, subtle border highlights, and dense monospaced code blocks *(assumed)*.

---

## Phase 1 — Technical Guides Hub, 404 Page & Routing

**Purpose:** Add the developer technical guides hub (`/guides` and `/guides/:id`) and 404 fallback page, supporting deep links and discoverable content for search crawlers.
**Starts when:** Now.
**Re-check first:** Confirm `frontend/src/App.jsx` structure and router setup.

### Task 1.1: Author Technical Guides Data Source
- **Goal:** Create `frontend/src/content/guidesData.js` containing 3 in-depth technical guides with realistic code examples and schemas.
- **Why:** Required by OSC SEO architecture to serve as an authoritative developer knowledge base.
- **Where:** `frontend/src/content/guidesData.js`.
- **Do:** Create file exporting `CALENDAR_GUIDES` array with structured guides:
  1. `gazetted-vs-restricted-holidays`: Central vs State gazette rules, mandatory closures vs optional religious leaves, Section 25 NI Act vs executive orders.
  2. `hrms-payroll-leave-automation`: Engineering architecture for syncing calendar-api with attendance, payroll cutoffs, and weekend bridge calculations.
  3. `quickstart-integration-recipes`: Production code recipes in Node.js, Python, cURL, and Go.
- **Test first:** Verify JS syntax and data structure export without missing fields.
- **Verify:** `node -e "import('./frontend/src/content/guidesData.js').then(m => console.log(m.CALENDAR_GUIDES.length))"` outputs `3`.
- **Don't touch:** `frontend/src/data/regions.js`.
- **If it fails:** Fix syntax or export format.
- **Commit:** `git commit -m "feat(frontend): add technical guides data source"`

### Task 1.2: Build Guides Page and NotFound Components
- **Goal:** Build `frontend/src/pages/GuidesPage.jsx` with interactive sidebar navigation, URL parameter routing (`/guides/:id`), and build `frontend/src/pages/NotFoundPage.jsx`.
- **Why:** Delivers real per-guide URL routes for both browser visitors and static search engine indexing, plus graceful 404 handling.
- **Where:** `frontend/src/pages/GuidesPage.jsx`, `frontend/src/pages/NotFoundPage.jsx`.
- **Do:**
  - In `GuidesPage.jsx`, implement responsive 2-column layout:
    - Left column: List of guide cards with category badges, reading time, and active state indicator.
    - Right column: Full article content with headings, callouts, and `CodeSnippet` blocks.
    - Use `useParams` to bind directly to route `:id`, falling back to first guide.
  - In `NotFoundPage.jsx`, implement clear 404 view with link back to Home.
- **Test first:** Check that component files exist and export default functions.
- **Verify:** `node -e "const fs = require('fs'); if (!fs.existsSync('frontend/src/pages/GuidesPage.jsx') || !fs.existsSync('frontend/src/pages/NotFoundPage.jsx')) process.exit(1);"` exits 0.
- **Don't touch:** `frontend/src/pages/PlaygroundPage.jsx`.
- **If it fails:** Adjust params handling and conditional fallbacks.
- **Commit:** `git commit -m "feat(frontend): implement GuidesPage and NotFoundPage components"`

### Task 1.3: Update Router and Navigation
- **Goal:** Update `frontend/src/App.jsx` and `frontend/src/components/Navbar.jsx` to register `/guides`, `/guides/:id`, `*` (404), and add Guides navigation item.
- **Why:** Seamless navigation between Home, Playground, Docs, Guides, and Status.
- **Where:** `frontend/src/App.jsx`, `frontend/src/components/Navbar.jsx`.
- **Do:**
  - In `App.jsx`, extract `AppContent` (pure routing definitions with `Routes`) and export both `AppContent` and default `App` (wrapped in `Router`).
  - Add routes `<Route path="/guides" element={<GuidesPage />} />`, `<Route path="/guides/:id" element={<GuidesPage />} />`, and `<Route path="*" element={<NotFoundPage />} />`.
  - In `Navbar.jsx`, add `Guides` navigation link alongside `Home`, `Playground`, `Docs`, `Status`.
- **Test first:** Run `npm run build` from `frontend/`.
- **Verify:** `npm run build` in `frontend/` succeeds without routing errors.
- **Don't touch:** Existing `/playground` or `/docs` component logic.
- **If it fails:** Verify route path definitions and imports.
- **Commit:** `git commit -m "feat(frontend): wire guides routes and top navigation"`

### Checkpoint: Phase 1
- Run `npm run build` in `frontend/`.
- Create a commit for any remaining Phase 1 files and update the status in `DOCS/STATUS.md`.

---

## Phase 2 — Anti-Slop UI Refinement & Polish

**Purpose:** Eliminate generic AI-generated aesthetic tells (rainbow gradients, generic cards, pulse clutter) in favor of high-contrast developer polish.
**Starts when:** Phase 1 complete.
**Re-check first:** Inspect `frontend/src/index.css`, `HomePage.jsx`, `PlaygroundPage.jsx`, and `StatusPage.jsx`.

### Task 2.1: Clean Up Buttons, Gradients, and Unnecessary Pulses
- **Goal:** Replace generic `bg-gradient-to-r from-saffron-500 to-red-600` with solid saffron buttons (`bg-saffron-600 hover:bg-saffron-500 active:bg-saffron-700 text-white font-medium shadow-sm hover:shadow active:scale-[0.99]`) and remove misleading animation pulses.
- **Why:** Slop signature check flags multi-color landing page gradients and permanent pulse animations as generic AI output; solid brand colors and calm UI convey intentionality.
- **Where:** `frontend/src/pages/HomePage.jsx`, `frontend/src/pages/PlaygroundPage.jsx`, `frontend/src/components/Navbar.jsx`, `frontend/src/index.css`.
- **Do:**
  - Replace gradient classes with clean solid background classes (`bg-saffron-600 hover:bg-saffron-500`).
  - Remove unnecessary `animate-pulse` on static icons and headers (retain only dynamic warming-up spinner indicator).
  - Standardize Navbar logo hover transition to subtle scale (`hover:scale-[1.02]` instead of aggressive `hover:scale-105`).
  - Standardize card roundedness to `rounded-xl` for clean component harmony.
- **Test first:** Verify buttons render with high contrast against dark background.
- **Verify:** `git grep "from-saffron-500 to-red-600" frontend/src` returns 0 hits.
- **Don't touch:** `focus-visible` ring settings in `index.css` or functional navbar `backdrop-blur-md`.
- **If it fails:** Adjust button color classes and hover states.
- **Commit:** `git commit -m "refactor(frontend): replace generic gradients and pulses with solid brand styling"`

### Task 2.2: Refine Typography and Layout Hierarchy
- **Goal:** Tighten spacing rhythms and ensure all headings, monospace snippets, and response badges have clear visual weight.
- **Why:** Enhances readability and developer usability across mobile and desktop.
- **Where:** `frontend/src/pages/HomePage.jsx`, `frontend/src/components/CodeSnippet.jsx`, `frontend/src/components/CalendarGrid.jsx`.
- **Do:**
  - Ensure quickstart curl snippet on HomePage has clear contrast and prominent copy button.
  - Optimize calendar grid tooltips and weekend highlights for crisp contrast.
  - Ensure all secondary text uses appropriate slate tokens per STACK-CONTEXT.md.
- **Test first:** Verify responsive viewports on desktop and mobile.
- **Verify:** `npm run build` in `frontend/` succeeds without styling compilation errors.
- **Don't touch:** Underlying API fetch logic or state management.
- **If it fails:** Tune padding/margin classes.
- **Commit:** `git commit -m "refactor(frontend): tighten typography and card hierarchy"`

### Checkpoint: Phase 2
- Run `npm run build` in `frontend/`.
- Create a commit for any remaining Phase 2 adjustments and update the status in `DOCS/STATUS.md`.

---

## Phase 3 — SSG Prerendering, Sitemap, and Vercel Routing

**Purpose:** Implement build-time static site generation (SSG) for all routes, sitemap.xml, robots.txt, and update Vercel rewrites to satisfy the 6 OSC SEO invariants.
**Starts when:** Phase 2 complete.
**Re-check first:** Check `frontend/package.json` and `frontend/vercel.json`.

### Task 3.1: Prepare HTML Template & Implement Prerender Script
- **Goal:** Update `frontend/index.html` with canonical and OpenGraph meta tags, and create `frontend/scripts/prerender.mjs` to render static HTML for `/`, `/docs`, `/guides`, `/guides/:id`, and `/status` into `dist/`, plus `dist/sitemap.xml` and `dist/robots.txt`.
- **Why:** Guarantees search engines receive 100% rendered markup with unique meta tags and canonical URLs.
- **Where:** `frontend/index.html`, `frontend/scripts/prerender.mjs`.
- **Do:**
  - In `index.html`, add canonical link (`https://calendar-api.vercel.app/`), OpenGraph tags, and Schema.org `WebAPI` JSON-LD.
  - In `scripts/prerender.mjs`, use Vite SSR (`createServer` mode: `production`) to import `AppContent` and `CALENDAR_GUIDES`.
  - Render each page inside `MemoryRouter` to static HTML strings.
  - Replace `<div id="root"></div>` with rendered markup in `dist/index.html` template.
  - Inject unique title element, meta description tag, link canonical tag, and Schema.org `WebAPI` JSON-LD.
  - Generate multi-line `dist/sitemap.xml` with lastmod tag and priority tag.
  - Generate `dist/robots.txt` pointing to sitemap URL.
- **Test first:** Test prerender script directly using `node scripts/prerender.mjs` after build.
- **Verify:** `node -e "const fs = require('fs'); if (!fs.existsSync('frontend/scripts/prerender.mjs')) process.exit(1);"` exits 0.
- **Don't touch:** `backend/` or root files.
- **If it fails:** Debug SSR module loading or route rendering.
- **Commit:** `git commit -m "feat(frontend): add SSG prerender script, sitemap, and robots generator"`

### Task 3.2: Update Build Scripts and Vercel Routing Configuration
- **Goal:** Chain prerendering into `package.json` build command and configure `vercel.json` with prerender rewrites and negative-lookahead exemption.
- **Why:** Ensures automated deployment on Vercel serves prerendered static pages and raw verification/sitemap files without SPA interception.
- **Where:** `frontend/package.json`, `frontend/vercel.json`.
- **Do:**
  - Update `package.json` script: `"build": "vite build && node scripts/prerender.mjs"`.
  - Update `vercel.json` with explicit prerender rewrites:
    - `/docs` -> `/docs/index.html`
    - `/guides` -> `/guides/index.html`
    - `/guides/:id` -> `/guides/:id/index.html`
    - `/status` -> `/status/index.html`
    - Negative lookahead SPA fallback exempting `assets`, `images`, `robots.txt`, `sitemap.xml`, `favicon.svg`, `logo.svg`, and `google*.html`.
- **Test first:** Run `npm run build` from `frontend/`.
- **Verify:** `npm run build` in `frontend/` exits 0 and outputs prerendered HTML in `dist/`.
- **Don't touch:** Production API URL environment variables.
- **If it fails:** Adjust rewrite patterns in vercel.json.
- **Commit:** `git commit -m "chore(frontend): configure SSG build pipeline and vercel rewrites"`

### Checkpoint: Phase 3
- Run `npm run build` in `frontend/`.
- Create a commit for the build updates and update the status in `DOCS/STATUS.md`.

---

## Phase 4 — Final Verification & Documentation

**Purpose:** Perform end-to-end build verification, check all live interactions, and update documentation.
**Starts when:** Phase 3 complete.
**Re-check first:** Verify all dist files and git status.

### Task 4.1: End-to-End Build & Smoke Verification
- **Goal:** Verify that production build passes, static routes serve correctly, and all interactive features (Playground API calls, Calendar visualizer, Code snippet copy) work seamlessly.
- **Why:** Confirms zero regressions across all core features and proves the build artifact is production-ready.
- **Where:** `frontend/`.
- **Do:**
  - Run `npm run build` in `frontend/`.
  - Validate generated sitemap XML structure.
  - Verify that no console errors or broken styles occur.
- **Test first:** Clean build run.
- **Verify:** `npm run build` in `frontend/` succeeds with exit code 0.
- **Don't touch:** Non-frontend files.
- **If it fails:** Resolve any remaining lint or bundle issues.
- **Commit:** `git commit -m "chore: verify production build and frontend invariants"`

### Task 4.2: Update Project Status & Docs Index
- **Goal:** Update `DOCS/STATUS.md` and `DOCS/README.md` to reflect the completed frontend upgrade, SEO invariants compliance, and active state.
- **Why:** Keeps project records accurate and maintains documentation integrity.
- **Where:** `DOCS/STATUS.md`, `DOCS/README.md`.
- **Do:**
  - Update `DOCS/STATUS.md` recording all 6 SEO invariants passing, AI-slop cleanup completed, and production build verified.
  - Update `DOCS/README.md` index table if applicable.
- **Test first:** Check that STATUS.md remains under 40 lines.
- **Verify:** `git status --short` in repository reports a clean working tree.
- **Don't touch:** `DOCS/CONTEXT/STACK-CONTEXT.md` historical sections.
- **If it fails:** Adjust formatting.
- **Commit:** `git commit -m "docs: update STATUS.md with frontend standards upgrade"`

### Checkpoint: Phase 4
- Verify final git status is clean and create a commit for any final documentation adjustments. Update the status in `DOCS/STATUS.md`.

---

## Progress Log

*(Log timestamps and commit hashes as each task completes)*
