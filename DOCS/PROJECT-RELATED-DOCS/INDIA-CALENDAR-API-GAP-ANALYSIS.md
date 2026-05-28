# 🇮🇳 India Calendar API — Gap Analysis & Project Overview

> **Document Purpose:** Reference doc for understanding the problem, the market gap, and how this project solves it.
> **Last Updated:** May 2026

---

## 📌 The Problem

Developers building Indian apps (HR tools, fintech, scheduling, e-commerce) need reliable calendar data:
- Public holidays (central + state-level)
- Indian festivals and observances
- Working day checks
- "Is today a holiday?" queries

**But every existing solution has a barrier.**

---

## 🔍 Market Research — What Exists Today

| API | Free? | No Login / API Key? | India State-Level? | Open Source? |
|---|---|---|---|---|
| **Calendarific** | Limited | ❌ Login required | ❌ | ❌ |
| **Holiday API** | Limited | ❌ API key required | ❌ | ❌ |
| **API Ninjas** | Limited | ❌ API key required | ❌ | ❌ |
| **AbstractAPI** | Limited | ❌ API key required | ❌ | ❌ |
| **Nager.Date** | ✅ Free | ✅ No key needed | ❌ **India not supported** | ✅ |

### Key Findings

- **Calendarific** is the most popular — but forces signup before any developer can even test it. This is friction.
- **Nager.Date** is the closest to what we want — free, open-source, no API key — but **India (`IN`) is not a supported country.**
- **No API exists** that is:
  - Truly free (no credit card, no signup)
  - India-specific with state-level data
  - Open source and community-driven
  - Covers Indian festivals (not just gazetted holidays)

---

## 🎯 The Gap (In One Line)

> **There is no free, open-source, no-login-required API specifically built for Indian calendar data with state-level holiday support.**

---

## ✅ How This Project Solves It

### What we're building
A **REST API** that any developer can hit directly — no signup, no API key, no friction.

```
GET https://api.yourdomain.com/v1/holidays?country=IN&year=2026
GET https://api.yourdomain.com/v1/holidays?country=IN&year=2026&region=KA
GET https://api.yourdomain.com/v1/date/is-holiday?country=IN&date=2026-01-26
```

### Our unfair advantages over existing options

- **Zero friction** — no login, no API key, just a URL
- **India-first** — built specifically for IN, not a generic global API where India is an afterthought
- **State-level data** — Karnataka, Maharashtra, Tamil Nadu, etc. (nobody else does this well)
- **Festivals + observances** — not just gazetted holidays, but Diwali, Holi, Eid, regional festivals
- **Open source** — community can contribute data, fix errors, add states
- **Free forever** — MIT licensed, self-hostable

---

## 🏗️ How It's Built (Simple Overview)

```
Data Sources (Govt sites, ICS feeds)
        ↓
  JSON Dataset (stored in GitHub repo)
        ↓
  Node.js + Express API (reads JSON, serves endpoints)
        ↓
  Deployed on Railway/Render (free tier)
        ↓
  Public URL → any developer can use it
```

### Tech Stack
- **Language:** Node.js (JavaScript)
- **Framework:** Express
- **Data format:** JSON files per country/year
- **Deployment:** Railway or Render (free)
- **Docs:** OpenAPI / Swagger
- **License:** MIT

### Cost to build and run
| Item | Cost |
|---|---|
| Code + GitHub | ₹0 |
| Deployment (Railway free tier) | ₹0 |
| Domain name (optional) | ~₹800–1200/year |
| **Total to launch** | **₹0** |

---

## 📦 v1 Scope (What We're Building First)

- [ ] Central Indian public holidays (2025, 2026)
- [ ] State-level holidays for major states
- [ ] `GET /v1/holidays` endpoint
- [ ] `GET /v1/date/is-holiday` endpoint
- [ ] `GET /v1/date/next-holiday` endpoint
- [ ] Basic rate limiting
- [ ] Public GitHub repo with README + docs

**Out of scope for v1:** Lunar/astronomical events, school calendars, other countries

---

## 📁 Data Strategy

1. **Primary source** — India government portals (india.gov.in, state govt sites)
2. **Secondary** — Reputable community datasets (with license check)
3. **Format** — One JSON file per state per year, stored in `/data/IN/` in the repo
4. **Updates** — Community PRs + yearly manual verification

---

## 🚀 Future Roadmap (Post v1)

- Add more Indian states and UTs
- Add festivals and observances layer
- Add other South Asian countries (Pakistan, Bangladesh, Sri Lanka)
- GraphQL support
- npm package / SDK for JS developers

---

## 🔗 References

- [Nager.Date (closest existing solution)](https://date.nager.at)
- [India National Holiday Portal](https://www.india.gov.in/calendar)
- [Project Reference File](./PROJECT-REFERENCE.md)
