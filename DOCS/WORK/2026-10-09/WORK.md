# Frontend cleanup, behavior fixes, and mobile check

The portal cleanup plan completed its five phases in seven commits on `frontend-deslop`. Its full task log and plan issue are preserved in [the closed plan](PLAN-frontend-deslop-closed.md). The owner then authorized fixes to the remaining behavior gaps, a tighter page rhythm, mobile repairs, and a local merge to `main`.

## What changed

- The calendar grid identifies day rows by their `is_holiday` field, so a holiday list with more than 50 entries keeps its markings and names. Marked dates expose details by tap and keyboard focus.
- The status badge checks `/health` and verifies the service payload. A 404 is no longer called live, and a slow request says it is still checking.
- Playground exposes `scope` on all routes and `restricted` on the calendar route, matching the backend's allowed values. Labels and autocomplete metadata make its fields usable on phones.
- Page top/bottom padding moved from 40–64px to 24–32px on the five main pages. Home's stacked section boundary fell from 112px to 40px on mobile (56px at larger widths); Docs' repeated section boundary fell from 104px to 48px on mobile. The 404 page, cards, console, article, and footer were tightened without reducing control sizes.
- The mobile menu now has an accessible name, focus handling, Escape close, scroll lock, and route-close behavior. Guide summaries show their full text, images have intrinsic dimensions, body copy is readable, and reduced-motion preference stops animations.

## Verification

- Backend: 56/56 tests passed. Frontend production build: seven pages prerendered.
- Local Chrome smoke checks passed for 404 vs valid health responses, the new option URLs, and a 60-entry holiday list in calendar view.
- A 21-case Chrome mobile probe covered seven routes at 320, 390, and 768px. It found no horizontal overflow, layout clipping, body text below its readable floor, form zoom failures, or navigation failures. [MOBILE.md](../../../MOBILE.md) records the measurements and three remaining probe classifications caused by decorative or color-only CSS.
- Frontend lint remains nonzero but improved from 26 to 22 pre-existing errors; this pass did not expand into a lint refactor.

## Disposition

The original plan's Windows route-probe issue was resolved with a PowerShell run. The owner explicitly authorized local merge, superseding its earlier review hold. The frontend changes have not been pushed or deployed; the 2027 data phase in root `PLAN.md` remains separate.
