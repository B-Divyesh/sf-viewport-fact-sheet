# Viewport Fact Sheet

Viewport Fact Sheet explains why a browser element is visible, clipped, offset, or unreachable in the current viewport. It is for frontend engineers and test authors who need a checkable layout reason before changing CSS or writing a test.

The Chromium extension and Playwright helper record box geometry, clipping and scroll ancestors, a centre-point hit test, and reachability reason codes. Reports exclude page text, ARIA labels, form values, query strings, and URL fragments.

## Try the sample

Open `/demo/` or choose **Try it with sample data** on the site. The sample starts with a populated report for a clipped checkout panel. It uses the separate `demo:vfs:workspace` localStorage key.

**Reset demo** restores the supplied report. **Start for real** discards the demo key before returning home. See [.factory/demo.md](.factory/demo.md) for the sample data and isolation details.

## Install the extension

1. Run `npm ci && npm run build`.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Choose **Load unpacked** and select `.output/chrome-mv3`.
4. On a page you are allowed to inspect, open the toolbar popup and choose **Pick element**.
5. Click an element, or press **Esc** to cancel. `Alt+Shift+V` starts picking from the keyboard.

The release archive is `.output/viewport-fact-sheet-chrome.zip`. The deploy build copies it to `dist/site/downloads/`.

## Use the Playwright helper

After a build, copy `dist/playwright-helper/index.mjs` into a test project. The `index.d.mts` file is included in the helper ZIP for NodeNext editor types.

```ts
import { getViewportFactSheet, assertViewportReachable } from './index.mjs';

const facts = await getViewportFactSheet(page, page.getByRole('button', { name: 'Pay now' }));
expect(facts.verdict.reachable).toBe(true);

await assertViewportReachable(page, '#checkout');
```

The helper accepts a CSS selector or Playwright `Locator`. It returns a report or throws reason codes when an assertion fails.

## Develop, test, and build

Requirements: Node.js 20+, npm, `zip`, `unzip`, and the preinstalled Playwright Chromium browser.

```bash
npm ci
npm run typecheck
npm run test:unit
npm run build
npm test
npm run verify:claims
```

`npm run build:site` produces the deployable site in `dist/site/`. Deploy that directory verbatim, including `downloads/`, `_headers`, and `staticwebapp.config.json`.

Every public product claim is listed in [.factory/claims.json](.factory/claims.json). Run one claim from a clean checkout with its documented command, for example:

```bash
npm run test:claims -- --grep @claim:offline-demo
```

## Privacy and support

The static site uses no cookies or third-party scripts. The extension stores its latest report in local browser extension storage. Read the deployed [privacy policy](https://viewport-fact-sheet.sociobot.in/privacy/) and [terms](https://viewport-fact-sheet.sociobot.in/terms/).

## Project layout

- `src/` — shared inspection engine and picker
- `entrypoints/` — Manifest V3 popup and background script
- `playwright-helper/` — Playwright API
- `site/` — static site, demo, legal pages, and 404 page
- `tests/` — unit, browser, artifact, and claim checks

## License

MIT. See [LICENSE](LICENSE).
