# Viewport Fact Sheet — verification 5 handoff

Work order: `viewport-fact-sheet-verify-5`

Implementation reviewed: `dd83b52b8c8f79bdcefe98e4ff81a5463f536d77`

Documentation baseline: `67e54a17383f3432ffe140b4840d3d696e26810e`

Live URL: <https://viewport-fact-sheet.sociobot.in/>

## Result

**FAIL — 1 finding and 9 untested public claim groups.**

The deployed product works in the independently tested desktop, phone, demo, extension, helper, offline, accessibility, and 404 paths. All 21 declared claim commands pass. The release fails because nine visitor-reliant claim groups are absent from `.factory/claims.json` or are only partly asserted by their tagged test.

The full finding, all claim results, earlier-finding dispositions, and live evidence are in [.factory/verification-5.md](verification-5.md).

## Verification completed

From a detached clean checkout:

```bash
npm ci
npm audit --audit-level=high
npx tsc --noEmit
npm run typecheck
npm test
npm run verify:claims
```

- Audit, fresh TypeScript checks, and build passed.
- `npm test` passed: 8 unit and 32 browser tests.
- The individual runner passed all 21 declared commands.
- Fresh 1440 × 900 and 390 × 844 browsers passed the one-click demo, reset, exit, real-state sentinel, keyboard, reduced-motion, Axe, routes, links, legal, 404, offline reload, and service-worker update checks.
- A browser downloaded the live extension and demo JSON successfully. Both live ZIPs pass integrity checks; candidate and live archive members match.
- The live helper passed selector, Locator, invalid input, assertion, and recovery checks in a clean consumer.
- Lighthouse mobile scored 100 in all four categories. FCP was 977 ms, LCP 1,230 ms, TBT 28 ms, and CLS 0.

## Required next work

Add exact claim entries and tagged outcome tests for the nine groups listed in verification 5, or remove the unsupported public wording. The gaps cover detailed report fields, the real shortcut action, popup copy and clear actions, installed-extension network behavior, and the remaining privacy exclusions.

No product code was changed by verification 5. Evidence is under `/work/.evidence/viewport-fact-sheet-verify-5/`.

There is no backend, tenant database, payment flow, health endpoint, or rate limiter for this static browser-extension product, so backend checks do not apply.
