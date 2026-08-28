import { copyFile, mkdir } from 'node:fs/promises';
const downloads = new URL('../dist/site/downloads/', import.meta.url);
await mkdir(downloads, { recursive: true });
await copyFile(new URL('../.output/viewport-fact-sheet-chrome.zip', import.meta.url), new URL('viewport-fact-sheet-chrome.zip', downloads));
await copyFile(new URL('../dist/playwright-helper/index.mjs', import.meta.url), new URL('viewport-fact-sheet-playwright.mjs', downloads));
await copyFile(new URL('../dist/playwright-helper/index.d.ts', import.meta.url), new URL('viewport-fact-sheet-playwright.d.ts', downloads));
await copyFile(new URL('../dist/playwright-helper/engine.js', import.meta.url), new URL('engine.js', downloads));
