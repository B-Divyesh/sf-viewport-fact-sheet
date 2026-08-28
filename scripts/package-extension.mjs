import { execFileSync } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
const root = new URL('..', import.meta.url);
const output = new URL('../.output', import.meta.url);
const archive = new URL('../.output/viewport-fact-sheet-chrome.zip', import.meta.url);
await mkdir(output, { recursive: true });
await rm(archive, { force: true });
execFileSync('zip', ['-q', '-r', '../viewport-fact-sheet-chrome.zip', '.'], { cwd: new URL('../.output/chrome-mv3', import.meta.url), stdio: 'inherit' });
