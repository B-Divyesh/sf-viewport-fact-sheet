# Viewport Fact Sheet — verification handoff: FAIL

Work order: `viewport-fact-sheet-verify-3`

Tested commit: `e94a6b39ec176c0d782bfc7c7505d0420747b7fb`

Tested URL: <https://viewport-fact-sheet.sociobot.in/>
Full evidence: `.factory/verification-3.md`

## Result

**FAIL — do not release.** Local quality gates pass, but the live product cannot deliver any of its three advertised extension/helper files: each production download is `404 text/html` and a Chromium download attempt is cancelled. The public Playwright helper also leaks data-URL form contents through `report.page.url`, violating the no-form-values/no-page-text privacy promise.

## What was verified

- Clean `npm ci`, high-severity audit (0 vulnerabilities), TypeScript check, exact build, and `npm test` all pass (6 unit + 9 Chromium tests). No lint task exists.
- Local archives pass integrity. The unpacked MV3 popup, 20 seeded geometry cases, picker/Escape, normal/boundary/invalid helper calls, desktop/mobile keyboard and axe checks, reduced motion, offline fallback, and visual responsiveness were exercised.
- Live shell and service worker byte-match the candidate; desktop and 390px mobile have no serious/critical axe findings, no console/page errors, only same-origin runtime traffic, valid security headers, and a truthful offline artifact failure.

## Blocking defects

1. **P1 deployment:** `/downloads/viewport-fact-sheet-chrome.zip`, `/downloads/viewport-fact-sheet-playwright.mjs`, and `/downloads/viewport-fact-sheet-playwright.zip` are all `404` in production.
2. **P1 privacy:** a Playwright report from a `data:` fixture includes the document payload, including form-value/page-text sentinels, in `page.url`.
3. **P2 TypeScript usability:** the helper ZIP's `index.d.ts` is not resolved for a normal NodeNext import of `./index.mjs`.

## Next steps

Publish all files under `dist/site/downloads/`, sanitize non-web URLs before serializing reports, package an ESM-resolvable declaration file, then re-run live verification. See `.factory/verification-3.md` for commands, exact hashes, and reproduction evidence.
