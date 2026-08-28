# Viewport Fact Sheet

Viewport Fact Sheet is a local-first Chromium extension and Playwright helper for frontend engineers and test authors who need deterministic evidence for why an element is visible, clipped, offset, occluded, or unreachable in the current viewport.

It reports the box model and coordinates, relevant computed styles, clipping and scroll ancestors, visible-area ratio, centre-point hit test, and a concise verdict with stable reason codes.

The extension never reads form values, page text (including ARIA labels), or network bodies. It strips query strings and fragments from recorded URLs, runs only after a toolbar action or keyboard shortcut, and keeps only the latest report in local extension storage.

## Install the built extension

1. Run `npm install && npm run build`.
2. Open `chrome://extensions`, enable **Developer mode**, and choose **Load unpacked**.
3. Select `.output/chrome-mv3`.
4. On a normal web page, open the toolbar popup and choose **Pick element**. Click the element or press **Esc** to cancel. `Alt+Shift+V` starts the picker from the keyboard.

The packaged archive is `.output/viewport-fact-sheet-chrome.zip` and is also copied to `dist/site/downloads/`.

## Playwright helper

After a build, copy `dist/playwright-helper/index.mjs` into your test project. It is a self-contained helper; `index.d.ts` is optional editor type information. The site also offers `viewport-fact-sheet-playwright.zip` containing both files.

```ts
import { getViewportFactSheet, assertViewportReachable } from './index.mjs';

const facts = await getViewportFactSheet(page, page.getByRole('button', { name: 'Pay now' }));
expect(facts.verdict.reachable).toBe(true);

await assertViewportReachable(page, '#checkout');
```

The helper accepts a CSS selector or Playwright `Locator` and returns the same versioned JSON report as the extension.

## Develop, test, and build

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
npm run test:unit
npm run build        # dist/site plus .output/chrome-mv3
npm test             # unit tests, clean build, Playwright + axe checks
```

`npm run build:site` writes the deployable static site to `dist/site/`, with `index.html` at that root. The full build also places extension and helper downloads there. Publish the complete `dist/site/` directory, including `downloads/`, `_headers`, and `staticwebapp.config.json`, verbatim. The Azure configuration excludes downloads from SPA fallback, assigns their MIME types, and sets the response policies. The browser suite covers 20 seeded layout classifications, desktop and 390 px mobile rendering, legal routes, serious/critical axe findings, console errors, keyboard skip focus, download contents, and privacy-safe reports.

## Project layout

- `src/inspector.ts` — shared inspection engine
- `src/injected.ts` — keyboard-accessible page picker
- `entrypoints/` — WXT MV3 background and popup
- `playwright-helper/` — Playwright API
- `site/` — static product, privacy, and terms pages
- `tests/` — unit and browser checks
- `.factory/design.md` — visual system and asset provenance
- `.factory/handoff.md` — verification and known gaps

## Privacy and browser support

V1 targets Chromium Manifest V3. Protected browser pages cannot be inspected. Elements inside cross-origin iframes cannot be selected from the top document.

See the deployed [privacy policy](https://viewport-fact-sheet.sociobot.in/privacy/) and [terms](https://viewport-fact-sheet.sociobot.in/terms/).

## Deployment

Deploy `dist/site/` as a static site at `https://viewport-fact-sheet.sociobot.in`.

## License

MIT. See [LICENSE](LICENSE).
