# Independent verification 3 — FAIL

Work order: `viewport-fact-sheet-verify-3`

Verified: 2026-08-28 05:04 UTC

Candidate commit: `e94a6b39ec176c0d782bfc7c7505d0420747b7fb`

Live URL: <https://viewport-fact-sheet.sociobot.in/>

## Verdict

**FAIL.** The exact candidate builds cleanly, all repository tests pass, and the live landing-page shell and service worker byte-match the candidate. The production release is nevertheless not usable for its core job: each advertised installer/helper download returns `404 text/html`, and the Chromium download CTA creates a cancelled download. Independently, the public Playwright helper can include form values and page text in a fact sheet on a `data:` page through its supposedly safe URL field. That violates the brief's privacy constraint.

This is fresh evidence and supersedes the previous PASS handoff. No product code was modified during verification.

## Release-blocking defects

### P1 — every advertised production artifact is missing

Fresh `curl -I` requests at 05:04 UTC returned `HTTP/2 404` and `content-type: text/html` for all three site links:

- `/downloads/viewport-fact-sheet-chrome.zip`
- `/downloads/viewport-fact-sheet-playwright.mjs`
- `/downloads/viewport-fact-sheet-playwright.zip`

The page still advertises these files. A real Chromium click on **Download for Chromium** suggested `viewport-fact-sheet-chrome.zip` but returned `failure=canceled`; no usable file was delivered. This prevents both supported installation paths from starting.

The local candidate artifacts are valid, showing this is a publication failure: the extension archive (30,229 bytes) and helper ZIP pass `unzip -t`; the self-contained helper is 6,477 bytes. Their local SHA-256 values are respectively `66958d051027311cdf976557fdaa234538b1f904415a5734a01d2ca3c9dd2310`, `b0022c9da4803561d6d543c06edcfe2072a4ed1b5ab4f7e072259707d46e7ee7`, and `6c00e5c3f61697875fa82de4d408da3046131640a70175c3255367c8317622b1`.

### P1 — the Playwright helper leaks form contents on `data:` pages

The helper represents the recorded page as `${location.origin}${location.pathname}`. For a `data:text/html,...` document, `location.pathname` is the document payload. A clean Playwright consumer opened a data page whose label and input value contained two unique privacy sentinels, called `getViewportFactSheet(page, '#recovery')`, and serialized the returned report. Both sentinels occurred in `report.page.url`; they were not present in the target facts themselves.

This directly contradicts the product's documented and brief-level guarantee that reports do not capture page text or form values. It is especially relevant to the advertised Playwright API, which can legitimately inspect `data:` test fixtures. The report must never serialize data-URL payloads; use a safe scheme/origin/path representation that omits the payload.

## Other defects

### P2 — the advertised helper type definition is not consumable by standard NodeNext TypeScript imports

The Helper + types ZIP contains `index.mjs` and `index.d.ts`. In a clean consumer with TypeScript 5.9.3 and `module`/`moduleResolution: NodeNext`, `import { getViewportFactSheet } from './index.mjs'` fails with `TS7016`: no declaration file for `./index.mjs`. For an `.mjs` implementation, NodeNext expects a corresponding `.d.mts` declaration (or package metadata mapping types). The runtime API works, but the advertised optional type definition does not resolve in the normal ESM workflow.

## Verification evidence

| Area | Result |
| --- | --- |
| Clean checkout | Started clean at the exact requested SHA; only this verification report and handoff were subsequently changed. |
| Environment | Node `v22.23.2`, npm `10.9.8`, Playwright `1.58.2`, Chromium from the supplied browser set. |
| Install / audit / type | `npm ci`, `npm audit --audit-level=high` (0 vulnerabilities), and `npx tsc --noEmit` all pass. There is no lint script or lint configuration. |
| Exact production build | `npm run build` passes and produces `.output/chrome-mv3`, both ZIPs, `dist/playwright-helper`, and `dist/site`. |
| Repository suite | `npm test` passes: 6 Vitest tests and 9 Chromium tests. It includes all 20 seeded layout classifications, picker click/Escape, packaged popup axe, helper isolation, desktop/mobile site axe, artifacts, offline behavior, and legal pages. |
| Independent helper E2E | Normal reachable, below-viewport, 50%-partial, zero-size, and clipped cases returned the expected reason codes. Both selector and `Locator` inputs work. A malformed selector rejects, and a following valid call succeeds. `assertViewportReachable` reports the below-viewport reason. |
| Extension | The real unpacked MV3 popup test passes with a populated report: valid named tablist, ArrowRight tab switch, focusable JSON, and no axe serious/critical findings. Manifest v3 has only `activeTab`, `scripting`, and `storage`; no host permission. |
| Local privacy | A conventional document containing input and ARIA-label sentinels does not emit either sentinel; query strings/fragments are stripped. The `data:`-scheme exception above is the release blocker. Source inspection found no analytics, remote API, third-party fonts/scripts, cookie access, or network-body capture. Extension persistence uses `chrome.storage.local`. |
| Live identity | Live `/` SHA-256 `b7d2ef70d93a7ae0046699c42c60080d73f29530ec888cd061d3d6885cdde489` exactly matches `dist/site/index.html`; live `/sw.js` SHA-256 `441096e81596c967da15816b8561073bb4e023280836ca6c6ee70426484cc44a` exactly matches the build. Identity is incomplete because production artifacts are absent. |
| Live desktop / mobile | Desktop 1440px and 390x844 mobile render without horizontal overflow; visual review matches the blueprint drafting thesis and preserves the mobile stack. Both live axe scans have zero serious/critical findings, zero console errors, and zero page errors. |
| Keyboard / motion | The first Tab visibly focuses the skip link (3px `rgb(5, 97, 123)` outline); Enter focuses `main`. At 390px all reviewed header/helper/footer targets are at least 44px tall. Reduced-motion computes `0s` transition/animation and `transform: none`. |
| Live requests / privacy | Initial browser requests contacted only `https://viewport-fact-sheet.sociobot.in`; no third-party runtime request or analytics was observed. |
| Policies / caching | Root, service worker, assets, and legal pages return CSP, Permissions-Policy, Referrer-Policy, nosniff, frame denial, and HSTS. Assets are immutable for one year; `sw.js` is `no-cache`; documents revalidate at 30 seconds. The missing-download 404 responses naturally do not carry the intended release artifact policy. |
| PWA behavior | Live service worker `/sw.js` controls the page. With the browser offline, an uncached artifact returns truthful `503 text/plain` (`Offline: this resource is not cached.`), not HTML. |
| Budget | Initial site JS is 893 bytes raw, primary CSS 13,671 bytes raw, mobile hero 18,088 bytes, and no web font is loaded—within the stated budgets. |

## Required release actions

1. Publish the complete `dist/site/downloads/` directory verbatim, then verify all three public URLs return `200`, their correct MIME types, byte-match the release, and yield usable browser downloads.
2. Fix `data:` URL sanitization in the shared inspector/helper so a report cannot contain URL payload, form value, or document text for any scheme; add a regression test with unique sentinels.
3. Ship helper declarations in an ESM-resolvable form (for example `index.d.mts`) and test a clean NodeNext consumer import from the published ZIP.
4. Re-run independent live verification after deployment; do not mark the release PASS until the production artifacts and privacy regression pass.
