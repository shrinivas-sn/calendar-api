# Project Architecture & Context: India Calendar API

This document provides a comprehensive technical overview of the complete **India Calendar API** codebase. It outlines the design, monorepo structure, data ingestion pipeline, API backend, frontend UI portal, and deployment layout.

---

## 1. Project Overview & Business Value

### The Market Gap
Developers building applications for the Indian market face challenges integrating local holiday data. Existing APIs (like Calendarific or Holiday API) require paid plans, signups, or do not offer state-level resolution. Open-source libraries like `Nager.Date` do not support India (`IN`) due to its complex holiday structure.

### The Solution
This project is a **truly free, open-source, keyless REST API** serving Indian holiday calendars (Central Government + 36 States & UTs). It is built as a lightweight, database-free application serving static JSON files generated from official sources.

* **Live API Production URL**: `https://calendar-api-d7a8.onrender.com`
* **Live Frontend UI URL**: `https://calendar-api-web.vercel.app`
* **Zero Friction**: No API keys, no registrations, no limits.
* **India-First**: Covers Central government, all 28 States, and all 8 Union Territories (37 regions total).
* **Accurate Data**: Fetched directly from official government sources (`india.gov.in`).
* **Static File Architecture**: High performance and zero database overhead by serving pre-compiled static JSON files.

---

## 2. Monorepo Architecture

The codebase is organized as a monorepo with separate backend and frontend projects:

```
calendar-api/
├── backend/                  # REST API server & Data pipeline
│   ├── data/                 # Ingested JSON holiday databases
│   ├── ics/                  # Backup iCal calendar files
│   ├── scripts/              # Data collection pipelines
│   │   ├── parse-ics.js      # Scraper/Parser script
│   │   └── verify-data.js    # Data validator
│   ├── src/
│   │   └── index.js          # Node.js + Express server code
│   └── package.json
│
├── frontend/                 # React SPA — Documentation Portal & API Playground
│   ├── public/
│   │   └── images/           # Favicon SVG and static brand assets
│   ├── src/
│   │   ├── assets/           # Hero image, React/Vite SVGs
│   │   ├── components/
│   │   │   ├── CalendarGrid.jsx    # Interactive monthly calendar with holiday indicators
│   │   │   ├── CodeSnippet.jsx     # Multi-language code generator (cURL/JS/Python/Go)
│   │   │   ├── Footer.jsx          # Shared footer with brand & nav links
│   │   │   ├── JsonViewer.jsx      # Syntax-highlighted JSON response viewer
│   │   │   ├── Navbar.jsx          # Sticky top nav with mobile hamburger menu
│   │   │   ├── RegionSelector.jsx  # Searchable dropdown for 37 regions
│   │   │   └── StatusBadge.jsx     # Live API health indicator with latency
│   │   ├── data/
│   │   │   └── regions.js          # Static region list (Central + 37 States/UTs)
│   │   ├── pages/
│   │   │   ├── HomePage.jsx        # Landing page with hero, features & live demo
│   │   │   ├── PlaygroundPage.jsx  # Full interactive API console & request builder
│   │   │   ├── DocsPage.jsx        # Complete API reference documentation
│   │   │   └── StatusPage.jsx      # Service health & performance dashboard
│   │   ├── App.jsx           # Router shell — wraps Navbar, Routes, Footer
│   │   ├── main.jsx          # React DOM entry point
│   │   └── index.css         # Tailwind base + custom design system styles
│   ├── tailwind.config.js    # Custom saffron palette, Inter/JetBrains Mono fonts
│   ├── vercel.json           # SPA rewrite rules for client-side routing
│   └── package.json
│
└── README.md                 # Main entry documentation
```

---

## 3. Data Pipeline & Storage (`/backend`)

The holiday data is stored statically as JSON, avoiding database lookup times and infrastructure costs.

### Ingestion Flow (`backend/scripts/parse-ics.js`)
1. **CMS API Extraction**: Queries the official government portal (`india.gov.in/calendar`) via an internal CMS route `/internal/cms`.
2. **ICS Generation**: Sends the raw JSON list of holidays to the portal's `/api/calendar-ics` endpoint to download the standard iCal file.
3. **Backup Storage**: Saves `.ics` files under `backend/ics/` (e.g. `IN_KA_2026.ics`).
4. **Parsing**:
   - Parses the iCal events (vevent) line-by-line.
   - Cleans the summary (replaces `\,` with `,`).
   - Converts dates to `YYYY-MM-DD`.
   - Programmatically filters out duplicate events.
   - Standardizes type mapping (`Gazetted Holiday` -> `gazetted_holiday`, `Restricted Holiday` -> `restricted_holiday`, others -> `observance`).
5. **Output**: Writes sorted, structured JSON files to `backend/data/<year>/IN/<region>/holidays.json` (where `<region>` is the 2-letter uppercase code or `central`).
6. **Index Creation**: Compiles a master list of all processed regions at `backend/data/<year>/IN/INDEX.json`.

---

## 4. REST API Implementation (`backend/src/index.js`)

The backend is built with **Node.js + Express** and runs on port `3000` by default.

### Features
* **CORS & Rate Limiting**: Enabled via standard CORS middleware and `express-rate-limit` (limiting each IP to 100 requests per 15 minutes).
* **Zero Database Overhead**: Standard Node `fs` reads pre-generated JSON files.
* **On-the-Fly Merging**:
  - When a user requests a state calendar (e.g., `region=KA`), the API automatically reads both the `central` calendar and the state (`KA`) calendar.
  - It merges them at runtime, filters out duplicate entries (e.g., Republic Day which appears on both lists), and returns a single sorted chronological list.

### Core Endpoints
1. **Fetch Holidays List**
   `GET https://calendar-api-d7a8.onrender.com/v1/holidays?country=IN&year=2026[&region=KA]`
   Returns the holiday list for the year. Region defaults to `central` if omitted.
2. **Check Holiday Status**
   `GET https://calendar-api-d7a8.onrender.com/v1/date/is-holiday?country=IN&date=2026-01-26[&region=KA]`
   Checks if a specific date is a holiday and returns matches.
3. **Get Next Holiday**
   `GET https://calendar-api-d7a8.onrender.com/v1/date/next-holiday?country=IN&date=2026-01-01[&region=KA]`
   Identifies the next holiday. Automatically rolls over into the next year if needed.
4. **Date Range Query**
   `GET https://calendar-api-d7a8.onrender.com/v1/holidays/range?country=IN&start=2026-01-01&end=2026-06-30[&region=KA]`
   Filters holidays within a custom range, supporting multi-year queries.
5. **Calendar Utility**
   `GET https://calendar-api-d7a8.onrender.com/v1/calendar?country=IN&year=2026[&region=KA]`
   Generates a full 365/366 day layout tagged with weekends, holidays, and working-day classifications.

---

## 5. Frontend Client Portal (`/frontend`)

The frontend is a **multi-page Single Page Application (SPA)** built with **React 19 + Vite 8 + TailwindCSS 3** and deployed on Vercel. It serves as a polished developer documentation portal, interactive API playground, and service status dashboard.

* **Live Link**: `https://calendar-api-web.vercel.app`
* **Environment Configuration**: Set `VITE_API_URL` to target the active server (defaults to local port 3000 in development, mapped to `https://calendar-api-d7a8.onrender.com` in production).

### Tech Stack & Key Dependencies
| Library | Purpose |
|---------|---------|
| `react` (v19) + `react-dom` | Core UI rendering framework |
| `react-router-dom` (v7) | Client-side SPA routing across 4 pages |
| `lucide-react` | Icon library used throughout the UI (Menu, Terminal, Globe, etc.) |
| `tailwindcss` (v3) | Utility-first CSS framework with custom theme configuration |
| `vite` (v8) | Lightning-fast dev server and production bundler |

### Design System
The UI follows a **dark-mode-first, premium design** language:
* **Custom Color Palette**: A custom `saffron` color scale (Indian flag orange theme) defined in `tailwind.config.js`, extending Tailwind's default palette. The slate palette is also customized for higher text contrast.
* **Typography**: Google Fonts — **Inter** (display/body text, weights 300–900) and **JetBrains Mono** (code blocks, API paths, JSON viewers).
* **CSS Custom Properties**: Brand gradients (`--saffron-gradient`, `--indigo-gradient`, `--emerald-gradient`) for gradient text effects.
* **Reusable Card Utilities**: `.interactive-card` (with hover lift/shadow effects) and `.docs-card` (static documentation panels).
* **Animated Background**: Two floating, blurred radial-gradient glow circles (`saffron` and `indigo`) with a slow CSS `floatCircle` animation on the page backdrop.
* **Micro-animations**: Fade-in transitions (`.animate-fadeIn`), button scale effects on hover/active, pulse animations on status indicators.
* **Custom Scrollbar**: Styled scrollbar track and thumb matching the dark slate theme.
* **JSON Syntax Highlighting**: Custom CSS classes (`.property`, `.string`, `.number`, `.boolean`) for color-coded JSON rendering.

### Client-Side Routing (React Router)
`App.jsx` is a **router shell** — it wraps a shared `<Navbar />`, `<Routes>` (4 routes), and `<Footer />` with decorative background glow elements. The four routes are:

| Route | Page Component | Description |
|-------|---------------|-------------|
| `/` | `HomePage` | Marketing landing page with hero, feature highlights, quick-start command, and an embedded live API demo |
| `/playground` | `PlaygroundPage` | Full interactive API console for building, executing, and visualizing API requests |
| `/docs` | `DocsPage` | Comprehensive API reference documentation with sidebar navigation |
| `/status` | `StatusPage` | Real-time service health dashboard with latency, CDN caching, and uptime monitoring |

### Page Details

#### 5.1 HomePage (`/`)
The landing page designed to onboard developers instantly:
* **Hero Section**: Animated "Developer-First & 100% Free" badge, main headline "Open-Source Indian Calendar API", and two CTA buttons ("Explore Playground" and "Read API Docs").
* **Quick Start Widget**: A copyable `curl` command box with a one-click copy button.
* **Feature Highlights Grid**: Three cards — "No Authentication" (zero friction), "State-Level Accuracy" (central+state merging), and "Edge-Optimized" (static JSON, Cloudflare CDN).
* **Live Demo Section**: A `RegionSelector` dropdown to pick any state, a "Test Request" button that makes a real API call, and a `JsonViewer` rendering the top 3 holiday results from the response.

#### 5.2 PlaygroundPage (`/playground`)
A terminal-style interactive API console with a split-panel layout:
* **Console Header Bar**: Traffic-light dots (macOS-style), "API Console" label, dynamic HTTP status badge (color-coded 2xx green vs error red), response latency badge (e.g., `142ms`), and a `GET` method indicator.
* **URL Bar**: Live-updating full API URL display with a copy button.
* **Left Panel — Request Builder**:
  - API Server URL input (editable base URL).
  - Endpoint selector dropdown for all 5 API routes (`/v1/holidays`, `/v1/date/is-holiday`, `/v1/date/next-holiday`, `/v1/holidays/range`, `/v1/calendar`).
  - `RegionSelector` component (searchable dropdown with 37 regions).
  - Conditional parameter fields: year selector (for holidays/calendar), date picker (for is-holiday/next-holiday), and start/end date pickers (for range).
  - "Send Request" button with loading spinner state.
  - `CodeSnippet` component: Multi-tab code generator showing the current request in **cURL, JavaScript (fetch), Python (requests), and Go (net/http)**, with copy-to-clipboard.
* **Right Panel — Response Viewer**:
  - Tab bar toggling between **"Pretty JSON"** (syntax-highlighted via `JsonViewer`) and **"Calendar"** (visual month grid via `CalendarGrid`).
  - Response metadata display (total results count, region, year).
  - Loading overlay, error state with troubleshooting hints, and empty state with call-to-action.

#### 5.3 DocsPage (`/docs`)
A full API reference documentation page (~533 lines of JSX):
* **Sticky Sidebar Navigation**: 4 sections — Overview & Setup, API Endpoints, Response Schema, Errors & Limits — with active-section highlighting and smooth scroll-to-section.
* **Overview Section**: Explains the API's zero-setup philosophy and use cases.
* **Base URL Section**: Displays the production endpoint prominently.
* **Endpoint Documentation**: All 5 endpoints are fully documented with:
  - GET method badge and route path.
  - Description of behavior.
  - Parameter table (Parameter, Required, Type, Description columns).
  - Example JSON response rendered via `JsonViewer`.
* **Response Schema**: Documents the standard response envelope fields (`country`, `year`, `region`, `data`, `meta`).
* **Errors & Rate Limits**: Defines the error response format (`error`, `message`, `status` fields), includes a comprehensive **validation check catalog table** covering 11 error scenarios (400 Bad Request, 404 Not Found, 429 Rate Limited) with exact error messages and trigger conditions.

#### 5.4 StatusPage (`/status`)
A real-time service health monitoring dashboard:
* **System Status Header**: Animated pulse icon with a `StatusBadge` component that pings the backend on load and shows "API Live (Xms)" or "API Offline".
* **Metrics Grid** (3 cards): Latency (live roundtrip measurement from browser), CDN Caching (Cloudflare status), Uptime Target (99.9%).
* **Operational Details Table**: API Version (v1.0.0), Hosting Provider (Render/Node.js), Deployment Target URL, Rate Limiting Threshold (100 req/15min/IP), Data Storage Protocol (static JSON flat-files).

### Reusable Components (7 total)
| Component | Purpose |
|-----------|---------|
| `Navbar` | Sticky top header with `NavLink`-based navigation (Home, Playground, Docs, Status), GitHub icon link, and responsive mobile hamburger menu using `lucide-react` icons |
| `Footer` | Shared footer with brand logo, MIT License notice, and quick navigation links |
| `CalendarGrid` | Interactive monthly calendar view with previous/next month navigation, color-coded day cells (gazetted=red, restricted=amber, observance=blue), hover tooltips showing holiday name/type, and a color legend |
| `CodeSnippet` | Multi-language code snippet generator with tabbed interface (cURL, JavaScript, Python, Go) and a copy-to-clipboard button |
| `JsonViewer` | Syntax-highlighted JSON renderer using regex-based tokenization with custom CSS color classes for properties, strings, numbers, and booleans |
| `RegionSelector` | Searchable dropdown selector for all 37 regions (Central + States/UTs), with search filtering, click-outside-to-close, and visual check mark for selected item |
| `StatusBadge` | Lightweight API health indicator that pings the backend URL on mount and renders a pill badge showing "Checking...", "API Live (latency)", or "API Offline" |

### Static Data Layer
`src/data/regions.js` contains a hardcoded array of **38 region entries** (1 Central Government + 37 State/UT codes) used by the `RegionSelector` component across multiple pages. This keeps region metadata on the client without requiring an API call.

---

## 6. Deployment & Operations

### Backend (Express API)
* Deployed on **Render** (`https://calendar-api-d7a8.onrender.com`) targeting the `/backend` root directory.
* A CDN (e.g., Cloudflare) is configured with caching headers since the calendar JSON database is static and changes very rarely.

### Frontend (Vite Client)
* Deployed on **Vercel** (`https://calendar-api-web.vercel.app`) targeting the `/frontend` root directory.
* Requires the environment variable `VITE_API_URL` configured to the live backend Render URL.
* A `vercel.json` rewrite rule redirects all non-asset paths to `index.html` to support React Router's client-side routing on Vercel.
