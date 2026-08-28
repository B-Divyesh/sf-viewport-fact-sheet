import { copyFile, mkdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const downloads = new URL('../dist/site/downloads/', import.meta.url);
await mkdir(downloads, { recursive: true });
await copyFile(new URL('../.output/viewport-fact-sheet-chrome.zip', import.meta.url), new URL('viewport-fact-sheet-chrome.zip', downloads));
await copyFile(new URL('../dist/playwright-helper/index.mjs', import.meta.url), new URL('viewport-fact-sheet-playwright.mjs', downloads));
const helperArchive = new URL('viewport-fact-sheet-playwright.zip', downloads);
await rm(helperArchive, { force: true });
execFileSync('zip', ['-q', '-j', helperArchive.pathname, 'index.mjs', 'index.d.mts'], { cwd: new URL('../dist/playwright-helper/', import.meta.url) });
