# Verification 5 — explain why an element misses the viewport

Work order: `viewport-fact-sheet-verify-5`

Verified: 2026-09-06 04:46 UTC

Implementation candidate: `dd83b52b8c8f79bdcefe98e4ff81a5463f536d77`

Documentation baseline: `67e54a17383f3432ffe140b4840d3d696e26810e`

Live URL: <https://viewport-fact-sheet.sociobot.in/>

## Result

**FAIL — 1 finding and 9 untested public claim groups.**

The deployed product works in the tested desktop, phone, extension, helper, demo, offline, and error paths. All 21 commands declared in `.factory/claims.json` pass independently. The release still fails the claims contract because public copy promises nine outcomes or field groups that have no matching claim entry or are only partly asserted by the named claim test.

## Job, audience, and first action

The job is to explain why a browser element is clipped, offset, or unreachable in the current viewport. The audience is frontend engineers and test authors.

Before scrolling in fresh 1440 × 900 and 390 × 844 browsers, the page showed:

- `Explain why an element misses the viewport`;
- the audience sentence naming frontend engineers and test authors;
- `Try it with sample data` and `Opens a populated inspection report.`; and
- three separate facts about price, local use, and excluded content.

All four blocks fit inside both first viewports. The sample action opened `/demo/`. On the phone, the populated report began at y=509 in the 844 px viewport and already showed `Not reachable` and `37%`.

## Finding

### P1 — nine public claim groups do not have complete claim tests

The claim runner is green, but its assertions are narrower than the public copy. The claims contract requires every visitor-reliant outcome to have one tagged test that proves that outcome, not only that a related field or control exists.

| Public claim group | Public location | Missing proof |
| --- | --- | --- |
| Content box, document offset, viewport position, centre delta, and visible-area ratio | Landing report fields and privacy data list | `@claim:box-geometry` checks only border-box width and height. |
| Overflow mode, scroll extent, current offset, and clipped edges | Landing clip and scroll fields | `@claim:clipping-scroll-chain` checks only that one ancestor selector appears in each chain. |
| Computed visibility, viewport intersection, and pointer events | Landing reachability fields | `@claim:hit-test-reachability` checks an occluded hit, verdict, and reason only. |
| Position, insets, transform, z-index, box sizing, margins, borders, and padding | Landing style-delta fields | No claim entry or tagged test covers this field group. |
| Pressing `Alt+Shift+V` starts the picker | Landing workflow and README | `@claim:extension-shortcut` checks only the manifest's suggested-key string. It does not perform the promised action. |
| Copying a versioned report from the extension | Landing workflow | `@claim:json-export` downloads demo JSON only. It does not exercise the popup's `Copy JSON` action. |
| Choosing `Clear` deletes the stored extension report | Privacy policy | No claim entry or tagged test exercises this deletion path. |
| The extension has no analytics, remote API, account, or telemetry and runs locally | Landing facts and privacy policy | `@claim:local-only-requests` records static demo requests only, not an installed extension inspection flow. |
| Reports exclude cookies, network bodies, screenshots, and URL fragments | Landing, README, and privacy policy | The content test checks page text, ARIA labels, and form values; the URL test checks a query string. The remaining exclusions are not asserted by a claim test. |

These are claim-proof gaps, not evidence that the current runtime emits or omits the wrong fields. They are release findings because incomplete and unlisted public claims explicitly fail this work order. Add exact outcome tests and registry entries, or remove the unsupported copy.

## Declared claim command results

Each command was run independently from a detached clean checkout after `npm ci`. The complete command log ends with `Verified 21 declared claims.` and exit code 0.

| Claim ID | Command result | Outcome asserted by the current test |
| --- | --- | --- |
| `box-geometry` | Pass | Border-box width and height are populated. |
| `clipping-scroll-chain` | Pass | The seeded clipper appears in both ancestor lists. |
| `hit-test-reachability` | Pass | The seeded panel is occluded and not reachable. |
| `json-export` | Pass | Demo JSON downloads with schema 1.0 and an unreachable verdict. |
| `free-download` | Pass | The extension archive is public ZIP data. |
| `demo-isolation` | Pass | The demo namespace leaves a real-state sentinel unchanged. |
| `demo-banner` | Pass | The sample-data label remains visible after scrolling. |
| `demo-exit` | Pass | Start for real removes the demo key. |
| `demo-reset` | Pass | Reset restores the 37% report and announces completion. |
| `no-content-capture` | Pass | Page text, ARIA text, and form values are absent. |
| `url-sanitization` | Pass | A query string is absent from the report URL. |
| `local-only-requests` | Pass | The demo load and reset use only the local test origin. |
| `no-site-cookies` | Pass | The demo leaves `document.cookie` empty. |
| `extension-shortcut` | Pass | The manifest contains `Alt+Shift+V`. |
| `extension-report-storage` | Pass | A seeded report survives popup reload in extension storage. |
| `playwright-selector` | Pass | The helper accepts a selector. |
| `playwright-locator` | Pass | The helper accepts a Locator. |
| `reason-codes` | Pass | A failed assertion includes a clipping or occlusion reason. |
| `helper-types` | Pass | The helper ZIP contains `index.d.mts`. |
| `demo-keyboard` | Pass | The phone report download control is focusable and 44 px tall. |
| `offline-demo` | Pass | A dedicated demo context reloads offline. |

Evidence: `/work/.evidence/viewport-fact-sheet-verify-5/claims-full.log` and `claims-summary.txt`.

## Product checks

### Clean build and test

- Environment: Node `v22.23.2`, npm `10.9.8`, Playwright `1.58.2`.
- `npm ci`: pass, 196 packages installed.
- `npm audit --audit-level=high`: pass, zero vulnerabilities.
- Fresh pre-build `npx tsc --noEmit`: pass.
- `npm run typecheck`: pass.
- `npm test`: pass, 8 unit tests and 32 browser tests.
- `npm run build`: pass and produces `dist/site`, both downloadable ZIPs, the helper, and the MV3 extension.
- The suite classified all 20 seeded layout cases correctly and covered picker capture and Escape, invalid helper selectors, missing selectors, recovery, NodeNext consumption, popup persistence, keyboard behavior, and accessibility.

### Live demo and real data isolation

- Fresh desktop and phone sessions entered the sample in one click.
- Both showed the populated checkout report, `Not reachable`, 37% visible area, the clipping ancestor, centre hit, reason code, and a concrete first fix.
- The sticky `Demo — sample data, nothing is saved` label remained visible at the page end.
- Reset restored a changed 12% value to 37% and announced `Sample report reset.`.
- A seeded `vfs:real:workspace` sentinel was unchanged by entering, changing, resetting, and leaving the demo.
- Start for real deleted `demo:vfs:workspace` and kept the real-state sentinel.
- The sample JSON download completed as `viewport-fact-sheet-demo.json`, parsed as schema `1.0`, and contained `reachable: false`.

### Live extension and helper artifacts

- The browser downloaded `viewport-fact-sheet-chrome.zip` with no failure, ZIP magic, and 30,281 bytes.
- Both live ZIPs pass `unzip -t`. Every extracted extension member matches the clean candidate build. The live helper's `index.mjs` and `index.d.mts` match the candidate.
- A clean consumer imported the live single-file helper. Selector and Locator inputs returned the expected clipped/occluded report. Malformed and missing selectors rejected, a later valid request recovered, and the reachability assertion included a reason code.
- The current repository suite loaded the real MV3 package, persisted a report, reloaded the popup, used its tab keyboard behavior, focused the JSON region, and found no serious or critical popup Axe issue.
- Extension code and packaged members are unchanged from independent verification 4, which also proved the real shortcut, picker selection, protected-page error, recovery, download, and clear paths. Current artifact identity makes those earlier dispositions still applicable.

### Desktop, phone, keyboard, accessibility, and motion

- Fresh 1440 × 900 and 390 × 844 sessions had no horizontal overflow, console errors, page errors, or cross-origin requests.
- Landing, demo, privacy, and terms each have `lang=en`, one `h1`, one `main`, route-specific titles, and valid navigation.
- The first Tab exposed a designed skip link; Enter focused `main`. The demo JSON control remained focusable and at least 44 px tall on phone.
- Reduced-motion emulation computed zero-duration transition and animation with no transform.
- Playwright Axe found zero serious or critical issues on desktop and phone landing/demo pages and on all normal routes. The factory URL verifier found no console errors, missing image alt text, or unlabeled buttons.
- Lighthouse mobile scored 100 for Performance, Accessibility, Best Practices, and SEO. FCP was 977 ms, LCP 1,230 ms, TBT 28 ms, CLS 0, and transfer size 76,741 bytes.

### Routes, links, privacy, offline, and 404

- All internal product, legal, and download links returned 200. The external source link returned 200.
- `/privacy/` and `/terms/` have their own titles and complete page structure.
- An unknown URL returned HTTP 404 with `Page not found — Viewport Fact Sheet`, a designed product-styled page, and a working home action. This expected 404 is not a defect.
- The service worker controlled `/demo/`; `registration.update()` left no waiting or installing worker. The populated demo reloaded offline.
- In a separate fresh browser, an uncached extension request while offline returned `503 text/plain` and `Offline: this resource is not cached.`.
- Live desktop and phone flows made only same-origin requests and set no site cookies. The installed extension requests only `activeTab`, `scripting`, and `storage`, with no persistent host permission.

### Candidate and live identity

Only `.factory/handoff.md` differs between implementation SHA `dd83b52b8c8f79bdcefe98e4ff81a5463f536d77` and documentation SHA `67e54a17383f3432ffe140b4840d3d696e26810e`.

The live landing HTML, demo HTML, service worker, and helper byte-match the clean build. Extracted live archive members also match. ZIP container hashes may differ because packaging timestamps are not reproducible. The reviewed live runtime is therefore the stated implementation candidate; the later documentation commit does not require another product image.

## Earlier findings

| Earlier finding | Current disposition |
| --- | --- |
| Downloads returned fallback HTML or 404 | Fixed. All live files return their advertised types; browser download and archive integrity pass. |
| Helper needed an unadvertised `engine.js` | Fixed. The public helper is a self-contained file and the ZIP includes NodeNext types. |
| ARIA text or `data:` payloads leaked page and form contents | Fixed. Current privacy regressions pass for page, ARIA, form, and unsafe URL payload sentinels. |
| Missing response policies, weak skip navigation, vulnerable development dependencies | Fixed. Headers, skip focus, and zero-vulnerability audit pass. |
| Popup tab/JSON accessibility, mobile code scrolling, and short touch targets | Fixed. Current suite and live Axe scans pass; reviewed phone controls meet 44 px. |
| Offline artifact requests returned the HTML shell | Fixed. A fresh browser received a truthful 503 text response. |
| Stable download names were cached immutable for one year | Fixed. Live downloads use `public, max-age=0, must-revalidate`. |
| Standalone TypeScript checking needed a prior build | Fixed. Fresh `npx tsc --noEmit` and the documented typecheck both pass. |
| No demo, first-screen contract gaps, no real 404, incomplete metadata and navigation | Fixed. Fresh live checks pass each path. |
| No claims registry and at least 18 untested public claims | Partly fixed. The registry now has 21 unique commands and all pass, but the nine incomplete or unlisted public groups above remain. |

## Scope

This is a static site, browser extension, and Playwright helper. It has no product backend, tenant database, payment flow, health endpoint, or rate limiter. Backend tenant isolation, restart persistence, SQLite, and 429 checks do not apply. No AI feature is expected for this deterministic geometry job.

## Evidence

Evidence is in `/work/.evidence/viewport-fact-sheet-verify-5/`, including desktop and phone screenshots, 404 screenshots, live browser results, browser downloads, live helper results, archive copies, full claim logs, offline results, URL verification, and Lighthouse JSON.

## Final verdict

**FAIL.** Finding count: **1**. Untested public claim count: **9**. The product cannot pass until every public claim above has a complete tagged claim test or is removed from public copy.
