# Viewport Fact Sheet — independent verification 4: PASS

Work order: `viewport-fact-sheet-verify-4`

Verified candidate: `894e7efd48f0148371f583836542fd1fc919a05f`

Verified live URL: <https://viewport-fact-sheet.sociobot.in/>

Full evidence: `.factory/verification-4.md`

## Result

**PASS.** Fresh clean-checkout, packaged-product, clean-consumer, and live-browser evidence confirms that the candidate works end to end and that the earlier deployment-only failure is resolved. All advertised artifacts are live and consumable, the real extension keyboard/picker/export workflow works, the helper handles normal/boundary/error/recovery cases, all 20 seeded classifications pass, and the privacy constraints hold.

## How verified

```bash
npm ci
npm audit --audit-level=high
npm run build
npx tsc --noEmit
npm test
node scripts/verify-release.mjs
unzip -t .output/viewport-fact-sheet-chrome.zip
unzip -t dist/site/downloads/viewport-fact-sheet-playwright.zip
```

- Install/audit: 0 vulnerabilities.
- Build: exact production build passed and produced the complete `dist/site` plus extension/helper packages.
- Tests: 8 Vitest + 11 Chromium tests passed; seeded classification is 20/20.
- Independent extension: real OS `Alt+Shift+V` picker, persisted popup result, Copy JSON, Download JSON, Clear, protected-page error, and recovery passed.
- Independent helper: a clean consumer passed runtime, NodeNext types, normal/partial/clipped/occluded cases, invalid/missing input, assertion failure, recovery, and privacy sentinels.
- Live identity: all deterministic public files byte-match the candidate; every member of both live ZIPs matches the candidate. All three downloads return 200 with correct MIME types and a real browser download succeeds.
- Accessibility/UI: desktop and 390 px mobile have no overflow, console/page errors, or axe serious/critical findings; keyboard skip/focus, 44 px mobile targets, reduced motion, legal pages, and factory URL verification pass.
- Privacy/policy: first-party-only runtime requests, minimal MV3 permissions, local-only extension persistence, CSP/Permissions-Policy/HSTS/referrer/nosniff/frame protections, and no form-value/body-label/ARIA-label sentinels; the separately disclosed page title remains in reports.
- PWA/performance: controlled offline reload and service-worker update pass; uncached offline artifact is truthful `503 text/plain`. Lighthouse mobile: 99 performance, 100 accessibility, 100 best practices, 100 SEO; LCP 1.2 s, TBT 100 ms, CLS 0, total 74 KiB.

## Non-blocking findings / next steps

1. Stable `/downloads/*` filenames currently receive one-year `immutable` caching. Before publishing another version, use versioned/content-hashed filenames or revalidation caching so existing users cannot retain an older artifact for a year (P2).
2. A clean pre-build `npx tsc --noEmit` cannot resolve generated `dist/playwright-helper/index.mjs`; it passes after `npm run build`. Add a formal typecheck script that builds the helper first or excludes that generated-output test (P3). There is no lint script/config.

No product code was changed during verification.
