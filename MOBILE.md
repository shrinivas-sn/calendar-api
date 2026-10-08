# Mobile check — India Calendar API portal

Run: 09/10/2026 · Vite 8 / React 19 / Tailwind 3.4 · seven routes · three viewports
Browser: Chrome headless through puppeteer-core 25.13.0

## Run profile

- Local URL: `http://127.0.0.1:5173/` (server started for this check).
- Routes: `/`, `/playground`, `/docs`, `/guides`, `/guides/gazetted-vs-restricted-holidays`, `/status`, and a missing route.
- Viewports: 320×568, 390×844, 768×1024. Tailwind uses the default `sm`/`md`/`lg` breakpoints (640/768/1024px).
- All 12 check families applied somewhere in the portal. Form zoom applied to Playground; media checks to pages with images; navigation, motion, and hover checks to their applicable viewports.

## Score

The final probe wrote 21 route/viewport results. `FAIL` below is the probe's raw result; the three remaining failing families are explained under Findings. Zero horizontal overflows, clipped elements, or tap targets below the 24px floor were measured.

| Family | 320px | 390px | 768px | Worst measured value |
|---|---|---|---|---|
| Horizontal overflow | pass | pass | pass | 0px overflow |
| Viewport metadata | n/a | n/a | pass | Present |
| Tap targets | warn | warn | warn | 0 below 24px; some below 44px |
| Text legibility | warn | warn | n/a | 0 failing body text nodes |
| Form input zoom | pass | pass | n/a | 0 of 4 visible fields failing |
| Layout collision | pass | pass | pass | 0 clipped, occluded, or distorted |
| Fixed bar budget | FAIL | FAIL | FAIL | 111.4% at 320px, including a decorative 100vh layer |
| Dynamic viewport / safe area | FAIL | FAIL | n/a | 0 bare `vh` source files; decorative fixed layer flagged |
| Media layout shift | pass | pass | n/a | CLS at most 0.001; image dimensions present |
| Touch affordance | n/a | FAIL | n/a | 12 hover CSS rules flagged |
| Navigation drawer | pass | pass | n/a | All six interaction steps pass |
| Reduced motion | n/a | pass | n/a | 0 elements still animating |

## Findings

- **Fixed bar / safe area:** The probe includes `.glow-backdrop`, a full-viewport, `pointer-events: none`, `z-index: -1` decorative layer, in its fixed-bar sum and safe-area check. The actual sticky header is 65px, or 11.4% of the 320px-wide viewport's 568px height. This is a probe classification error; no content is blocked by the decorative layer. The source has no bare `100vh` or `min-h-screen` after the change.
- **Touch affordance:** The 12 reported rules are ordinary Tailwind hover color rules. The probe's `opacity` regex also matches Tailwind variable names such as `--tw-border-opacity`. Holiday details now open by tap and keyboard focus, so no content depends on hover.
- **Warnings:** The probe warns when a target is under 44px although none is below its 24px failure floor. Body text is at least 14px; the remaining warning is its 14–15px range.

## Fix ledger

| Area | Before | After | Rechecked |
|---|---|---|---|
| Navigation drawer | 0/6 interaction steps | 6/6 | 320px and 390px, all routes |
| Playground fields | 3/3 failed | 0/4 failed after adding scope | 320px and 390px |
| Guide summaries | 3 clipped | 0 clipped | Guide list and article at 320px and 390px |
| Body text | Docs 56 failures; Home 5; Guides 8; Playground 3 | 0 failures on all measured routes | 320px and 390px |
| Reduced motion | 2 elements still animated | 0 | 390px, all routes |
| Images | 2 without intrinsic dimensions | 0 | 320px and 390px, all routes |
