# Viewport Fact Sheet — build handoff

Work order: `viewport-fact-sheet-build-1`
Completed: 2026-08-28

## What shipped

- A WXT + TypeScript Manifest V3 Chromium extension with `activeTab`, `scripting`, and local `storage` permissions only.
- A page picker activated from the popup or `Alt+Shift+V`, with exact hover geometry, click-to-capture, and Esc cancellation.
- A versioned JSON fact sheet containing target identity, box model, viewport/document coordinates, centre delta, visibility ratio, relevant computed styles, clipping ancestors, scroll ancestors, and centre-point stacking hit test.
- Explicit reachability verdicts and reason codes for CSS invisibility, zero size, each off-screen direction, partial viewport intersection, ancestor clipping, occlusion, inherited zero opacity, pointer-event blocking, and hit-test mismatch.
- A popup with empty, picking, captured, cancelled, protected-page error, and cleared states; summary/JSON keyboard tabs; copy and file export.
- A Playwright helper with `installViewportFactSheet`, `getViewportFactSheet`, and `assertViewportReachable` APIs, built with the same engine as the extension.
- A responsive blueprint-drafting landing site, `/privacy/`, `/terms/`, offline shell caching, downloadable extension zip, and helper artifacts.
- Original generated hero art plus hand-authored extension icons. Prompt, model route, date, and provenance are recorded in `.factory/design.md` and `assets/src/`.

## Privacy and security

The picker runs only after an explicit toolbar/shortcut action and declares no persistent host permissions. Reports stay in `chrome.storage.local`. The engine does not capture text content, inputs, form values, cookies, screenshots, or network data; page query strings and fragments are omitted. The site has no analytics, third-party runtime scripts, fonts, or CDN dependencies. `npm audit --omit=dev` reports 0 production vulnerabilities.

## Build and verification

```bash
npm install
npm test
npm run build
```

The exact static deploy output is `dist/site/` with `dist/site/index.html` at its root. Extension unpacked output is `.output/chrome-mv3/`; the packaged archive is `.output/viewport-fact-sheet-chrome.zip` and is copied to `dist/site/downloads/`.

Verification completed locally:

- TypeScript: `npx tsc --noEmit` — pass.
- Unit tests: 3/3 pass.
- Playwright: 5/5 pass, including picker capture/cancel, mobile at 390 × 844, legal routes, console-error check, axe scan, and exact classification of all 20 seeded layout cases (target ≥18).
- Axe: 0 serious or critical violations on the landing page.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.5 s, CLS 0, TBT 0 ms.
- Initial site JS: 1.34 KB raw / 0.67 KB gzip; CSS: 13.18 KB raw / 3.68 KB gzip.
- Hero imagery: 18 KB mobile WebP and 44 KB desktop WebP; explicit dimensions and high-priority LCP preload.
- Extension bundle: 42 KB uncompressed files / 30 KB zip, with the 8.1 KB picker engine.

## Known gaps

- V1 targets Chromium MV3; Firefox packaging is not included.
- Browser-protected URLs cannot be inspected by design.
- The top-document picker cannot cross into cross-origin iframes. The Playwright helper can still inspect a locator inside a selected frame.
- Hit testing is a deterministic centre-point sample of the currently visible box. Highly irregular shapes may require checking more points in a future schema version.
- Store signing and publication are factory deployment steps; the site currently provides the installable unpacked zip.

## Suggested next steps

Add multi-point hit-test sampling for irregular shapes, Firefox packaging, and optional user-controlled history export. No backend or billing work is needed for the free v1.
