# Frontend Redesign Plan: India Calendar API Portal
**Date:** May 29, 2026  
**Status:** Awaiting Approval

---

## 1. Problem With the Current Frontend

The current `App.jsx` (615 lines) is a **single monolithic component** that dumps everything onto one scrollable page — hero, playground, and documentation are all stacked vertically. A new visitor has no clear path to understand *what this API does*, *how to use it*, or *where to start*.

**Key issues:**
- No proper navigation — just anchor links (`#playground`, `#docs`) on a single page.
- All logic lives in one giant component with inline styles everywhere.
- No route-based pages — a developer landing here doesn't get a structured journey.
- Documentation is hidden behind tabs at the bottom of a long scroll.
- No code snippet generator (only raw JSON response viewer).

---

## 2. Design Philosophy (Inspired by mfapi.in, not a copy)

The mfapi.in approach works because it follows a **"show, don't tell"** principle:
- The landing page immediately demonstrates the API with a live widget.
- Navigation is clean and leads users to distinct sections (Docs, Playground, Status).
- Every page has a single clear purpose.

**Our approach — adapted for a calendar/holiday API:**

| mfapi.in Pattern | Our Adaptation |
| :--- | :--- |
| Search bar for 10K+ mutual fund schemes | Region selector + endpoint picker for 37 states/UTs |
| NAV chart preview in search results | Interactive calendar grid showing holidays visually |
| Tabbed code snippets | Multi-language code generator (cURL, JS, Python, Go) |
| Top nav with clear sections | Persistent top navbar with 4 distinct pages |
| Developer-first dark aesthetic | Our own saffron-accented dark theme (already established) |

---

## 3. Navigation & Page Architecture

### Top Navigation Bar (persistent across all pages)
```
┌─────────────────────────────────────────────────────────────────────┐
│  🗓 Calendar API        Home   Playground   Docs   Status   [GitHub]│
└─────────────────────────────────────────────────────────────────────┘
```

We will use **React Router (react-router-dom)** for client-side routing. This gives us clean URLs and proper page transitions.

### Page Structure (4 Pages)

| Route | Page | Purpose |
| :--- | :--- | :--- |
| `/` | **Home** | Landing page — explains what this API is, key features, quick-start snippet, and a mini live demo |
| `/playground` | **Playground** | Full interactive query builder + code generator + response viewer |
| `/docs` | **Documentation** | Structured API reference with all 5 endpoints, parameters, and example responses |
| `/status` | **Status** | Live API health check with response time measurement |

---

## 4. Page-by-Page Design Breakdown

### Page 1: Home (`/`)

**Goal:** A first-time visitor should understand the API in under 10 seconds.

**Sections (top to bottom):**

1. **Hero Banner**
   - Headline: "Free & Open Indian Calendar API"
   - Subtext: One-liner about zero-signup, state-level holiday data
   - Two CTA buttons: `Try the Playground →` and `Read the Docs`

2. **Quick Start Code Block**
   - A single, prominent `curl` command that a developer can copy and run immediately
   - Shows instant value — "paste this in your terminal right now"
   ```
   curl https://calendar-api-production-a697.up.railway.app/v1/holidays?country=IN&year=2026&region=KA
   ```

3. **Feature Cards Grid (3 columns)**
   - "Zero Signup" — No keys, no auth, completely free
   - "37 Regions" — Central + all states and union territories
   - "5 Endpoints" — Holidays list, date check, next holiday, date range, full calendar

4. **Mini Live Demo Widget**
   - A compact region dropdown + "Fetch" button that fires a real API call
   - Shows a small formatted JSON preview below it
   - Purpose: prove the API works right on the landing page — just like mfapi.in shows live data immediately

5. **Footer**
   - MIT License, GitHub link, navigation links

---

### Page 2: Playground (`/playground`)

**Goal:** Full-power interactive API testing tool.

**Layout: Two-column split**
```
┌─────────────────────────────┬──────────────────────────────────────┐
│  REQUEST BUILDER            │  RESPONSE VIEWER                     │
│                             │                                      │
│  Endpoint: [dropdown]       │  ┌──────────────────────────────────┐│
│  Region:   [search/select]  │  │ [JSON Tab] [Calendar Tab]       ││
│  Year:     [select]         │  │                                  ││
│  Date:     [input]          │  │  { formatted JSON response }    ││
│                             │  │                                  ││
│  [Generated URL bar]        │  │  or                             ││
│  [Send Request]             │  │                                  ││
│                             │  │  [visual calendar grid]         ││
│  ┌────────────────────────┐ │  │                                  ││
│  │ CODE SNIPPETS          │ │  └──────────────────────────────────┘│
│  │ [cURL][JS][Python][Go] │ │                                      │
│  │                        │ │                                      │
│  │ curl -X GET "..."      │ │                                      │
│  │ [Copy]                 │ │                                      │
│  └────────────────────────┘ │                                      │
└─────────────────────────────┴──────────────────────────────────────┘
```

**Left Panel — Request Builder:**
- Endpoint dropdown (all 5 endpoints)
- Region selector with fuzzy search/autocomplete
- Context-aware parameter inputs (year, date, start/end — shown/hidden based on endpoint)
- Live-updating URL preview bar with copy button
- "Send Request" action button
- **Code Snippet Generator** (NEW): Tabs for cURL / JavaScript / Python / Go — auto-updates as parameters change

**Right Panel — Response Viewer:**
- **Tab 1: Pretty JSON** — Syntax-highlighted, formatted response
- **Tab 2: Calendar View** (shown only for `/holidays` and `/calendar` endpoints) — Visual month grid where holiday dates are color-coded dots with tooltips

---

### Page 3: Documentation (`/docs`)

**Goal:** Clean, structured API reference — one section per endpoint.

**Layout: Sidebar + Content**
```
┌──────────────────┬──────────────────────────────────────────────────┐
│  SIDEBAR         │  CONTENT                                         │
│                  │                                                   │
│  Overview        │  ## GET /v1/holidays                              │
│  ─────────────── │                                                   │
│  GET /holidays   │  Returns a list of government holidays...        │
│  GET /is-holiday │                                                   │
│  GET /next-holiday│  ### Parameters                                  │
│  GET /range      │  | Param   | Required | Description |            │
│  GET /calendar   │  |---------|----------|-------------|            │
│  ─────────────── │  | country | Yes      | Must be IN  |            │
│  Response Schema │  | year    | Yes      | 4-digit     |            │
│  Error Handling  │  | region  | No       | State code  |            │
│                  │                                                   │
│                  │  ### Example Request                              │
│                  │  ```                                              │
│                  │  curl "https://...?country=IN&year=2026"          │
│                  │  ```                                              │
│                  │                                                   │
│                  │  ### Example Response                             │
│                  │  { ... formatted JSON ... }                       │
└──────────────────┴──────────────────────────────────────────────────┘
```

- Left sidebar scrolls with the user and highlights the active section
- Each endpoint gets its own section with: description, parameters table, example request, and example response
- Bottom sections cover the common response schema and error handling patterns

---

### Page 4: Status (`/status`)

**Goal:** Show developers the API is alive and fast.

**Content:**
- Live health check — pings the backend on page load and shows response time
- Status indicator: Green "Operational" badge or Red "Down" badge
- Response latency display (e.g., "Response Time: 34ms")
- API version info
- Uptime commitment badge ("99.9% Uptime Target")

---

## 5. New Dependencies

| Package | Purpose |
| :--- | :--- |
| `react-router-dom` | Client-side routing for multi-page navigation |
| `tailwindcss` + `postcss` + `autoprefixer` (v3) | Utility-first CSS framework for rapid, consistent styling |

**No other new dependencies.** We keep it lightweight. The existing `lucide-react` stays for icons.

---

## 6. Component Architecture

We will break the current monolithic `App.jsx` into clean, focused components:

```
frontend/src/
├── main.jsx                    # App entry point (unchanged)
├── App.jsx                     # Router setup + Layout wrapper
├── index.css                   # Tailwind directives + custom base styles
│
├── components/
│   ├── Navbar.jsx              # Persistent top navigation bar
│   ├── Footer.jsx              # Shared footer
│   ├── CodeSnippet.jsx         # Multi-language code generator with copy
│   ├── JsonViewer.jsx          # Syntax-highlighted JSON display
│   ├── CalendarGrid.jsx        # Visual month-grid holiday renderer
│   ├── RegionSelector.jsx      # Fuzzy search dropdown for states/UTs
│   └── StatusBadge.jsx         # Live/down indicator badge
│
├── pages/
│   ├── HomePage.jsx            # Landing page (hero + features + mini demo)
│   ├── PlaygroundPage.jsx      # Full interactive API tester
│   ├── DocsPage.jsx            # Structured API documentation
│   └── StatusPage.jsx          # API health & latency checker
│
└── data/
    └── regions.js              # Regions array (extracted from current App.jsx)
```

---

## 7. Styling Strategy (Tailwind CSS v3)

### Setup
- Install Tailwind CSS v3, PostCSS, and Autoprefixer.
- Configure `tailwind.config.js` to scan all `.jsx` files in `src/`.
- Replace the current `index.css` with Tailwind directives (`@tailwind base; @tailwind components; @tailwind utilities;`) plus a small `@layer base` block for our custom dark theme variables, font imports, and scrollbar styles.

### Theme Preservation
We will **keep the existing saffron/indigo color identity** — this is our brand. Tailwind will be configured with custom colors:
- `saffron`: `#ea580c` (primary accent)
- `deep`: `#050508` (background)
- `glass`: semi-transparent white borders/backgrounds

### What Gets Removed
- All inline `style={{...}}` attributes in JSX (replaced with Tailwind classes)
- The `App.css` file (no longer needed)
- Most of the current `index.css` custom classes (replaced by Tailwind utilities)

### What Gets Kept
- Google Fonts imports (Inter/Outfit, JetBrains Mono)
- The glow-backdrop animation keyframes
- Syntax highlighting color classes for JSON viewer

---

## 8. Implementation Phases

### Phase 1: Project Setup & Foundations
- Install `react-router-dom`, `tailwindcss`, `postcss`, `autoprefixer`
- Configure Tailwind with custom theme colors/fonts
- Rewrite `index.css` with Tailwind directives + preserved custom styles
- Create `App.jsx` with Router layout (Navbar + page outlet + Footer)
- Extract `regions.js` data file

### Phase 2: Shared Components
- Build `Navbar.jsx` — responsive top nav with active route highlighting
- Build `Footer.jsx` — simple shared footer
- Build `RegionSelector.jsx` — search/filter dropdown
- Build `CodeSnippet.jsx` — tabbed code generator with clipboard copy
- Build `JsonViewer.jsx` — refactor existing `syntaxHighlight` logic
- Build `StatusBadge.jsx` — green/red live indicator

### Phase 3: Home Page
- Hero section with CTAs
- Quick-start curl block
- Feature cards grid
- Mini live demo widget

### Phase 4: Playground Page
- Two-column layout (request builder + response viewer)
- Wire up all endpoint/parameter controls
- Integrate CodeSnippet and JsonViewer components
- Build CalendarGrid component for visual holiday rendering

### Phase 5: Documentation Page
- Sidebar navigation with scroll-spy highlighting
- Endpoint sections with parameter tables and example responses
- Response schema and error handling reference

### Phase 6: Status Page & Polish
- Live health ping on page load
- Response time measurement and display
- Final responsive design pass for mobile/tablet
- Micro-animation polish (hover states, transitions, page transitions)

---

## 9. What Does NOT Change

> **IMPORTANT:** This redesign is frontend-only. We will NOT touch:
> - `backend/` — No changes to API server, routes, or data files
> - `backend/scripts/` — No changes to data pipeline
> - `backend/data/` — No changes to holiday JSON files
> - API response format — The frontend consumes the same endpoints
> - Production URLs — Backend stays on Railway, frontend stays on Vercel

---

## 10. Verification Plan

1. **Dev server**: Run `npm run dev` in `/frontend` and verify all 4 pages render correctly.
2. **Navigation**: Click through Home → Playground → Docs → Status and verify routing works.
3. **Playground test**: Select a region + endpoint, send a real request to the backend, verify JSON response renders.
4. **Code snippets**: Verify generated cURL/JS/Python/Go snippets match the selected parameters.
5. **Copy button**: Verify clipboard copy works for URL and code snippets.
6. **Responsive**: Check layout at desktop (1440px), tablet (768px), and mobile (375px) widths.
7. **Build**: Run `npm run build` to verify production build succeeds with no errors.

---

## Awaiting Your Approval

Please review this plan. Once you approve, I will begin implementation starting from Phase 1.
