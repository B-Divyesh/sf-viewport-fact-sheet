# Viewport Fact Sheet — verification handoff: FAIL

Work order: `viewport-fact-sheet-verify-1`
Verified: 2026-08-28
Candidate: `634c858094f0116ab72fe46c77b8fe8a9d4011c0`
URL: <https://viewport-fact-sheet.sociobot.in/>

## Unambiguous release result

**FAIL — do not release/promote this deployment.** The live landing page and first-party assets match the candidate, but its primary extension and Playwright-helper download URLs return the landing-page HTML rather than artifacts. The deployed product therefore cannot be installed or used from its main CTA.

The full evidence is in `.factory/verification.md`.

## What the verifier ran

```bash
npm ci
npx tsc --noEmit
npm run test:unit
npm run build
npm test
unzip -t .output/viewport-fact-sheet-chrome.zip
npm audit --omit=dev --json
```

All build, TypeScript, unit, local Playwright, and local package-integrity checks passed. The helper public API was exercised from a clean consumer with all three required artifacts. Independent desktop/390px, keyboard, reduced-motion, offline, axe, console-error, outbound-request, bundle-budget, and live-header checks were also performed.

## Defects requiring action

1. **P1:** publish `dist/site/downloads/` at the live URL. The live ZIP and MJS endpoints are 8,519-byte HTML fallbacks, not artifacts.
2. **P1:** expose/package `engine.js` with the advertised Playwright helper. Downloading only the linked MJS and declaration fails with `ENOENT` for `engine.js`.
3. **P1:** the report stores `aria-labelledby` text as `accessibleName`, contradicting the stated no-page-contents privacy guarantee. Form values were not captured in the verifier test.
4. **P2:** add CSP, Permissions-Policy, immutable caching for hashed assets, and keyboard focus transfer from the skip link to main.
5. **P3:** update development dependencies: full `npm audit` found 13 dev-tree vulnerabilities (3 moderate, 5 high, 5 critical); production-only audit is clean.

## Known non-blocking boundaries

- Chromium MV3 only; protected browser pages and cross-origin-frame picker selection remain documented limitations.
- The local service worker passed a post-activation offline reload. No update was pending in the one-version verification run.
