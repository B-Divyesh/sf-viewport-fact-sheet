# Viewport Fact Sheet — repair 4 handoff

Work order: `viewport-fact-sheet-repair-4`
Implementation deployed: `dd83b52b8c8f79bdcefe98e4ff81a5463f536d77`
Live URL: <https://viewport-fact-sheet.sociobot.in/>
Documentation SHA: the post-deploy documentation commit containing this handoff (it does not change the deployed image).

## Result

The review blockers and earlier minor findings are resolved.

- `/demo/` is a real one-click sample workspace. It loads a populated clipped-panel report, keeps a sticky `Demo — sample data, nothing is saved` banner visible, has **Reset demo** and **Start for real**, and stores only `demo:vfs:workspace`. Leaving the demo discards that key.
- `.factory/claims.json` lists 21 public claims. Each claim has one `@claim:<id>` outcome test. `npm run verify:claims` executes all declared commands individually from a clean build; the 2026-09-06 run completed with `Verified 21 declared claims.`
- The landing page now states the job, audience, and **Try it with sample data** first action before scrolling. The copy audit, terminology table, and catalog description are in `.factory/copy-audit.md` and `.factory/catalog-description.txt`.
- The static site has route-specific metadata, canonical/OG/Twitter fields, a 1200 × 630 product-derived social image, 180 px touch icon, Demo/Privacy navigation, versioned footer, sitemap entry, and an honest `/404.html` response. Live unknown paths return HTTP 404 with the designed page.
- Stable download URLs now revalidate instead of being immutable for a year. `npx tsc --noEmit` works from a clean checkout; `npm run typecheck` checks production and test sources.
- The prior extension, helper, privacy, accessibility, artifact, and service-worker repairs remain in place. External source links now accurately announce an external site.

## How to verify

```bash
npm ci
npm audit --audit-level=high
npx tsc --noEmit
npm run typecheck
npm test
npm run verify:claims
npm run build:site
```

`npm test` passed with 8 unit tests and 32 browser tests. The combined claim sweep passed all 21 tests, and the final individual registry runner completed all 21 documented commands against the deployed implementation. `npm audit --audit-level=high` reported zero vulnerabilities.

Live verification after the final deployment:

- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, 780 ms load, no browser errors, `lang=en`, one `h1`, one `main`, no missing image alt, and no unlabeled buttons.
- A fresh desktop browser showed the job headline, audience, and sample action before scrolling. It entered `/demo/` and showed the banner, reset control, and populated `NOT REACHABLE` report. A fresh 390 px phone browser showed that report at y=526 within its 844 px first viewport, with no horizontal overflow or console errors.
- The demo reset restored `37%`; a pre-seeded `vfs:real:workspace` sentinel remained unchanged. Offline `/demo/` reload worked after the first visit. Reduced motion computed zero-duration transitions and no transform.
- Live Playwright Axe scans had no serious or critical violations on landing, demo, and phone demo. The real extension ZIP download completed without failure and passed `unzip -t`.
- `GET /does-not-exist` returned HTTP 404 with title `Page not found — Viewport Fact Sheet`. Downloads return `application/zip` with `Cache-Control: public, max-age=0, must-revalidate`.
- Lighthouse mobile (simulated throttling, no full-page screenshot) scored Performance 100, Accessibility 100, Best Practices 100, and SEO 100; FCP 1,090 ms, LCP 1,408 ms, CLS 0.

Evidence is under `/work/.evidence/viewport-fact-sheet-repair-4/` and `/work/.evidence/viewport-fact-sheet-repair-4-final/`, including desktop/mobile screenshots, the downloaded extension archive, verification JSON, Lighthouse output, final HTTPS verification, and the `Verified 21 declared claims.` marker.

## Scope and known gaps

There is no product backend, tenant state, SQLite database, payment flow, or paid offer in this free browser-extension product, so backend isolation/health/rate-limit and billing-registration checks do not apply. No AI feature was added because deterministic browser geometry is the product’s core job and the researched brief does not require model assistance.

No known product gaps remain from review 1. The standard development environment must provide Node.js 20+, `zip`, `unzip`, and the documented Playwright browser.
