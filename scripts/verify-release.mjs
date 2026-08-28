import { access, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { execFileSync } from 'node:child_process';

const root = new URL('../dist/site/', import.meta.url);
const required = [
  'index.html',
  'staticwebapp.config.json',
  'downloads/viewport-fact-sheet-chrome.zip',
  'downloads/viewport-fact-sheet-playwright.mjs',
  'downloads/viewport-fact-sheet-playwright.zip',
];

for (const relativePath of required) {
  await access(new URL(relativePath, root), constants.R_OK);
}

const helper = await readFile(new URL('downloads/viewport-fact-sheet-playwright.mjs', root), 'utf8');
if (!helper.includes('__VIEWPORT_FACT_SHEET__')) {
  throw new Error('The published Playwright helper is not the self-contained release build.');
}

for (const relativePath of [
  'downloads/viewport-fact-sheet-chrome.zip',
  'downloads/viewport-fact-sheet-playwright.zip',
]) {
  execFileSync('unzip', ['-tqq', new URL(relativePath, root).pathname], { stdio: 'inherit' });
}

const helperListing = execFileSync('unzip', ['-Z1', new URL('downloads/viewport-fact-sheet-playwright.zip', root).pathname], { encoding: 'utf8' });
for (const entry of ['index.mjs', 'index.d.mts']) {
  if (!helperListing.split('\n').includes(entry)) throw new Error(`Helper archive is missing ${entry}.`);
}

console.log('Release site verified: pages and all three consumable downloads are present.');
