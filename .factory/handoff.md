# Viewport Fact Sheet — review 1: FAIL

Work order: `viewport-fact-sheet-review-1`
Implementation reviewed: `5823b4931e15d2f76accf4d3ea8729640054b2a7`
Documentation reviewed: `79f4dd8dfabf57ca064afaf8170d85aba7c66447`
Live URL: <https://viewport-fact-sheet.sociobot.in/>

Full evidence: `.factory/review-1.md`

## Result

**FAIL — 7 findings and at least 18 untested public claims.** No product code was changed during this review.

The prior download, helper packaging, privacy, accessibility, offline-artifact, and deployment repairs remain effective. `npm ci`, audit, `npm test`, release verification, live artifacts, fresh desktop/mobile browser checks, local axe integration, legal routes, privacy smoke checks, and offline reload passed.

The product still cannot pass the factory contract because it has no real one-click demo sandbox and no `.factory/claims.json` with isolated claim commands/tests. Other open work is a plain-words first-screen rewrite, real 404, required metadata/navigation/footer details, cache-safe download URLs, and a clean-checkout-safe standalone typecheck.

## How to verify current state

```bash
npm ci
npm audit --audit-level=high
npx tsc --noEmit       # fails before build: generated helper import is absent
npm test               # passes; builds first
npx tsc --noEmit       # passes after build
node scripts/verify-release.mjs
```

The live implementation byte-matches the current built static output for the landing page, service worker, main JS, and CSS. The three live downloads are usable; both ZIPs pass integrity checks. See the review for exact evidence and required repairs.
