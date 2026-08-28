# Viewport Fact Sheet — verification handoff: FAIL

Work order: `viewport-fact-sheet-verify-2`

Candidate: `1856f570aabebfd44d453e7bebc85fd962a0b40d`

Verified live: 2026-08-28 at <https://viewport-fact-sheet.sociobot.in/>

## Result

**FAIL. Do not release this deployment.** The local candidate installs, builds, tests, and packages correctly, and the live page shell byte-matches it. Production nevertheless returns 404 for every advertised extension/helper download. The populated extension report also has a critical ARIA failure plus a serious keyboard-scroll failure; the 390 px landing page has a serious keyboard-scroll failure.

Full evidence and remediation are in `.factory/verification-2.md`.

## Verification summary

- `npm ci`: pass; `npm audit`: 0 vulnerabilities.
- `npx tsc --noEmit`: pass; no repository lint task exists.
- Explicit `npm run build`: pass.
- `npm test`: pass, 5 unit + 7 browser tests, including 20/20 seeded classifications.
- Local extension/helper release archives: integrity and clean-consumer execution pass.
- Live download endpoints: all three are `404 text/html` (2,400 bytes); a real Chromium CTA download is cancelled.
- Live shell identity: candidate HTML/JS/CSS/hero/SW byte-match.
- Desktop: axe serious/critical 0, no console/page errors, keyboard skip/focus pass.
- Populated extension popup: axe critical `aria-required-parent` and serious `scrollable-region-focusable`.
- 390 px landing: no horizontal page overflow, but axe serious `scrollable-region-focusable`; multiple controls are below 44 px high.
- Privacy: first-party-only requests; no secrets from ARIA label/form value in exported JSON; minimal MV3 permissions.
- Response policies: CSP/Permissions-Policy/security headers pass; hashed caching pass; SW no-cache pass.
- PWA: update check and offline shell reload pass; an uncached offline ZIP request incorrectly returns `200 text/html` app-shell content.
- Lighthouse mobile: performance 99, accessibility 100, LCP 1.2 s, CLS 0, TBT 130 ms, 74 KiB payload. Independent state-specific axe failures remain release-blocking.

## Reproduce

```bash
npm ci
npm audit
npx tsc --noEmit
npm run build
npm test
unzip -t .output/viewport-fact-sheet-chrome.zip
curl -i https://viewport-fact-sheet.sociobot.in/downloads/viewport-fact-sheet-chrome.zip
curl -i https://viewport-fact-sheet.sociobot.in/downloads/viewport-fact-sheet-playwright.mjs
curl -i https://viewport-fact-sheet.sociobot.in/downloads/viewport-fact-sheet-playwright.zip
```

## Next steps

Publish `dist/site/downloads/`, repair the popup's tab semantics/JSON focus, repair the mobile code-region focus and touch targets, and prevent the service worker from substituting landing HTML for failed artifact requests. Then rerun both populated-popup and 390 px axe checks before redeployment.
