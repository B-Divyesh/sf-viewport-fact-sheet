# Viewport Fact Sheet — repair handoff: PASS

Work order: `viewport-fact-sheet-repair-1`
Base verified: `634c858094f0116ab72fe46c77b8fe8a9d4011c0`
Repair commits: `180e292`, `b29a3fe`, `23b971d`
Deployed: 2026-08-28 to <https://viewport-fact-sheet.sociobot.in/> (Azure Static Web Apps deployment `3011f73e-60cd-4391-a46a-4bc448ef7372`)

## Result

All release-blocking findings in `.factory/verification.md` are repaired and verified locally and live.

- The deployed Chromium ZIP is a real `application/zip`, passes `unzip -t`, and byte-matches `dist/site/downloads/viewport-fact-sheet-chrome.zip`.
- The deployed Playwright helper is a self-contained `text/javascript` module and byte-matches the built download. Its engine is embedded at build time; a clean consumer with only the downloaded `.mjs` successfully inspected an element. The optional type definition is packaged with the helper in the correctly typed ZIP rather than exposed as Azure's misleading `.d.ts` MIME type.
- The deployed static config excludes `/downloads/*` from SPA fallback, so missing/download paths cannot return landing-page HTML. It also sets ZIP/MJS MIME types, CSP, Permissions Policy, immutable asset/download caching, and no-cache service-worker updates.
- Reports no longer resolve or store `aria-label`/`aria-labelledby` text. The exact regression uses `Account recovery token: VERIFY-SECRET-9281` plus an input value and proves neither reaches exported JSON.
- Skip links now focus their `main` target. This is browser-regression-covered with Tab then Enter.
- Development tooling was upgraded and a clean full `npm audit` now reports 0 vulnerabilities.

## How to run and verify

```bash
npm ci
npx tsc --noEmit
npm audit
npm test
unzip -t .output/viewport-fact-sheet-chrome.zip
```

`npm run build` produces `.output/chrome-mv3`, `.output/viewport-fact-sheet-chrome.zip`, the self-contained helper in `dist/playwright-helper/`, and deployable `dist/site/`. Deploy the full `dist/site/` directory; it includes `downloads/` and `staticwebapp.config.json`.

## Evidence

| Check | Result |
| --- | --- |
| Clean install / type / audit | `npm ci` pass; `npx tsc --noEmit` pass; full and production `npm audit` are 0 vulnerabilities. |
| Unit and integration | `npm test` pass: 5 unit tests and 7 Chromium tests. |
| Existing product behavior | All 20 seeded layout classifications, picker capture/cancel, extension build, package integrity, legal pages, desktop, 390 px mobile, axe, and console checks pass. |
| New helper regression | Clean temporary consumer with only `viewport-fact-sheet-playwright.mjs` passed `getViewportFactSheet`; no adjacent `engine.js` exists or is required. |
| New privacy regression | Export contains neither an ARIA-referenced secret nor an input value, and has no `accessibleName` field. |
| New release-policy regression | Tests assert `/downloads/*` is excluded from fallback, ZIP/MJS MIME mappings exist, CSP/Permissions Policy exist, and assets are immutable. |
| Keyboard / accessibility | Live desktop: one `h1`, one `main`, skip link focused `main`, axe serious/critical = 0, no console errors. |
| Mobile / privacy | Live 390 px body width = 390 px; only `viewport-fact-sheet.sociobot.in` was requested on first load. |
| Offline / update | Local production preview registered active SW `v2`; after a controller reload, offline navigation returned HTTP 200 and the landing heading. `sw.js` is live with `Cache-Control: no-cache`. |
| Live artifacts / identity | Live ZIP, MJS, helper ZIP, and landing HTML byte-match their current `dist/site` files. ZIPs pass integrity. The old direct `.d.ts` URL is now a truthful 404 rather than a fallback or incorrectly typed advertised download. |
| Live response policy | Root, downloads, JS assets, and SW have CSP and Permissions Policy; downloads/hashed JS use `public, max-age=31536000, immutable`; SW uses `no-cache`. |
| Lighthouse (live) | Performance 100, accessibility 100; LCP 1.2 s and CLS 0. |

## Known boundaries

- Chromium Manifest V3 only. Protected browser pages and top-document selection inside cross-origin iframes remain unavailable browser limitations.
- Reports intentionally retain structural debugging facts such as page title, origin/path, selectors, IDs/classes, and styles; users should still review an export before sharing it. They do not retain page text, ARIA labels, form values, query strings, fragments, cookies, screenshots, or network bodies.
