# Viewport Fact Sheet — repair handoff: PASS

Work order: `viewport-fact-sheet-repair-3`
Verifier report: `.factory/verification-3.md` at `51d6722ce662e19b9012b5355f0e5c2a3e4b3ddd`
Repaired product commit: `5823b4931e15d2f76accf4d3ea8729640054b2a7`
Deployed: 2026-08-28 to <https://viewport-fact-sheet.sociobot.in/> (Azure Static Web Apps deployment `619b4602-7ae7-47f1-9d69-75d0c71cd1dd`)

## Result

All release-blocking and other findings from independent verification 3 are repaired, covered by exact regressions, and verified locally and in production.

- `npm run build:site`, the work order's deployment entry point, now builds the extension and helper, builds the pages, copies all three downloads, and fails unless the archives and helper contents are valid. This fixes the publication root cause instead of relying on a later manual copy.
- Non-web locations that can embed private payloads now serialize only their protocol (`data:`, `blob:`, `file:`). A real Playwright regression puts unique page-text and form-value sentinels in a `data:` document and proves neither occurs in the exported report.
- The helper now ships `index.d.mts`, which TypeScript's NodeNext resolver associates with `index.mjs`. A clean extracted-ZIP consumer imports `./index.mjs` and passes TypeScript 5.9.3 with `module` and `moduleResolution` set to `NodeNext`.
- The complete built site was deployed. Every advertised download now returns `200` with the expected MIME type, byte-matches the release, and is usable through the real Chromium CTA.

## How to run and verify

```bash
npm ci
npm audit --audit-level=high
npx tsc --noEmit
npm test
npm run build:site
node scripts/verify-release.mjs
unzip -t .output/viewport-fact-sheet-chrome.zip
unzip -t dist/site/downloads/viewport-fact-sheet-playwright.zip
```

There is no separate lint configuration in this repository; strict TypeScript checking is the source-level static gate. `npm test` runs unit tests, the complete clean production build and release verification, then the Chromium integration/accessibility suite.

## Verification evidence

| Check | Result |
| --- | --- |
| Clean install / audit / type | `npm ci` passed with 197 packages; `npm audit --audit-level=high` reported 0 vulnerabilities; `npx tsc --noEmit` passed. |
| Full repository suite | `npm test` passed: 8 Vitest tests and 11 Chromium tests. Existing 20/20 seeded classification, picker click/Escape, real populated MV3 popup, legal, desktop/mobile, keyboard, axe, offline, and helper-isolation coverage remains green. |
| Privacy regression | A real `data:` page contained `PAGE-TEXT-SENTINEL-7319` in its label and `FORM-VALUE-SENTINEL-4826` in its input. The report URL was exactly `data:` and serialized output contained neither sentinel. Unit coverage also verifies payload-safe handling for `data:`, `blob:`, and `file:` while preserving origin/path for HTTPS. |
| NodeNext consumer | The public helper ZIP was extracted into a clean temporary consumer, its dependencies exposed as an installed consumer would provide them, and TypeScript 5.9.3 compiled `import { getViewportFactSheet } from './index.mjs'` under strict NodeNext settings. The ZIP contains `index.mjs` and `index.d.mts`. |
| Publication regression | `npm run build:site` now produces the full deployment atomically. `scripts/verify-release.mjs` requires the page/config and all three downloads, checks both ZIPs with `unzip -t`, verifies the helper is self-contained, and requires both helper archive entries. |
| Live downloads | Extension ZIP: `200 application/zip`, 30,281 bytes, SHA-256 `0bef9b2a100265b34eb4adbf7ba2d7749e41227973b3e54744b619cc7385c9e4`; helper MJS: `200 text/javascript`, 6,640 bytes, SHA-256 `b3bfb05f6b8a4e7095f81512dc4f509e4b34cfdbe3ad0417bda13ee902b98d28`; helper ZIP: `200 application/zip`, 3,601 bytes, SHA-256 `67875b106977dcb25ef73451d1e99afaf8f26debee34afb912af2bc7ad4ea6af`. Each live hash equals its local release hash; both live ZIPs pass integrity. |
| Real browser download | Chromium downloaded `viewport-fact-sheet-chrome.zip` with no failure; its SHA-256 was the expected `0bef9b2…e4`. |
| Live identity | Live `index.html`, `sw.js`, both JS chunks, both CSS files, both hero images, and all three downloads byte-match `dist/site`. Index SHA-256: `b7d2ef70d93a7ae0046699c42c60080d73f29530ec888cd061d3d6885cdde489`; service worker SHA-256: `441096e81596c967da15816b8561073bb4e023280836ca6c6ee70426484cc44a`. |
| Live desktop / mobile | At 1440 px and 390 × 844 there is no horizontal overflow, one `h1`, and one `main`. Axe found 0 serious/critical issues at both sizes. At 390 px every checked header/helper/footer target is at least 44 × 44 CSS px. No console or page errors occurred during normal load. |
| Keyboard / motion | First Tab focuses the skip link with a 3 px outline; Enter moves focus to `main`. Reduced motion computes `0s` transition/animation and `transform: none`. The packaged popup regression covers named tablist semantics, ArrowRight switching, focusable JSON, and axe. |
| Privacy / network | Initial live browser traffic contacted only `viewport-fact-sheet.sociobot.in`; no analytics or third-party runtime requests were observed. Existing no-page-text/no-form-value tests pass, and extension persistence remains local-only. |
| Response policy | Root, worker, assets, and downloads carry CSP, Permissions-Policy, Referrer-Policy, nosniff, frame denial, and HSTS. Hashed assets and downloads are immutable for one year; `sw.js` is `no-cache`; documents revalidate after 30 seconds. |
| Offline / update | The live service worker controls the page and `registration.update()` completes. With Chromium offline, an uncached download returns truthful `503 text/plain` with `Offline: this resource is not cached.` |
| Performance | Lighthouse 12.8.2 mobile: Performance 100, Accessibility 100, FCP 0.9 s, LCP 1.2 s, CLS 0, TBT 0 ms, Speed Index 0.9 s, 74 KiB total. Initial JS remains 893 bytes plus 630 bytes raw, primary CSS 13,671 bytes, mobile hero 18,088 bytes, and no web font is loaded. |

## Known boundaries

- Chromium Manifest V3 only. Protected browser pages and top-document selection inside cross-origin iframes remain documented browser limitations.
- Reports deliberately retain structural debugging facts such as selectors, IDs/classes, geometry, and relevant styles. They do not retain form values, body/ARIA label text, non-web URL payloads, query strings, fragments, cookies, screenshots, or network bodies.
- No product, design, artifact-class, or deployment-class behavior was changed beyond the verifier's findings; the researched brief and blueprint drafting visual system remain intact.
