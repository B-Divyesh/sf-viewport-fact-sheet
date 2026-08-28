# Viewport Fact Sheet — repair handoff: PASS

Work order: `viewport-fact-sheet-repair-2`
Verifier report: `.factory/verification-2.md` at `dd3e3882722db8b5ec8dbb294d83b7d81622ae33`
Repaired product commit: `e19e92a`
Deployed: 2026-08-28 to <https://viewport-fact-sheet.sociobot.in/> (Azure Static Web Apps deployment `228593ad-fe87-4210-94f5-4be25c324d18`)

## Result

All release-blocking findings from the independent report are repaired and verified locally and in production.

- The entire `dist/site/` directory, including `downloads/`, was published. All three advertised artifact URLs now return `200` with the correct MIME type, pass ZIP integrity checks where applicable, and byte-match the build. A real Chromium CTA download has the expected `viewport-fact-sheet-chrome.zip` filename.
- The real packaged MV3 popup now has a proper `tablist`; its populated JSON region is keyboard-focusable and named. Axe reports zero serious/critical findings in that real extension state.
- The mobile code sample is focusable, and the previously undersized mobile links now measure at least `44 × 44` CSS px. Desktop and 390 px live axe checks have zero serious/critical findings.
- Service-worker fallback is restricted to navigation. An uncached offline artifact request returns `503 text/plain` with an honest offline message, never an HTML app shell under a ZIP filename. The cache was versioned to `viewport-fact-sheet-v3` so deployed clients update.

## How to run and verify

```bash
npm ci
npm audit --audit-level=high
npx tsc --noEmit
npm test
unzip -t .output/viewport-fact-sheet-chrome.zip
unzip -t dist/site/downloads/viewport-fact-sheet-playwright.zip
```

`npm test` uses `xvfb-run` for the real headed Chromium MV3 popup regression. `npm run build` produces the extension ZIP, self-contained Playwright helper, correctly typed helper ZIP, and deployable `dist/site/`; publish that full directory verbatim.

## Evidence

| Check | Result |
| --- | --- |
| Clean install, audit, type | `npm ci` pass; `npm audit --audit-level=high` reports 0 vulnerabilities; `npx tsc --noEmit` pass. No separate lint task/configuration exists. |
| Unit/integration | `npm test` pass: 6 unit tests and 9 Chromium browser tests. It preserves all 20 seeded layout classifications, picker capture/Escape, helper clean-consumer execution, legal pages, download bytes, and skip focus. |
| New popup regression | Builds and loads the actual unpacked MV3 extension with a realistic populated report; verifies `tablist`, ArrowRight switching, focusable JSON, and axe serious/critical = 0. |
| New 390 px regression | Verifies no page overflow, code-region focus, all reported navigational/download targets at least 44 × 44 px, and axe serious/critical = 0. |
| New offline regression | Registers the built service worker, reloads under control, takes the browser offline, and asserts `/downloads/viewport-fact-sheet-chrome.zip` returns `503 text/plain` rather than app HTML. |
| Package / consumer | Extension archive and helper ZIP both pass `unzip -t`; the browser suite imports the advertised standalone helper from a clean temporary consumer without `engine.js`. |
| Production downloads | Chrome ZIP: `200 application/zip`, 30,229 bytes, SHA-256 `f63e2fb31ff578e564006e0d2210e6824d33003cb1dd9dec8adfcf7f9ccc3b31`; helper MJS: `200 text/javascript`, 6,477 bytes, SHA-256 `b0022c9da4803561d6d543c06edcfe2072a4ed1b5ab4f7e072259707d46e7ee7`; helper ZIP: `200 application/zip`, 3,546 bytes, SHA-256 `42c33873cc2029ab896a9ca159b8e49f72ecede26d49971a83a6741b0c4f90b2`. Each byte-matches `dist/site/downloads/`; both ZIPs pass `unzip -t`. |
| Live browser / accessibility | `verify-url.sh` reports title, `lang=en`, one `h1`, `main`, image alt coverage, and no console/page errors. Live desktop and 390 px axe have zero serious/critical findings; skip Enter focuses `main`; page width is exactly 390 px at the mobile viewport. |
| Privacy / response policy | Initial live browser requests contacted only `viewport-fact-sheet.sociobot.in`; no analytics or third-party runtime request. Existing privacy regression remains green. Root, SW, asset, and download responses have CSP, Permissions Policy, nosniff, referrer policy, and frame denial; assets/downloads are immutable and `sw.js` is `no-cache`. |
| Offline / update / identity | Live `v3` service worker controls the page; offline uncached ZIP is truthful `503`; `registration.update()` completes. Live index, SW, all built JS/CSS, heroes, and all downloads byte-match the current build. |
| Performance | Mobile Lighthouse 12.8.2 report: Performance 100, Accessibility 100, FCP 1.0 s, LCP 1.2 s, CLS 0, TBT 30 ms, 74 KiB total payload. The Lighthouse CLI emitted the valid report but exited non-zero after its final full-page screenshot target crashed in this container; this did not affect the emitted scores or separate Playwright checks. |

## Known boundaries

- Chromium Manifest V3 only. Protected browser pages and top-document selection inside cross-origin iframes remain browser limitations.
- Reports deliberately retain structural debugging facts (for example selectors, IDs/classes, geometry, and relevant styles). They do not retain page text, ARIA label text, input values, query strings, fragments, cookies, screenshots, or network bodies.
