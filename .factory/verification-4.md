# Independent verification 4 — PASS

Work order: `viewport-fact-sheet-verify-4`

Verified: 2026-08-28 06:26 UTC

Candidate commit: `894e7efd48f0148371f583836542fd1fc919a05f`

Live URL: <https://viewport-fact-sheet.sociobot.in/>

## Verdict

**PASS.** Fresh evidence shows that the exact candidate builds and tests cleanly, the downloaded browser extension and Playwright helper perform the researched job end to end, and the complete live deployment matches the candidate. The previous deployment-only failure is resolved: all three advertised downloads return the correct artifact types, a real Chromium download succeeds, and the live archive members are identical to the candidate build.

No release-blocking defect was found. Two non-blocking engineering findings are recorded below.

## Defects by severity

### P2 — unversioned download URLs are cached immutable for one year

All `/downloads/*` responses use `Cache-Control: public, max-age=31536000, immutable`, but the three download filenames contain neither a content hash nor a release version. A browser that has cached an earlier release can therefore reuse it for up to a year after a newer release is published at the same URL. The current candidate is served correctly to a fresh client, so this did not block this release verification. Before the next release, either version the download filenames or require revalidation instead of `immutable`.

### P3 — standalone TypeScript checking is build-order dependent

Immediately after a clean `npm ci`, `npx tsc --noEmit` fails with `TS2307` because `tests/e2e/engine.spec.ts` imports the generated `dist/playwright-helper/index.mjs`. The exact production build creates that file, after which the same type check passes. There is no `typecheck` or lint script and no lint configuration. `npm test` remains clean-checkout-safe because it builds before the browser tests. A future `typecheck` script should build the helper first or exclude the generated-output consumer test.

## Clean local verification

The candidate was checked out detached into a new temporary worktree. No product source was modified.

| Check | Fresh result |
| --- | --- |
| Environment | Node `v22.23.2`, npm `10.9.8`, Playwright `1.58.2`, supplied Chromium in `/opt/pw-browsers`. |
| Install and dependency audit | `npm ci` installed 196 packages (197 audited); `npm audit --audit-level=high` found 0 vulnerabilities. |
| Type/lint | Pre-build TypeScript coupling is noted above. After `npm run build`, `npx tsc --noEmit` passed. No lint script/config exists. |
| Exact production build | `npm run build` passed. It produced the MV3 extension, extension ZIP, self-contained helper, NodeNext declaration, helper ZIP, and complete `dist/site`; release verification reported all pages and three consumable downloads present. |
| Unit tests | 8/8 Vitest tests passed. |
| Complete suite | `npm test` passed: 8 unit tests and 11 Chromium tests in 30.3 s. This includes 20/20 seeded layout classifications, picker capture/Escape, real popup accessibility/keyboard behavior, clean helper isolation, privacy regression, NodeNext consumption, site desktop/mobile, legal pages, and offline behavior. |
| Package integrity | Both candidate ZIPs pass `unzip -t`. The extension archive contains a valid MV3 manifest and only `activeTab`, `scripting`, and `storage`; the helper archive contains `index.mjs` and `index.d.mts`. |

## Independent product exercise

### Browser extension

A real unpacked candidate extension was loaded in Chromium, without changing its manifest or permissions.

- `chrome.commands.getAll()` reported `Alt+Shift+V`; an OS-level keyboard event started the real picker on the deployed page.
- Selecting the highlighted heading produced and persisted a schema `1.0` report with `reachable: true`, `hitTest: target`, full visible area, and `no-blocking-condition-detected`.
- Reopening the popup rendered the persisted report. **Copy JSON** confirmed success, **Download JSON** produced parseable `viewport-fact-sheet-2026-08-28.json`, and **Clear** removed storage and restored the empty state.
- Starting from `chrome://extensions/` returned: `This browser page is protected. Open a normal website and try again.` The following authorized-page flow recovered normally.
- The packaged popup repository test independently passed named tab semantics, ArrowRight switching, focusable long JSON, and zero serious/critical axe findings.

### Playwright helper in a clean consumer

The published candidate helper ZIP was extracted into a separate npm consumer with Playwright 1.58.2, TypeScript 5.9.3, and Node types.

- Runtime imports from `index.mjs` and strict NodeNext type resolution through `index.d.mts` passed.
- Exact box geometry and padding/content measurements passed for a normal target.
- A 50%-visible viewport boundary returned ratio `0.5`; an overflow container reported both clip and scroll chains; a covered element returned `occluded-at-visible-center` and was not reachable.
- Both CSS selectors and Playwright `Locator` inputs worked.
- Malformed and missing selectors rejected; `assertViewportReachable` included `below-viewport`; a subsequent valid request recovered.
- Form-label, form-value, and ARIA-label sentinels were absent from serialized reports. The separately disclosed document title remained present.

## Live deployment evidence

### Candidate identity and downloads

- Live `index.html` is 8,709 bytes with SHA-256 `b7d2ef70d93a7ae0046699c42c60080d73f29530ec888cd061d3d6885cdde489`, exactly matching the candidate build.
- Live `sw.js` is 1,396 bytes with SHA-256 `441096e81596c967da15816b8561073bb4e023280836ca6c6ee70426484cc44a`, exactly matching.
- Every public JS, CSS, WebP, legal-page, favicon, robots, and sitemap file byte-matches `dist/site`.
- Extension ZIP: `200 application/zip`, 30,281 bytes, live SHA-256 `c6ef82c8a428fa317d4b2e99f71c7f9c7833e128e76f196cfa1f32b85bb85429`.
- Single-file helper: `200 text/javascript`, 6,640 bytes, SHA-256 `b3bfb05f6b8a4e7095f81512dc4f509e4b34cfdbe3ad0417bda13ee902b98d28`, exactly matching the candidate.
- Helper ZIP: `200 application/zip`, 3,601 bytes, live SHA-256 `732f962990cd4578acc6fa187240cbcea796541a36862f1449023290a7dfc995`.
- ZIP container hashes vary between builds because ZIP timestamps are not reproducible. Independent extraction and recursive comparison found every live extension/helper archive member identical to the candidate, and both live archives pass `unzip -t`.
- The real **Download for Chromium** link completed with no browser failure, the expected filename, 30,281 bytes, and the live extension hash above.

### Desktop, mobile, keyboard, and accessibility

- At 1440 × 900 and 390 × 844, the landing page has `lang="en"`, a descriptive title, exactly one `h1`, exactly one `main`, 16 px body text, no missing image alt attributes, and zero horizontal overflow.
- Visual inspection at both sizes matches the blueprint drafting thesis. Mobile intentionally hides the secondary header navigation, stacks the product story, keeps the primary actions, and has no clipped content.
- Axe 4.10.2 reported 0 serious/critical findings on the live landing page at both sizes and on `/privacy/` and `/terms/` at both sizes. The legal pages also have one `h1`, one `main`, and no horizontal overflow.
- First Tab focuses the skip link with a 3 px visible outline; Enter moves focus to `main`. All visible mobile targets checked are at least 44 px high. Reduced-motion emulation computes `0s` transition/animation and no transform.
- The factory `verify-url.sh` passed: HTTP 200, 968 ms load, no console/page errors, title/lang/main present, one `h1`, zero missing alt attributes, and zero unlabeled buttons.

### Privacy, network, response policy, and PWA

- Initial browser loads contacted only `https://viewport-fact-sheet.sociobot.in`; no analytics, telemetry, remote API, third-party script, CDN font, cookie access, or network-body capture was found.
- Source/manifest inspection confirms user-triggered `activeTab` access, local extension storage only, and no persistent host permission. Query/fragment and non-web-URL payload regressions pass; form values and page/ARIA text sentinels remain absent.
- Documents, assets, workers, and downloads carry CSP, Permissions-Policy, Referrer-Policy, `nosniff`, frame denial, and HSTS. Hashed assets are one-year immutable; documents revalidate after 30 seconds; `sw.js` is `no-cache`. The unversioned-download concern is recorded above.
- The live service worker controls the page and `registration.update()` completes. Offline reload preserves the product title, displays the offline notice, and an uncached extension-artifact request returns `503 text/plain` with `Offline: this resource is not cached.`

### Performance and budgets

Lighthouse 12.8.2 mobile scored Performance **99**, Accessibility **100**, Best Practices **100**, and SEO **100**. FCP was 0.9 s, LCP 1.2 s, TBT 100 ms, CLS 0, Speed Index 1.2 s, and total transfer 74 KiB.

Candidate raw budgets are well inside the contract: initial JS is 893 + 630 bytes, primary CSS is 13,671 bytes, mobile/desktop hero images are 18,088/44,124 bytes, and no web font is loaded.

## Conclusion

The candidate satisfies the researched smallest useful product and the repository definition of done. The extension and helper provide deterministic geometry, clipping/scroll-chain, hit-test, and viewport-reachability evidence; all 20 seeded cases classify correctly; privacy constraints hold; and the live install/export workflows work. Release result: **PASS**.
