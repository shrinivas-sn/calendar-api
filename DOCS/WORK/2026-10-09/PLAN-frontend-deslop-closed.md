# PLAN — Frontend de-slop (portal pages only)

**Written 09/10/2026.** Temporary file — deleted when this closes.

**Goal:** Remove false claims, the guide formatting bug, banned eyebrow labels and the templated
home layout from the portal, changing only `frontend/src/`, with every change specified exactly below.
**Why:** Owner review on 09/10/2026 (scorecard in this session): Status page shows untrue facts
(Cloudflare CDN, 99.9% guaranteed uptime, "regional node database"), Docs claims "sub-50ms",
Home describes ICS files that no longer exist, guides print raw `**bold**`, and four pages carry
an eyebrow label (banned pattern) or the stock AI hero.
**What this changes:** `frontend/src/pages/StatusPage.jsx`, `frontend/src/pages/DocsPage.jsx`,
`frontend/src/pages/GuidesPage.jsx`, `frontend/src/pages/HomePage.jsx`,
`frontend/src/pages/PlaygroundPage.jsx`, new `frontend/src/components/GuideText.jsx`,
plus this file and `DOCS/STATUS.md` for progress notes.
**Done means:** every check in Task 5.2 prints `0`, `npm --prefix frontend run build` succeeds,
root `npm test` passes, and `git diff --name-only main` lists only the allowed files above.
**Out of scope:**
- Anything under `backend/`, `api/`, `.github/`, root `package.json`, `vercel.json`.
- Fonts, colours, `tailwind.config.js`, `index.css`, `index.html`, `scripts/prerender.mjs`.
- `Navbar.jsx`, `Footer.jsx`, `CalendarGrid.jsx`, `NotFoundPage.jsx` and every other component not named above.
- Fixing mobile problems (Phase 5 measures and reports only).
- Fixing the 31 existing lint errors (the count must just not go up).

---

## Read this first

0. **Run the whole plan in one go: Phase 1 → Phase 5, every task, without stopping to ask.**
   Checkpoints are save points, not pauses — do the checkpoint steps and continue immediately.
   Nothing in this plan needs the owner before the end. If a task fails, follow **Failure
   handling** (log it, move on); stop only after Phase 5, then report: commits made, Task 5.2
   output, mobile findings, and every Plan issues row.
1. From the repo root: `git switch main && git pull` then `git switch -c frontend-deslop`.
   If the branch already exists: `git switch frontend-deslop`.
2. Read only: `DOCS/STATUS.md`, this file's **Rules**, your current task, the last Progress Log
   entry. Do not read `DOCS/EXTRA/`, `backend/data/`, `frontend/dist/`, or `PLAN.md`
   (a different plan for the backend — do not touch it).
3. Detect the environment — commands, never remembered values:

| Check | Command | Pass looks like |
|---|---|---|
| Node | `node -v` | `v20` or higher |
| Frontend deps | `npm --prefix frontend ls react --depth=0` | shows `react@19…`; else run `npm --prefix frontend install` |
| Build works before you start | `npm --prefix frontend run build` | ends with `Successfully rendered 7 pages` |
| Lint baseline | `npm --prefix frontend run lint 2>&1 \| grep -o "[0-9]* problems"` | `31 problems` (record the number you see) |
| Backend tests (must stay green, you never edit backend) | `npm test` (repo root) | `# fail 0` |

4. A task's **Where:** uses search text, not line numbers. If the text is missing, the code moved:
   find the equivalent, apply the same intent, and log it under Plan issues.
5. **Code blocks marked "Replace with exactly" are final.** Copy them character for character.
   Do not "improve" wording, add classes, add icons, or reorder anything. Leading spaces in
   this file may differ from the source file: match and keep the source file's indentation;
   only the text after the indentation must be identical.

## Facts verified while planning

| Fact | Source | Checked on |
|---|---|---|
| Frontend: React 19, react-router-dom 7, Tailwind 3.4, lucide-react, Vite; build = `vite build && node scripts/prerender.mjs` | `frontend/package.json` | 09/10/2026 |
| No Cloudflare/CDN in front of the API; API host is Render | `api.json` `api_base_url`; `curl -I` on the API shows `x-render-origin-server: Render` | 08/10/2026 |
| Render free plan sleeps after 15 min without traffic; wake takes about 1 minute | https://render.com/docs/free | 08/10/2026 |
| API sends `Cache-Control: public, max-age=3600` on 200 responses; rate limit 100 per 15 min per IP | `backend/src/index.js` search `max-age=3600` and `max: 100` | 09/10/2026 |
| Data is JSON files in git; monthly check `.github/workflows/data-update.yml` (1st of month) | repo files | 09/10/2026 |
| API options that exist: `scope` (all routes), `restricted` (`/v1/calendar` only), range max 5 calendar years | `backend/src/index.js` search `OPTION_VALUES`, `MAX_RANGE_YEARS` | 09/10/2026 |
| `/v1/calendar` returns one row per day (`date, day, is_weekend, is_holiday, holiday_name, holiday_type, is_working_day`), not month-by-month | `backend/src/index.js` search `calendar.push({` | 09/10/2026 |
| Guide text uses `**bold**`, inline backticks, `- ` bullet lines and `1. ` numbered lines; it is printed raw today | `frontend/src/content/guidesData.js` lines starting `1. **National`; `GuidesPage.jsx` search `whitespace-pre-line` | 09/10/2026 |
| Guide code blocks contain `/**` (JSDoc), so a check for raw bold must look for `**` followed by a letter | `guidesData.js` search `` code: `/** `` | 09/10/2026 |
| `Zap` is used twice in PlaygroundPage (header pill and line ~159) — keep the import | `PlaygroundPage.jsx` search `<Zap` | 09/10/2026 |
| Lint currently reports 31 errors (pre-existing) | `npm --prefix frontend run lint` | 09/10/2026 |
| Banned pattern (owner): eyebrow label — small uppercase tag/pill above a headline | `~/.claude/skills/no-ai-slop/references/banned-patterns.md` | 09/10/2026 |

## Rules for every task

- Edit **only** the files named in the task's **Where**. Never edit anything outside `frontend/src/`, except appending to this plan's Progress Log / Plan issues and `DOCS/STATUS.md`.
- Never add: eyebrow labels or pills above headings, gradient text or backgrounds, new cards or card grids, emoji, new icons, new animations, new colours, new fonts, new npm packages, `dangerouslySetInnerHTML`.
- Never write your own copy. Every visible word you add comes from a "Replace with exactly" block in this plan. If a word you need is not in this plan, stop that task and log a Plan issue.
- Never use these words anywhere: seamless, effortless, powerful, blazing, lightning, unlock, robust, cutting-edge, next-level, guaranteed.
- One task = one commit, with the message given. Commit messages end with your tool's attribution line if it has one.
- Never push, never merge, never deploy. The owner does that after review.
- After every task: `npm --prefix frontend run build` must still succeed.

## Failure handling

| Situation | Do this |
|---|---|
| Build fails after an edit | Read the first error line; it is almost always an unused or missing import or an unclosed tag in the block you just pasted. Fix only that. |
| Lint count goes above the baseline | An import you removed is still used, or one you added is unused. Fix the import line of the file you edited. |
| A "Where" search text is not found | Do not guess. Search for the nearest unique phrase from the same block; if still unclear, log a Plan issue and skip to the next task. |
| You feel a page "looks empty" after a removal | That is intended. Do not add anything. |
| Anything else fails | Fix and retry at most three times. Then `git restore` that file, record the real output in the Progress Log, and continue with the next task. |
| The plan itself looks wrong | Follow **Plan issues** below — decide by impact, never freeze the whole plan. |
| Owner-only actions | Pushing, merging, deploying, changing fonts/colours — never do these; list them in your final message. |

---

## Phase 1 — Remove false claims (Status, Docs)

**Purpose:** Nothing on the site states something untrue.
**Starts when:** now
**Re-check first:** none

### Task 1.1 — Status page: honest header, delete fake stat cards, true operational details

**Goal:** Status page shows only the live check plus true facts.
**Why:** "Cloudflare", "99.9% Guaranteed", "regional node database" are false; a real user reads this page.
**Where:** `frontend/src/pages/StatusPage.jsx` (search text: `Service <span className="text-saffron-500">Status</span>`, `{/* Stats Cards Grid */}`, `Operational Details`)
**Do:**
- [ ] Replace the import lines (first 3 lines) with exactly:
  ```jsx
  import React, { useState } from 'react';
  import { Activity, Server } from 'lucide-react';
  import StatusBadge from '../components/StatusBadge';
  ```
- [ ] Delete the line `const [pingData, setPingData] = useState({ loading: true, latency: null, error: null });` and the whole `useEffect(() => { ... }, [baseUrl]);` block (from `useEffect(() => {` to `}, [baseUrl]);` inclusive). Keep `const [baseUrl] = useState(...)`.
- [ ] Replace the header block (from `{/* Header */}` through the matching closing div tag after the `<p>`) with exactly:
  ```jsx
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-100 mb-3">
          Service status
        </h1>
        <p className="text-sm sm:text-base text-slate-400">
          A live check of the API from your browser, and how the service is run.
        </p>
      </div>
  ```
- [ ] Delete the entire block from `{/* Stats Cards Grid */}` through its matching closing div tag (the `div` with `grid grid-cols-1 md:grid-cols-3`, containing the Latency, CDN Caching and Uptime cards). Nothing replaces it.
- [ ] Replace the whole the div with className `space-y-4 text-xs sm:text-sm` block (the rows under Operational Details, through its matching closing div tag) with exactly:
  ```jsx
        <div className="space-y-4 text-xs sm:text-sm">
          {[
            ['API version', 'v1'],
            ['Hosting', 'Render, free plan'],
            ['Cold start', 'The first request after 15 minutes without traffic can take about a minute'],
            ['API address', 'calendar-api-d7a8.onrender.com'],
            ['Rate limit', '100 requests per 15 minutes per IP address'],
            ['Response caching', 'Successful responses are cacheable for 1 hour'],
            ['Data storage', 'JSON files in the public GitHub repository, no database'],
            ['Data source', 'india.gov.in holiday calendar'],
            ['Data refresh', 'Checked automatically on the 1st of every month'],
          ].map(([label, value], i, rows) => (
            <div
              key={label}
              className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-2 ${i < rows.length - 1 ? 'border-b border-white/5' : ''}`}
            >
              <span className="text-slate-400 font-medium">{label}</span>
              <span className="text-slate-300 sm:text-right">{value}</span>
            </div>
          ))}
        </div>
  ```
- [ ] Change the outer wrapper `className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn"` to `className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10"`.
**Test first:** n/a — no test runner for the frontend; proven by Task 5.2 greps (`Cloudflare`, `99.9`, `Guaranteed`, `node database`, `Zero database` → 0).
**Verify:** `npm --prefix frontend run build` → `Successfully rendered 7 pages`; `grep -c "Cloudflare\|99.9\|Guaranteed" frontend/src/pages/StatusPage.jsx` → `0`.
**Don't touch:** `StatusBadge.jsx`; the System Status card block (`interactive-card p-6 sm:p-8 flex`); the `Operational Details` heading.
**If it fails:** build error "X is not defined" → you deleted something still used; compare with the Do list and restore only that.
**Commit:** `fix(portal): status page shows only true service facts`

### Task 1.2 — Docs overview: remove the latency claim

**Goal:** Docs intro is accurate.
**Why:** "sub-50ms latency" and "serves data instantly" are false on a free server that sleeps.
**Where:** `frontend/src/pages/DocsPage.jsx` (search text: `with zero keys and sub-50ms latency.` and `<strong className="text-white">Zero Setup:</strong>`)
**Do:**
- [ ] Replace the sentence `Welcome to the India Calendar API documentation. This open-source REST API serves official Indian government holidays (Central and State level) directly from structured datasets with zero keys and sub-50ms latency.` with exactly:
  `This open-source REST API serves official Indian government holidays for the Central Government and all 36 States and Union Territories. No API key or sign-up is needed.`
- [ ] Replace the inner content of the the paragraph with className `leading-relaxed` that starts with `<strong className="text-white">Zero Setup:</strong>` with exactly:
  ```jsx
                <strong className="text-white">Cold starts:</strong> The API runs on a free server that sleeps after 15 minutes without traffic. The first request after that can take about a minute; requests after it are fast.
  ```
**Test first:** n/a — copy change; proven by Task 5.2 grep (`sub-50ms` → 0).
**Verify:** `grep -c "sub-50ms\|serves data instantly" frontend/src/pages/DocsPage.jsx` → `0`; build succeeds.
**Don't touch:** every other part of DocsPage (endpoint tables, error table, sidebar).
**If it fails:** restore the file with `git restore frontend/src/pages/DocsPage.jsx` and redo the two replacements only.
**Commit:** `fix(portal): docs intro states cold starts instead of a latency claim`

### Checkpoint — Phase 1

- [ ] Full verification: `npm --prefix frontend run build` → `Successfully rendered 7 pages`; `grep -rc "Cloudflare\|99.9%\|sub-50ms" frontend/src/pages` → every file `0`.
- [ ] Commit made for every task in this phase.
- [ ] Status file updated: add under "Blockers / In Flight" one line: `Frontend de-slop on branch frontend-deslop (PLAN-frontend-deslop.md): Phase 1 done.`
- [ ] Progress Log entry added.

A new session may start here.

---

## Phase 2 — Guides: render formatting, remove label and hashtags

**Purpose:** Guides read as a finished article.
**Starts when:** Phase 1 checkpoint passed.
**Re-check first:** `frontend/src/content/guidesData.js` still contains `1. **National Holidays` (if not, the formatting rules below still apply; log it).

### Task 2.1 — New `GuideText` component (bold, inline code, lists)

**Goal:** Guide text shows bold, inline code and lists instead of raw `**` and backticks.
**Why:** Raw markdown symbols on the page are the most visible defect on the site.
**Where:** new `frontend/src/components/GuideText.jsx`; `frontend/src/pages/GuidesPage.jsx` (search text: `whitespace-pre-line`)
**Do:**
- [ ] Create `frontend/src/components/GuideText.jsx` with exactly:
  ```jsx
  import React from 'react';

  // Renders guide text written with a small markdown subset:
  // **bold**, `inline code`, "- " bullet lines, "1. " numbered lines, blank-line breaks.
  // Plain React elements only; the text is never injected as HTML.

  const TEXT_CLASS = 'text-slate-300 text-sm sm:text-[15px] leading-relaxed';

  function renderInline(text) {
    return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code key={i} className="font-mono text-[0.9em] text-slate-200 bg-slate-900 border border-slate-800 rounded px-1 py-0.5">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  }

  function toBlocks(text) {
    const blocks = [];
    for (const rawLine of text.split('\n')) {
      const line = rawLine.trim();
      const last = blocks[blocks.length - 1];
      if (line === '') {
        blocks.push({ type: 'break' });
      } else if (/^- /.test(line)) {
        if (last && last.type === 'ul') last.items.push(line.slice(2));
        else blocks.push({ type: 'ul', items: [line.slice(2)] });
      } else if (/^\d+\. /.test(line)) {
        const item = line.replace(/^\d+\. /, '');
        if (last && last.type === 'ol') last.items.push(item);
        else blocks.push({ type: 'ol', items: [item] });
      } else if (last && last.type === 'p') {
        last.text += ' ' + line;
      } else {
        blocks.push({ type: 'p', text: line });
      }
    }
    return blocks.filter((b) => b.type !== 'break');
  }

  export default function GuideText({ text }) {
    return (
      <div className="space-y-3">
        {toBlocks(text).map((block, i) => {
          if (block.type === 'ul') {
            return (
              <ul key={i} className={`list-disc pl-5 space-y-1.5 ${TEXT_CLASS}`}>
                {block.items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
              </ul>
            );
          }
          if (block.type === 'ol') {
            return (
              <ol key={i} className={`list-decimal pl-5 space-y-1.5 ${TEXT_CLASS}`}>
                {block.items.map((item, j) => <li key={j}>{renderInline(item)}</li>)}
              </ol>
            );
          }
          return <p key={i} className={TEXT_CLASS}>{renderInline(block.text)}</p>;
        })}
      </div>
    );
  }
  ```
- [ ] In `GuidesPage.jsx`, add the import line `import GuideText from '../components/GuideText';` directly after `import CodeSnippet from '../components/CodeSnippet';`.
- [ ] In `GuidesPage.jsx`, find the 3-line block made of the line containing `leading-relaxed whitespace-pre-line">`, the line `{section.content}` under it, and the closing div line after that. Replace those 3 lines with this single line (same indentation as the line you removed):
  ```jsx
  <GuideText text={section.content} />
  ```
**Test first:** n/a — no frontend test runner; proven after build by: `grep -cF "**National" frontend/dist/guides/gazetted-vs-restricted-holidays/index.html` → `0`, and `grep -o "<strong" frontend/dist/guides/gazetted-vs-restricted-holidays/index.html | wc -l` → greater than `0` (dry run: 9).
**Verify:** build succeeds; both greps above as stated; ``grep -cF '`MH`' frontend/dist/guides/gazetted-vs-restricted-holidays/index.html`` → `0`.
**Don't touch:** `guidesData.js` (do not edit guide text); the code-block rendering (`section.code`).
**If it fails:** if bold still shows raw, check that the import was added and the old `whitespace-pre-line` div is gone; do not change the regex.
**Commit:** `fix(portal): render bold, inline code and lists in guides`

### Task 2.2 — Guides header and footer: remove eyebrow label and hashtag row

**Goal:** Plain, left-aligned header; no visible keyword tags.
**Why:** "Developer Knowledge Hub" pill is a banned eyebrow label; `#keyword` chips read as SEO stuffing.
**Where:** `frontend/src/pages/GuidesPage.jsx` (search text: `Developer Knowledge Hub`, `Topics:`)
**Do:**
- [ ] Replace the header block (from `{/* Header section */}` through the matching closing div tag after the `<p>` that starts `Authoritative references`) with exactly:
  ```jsx
        {/* Header section */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Guides
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-3xl">
            How Indian public holidays work, and how to use this API in HR and payroll systems.
          </p>
        </div>
  ```
- [ ] Replace the footer block (from `{/* Keywords & Footer */}` through its matching closing div tag just before the closing article tag) with exactly:
  ```jsx
            {/* Footer */}
            <div className="mt-10 pt-6 border-t border-slate-800/80 flex justify-end">
              <Link
                to="/playground"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-saffron-400 hover:text-saffron-300 transition-colors"
              >
                <span>Try these requests in the playground</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
  ```
- [ ] Replace the import line `import { BookOpen, Clock, Tag, ChevronRight, Copy, Check, ArrowUpRight } from 'lucide-react';` with exactly `import { Clock, Tag, Copy, Check, ArrowUpRight } from 'lucide-react';`
**Test first:** n/a — markup change; proven by Task 5.2 greps (`Developer Knowledge Hub`, `Topics:` → 0).
**Verify:** build succeeds; `grep -c "Knowledge Hub\|Topics:" frontend/src/pages/GuidesPage.jsx` → `0`.
**Don't touch:** the sidebar guide list, the article header, `keywords` in `guidesData.js` (kept as data).
**If it fails:** if build says `CodeSnippet` unused, leave that import as it was (it is not part of this task).
**Commit:** `fix(portal): plain guides header, no eyebrow label or hashtag chips`

### Checkpoint — Phase 2

- [ ] Full verification: build → `Successfully rendered 7 pages`; the three greps from Task 2.1 as stated.
- [ ] Commit made for every task in this phase.
- [ ] Status file updated: same line as Phase 1, now `Phases 1–2 done.`
- [ ] Progress Log entry added.

A new session may start here.

---

## Phase 3 — Home page: one main action, real endpoint list

**Purpose:** Home reads as a working API's front page, not a stock template.
**Starts when:** Phase 2 checkpoint passed.
**Re-check first:** `HomePage.jsx` still contains `Explore Interactive Playground` and `API Endpoint Matrix`.

### Task 3.1 — Hero: plain heading, one button plus a text link, no stat row

**Goal:** Hero states what the API is and has one primary action.
**Why:** Two equal buttons, an accent-coloured word and a decorative "0 Key / Instant Access" stat row are the stock AI hero.
**Where:** `frontend/src/pages/HomePage.jsx` (search text: `Indian Public Holidays &amp; Calendar`, `{/* Action CTAs */}`, `{/* Architectural Metrics Strip */}`)
**Do:**
- [ ] Replace the `<h1 ...>...</h1>` block with exactly:
  ```jsx
          <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-extrabold text-white tracking-tight leading-[1.12]">
            Indian public holidays API
          </h1>
  ```
- [ ] Replace the text inside the the paragraph with className `text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl` with exactly:
  `Official gazetted and restricted holidays for the Central Government and all 36 States and Union Territories, as JSON. No API key, no sign-up.`
- [ ] Replace the block from `{/* Action CTAs */}` through its matching closing div tag with exactly:
  ```jsx
          {/* Actions */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
            <NavLink
              to="/playground"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold text-white bg-saffron-600 hover:bg-saffron-500 active:bg-saffron-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <span>Try it in the playground</span>
              <ArrowRight size={16} />
            </NavLink>
            <NavLink
              to="/docs"
              className="text-sm font-semibold text-slate-300 hover:text-white underline underline-offset-4 decoration-slate-600 hover:decoration-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400 rounded"
            >
              Read the docs
            </NavLink>
          </div>
  ```
- [ ] Delete the whole block from `{/* Architectural Metrics Strip */}` through its matching closing div tag (the `grid grid-cols-3` with `37`, `5`, `0 Key`). Nothing replaces it.
- [ ] Change the hero `<section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-16 sm:mb-24">` to `<section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center mb-16">`.
- [ ] Change the terminal label `<span className="text-xs font-mono text-slate-300 font-semibold">api-live-demo</span>` text to `Example request` (keep the classes).
**Test first:** n/a — markup change; proven by Task 5.2 greps (`0 Key`, `Explore Interactive Playground` → 0).
**Verify:** build succeeds; `grep -c "0 Key\|Instant Access\|Explore Interactive" frontend/src/pages/HomePage.jsx` → `0`.
**Don't touch:** the right-column demo panel logic (`handleDemoFetch`, tabs, `RegionSelector`), state hooks.
**If it fails:** restore the file and redo only the bullet that broke.
**Commit:** `fix(portal): plain home hero with one primary action`

### Task 3.2 — Endpoint grid → endpoint list; guides callout → plain section

**Goal:** Endpoints shown as an accurate list; guides linked without an eyebrow label.
**Why:** The 3-column card grid had a filler "Open Source" card offering ICS files that no longer exist, and a wrong `/v1/calendar` description; the guides box carries a banned eyebrow label.
**Where:** `frontend/src/pages/HomePage.jsx` (search text: `{/* ─── Section 2: Endpoints Matrix ─── */}`, `{/* ─── Section 3: Technical Guides Callout ─── */}`, the first `import { ArrowRight` line)
**Do:**
- [ ] Directly above `export default function HomePage() {`, add exactly:
  ```jsx
  const ENDPOINTS = [
    { path: '/v1/holidays', returns: 'All holidays in a year, for the Central Government or one state', params: 'country, year, region, scope' },
    { path: '/v1/date/is-holiday', returns: 'Whether a date is a holiday, and which holidays fall on it', params: 'country, date, region, scope' },
    { path: '/v1/date/next-holiday', returns: 'The next holiday after a given date', params: 'country, date, region, scope' },
    { path: '/v1/holidays/range', returns: 'Holidays between two dates, up to 5 calendar years', params: 'country, start, end, region, scope' },
    { path: '/v1/calendar', returns: 'Every day of a year with weekend, holiday and working-day flags', params: 'country, year, region, scope, restricted' },
  ];

  ```
- [ ] Replace everything from `{/* ─── Section 2: Endpoints Matrix ─── */}` down to (not including) the last closing div line of the file, the one that closes the page wrapper just before the closing parenthesis of return — i.e. Section 2 and Section 3 together — with exactly:
  ```jsx
      {/* Endpoints */}
      <section className="mb-16 pt-12 border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Endpoints
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              All endpoints are GET requests and need <code className="font-mono text-slate-300">country=IN</code>.
            </p>
          </div>
          <NavLink
            to="/docs"
            className="text-xs font-semibold text-saffron-400 hover:text-saffron-300 flex items-center gap-1"
          >
            <span>Full reference</span>
            <ArrowRight size={13} />
          </NavLink>
        </div>

        <ul className="divide-y divide-slate-800 border-y border-slate-800">
          {ENDPOINTS.map((endpoint) => (
            <li key={endpoint.path} className="py-4 grid gap-1 md:grid-cols-12 md:gap-6 md:items-baseline">
              <span className="md:col-span-4 font-mono text-sm text-slate-100">{endpoint.path}</span>
              <span className="md:col-span-5 text-sm text-slate-300">{endpoint.returns}</span>
              <span className="md:col-span-3 font-mono text-xs text-slate-400">{endpoint.params}</span>
            </li>
          ))}
        </ul>

        <p className="text-xs text-slate-400 mt-4">
          Data and source code:{' '}
          <a
            href="https://github.com/shrinivas-sn/calendar-api"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-300 hover:text-white underline underline-offset-4 decoration-slate-600"
          >
            github.com/shrinivas-sn/calendar-api
          </a>
        </p>
      </section>

      {/* Guides */}
      <section className="pt-12 border-t border-slate-800/80">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Guides
        </h2>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          Gazetted vs restricted holidays, HR leave calculations, and code examples in Node.js, Python and Go.
        </p>
        <NavLink
          to="/guides"
          className="inline-flex items-center gap-1 mt-4 text-xs font-semibold text-saffron-400 hover:text-saffron-300"
        >
          <span>Read the guides</span>
          <ArrowRight size={13} />
        </NavLink>
      </section>
  ```
- [ ] Replace the import line `import { ArrowRight, Terminal, BookOpen, Check, Copy, Sparkles, CheckCircle2, Play, Code2 } from 'lucide-react';` with exactly `import { ArrowRight, Terminal, Check, Copy, Play } from 'lucide-react';`
**Test first:** n/a — markup change; proven by Task 5.2 greps (`ICS files`, `Month-by-month`, `Developer Guides`, `Endpoint Matrix` → 0).
**Verify:** build succeeds; `grep -c "ICS files\|Month-by-month\|Endpoint Matrix\|Developer Guides\|Open Source" frontend/src/pages/HomePage.jsx` → `0`.
**Don't touch:** the hero (Task 3.1), any other file.
**If it fails:** an "Adjacent JSX elements" error means the replacement range was wrong — restore the file, redo 3.1, then redo 3.2 replacing exactly from the Section 2 comment to just before the page's last closing div line.
**Commit:** `fix(portal): accurate endpoint list and plain guides section on home`

### Checkpoint — Phase 3

- [ ] Full verification: build → `Successfully rendered 7 pages`; greps from 3.1 and 3.2 → `0`.
- [ ] Commit made for every task in this phase.
- [ ] Status file updated: `Phases 1–3 done.`
- [ ] Progress Log entry added.

A new session may start here.

---

## Phase 4 — Playground header

**Purpose:** Last eyebrow label and centred accent-word heading removed.
**Starts when:** Phase 3 checkpoint passed.
**Re-check first:** `PlaygroundPage.jsx` still contains `Live API Console`.

### Task 4.1 — Plain left-aligned playground header

**Goal:** Header matches Status and Guides (left-aligned, plain heading, no pill).
**Why:** "Live API Console" pill is a banned eyebrow label; centred heading with one orange word repeats the template.
**Where:** `frontend/src/pages/PlaygroundPage.jsx` (search text: `{/* Page Header */}`)
**Do:**
- [ ] Replace the block from `{/* Page Header */}` through the matching closing div tag after the `<p>` that starts `Build requests, preview live outputs` with exactly:
  ```jsx
      {/* Page Header */}
      <div className="max-w-2xl mb-8">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white mb-3">
          Playground
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          Build a request, run it against the live API, and copy the code.
        </p>
      </div>
  ```
- [ ] Do **not** change the import line: `Zap` is still used further down the file.
**Test first:** n/a — markup change; proven by Task 5.2 grep (`Live API Console` → 0).
**Verify:** build succeeds; `grep -c "Live API Console" frontend/src/pages/PlaygroundPage.jsx` → `0`.
**Don't touch:** the console, request builder, response panel, any logic.
**If it fails:** restore the file and redo the single replacement.
**Commit:** `fix(portal): plain playground header`

### Checkpoint — Phase 4

- [ ] Full verification: build → `Successfully rendered 7 pages`.
- [ ] Commit made for every task in this phase.
- [ ] Status file updated: `Phases 1–4 done.`
- [ ] Progress Log entry added.

A new session may start here.

---

## Phase 5 — Verify everything; measure mobile (report only)

**Purpose:** Prove the work with commands, and hand the owner a measured mobile report.
**Starts when:** Phase 4 checkpoint passed.
**Re-check first:** none.

### Task 5.1 — Scope guard: only allowed files changed

**Goal:** Prove nothing outside the frontend pages was touched.
**Why:** The owner's hard rule: backend untouched.
**Where:** `./` (repository root; search text: n/a — command only)
**Do:**
- [ ] Run `git diff --name-only main...HEAD`.
**Test first:** n/a — this task is the check.
**Verify:** output contains only these paths (any subset): `frontend/src/pages/StatusPage.jsx`, `frontend/src/pages/DocsPage.jsx`, `frontend/src/pages/GuidesPage.jsx`, `frontend/src/pages/HomePage.jsx`, `frontend/src/pages/PlaygroundPage.jsx`, `frontend/src/components/GuideText.jsx`, `PLAN-frontend-deslop.md`, `DOCS/STATUS.md`. Then `npm test` (root) → `# fail 0`.
**Don't touch:** anything — if another path appears, `git restore --source=main -- <that path>` and commit `chore: revert out-of-scope change`.
**If it fails:** log the extra path under Plan issues with how it got changed.
**Commit:** none — check only.

### Task 5.2 — Slop and truth greps on source and built pages

**Goal:** Every known false claim and slop phrase is gone from the shipped HTML.
**Why:** A command result, not an impression, proves the cleanup.
**Where:** `frontend/src`, `frontend/dist` (search text: n/a — commands)
**Do:**
- [ ] `npm --prefix frontend run build`
- [ ] Run, from the repo root:
  ```bash
  for p in "Cloudflare" "99.9%" "Guaranteed" "node database" "Zero database" "sub-50ms" "serves data instantly" \
           "ICS files" "Month-by-month" "0 Key" "Instant Access" "Explore Interactive" "Endpoint Matrix" \
           "Developer Guides" "Developer Knowledge Hub" "Live API Console" "Topics:"; do
    printf "%3s  %s\n" "$(grep -rF --include=*.jsx --include=*.html -- "$p" frontend/src frontend/dist | wc -l)" "$p"
  done
  grep -rF --include=*.html -e "**National" -e "**Sandwich" -e "**Gazetted Holidays" frontend/dist/guides | wc -l
  ```
- [ ] Run `npm --prefix frontend run lint 2>&1 | grep -o "[0-9]* problems"`.
**Test first:** n/a — this task is the check.
**Verify:** every line of the loop prints `0`; the raw-bold grep prints `0`; lint problems ≤ the baseline from Read-this-first (31; the dry run on 09/10/2026 gave 26). Do not add "Open Source" or a bare `**` search: both legitimately appear (site-wide text, and Python `Holiday(**item)` in a code example).
**Don't touch:** nothing — if a count is not 0, go back to the task that owns that text and finish it.
**If it fails:** record the non-zero line and which file it is in (`grep -rnF -- "<text>" frontend/src`) in the Progress Log.
**Commit:** none — check only.

### Task 5.3 — Mobile measurement (no fixes)

**Goal:** A measured mobile report for the owner to review.
**Why:** Mobile fixes need judgement; this executor only measures.
**Where:** `frontend/` (output folder `frontend/.mobile-check/`, not committed)
**Do:**
- [ ] `npm --prefix frontend install --no-save puppeteer-core`
- [ ] Start the API (read-only use, never edit it) in a second terminal: `PORT=3000 node backend/src/index.js` (PowerShell: `$env:PORT=3000; node backend/src/index.js`).
- [ ] Start the site in a third terminal: `npm --prefix frontend run preview -- --port 4173 --strictPort`.
- [ ] Run (bash): `NODE_PATH="$(pwd)/frontend/node_modules" node E:/dev-recipes/mobile-responsiveness/templates/probe.js http://localhost:4173 frontend/.mobile-check --routes /,/docs,/guides,/status,/playground --viewports xs,sm,md --project-root frontend`
- [ ] For each `frontend/.mobile-check/results-*.json`, copy every family whose `status` is `fail` or `warn` into the Progress Log as one line: `<route> <viewport> <family>: <status> — <measured>`.
- [ ] Stop both servers (Ctrl+C in each terminal). Then confirm: PowerShell `Get-NetTCPConnection -LocalPort 3000,4173 -State Listen -ErrorAction SilentlyContinue` → prints nothing.
**Test first:** n/a — measurement only.
**Verify:** at least one `results-*.json` per route exists; the two ports are closed.
**Don't touch:** any source file — do **not** fix anything the probe reports.
**If it fails:** if `puppeteer-core` cannot find a browser, record the error line and skip this task; it is not a blocker for the rest.
**Commit:** none — `frontend/.mobile-check/` stays uncommitted.

### Checkpoint — Phase 5

- [ ] Full verification: Tasks 5.1 and 5.2 outputs pasted into the Progress Log.
- [ ] Commit made for every task in this plan (Phases 1–4: 7 commits).
- [ ] Status file updated: replace the de-slop line with `Frontend de-slop done on branch frontend-deslop (not pushed): owner review, then merge. Mobile report in PLAN-frontend-deslop.md Progress Log.`
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
| 1 | 09/10/2026 | Task 5.3 | bash probe command with `--routes /,/docs,...` | MSYS bash on Windows converts `,/` to `C:/Program Files/Git/` and `NODE_PATH` requires Windows syntax | Route `/` initially ran against converted path; other 4 routes unaffected | Probed route `/` with `$env:NODE_PATH` in PowerShell to complete all 15 results files | Pending owner review |

---

## Owner inputs

- Review the `frontend-deslop` branch (screenshots or a local preview), then push and merge it yourself or ask Claude to.
- Font change (currently Inter) is a separate design decision — not part of this plan.
- Mobile fixes from Task 5.3's report — decide with Claude after reading it.

---

## Decisions

- Executor never writes copy; all visible text is fixed in this plan. (owner, 09/10/2026: "don't let it guess")
- Frontend only; backend, CI, config untouched. (owner, 09/10/2026)
- Status page drops the three stat cards entirely instead of rewording them; the live badge already shows the measured response time. *(assumed)*
- Home endpoints become a plain list (`ul`) that stacks on phones, not a table that scrolls sideways. *(assumed)*
- Guide `keywords` stay in `guidesData.js` as data; only the visible chips are removed. *(assumed)*
- Guide markdown rendered by a 70-line local component, not a new package. *(assumed)*
- Inter font, colour palette and Navbar/Footer are left as they are. *(assumed)*

---

## Progress Log

*(Append only. Newest at the bottom. Never rewrite an entry — if it turned out wrong,
add a new one saying so. This log is what makes resuming cheap: a cold session reads
the last entry and knows exactly where to start.)*

- **09/10/2026 — Phase 1 complete.**
  - Task 1.1: `StatusPage.jsx` updated with honest service facts, deleted fake stat cards. Verified build and grep `0`. Committed `7c0e706`.
  - Task 1.2: `DocsPage.jsx` updated to mention cold starts and remove latency claim. Verified build and grep `0`. Committed `9dc4ba5`.
  - Checkpoint Phase 1 passed: build clean (7 pages), all Phase 1 greps 0, lint 29 problems.
- **09/10/2026 — Phase 2 complete.**
  - Task 2.1: Created `GuideText.jsx` to render bold, inline code, and lists. Replaced `whitespace-pre-line` in `GuidesPage.jsx`. Verified build, `**National` grep `0`, `<strong` grep `9`, `\`MH\`` grep `0`. Committed `8a9a44e`.
  - Task 2.2: Removed "Developer Knowledge Hub" pill from header and removed hashtag/topics row from footer in `GuidesPage.jsx`. Cleaned unused BookOpen/ChevronRight imports. Verified build and grep `0`. Committed `d1b928f`.
  - Checkpoint Phase 2 passed: build clean (7 pages), all Phase 2 greps as stated, lint 29 problems.
- **09/10/2026 — Phase 3 complete.**
  - Task 3.1: Cleaned `HomePage.jsx` hero heading, value prop text, actions (button + text link), removed metrics strip, updated terminal demo label. Verified build and grep `0`. Committed `6e1be04`.
  - Task 3.2: Replaced 3-column card grid with accurate 5-endpoint list (`ul`) using `ENDPOINTS` constant. Converted guides callout to a clean section without eyebrow label. Cleaned unused imports. Verified build and grep `0`. Committed `1ca02a2`.
  - Checkpoint Phase 3 passed: build clean (7 pages), all Phase 3 greps 0, lint 26 problems.
- **09/10/2026 — Phase 4 complete.**
  - Task 4.1: Replaced `PlaygroundPage.jsx` header with clean left-aligned heading without "Live API Console" pill. Kept `Zap` import. Verified build and grep `0`. Committed `5649990`.
  - Checkpoint Phase 4 passed: build clean (7 pages), all Phase 4 checks passed, lint 26 problems.
- **09/10/2026 — Phase 5 complete.**
  - Task 5.1: Scope guard verified `git diff --name-only main...HEAD`:
    - `frontend/src/components/GuideText.jsx`
    - `frontend/src/pages/DocsPage.jsx`
    - `frontend/src/pages/GuidesPage.jsx`
    - `frontend/src/pages/HomePage.jsx`
    - `frontend/src/pages/PlaygroundPage.jsx`
    - `frontend/src/pages/StatusPage.jsx`
    Root `npm test` verified: 56 passed, 0 failed.
  - Task 5.2: Verification greps on `frontend/src` and `frontend/dist`:
    - Cloudflare: 0
    - 99.9%: 0
    - Guaranteed: 0
    - node database: 0
    - Zero database: 0
    - sub-50ms: 0
    - serves data instantly: 0
    - ICS files: 0
    - Month-by-month: 0
    - 0 Key: 0
    - Instant Access: 0
    - Explore Interactive: 0
    - Endpoint Matrix: 0
    - Developer Guides: 0
    - Developer Knowledge Hub: 0
    - Live API Console: 0
    - Topics:: 0
    - Raw bold (`**National`, `**Sandwich`, `**Gazetted Holidays`) in `frontend/dist/guides`: 0
    - Lint problem count: 26 problems (baseline: 31).
  - Task 5.3: Mobile measurement findings (no source code modified, servers stopped, ports 3000 & 4173 closed):
    - / md fixed-bar-budget: fail — {"fixedHeightSumPx":1089,"viewportHeightPx":1024,"budgetPct":106.3}
    - / md tap-targets: warn — {"totalTargets":15,"failingFloor":0,"warnBelowTarget":10,"excludedCount":0}
    - / sm dvh-safe-area: fail — {"bareViewportUnitFiles":3,"innerHeight":844,"visualViewportHeight":844,"viewportFitCover":false}
    - / sm fixed-bar-budget: fail — {"fixedHeightSumPx":909,"viewportHeightPx":844,"budgetPct":107.7}
    - / sm media-cls: fail — {"cls":0,"missingIntrinsic":2,"missingLazyBelowFold":1,"totalImageBytes":0,"heavyImageCount":0}
    - / sm reduced-motion: fail — {"animatedElementsSampled":26,"stillAnimatingUnderReduce":2,"motionLibraryDetected":false,"matchMediaGuardFound":false}
    - / sm tap-targets: warn — {"totalTargets":9,"failingFloor":0,"warnBelowTarget":8,"excludedCount":0}
    - / sm text-legibility: fail — {"totalNodes":16,"failing":5,"warn":7}
    - / sm touch-affordance: fail — {"unguardedHoverRules":12,"dragSurfacesChecked":0}
    - / sm nav-drawer: fail — {"step1_opens":false,"step2_focusInPanel":false,"step3_scrollLocked":false,"step4_tabCycles":false,"step5_escapeCloses":false,"step6_closesOnNav":true}
    - / xs dvh-safe-area: fail — {"bareViewportUnitFiles":3,"innerHeight":568,"visualViewportHeight":568,"viewportFitCover":false}
    - / xs fixed-bar-budget: fail — {"fixedHeightSumPx":633,"viewportHeightPx":568,"budgetPct":111.4}
    - / xs media-cls: fail — {"cls":0,"missingIntrinsic":2,"missingLazyBelowFold":1,"totalImageBytes":0,"heavyImageCount":0}
    - / xs tap-targets: warn — {"totalTargets":6,"failingFloor":0,"warnBelowTarget":5,"excludedCount":0}
    - / xs text-legibility: fail — {"totalNodes":16,"failing":5,"warn":7}
    - / xs nav-drawer: fail — {"step1_opens":false,"step2_focusInPanel":false,"step3_scrollLocked":false,"step4_tabCycles":false,"step5_escapeCloses":false,"step6_closesOnNav":true}
    - /docs md fixed-bar-budget: fail — {"fixedHeightSumPx":1089,"viewportHeightPx":1024,"budgetPct":106.3}
    - /docs md tap-targets: warn — {"totalTargets":7,"failingFloor":0,"warnBelowTarget":2,"excludedCount":0}
    - /docs sm dvh-safe-area: fail — {"bareViewportUnitFiles":3,"innerHeight":844,"visualViewportHeight":844,"viewportFitCover":false}
    - /docs sm fixed-bar-budget: fail — {"fixedHeightSumPx":909,"viewportHeightPx":844,"budgetPct":107.7}
    - /docs sm media-cls: fail — {"cls":0,"missingIntrinsic":2,"missingLazyBelowFold":1,"totalImageBytes":0,"heavyImageCount":0}
    - /docs sm reduced-motion: fail — {"animatedElementsSampled":23,"stillAnimatingUnderReduce":2,"motionLibraryDetected":false,"matchMediaGuardFound":false}
    - /docs sm tap-targets: warn — {"totalTargets":2,"failingFloor":0,"warnBelowTarget":2,"excludedCount":0}
    - /docs sm text-legibility: fail — {"totalNodes":71,"failing":56,"warn":13}
    - /docs sm touch-affordance: fail — {"unguardedHoverRules":12,"dragSurfacesChecked":0}
    - /docs sm nav-drawer: fail — {"step1_opens":false,"step2_focusInPanel":false,"step3_scrollLocked":false,"step4_tabCycles":false,"step5_escapeCloses":false,"step6_closesOnNav":true}
    - /docs xs dvh-safe-area: fail — {"bareViewportUnitFiles":3,"innerHeight":568,"visualViewportHeight":568,"viewportFitCover":false}
    - /docs xs fixed-bar-budget: fail — {"fixedHeightSumPx":633,"viewportHeightPx":568,"budgetPct":111.4}
    - /docs xs media-cls: fail — {"cls":0,"missingIntrinsic":2,"missingLazyBelowFold":1,"totalImageBytes":0,"heavyImageCount":0}
    - /docs xs tap-targets: warn — {"totalTargets":2,"failingFloor":0,"warnBelowTarget":2,"excludedCount":0}
    - /docs xs text-legibility: fail — {"totalNodes":71,"failing":56,"warn":13}
    - /docs xs nav-drawer: fail — {"step1_opens":false,"step2_focusInPanel":false,"step3_scrollLocked":false,"step4_tabCycles":false,"step5_escapeCloses":false,"step6_closesOnNav":true}
    - /guides md fixed-bar-budget: fail — {"fixedHeightSumPx":1089,"viewportHeightPx":1024,"budgetPct":106.3}
    - /guides md tap-targets: warn — {"totalTargets":10,"failingFloor":0,"warnBelowTarget":3,"excludedCount":0}
    - /guides sm dvh-safe-area: fail — {"bareViewportUnitFiles":3,"innerHeight":844,"visualViewportHeight":844,"viewportFitCover":false}
    - /guides sm fixed-bar-budget: fail — {"fixedHeightSumPx":909,"viewportHeightPx":844,"budgetPct":107.7}
    - /guides sm layout-collision: fail — {"occluded":0,"clipped":3,"distorted":0}
    - /guides sm media-cls: fail — {"cls":0,"missingIntrinsic":2,"missingLazyBelowFold":1,"totalImageBytes":0,"heavyImageCount":0}
    - /guides sm reduced-motion: fail — {"animatedElementsSampled":23,"stillAnimatingUnderReduce":2,"motionLibraryDetected":false,"matchMediaGuardFound":false}
    - /guides sm tap-targets: warn — {"totalTargets":5,"failingFloor":0,"warnBelowTarget":2,"excludedCount":0}
    - /guides sm text-legibility: fail — {"totalNodes":29,"failing":8,"warn":16}
    - /guides sm touch-affordance: fail — {"unguardedHoverRules":12,"dragSurfacesChecked":0}
    - /guides sm nav-drawer: fail — {"step1_opens":false,"step2_focusInPanel":false,"step3_scrollLocked":false,"step4_tabCycles":false,"step5_escapeCloses":false,"step6_closesOnNav":true}
    - /guides xs dvh-safe-area: fail — {"bareViewportUnitFiles":3,"innerHeight":568,"visualViewportHeight":568,"viewportFitCover":false}
    - /guides xs fixed-bar-budget: fail — {"fixedHeightSumPx":633,"viewportHeightPx":568,"budgetPct":111.4}
    - /guides xs layout-collision: fail — {"occluded":0,"clipped":3,"distorted":0}
    - /guides xs media-cls: fail — {"cls":0,"missingIntrinsic":2,"missingLazyBelowFold":1,"totalImageBytes":0,"heavyImageCount":0}
    - /guides xs tap-targets: warn — {"totalTargets":4,"failingFloor":0,"warnBelowTarget":2,"excludedCount":0}
    - /guides xs text-legibility: fail — {"totalNodes":29,"failing":8,"warn":16}
    - /guides xs nav-drawer: fail — {"step1_opens":false,"step2_focusInPanel":false,"step3_scrollLocked":false,"step4_tabCycles":false,"step5_escapeCloses":false,"step6_closesOnNav":true}
    - /playground md fixed-bar-budget: fail — {"fixedHeightSumPx":1089,"viewportHeightPx":1024,"budgetPct":106.3}
    - /playground md tap-targets: warn — {"totalTargets":18,"failingFloor":0,"warnBelowTarget":13,"excludedCount":0}
    - /playground sm dvh-safe-area: fail — {"bareViewportUnitFiles":3,"innerHeight":844,"visualViewportHeight":844,"viewportFitCover":false}
    - /playground sm fixed-bar-budget: fail — {"fixedHeightSumPx":909,"viewportHeightPx":844,"budgetPct":107.7}
    - /playground sm form-input-zoom: fail — {"totalFields":3,"failing":3}
    - /playground sm media-cls: fail — {"cls":0,"missingIntrinsic":2,"missingLazyBelowFold":1,"totalImageBytes":0,"heavyImageCount":0}
    - /playground sm reduced-motion: fail — {"animatedElementsSampled":35,"stillAnimatingUnderReduce":2,"motionLibraryDetected":false,"matchMediaGuardFound":false}
    - /playground sm tap-targets: warn — {"totalTargets":8,"failingFloor":0,"warnBelowTarget":7,"excludedCount":0}
    - /playground sm text-legibility: fail — {"totalNodes":9,"failing":3,"warn":4}
    - /playground sm touch-affordance: fail — {"unguardedHoverRules":12,"dragSurfacesChecked":0}
    - /playground sm nav-drawer: fail — {"step1_opens":false,"step2_focusInPanel":false,"step3_scrollLocked":false,"step4_tabCycles":false,"step5_escapeCloses":false,"step6_closesOnNav":true}
    - /playground xs dvh-safe-area: fail — {"bareViewportUnitFiles":3,"innerHeight":568,"visualViewportHeight":568,"viewportFitCover":false}
    - /playground xs fixed-bar-budget: fail — {"fixedHeightSumPx":633,"viewportHeightPx":568,"budgetPct":111.4}
    - /playground xs form-input-zoom: fail — {"totalFields":3,"failing":3}
    - /playground xs media-cls: fail — {"cls":0,"missingIntrinsic":2,"missingLazyBelowFold":1,"totalImageBytes":0,"heavyImageCount":0}
    - /playground xs tap-targets: warn — {"totalTargets":5,"failingFloor":0,"warnBelowTarget":5,"excludedCount":0}
    - /playground xs text-legibility: fail — {"totalNodes":9,"failing":3,"warn":4}
    - /playground xs nav-drawer: fail — {"step1_opens":false,"step2_focusInPanel":false,"step3_scrollLocked":false,"step4_tabCycles":false,"step5_escapeCloses":false,"step6_closesOnNav":true}
    - /status md fixed-bar-budget: fail — {"fixedHeightSumPx":1089,"viewportHeightPx":1024,"budgetPct":106.3}
    - /status md tap-targets: warn — {"totalTargets":7,"failingFloor":0,"warnBelowTarget":3,"excludedCount":0}
    - /status sm dvh-safe-area: fail — {"bareViewportUnitFiles":3,"innerHeight":844,"visualViewportHeight":844,"viewportFitCover":false}
    - /status sm fixed-bar-budget: fail — {"fixedHeightSumPx":909,"viewportHeightPx":844,"budgetPct":107.7}
    - /status sm media-cls: fail — {"cls":0,"missingIntrinsic":2,"missingLazyBelowFold":1,"totalImageBytes":0,"heavyImageCount":0}
    - /status sm reduced-motion: fail — {"animatedElementsSampled":20,"stillAnimatingUnderReduce":2,"motionLibraryDetected":false,"matchMediaGuardFound":false}
    - /status sm tap-targets: warn — {"totalTargets":2,"failingFloor":0,"warnBelowTarget":2,"excludedCount":0}
    - /status sm text-legibility: fail — {"totalNodes":11,"failing":7,"warn":2}
    - /status sm touch-affordance: fail — {"unguardedHoverRules":12,"dragSurfacesChecked":0}
    - /status sm nav-drawer: fail — {"step1_opens":false,"step2_focusInPanel":false,"step3_scrollLocked":false,"step4_tabCycles":false,"step5_escapeCloses":false,"step6_closesOnNav":true}
    - /status xs dvh-safe-area: fail — {"bareViewportUnitFiles":3,"innerHeight":568,"visualViewportHeight":568,"viewportFitCover":false}
    - /status xs fixed-bar-budget: fail — {"fixedHeightSumPx":633,"viewportHeightPx":568,"budgetPct":111.4}
    - /status xs media-cls: fail — {"cls":0,"missingIntrinsic":2,"missingLazyBelowFold":1,"totalImageBytes":0,"heavyImageCount":0}
    - /status xs tap-targets: warn — {"totalTargets":2,"failingFloor":0,"warnBelowTarget":2,"excludedCount":0}
    - /status xs text-legibility: fail — {"totalNodes":11,"failing":7,"warn":2}
    - /status xs nav-drawer: fail — {"step1_opens":false,"step2_focusInPanel":false,"step3_scrollLocked":false,"step4_tabCycles":false,"step5_escapeCloses":false,"step6_closesOnNav":true}
  - Checkpoint Phase 5 passed: All 5 phases executed, 7 commits on `frontend-deslop`, all truth greps 0, backend tests 56/56 passing, mobile report logged.
- **09/10/2026 — Owner-authorized follow-on and closure.** The owner requested the remaining calendar/status/playground fixes, a tighter spacing pass across all pages, mobile fixes, and a local merge to `main` without waiting for review. These changes and their measured results are recorded in `DOCS/WORK/2026-10-09/WORK.md` and `MOBILE.md`. Plan issue 1's route probe was completed in PowerShell; its pending owner review was superseded by the owner's merge instruction. Phases 1–5 are complete, and this plan is archived under that WORK folder.
