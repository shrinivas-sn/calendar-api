# Frontend Context & Reference Guide — India Calendar API

This document serves as a clean, high-density, one-stop context for developers or AI models to understand how the frontend application is structured, how it connects to the backend, and what user-facing features are available.

---

## 1. App Structure Block Diagram

The application is structured as a Single Page Application (SPA). The main layout wrapper (`App.jsx`) contains the persistent Navbar and Footer, and uses React Router to dynamically mount page views based on the route path.

```
┌────────────────────────────────────────────────────────────────────────┐
│                               Navbar.jsx                               │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                              App Routes                                │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ ┌─────────┐  │
│  │    HomePage    │ │ PlaygroundPage │ │    DocsPage    │ │StatusPge│  │
│  │      (/)       │ │  (/playground) │ │    (/docs)     │ │(/status)│  │
│  └───────┬────────┘ └───────┬────────┘ └───────┬────────┘ └────┬────┘  │
│          │                  │                  │               │       │
│    ┌─────▼─────┐      ┌─────▼─────┐      ┌─────▼─────┐   ┌─────▼─────┐ │
│    │RegionSel. │      │RegionSel. │      │JsonViewer │   │StatusBadge│ │
│    │JsonViewer │      │CalGrid    │      └───────────┘   └───────────┘ │
│    └───────────┘      │JsonViewer │                                    │
│                       │CodeSnippet│                                    │
│                       │StatusBadge│                                    │
│                       └───────────┘                                    │
├────────────────────────────────────────────────────────────────────────┤
│                               Footer.jsx                               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Page Directory & User Features

### HomePage (`/`)
- **Hero & Value Props**: Simple introduction detailing the open-source, keyless, and state-level capabilities of the API.
- **Quick Start**: Displays a standard copyable `curl` endpoint request.
- **Interactive Live Demo**: An inline widget where users select one of the 37 states/UTs to test an API response payload instantly (renders the first 3 holidays using `RegionSelector` and `JsonViewer`).
- **Automatic Warm-up Warning**: If the demo API call takes longer than 3 seconds (due to Render's free tier sleep cycle), it displays a pulsing warning: `"Waking up Render backend (can take 30s)..."` to manage user expectations.

### PlaygroundPage (`/playground`)
- **API Request Builder**: Dropdowns and inputs to select endpoints (`/holidays`, `/is-holiday`, `/next-holiday`, `/range`, `/calendar`) and parameters (region, year, date).
- **Console Header Status Badge**: Integrates the `StatusBadge` directly in the Playground header to immediately ping the backend on mount and display its sleep/health state.
- **Dual Visualizer**: Toggle tabs allowing users to view the API response as either:
  - Raw syntax-highlighted JSON (`JsonViewer`).
  - An interactive visual calendar grid (`CalendarGrid`) with color-coded holidays and hover tooltips.
- **Live Code Generator**: Generates integration snippets (`CodeSnippet`) in cURL, JavaScript, Python, and Go that update in real-time as the request parameters change.
- **Warm-up Fetch Alert**: Similarly to the HomePage demo, if a manual request takes longer than 3 seconds, the loading indicator text dynamically shifts to `"Waking up backend server (this first load takes 30-40s)..."` to signal that the container is warming up from sleep.

### DocsPage (`/docs`)
- **Endpoint Reference**: Complete specifications for each available route, parameter, and error condition.
- **Navigation Sidebar**: A sticky, sidebar menu for quick scrolling to specific sections.

### StatusPage (`/status`)
- **Health Dashboard**: Measures real-time API latency using the `StatusBadge` component.
- **Service Specs**: Explains server caching, rate limit rules, and deployment architecture.

---

## 3. Shared Component Specifications

- **`Navbar.jsx`**: Top header holding the logo, page navigation, and an external link to the [GitHub Repository](https://github.com/shrinivas-sn/calendar-api) styled with a Lucide `ArrowUpRight` icon. Clicking the logo routes to home and scrolls to the top of the page.
- **`Footer.jsx`**: Bottom link list and copyright notes. Clicking the logo routes to home and scrolls to the top.
- **`RegionSelector.jsx`**: Autocomplete search dropdown listing all 37 Indian states and Union Territories sourced from `src/data/regions.js`.
- **`CalendarGrid.jsx`**: An interactive month-view calendar with left/right month controls. Highlights weekends with a red border, gazetted holidays in saffron, restricted holidays in amber, and observances in indigo. Tooltips show holiday names on hover.
- **`JsonViewer.jsx`**: A pretty-printer that parses JSON data and highlights strings, numbers, booleans, and keys using CSS classes.
- **`CodeSnippet.jsx`**: Renders structured and syntax-highlighted HTTP client request patterns for 4 languages.
- **`StatusBadge.jsx`**: Dynamic component that sends a real-time health-check ping to the backend API. Features an automated 2-second timeout checker: if the server is asleep and doesn't respond within 2 seconds, it automatically transitions to a warning state saying `Backend Sleeping (Waking up...)`. Once active, it displays either `"API Live (Xms)"` or `"API Offline"`.

---

## 4. How the Frontend Connects to the Backend

The frontend remains completely decoupled from the data pipeline and backend server logic, communicating solely via client-side fetch requests.

- **Base URL Resolution**: The frontend queries the API server by reading the target host from environment variables:
  - **Local Development**: Resolves to `http://localhost:3000` (defined as fallback).
  - **Production Hosting**: Configured on Vercel to `https://calendar-api-d7a8.onrender.com` using the `VITE_API_URL` build environment variable.
- **Cross-Origin Configuration**: Because the backend Express server has CORS middleware enabled, the frontend can query the API directly without proxy restrictions.
- **Data Boundaries**: The list of state names and codes is static and bundled in the frontend build (`src/data/regions.js`) to support instantaneous dropdown population. All actual calendar computation, range filtering, and holiday lookup queries are resolved by hitting the backend API.
- **Routing Configuration (`vercel.json`)**: To prevent "404 Page Not Found" errors when refreshing subpages (a common issue in Single Page Applications using client-side routing), a `vercel.json` file is added at the root of the `/frontend` folder to rewrite all route requests back to `/index.html` so that React Router can handle them.
