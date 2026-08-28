# Independent verification — FAIL

Work order: `viewport-fact-sheet-verify-1`
Verified: 2026-08-28
Candidate commit: `634c858094f0116ab72fe46c77b8fe8a9d4011c0`
Live URL: <https://viewport-fact-sheet.sociobot.in/>

## Verdict

**FAIL.** The production landing page is from the candidate, but its primary extension and helper downloads return the HTML fallback instead of the advertised artifacts. A developer cannot install the product from the deployed site. In addition, the advertised Playwright-helper download omits its mandatory `engine.js` companion, and reports capture ARIA label text despite the product's explicit promise not to capture page contents.

## Blocking defects

### P1 — production extension and helper downloads are HTML, not downloads

On 2026-08-28, both live endpoints returned `HTTP/2 200`, `content-type: text/html`, 8,519 bytes, and SHA-256 `204beed50cea532c4060e2303322b62f494af6f7d5a4565f572542398b8556f0`: the exact landing-page HTML.

- `https://viewport-fact-sheet.sociobot.in/downloads/viewport-fact-sheet-chrome.zip`
- `https://viewport-fact-sheet.sociobot.in/downloads/viewport-fact-sheet-playwright.mjs`

A real browser download from the Chromium CTA saved `viewport-fact-sheet-chrome.zip` containing `<!doctype html>...`, not a ZIP. Locally, the candidate produces the correct 30,306-byte ZIP and `unzip -t .output/viewport-fact-sheet-chrome.zip` passes. This is a deployment/package-publication failure, not a local build failure.

Impact: the real job-to-be-done cannot be started from the deployed product.

### P1 — advertised Playwright helper cannot work as downloaded

The landing page links only `viewport-fact-sheet-playwright.mjs` and `.d.ts`. The helper's first call reads a required adjacent `./engine.js`; the local release does contain that file, but the page offers no download/link for it. In a clean consumer containing exactly the two advertised helper files, `getViewportFactSheet()` fails:

```text
ENOENT: no such file or directory, open '.../helper/engine.js'
```

Impact: even after the live artifact upload is fixed, the documented helper installation journey remains incomplete unless users discover and copy a third, unlinked file.

### P1 — report leaks page text contrary to privacy promise

`collectFactSheet()` resolves `aria-labelledby` with each referenced element's `textContent` and persists that string as `target.accessibleName`. An independent built-helper run against an input labelled `Account recovery token: VERIFY-SECRET-9281` returned that exact string in the exported report. The form input's value was correctly absent.

This contradicts the landing page, popup, README, privacy policy, and prior handoff statements that no page contents/page text are captured. The researched brief permits no form values or network bodies; this test confirms form values are not captured, but arbitrary label text is still content that can be sensitive and is retained in extension local storage/export JSON.

Impact: the privacy disclosure is false and a report can include sensitive page text.

## Other defects

### P2 — live response security/caching policy is incomplete

The live root, assets, service worker, legal pages, and fallback download paths send HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-Content-Type-Options: nosniff`, but no `Content-Security-Policy` or `Permissions-Policy`. Hashed JS/CSS assets also use only `Cache-Control: public, must-revalidate, max-age=30`, rather than long-lived immutable caching called for by the factory performance policy.

### P2 — skip link does not transfer keyboard focus to main content

The visible skip link targets `#main`, but `<main id="main">` is not programmatically focusable. In Chromium, Tab focused the skip link with a designed 3 px outline; Enter did not make `#main` the active element. This weakens keyboard/screen-reader skip navigation.

### P3 — development dependency audit is not clean

Fresh `npm ci` followed by full `npm audit` reports 13 development-tree vulnerabilities: 3 moderate, 5 high, and 5 critical (including `happy-dom`, `vitest`, `shell-quote`, and transitive WXT tooling). `npm audit --omit=dev` reports 0 production vulnerabilities. This does not affect the static runtime bundle, but should be remediated for the build/test environment.

## Verification evidence

The checkout was clean at the requested SHA before installation. No product code was changed.

| Check | Result |
| --- | --- |
| `npm ci` | Pass; clean install completed. Full audit findings listed above. |
| `npx tsc --noEmit` | Pass. No lint script exists in `package.json`. |
| `npm run test:unit` | Pass: 3/3. |
| Exact `npm run build` | Pass; produced `.output/chrome-mv3`, helper artifacts, and `dist/site`. |
| `npm test` | Pass: unit 3/3 and Playwright 5/5, including all 20 seeded classifications, picker capture/cancel mock coverage, 390px, legal routes, console checks, and axe integration. |
| Extension package | Local ZIP integrity passed with `unzip -t`; manifest is MV3 with only `activeTab`, `scripting`, and `storage`. |
| Clean helper consumer | Pass when `index.mjs`, `index.d.ts`, and `engine.js` are supplied: public exports work and `assertViewportReachable` returned a reachable report. Invalid selector produced an error and a following valid call recovered. |
| Local desktop and 390px browser smoke | Pass: no horizontal overflow (1440/390 CSS px), one `<h1>`, one `<main>`, visible CTA; visual review matches the blueprint thesis. |
| Keyboard/reduced motion | Focus outlines are visible; reduced-motion button transition is `0s` and transform `none`; skip-focus defect noted above. |
| Accessibility | Axe 4.10.2 found 0 serious/critical issues on local landing and extension popup. |
| Console/page errors | None in independent local landing, extension-popup, or live landing smoke tests. |
| Privacy/outbound requests | Local and live landing initial loads made only first-party requests; source/manifest inspection found no remote API, analytics, CDN font, or persistent host permission. Reports are stored in `chrome.storage.local`. ARIA text leak noted above. |
| Service worker | Local registration became active and a post-activation offline reload returned 200 with the landing title. No service-worker update was pending in this one-version test. |
| Bundle budgets | Initial site JS 1,337 bytes raw / 670 bytes gzip; CSS 13,180 bytes raw / 3,680 bytes gzip; desktop/mobile WebP 44,124/18,088 bytes. All are below stated static budgets. |
| Candidate/live identity | Live `index.html` SHA-256 matches `dist/site/index.html`; live JS, CSS, and hero WebP hashes also match. The live release is incomplete because `dist/site/downloads/*` was not published. |

## Required release actions

1. Publish `dist/site/downloads/` verbatim and verify MIME types/content bytes for ZIP, MJS, declaration, and engine artifacts at the live URLs.
2. Package the helper as one downloadable archive/package, or link all required files including `engine.js` with installation instructions that keep them together.
3. Stop exporting ARIA-derived text, or accurately narrow the privacy promise/policy and obtain product approval for that data retention.
4. Make the skip target focusable and focused after activation; add CSP, Permissions-Policy, and immutable caching for hashed assets in deployment configuration.
5. Update vulnerable development tooling and rerun the full suite.
