# Independent verification 2 — FAIL

Work order: `viewport-fact-sheet-verify-2`

Verified: 2026-08-28

Candidate commit: `1856f570aabebfd44d453e7bebc85fd962a0b40d`

Live URL: <https://viewport-fact-sheet.sociobot.in/>

## Verdict

**FAIL.** The candidate builds and its automated suite passes, and the deployed page shell byte-matches that build. However, all three product downloads advertised by that shell return 404 in production, so a user cannot install either the Chromium extension or Playwright helper. The extension's populated report UI also has one critical and one serious axe finding, while the 390 px landing page has another serious axe finding. These violate the core journey and the acceptance contract's zero serious/critical accessibility requirement.

This is fresh evidence. It supersedes the `PASS` in the candidate's earlier handoff and is not a carry-over of the earlier HTML-fallback failure: production now returns truthful 404 responses, but the artifacts are still absent.

## Defects

### P1 — all advertised production downloads are absent

Repeated GETs at approximately 03:54 UTC returned `404`, `text/html`, and 2,400 bytes for each advertised artifact:

- `/downloads/viewport-fact-sheet-chrome.zip`
- `/downloads/viewport-fact-sheet-playwright.mjs`
- `/downloads/viewport-fact-sheet-playwright.zip`

Clicking **Download for Chromium** in Chromium emitted a download with the advertised filename, but Chromium cancelled it and `download.saveAs()` failed with `download.saveAs: canceled`. No installable file reached the user.

The local release is correct: the extension ZIP is 30,222 bytes, starts with ZIP magic, passes `unzip -t`, and has SHA-256 `b9032dfbf3c0dcc401177758212730fb2fcb9f2a76ce64360914e1d2d09122d4`; the single-file helper is 6,477 bytes with SHA-256 `b0022c9da4803561d6d543c06edcfe2072a4ed1b5ab4f7e072259707d46e7ee7`; and the helper ZIP passes integrity. This is a production publication failure, not a build failure.

Impact: the deployed product cannot perform its real job-to-be-done because neither installation path can start.

### P1 — populated extension popup has critical/serious accessibility failures

The built MV3 extension was loaded unpacked in Chromium and given a realistic report. Axe 4.10.2 found:

- **Critical `aria-required-parent`:** `#summary-tab` and `#json-tab` use `role="tab"` without an ancestor with `role="tablist"`.
- **Serious `scrollable-region-focusable`:** the JSON `<pre id="json">` scroll region has neither a focusable child nor its own focus target.

Keyboard ArrowRight does switch the tab and the controls have visible focus, but the invalid ARIA hierarchy prevents a conforming tab pattern and keyboard users cannot enter the overflowing JSON region.

Impact: a core report-reading view fails the explicit zero serious/critical axe gate.

### P2 — mobile landing code sample is not keyboard-scrollable

At 390 × 844, axe 4.10.2 reports serious `scrollable-region-focusable` on the Playwright code sample `<pre>`. It overflows horizontally but has neither a focusable child nor a focus target. The same finding reproduces against the local production build, so it is in the candidate rather than deployment drift.

### P2 — mobile touch targets miss the 44 px baseline

At 390 px, several important targets are shorter than the required 44 CSS px: header **Download** is 35 px high, **Read a sample report** is 20 px, both helper downloads are 19 px, and legal/source links are 19 px. The main Chromium CTAs are 50 px and the Copy button is 44 px.

### P2 — offline download failure is returned as successful landing HTML

With the live service worker controlling the page and the browser offline, `fetch('/downloads/viewport-fact-sheet-chrome.zip')` returns `200 text/html`, 8,615 bytes, beginning `<!doctype html>`. The service worker falls back to cached `/` for every failed GET, including artifact requests. Offline shell reload itself works, but a download recovery path should fail truthfully instead of returning the app shell under a ZIP filename.

## Local verification

The worktree was clean and at the exact candidate SHA before install. No product code was changed.

| Check | Result |
| --- | --- |
| Environment | Node `v22.23.2`; npm `10.9.8`; Playwright `1.58.2`; Chromium from the preinstalled Playwright browser set. |
| Clean install / audit | `npm ci` passed; full `npm audit` reported 0 vulnerabilities. |
| Type / lint | `npx tsc --noEmit` passed. No lint script or lint configuration exists. |
| Exact build | Explicit `npm run build` passed and produced `.output/chrome-mv3`, both release ZIPs, the self-contained helper, and `dist/site`. |
| Full repository suite | `npm test` passed: 5 unit tests and 7 Chromium tests. This includes 20/20 seeded layout classifications, picker capture/Escape, helper isolation, downloads, skip focus, legal pages, 390 px layout, and desktop axe coverage. |
| Extension package | ZIP integrity passed. Manifest V3 requests only `activeTab`, `scripting`, and `storage`; no persistent host permission exists. Chromium loaded its service worker and registered `Alt+Shift+V`. The actual popup rendered a report, switched tabs with ArrowRight, cleared back to empty state, and recovered from a protected-page error with the Pick button re-enabled. Axe defects are listed above. |
| Clean helper consumer | Extracted the advertised helper ZIP into a clean temporary project, installed Playwright 1.58.2 plus normal TypeScript/Node types, and type-checked `index.d.ts`. The public API accepted both selector and Locator inputs, reported reachable, 50%-partial, below-viewport, and zero-size cases correctly, rejected a malformed selector, recovered on the following valid call, and emitted the expected `visibility-hidden` assertion error. |
| Privacy regression | A report for an input labelled `Account recovery token: VERIFY-SECRET-9281` with value `VALUE-SECRET-4482` contained neither secret. Source inspection found no analytics, remote API, CDN font/script, cookie, or network-body capture. Extension state uses `chrome.storage.local`. |

The loaded-extension shortcut itself could not be dispatched by Chromium's Xvfb automation even though `chrome.commands.getAll()` reported `Alt+Shift+V`; the built picker was therefore exercised separately in the repository's real-browser click/Escape test. This is an automation limitation, not counted as a product defect.

## Live browser, privacy, policy, and performance evidence

| Check | Result |
| --- | --- |
| Candidate/live identity | Live `index.html`, both JS chunks, primary CSS, mobile hero WebP, and `sw.js` byte-match the candidate build. Example index SHA-256: `83372accf9b12b9753b00dae04e0d064018afe33c5ea383e1591b9fb5cbe8b67`. Identity is incomplete because all release downloads are missing. |
| Desktop semantics | 1440 px: `lang="en"`, descriptive title, one `h1`, one `main`, descriptive image alt, and no horizontal overflow. Visual review matched the blueprint design thesis. |
| Keyboard / focus | The first Tab visibly focuses Skip to main content with a 3 px outline; Enter focuses `<main id="main" tabindex="-1">`. All traversed links/buttons showed the same visible outline. No keyboard trap was observed. |
| 390 px mobile | No page overflow (`scrollWidth = clientWidth = 390`), content/CTA remain visible, and responsive stacking matches the design. Mobile axe/touch defects are listed above. |
| Reduced motion | Under `prefers-reduced-motion: reduce`, the primary CTA computes `transition-duration: 0s`, `animation-duration: 0s`, and `transform: none`. |
| Axe / errors | Desktop landing: 0 serious/critical. Populated extension popup: 1 critical + 1 serious. Mobile landing: 1 serious. No console errors, page errors, or failed initial requests occurred. |
| Outbound requests | The first live load contacted only `viewport-fact-sheet.sociobot.in`; no analytics or third-party runtime request was observed. |
| Legal | `/privacy/` and `/terms/` both return 200 and disclose local extension storage and the no-content/no-telemetry behavior. MIT `LICENSE` and operating/deployment instructions are present. |
| Response policy | Live root/assets/SW send CSP, Permissions-Policy, Referrer-Policy, nosniff, frame denial, and HSTS. Hashed assets use `public, max-age=31536000, immutable`; `sw.js` uses `no-cache`; root uses 30-second revalidation. Missing download 404s have only basic 404 headers. |
| PWA update/offline | Active controller is `/sw.js`; cache is `viewport-fact-sheet-v2`; `registration.update()` left no waiting/installing worker. Offline navigation returned 200 and the correct landing heading. Offline artifact fallback defect is listed above. |
| Bundle budgets | Initial JS is 1,523 bytes raw / about 0.85 KB gzip; primary CSS is 13,242 bytes raw / 3.69 KB gzip; mobile hero is 18,088 bytes; no fonts load. All are below contract budgets. |
| Lighthouse mobile | Performance 99, accessibility 100; FCP 0.9 s, LCP 1.2 s, CLS 0, TBT 130 ms, total payload 74 KiB. The independent axe runs above found state/viewport-specific defects that this Lighthouse pass did not expose. |

## Required release actions

1. Publish all three files from `dist/site/downloads/` and verify status, MIME type, ZIP integrity, and byte identity through the production URLs and real CTA clicks.
2. Give the popup tab buttons a `tablist` parent and make the JSON scroll region keyboard-focusable; add populated-report axe coverage.
3. Make the mobile landing code region keyboard-focusable and bring non-inline mobile controls to at least 44 × 44 CSS px; add 390 px axe/touch-target coverage.
4. Restrict the service-worker navigation fallback to document navigations and return a truthful failure for uncached artifact requests.
