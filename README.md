# 📅 Calendar API

> **A free, open-source Indian Holiday Calendar REST API.** No API keys, no signups, no rate limits to slow you down — just pure JSON.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![API Status](https://img.shields.io/website?url=https%3A%2F%2Fcalendar-api-production-a697.up.railway.app%2F)](https://calendar-api-production-a697.up.railway.app/)
[![Frontend Status](https://img.shields.io/website?url=https%3A%2F%2Fcalendar-api-web.vercel.app%2F)](https://calendar-api-web.vercel.app/)

---

## 🚀 Live Demo & Playground

* **Interactive Playground & Docs:** [https://calendar-api-web.vercel.app/](https://calendar-api-web.vercel.app/)
* **Base API URL:** `https://calendar-api-production-a697.up.railway.app`

---

## ✨ Features

- **100% Free & Keyless:** Directly make queries without any registration, credits, or authentication.
- **Central & State-Level Holidays:** Access central Indian holidays or merge them with region-specific (e.g. Karnataka `KA`, Maharashtra `MH`) calendars seamlessly.
- **Leap-Year Safe Calendar Utility:** Generate full 365/366 day layouts programmatically, complete with working-day and weekend classifications.
- **Deduplicated & Chronological Output:** Automatic elimination of duplicate holiday listings across regional data mergers.
- **Responsive Web Portal:** Dark-mode design system with an interactive playground to test requests.

---

## 📁 Repository Structure

```
calendar-api/
├── backend/
│   ├── data/                 # Structurized JSON databases per year (e.g. 2026/IN/...)
│   ├── scripts/              # Data parsing pipeline and validator scripts
│   ├── src/
│   │   └── index.js          # Node.js + Express REST API Code
│   └── package.json          # Server dependencies & scripts
│
├── frontend/                 # React (Vite) client code
│   ├── src/                  # App components & documentation portal
│   └── package.json          # UI dependencies & scripts
│
└── README.md                 # Project documentation
```

---

## 🛠️ Local Development Quick Start

Clone this repository and verify or run directories independently.

### 1. Run the Backend API Server
```bash
cd backend
npm install
npm run dev
```
The server will boot on `http://localhost:3000`. You can verify endpoints locally (e.g., `http://localhost:3000/v1/holidays?country=IN&year=2026`).

### 2. Run the Frontend UI Client
```bash
cd frontend
npm install
npm run dev
```
The Vite React client will run on `http://localhost:5173/`. By default, the local frontend targets your local backend (`localhost:3000`).

---

## 📖 API Documentation Reference

All requests expect query parameters. Format dates in `YYYY-MM-DD`. Region codes must be uppercase 2-letter Indian state/UT codes (e.g., `KA`, `MH`, `DL`) or `central`.

### 1. Fetch Holidays List
```http
GET /v1/holidays?country=IN&year=2026[&region=KA]
```
Returns a chronological list of holidays. If `region` is omitted, it defaults to central holidays.

### 2. Check Holiday Status
```http
GET /v1/date/is-holiday?country=IN&date=2026-01-26[&region=KA]
```
Checks if a specific date is a holiday. Returns a boolean check alongside details.

### 3. Find Upcoming Holiday
```http
GET /v1/date/next-holiday?country=IN&date=2026-01-01[&region=KA]
```
Locates the very next upcoming holiday. Automatically checks the following year if the current year ends.

### 4. Fetch Date Range
```http
GET /v1/holidays/range?country=IN&start=2026-01-01&end=2026-06-30[&region=KA]
```
Filters holidays within a chronological range, supporting multi-year spans.

### 5. Generate Calendar
```http
GET /v1/calendar?country=IN&year=2026[&region=KA]
```
Generates 365/366 day slots for the year, detailing week dates, holiday statuses, and work days.

---

## ⚡ Deployment Guide

### Deploying the Backend on Railway
1. Create a project from your GitHub repo.
2. Under service settings, set the **Root Directory** to `/backend`.
3. In settings, click **"Generate Domain"** to get your public API link.

### Deploying the Frontend on Vercel
1. Link your repo in Vercel.
2. Set the **Root Directory** to `/frontend`.
3. Add the **Environment Variable** `VITE_API_URL` and set its value to your live Railway API URL.
4. Click **"Deploy"**.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
