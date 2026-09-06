# Viewport Fact Sheet review 1 — audit the current viewport facts workflow

Work order: `viewport-fact-sheet-review-1`
Reviewed: 2026-09-06
Implementation candidate: `5823b4931e15d2f76accf4d3ea8729640054b2a7` (`fix: secure and publish release artifacts`)
Documentation commit: `79f4dd8dfabf57ca064afaf8170d85aba7c66447` (`docs: record independent verification 4`)
Live URL: <https://viewport-fact-sheet.sociobot.in/>

## Verdict

**FAIL — 7 findings, including 2 P1 findings and at least 18 untested public claims.**

The installed extension and helper do the core inspection job, and the earlier artifact-publication and privacy defects are fixed. The product cannot pass this review because the required one-click demo sandbox and required claims registry do not exist. The live site also lacks a real 404, has first-screen and metadata/structure contract gaps, retains the previously noted stale-download-cache risk, and has a clean-checkout typecheck issue.

## Job, audience, and first action

The job is to explain why a browser element is visible, clipped, offset, or unreachable in the current viewport. The intended audience is frontend engineers and test authors.

In fresh 1440 × 900 desktop and 390 × 844 phone contexts, the first action was **Download for Chromium**. There was no **Try it with sample data** action, no demo banner, and no Reset demo control before or after scrolling. The visible headline was `Stop guessing. Measure the viewport.` and the lead described the inspection output, but did not name the audience.

## Findings

### P1 — no one-click demo sandbox exists

The live landing page has a static sample report, but it is not a tryable product sandbox. No visible control says “Try it with sample data”; `/demo` and `/?demo=1` both return the ordinary landing page, without populated interactive output, a persistent `Demo — sample data, nothing is saved` label, Reset demo, Start for real, or a separate demo storage namespace. `site/main.ts` has no demo implementation and `.factory/demo.md` is absent.

This fails the demo-sandbox contract and prevents review of sample isolation, reset, and real-data non-interference.

### P1 — `.factory/claims.json` is missing; at least 18 public claims are untested

There is no `.factory/claims.json`, no `@claim:` tests, and consequently no declared claim commands to run. This violates the claims contract's required registry and leaves at least these visitor-reliant claims unlisted and untested by their required one-claim/one-demo-flow commands:

1. records box model and coordinates;
2. records clipping and scroll ancestors;
3. records hit-test and viewport reachability;
4. exports portable/versioned JSON;
5. is free;
6. is local only;
7. does not capture page contents or form values;
8. strips query strings;
9. strips page text and ARIA labels;
10. supports the documented extension picking shortcut;
11. supports the advertised Playwright helper;
12. the helper uses the same inspection engine;
13. the helper returns a report or throws reason codes;
14. the latest extension report persists locally;
15. there is no analytics, remote API, account, or telemetry;
16. the static site uses no cookies or third-party scripts;
17. offline shell reload works after first visit; and
18. downloads resume after reconnecting.

`npm test` provides useful coverage for several of these, but it cannot substitute for the required manifest and individually executable, tagged claim commands. The untested-claim count below is a conservative minimum, not a statement that the other prose is exempt.

### P2 — the first screen does not meet the plain-words first-screen contract

The headline starts with the generic slogan `Stop guessing.` instead of naming the job in the user's words. The following sentence explains output but does not say who it is for. The first action is a download rather than the required sample action, and the three facts are combined into one `Free · local only · no page contents or form values` line rather than three short facts. The same page uses non-informational headings and labels such as `Evidence, not interpretation`, `The missing layer between DOM and screenshot`, and `Open the drawing set.`

### P2 — unknown routes do not show a designed 404

`GET /does-not-exist` returns `200` and renders the landing page with the landing title and heading. There is no `404.html` and `site/public/staticwebapp.config.json` has no 404 response override. This is a fallback masquerading as a valid product route, not the required styled error page with a path back.

### P2 — required site metadata and standard-site structure are incomplete

The landing HTML has no canonical link, Open Graph fields, Twitter card fields, or 180 px Apple touch icon. It has only a PNG favicon. The header has no Demo or Privacy navigation entry, and the footer has no version/build id. These are required by the site-structure contract; the title, description, language, title-per-legal-route, sitemap, robots file, and legal routes do exist.

### P2 — unversioned public download URLs are cached immutable for one year

This remains open from verification 4. The stable `/downloads/viewport-fact-sheet-chrome.zip`, `/downloads/viewport-fact-sheet-playwright.mjs`, and `/downloads/viewport-fact-sheet-playwright.zip` responses send `Cache-Control: public, max-age=31536000, immutable`. Their filenames contain neither a version nor a content hash, so a returning user can receive a stale installer/helper for up to a year. Use versioned/hash-addressed filenames or revalidation caching.

### P3 — standalone TypeScript checking is not clean-checkout safe

Immediately after `npm ci`, `npx tsc --noEmit` fails with `TS2307` for the generated `dist/playwright-helper/index.mjs` import in `tests/e2e/engine.spec.ts`. It passes after `npm run build`. The production `npm test` sequence builds first, so the product test command passes, but a standalone typecheck cannot run from the documented clean setup. Add a typecheck script that builds the helper first or exclude the generated consumer test from the source typecheck.

## Verification evidence

| Check | Result |
| --- | --- |
| Clean install | `npm ci` passed; `npm audit --audit-level=high` reported 0 vulnerabilities. |
| Fresh-checkout typecheck | Failed as described above before a build; passed after `npm test` created the generated helper. |
| Declared build/test commands | `npm test` passed: 8 Vitest tests, production build, and 11 Chromium Playwright tests. `node scripts/verify-release.mjs` passed. |
| Claimed-command audit | No `.factory/claims.json` exists, so there were zero declared claim commands and at least 18 public claims remain untested by the mandated mechanism. |
| Live identity | Live `index.html`, `sw.js`, main JS, and primary CSS byte-match the locally built implementation candidate. The single-file helper byte-matches; sampled extension `manifest.json` and helper `index.mjs` ZIP members match. ZIP container hashes differ because build timestamps vary. |
| Live artifacts | All three live download URLs return 200 with the expected MIME type. A real Chromium download completed with `failure: null`; both downloaded ZIPs pass `unzip -t`. |
| Core artifact exercise | The repository's clean-consumer helper test passes for a copied single-file helper; its NodeNext helper-ZIP type test passes. The packaged extension test passes 20 seeded layout cases, picker capture/Escape, persisted popup report, keyboard tabs, focusable JSON, and zero serious/critical popup axe findings. |
| Desktop and phone | Fresh 1440 × 900 and 390 × 844 live browser contexts have one `h1`, one `main`, `lang=en`, no horizontal overflow, no console/page errors, only first-party requests, and zero serious/critical axe findings. Reduced-motion computes zero transition/animation duration. |
| Keyboard/accessibility | Local suite confirms skip-link focus transfer, popup tab keyboard behavior, focusable code/JSON regions, and 44 px reviewed mobile targets. The live Playwright axe scans passed. The standalone `@axe-core/cli` could not run because its bundled ChromeDriver supports Chrome 152 while the supplied browser is Chrome 145; the repository's installed `@axe-core/playwright` integration was used instead. |
| Privacy | Initial live requests stayed on `viewport-fact-sheet.sociobot.in`. Local regression tests confirm `data:`, form-value, page-text, and ARIA-label sentinels are absent from reports. No analytics/CDN/runtime remote API or broad host permission was found. |
| Offline/update | A fresh live service worker cache `viewport-fact-sheet-v3` installed, `registration.update()` left no waiting/installing worker, and an offline reload after a controlled reload returned 200 with the expected landing title. The prior truthful uncached-artifact 503 test passes in the repository suite. |
| Links/legal | All live internal product/download/privacy/terms links return 200. `/privacy/` and `/terms/` have route-specific titles and legal content. `robots.txt` and `sitemap.xml` return 200. |
| 404 | Fails: the unknown-path evidence above returns a normal 200 landing page. |
| Backend checks | Not applicable: this is a static browser extension and helper with no product backend, tenant state, health endpoint, rate limiting, or SQLite service. |

## Earlier findings and current disposition

| Earlier finding | Current disposition |
| --- | --- |
| Live downloads returned fallback HTML or 404 | Fixed: all three return real files, and a browser download completed. |
| Helper required an unadvertised `engine.js` | Fixed: the advertised helper is self-contained and the ZIP has `index.mjs` plus `index.d.mts`. |
| ARIA text/data URL could leak page or form contents | Fixed: current privacy regressions pass and unsafe URL schemes serialize only their protocol. |
| Missing CSP/Permissions-Policy, skip focus, dependency audit | Fixed: headers are present, skip focus passes, and audit is clean. |
| Popup tab/JSON and mobile code-sample accessibility defects | Fixed: current packaged/live axe coverage reports no serious or critical violations. |
| Offline artifact returned HTML shell | Fixed: suite asserts a truthful `503 text/plain`. |
| P2: immutable cache on stable download filenames | Still open; recorded above. |
| P3: pre-build standalone typecheck failure | Still open; reproduced above. |

## Required next steps

1. Build a real `/demo` (or `?demo=1`) sample workspace with one-click entry, realistic populated inspection output, persistent sandbox label, Reset demo, Start for real, documented separate storage, and claim tests that prove no real state changes.
2. Add `.factory/claims.json`, remove unsupported marketing claims or add one isolated `@claim:<id>` demo-flow test and runnable command for every public claim.
3. Rewrite the first screen in plain words; implement a genuine 404; add required metadata, navigation/footer details, and cache-safe download URLs.
4. Make typechecking clean-checkout safe, then rerun the complete review.
