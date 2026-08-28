import { test, expect, type Page } from '@playwright/test';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

type Report = { verdict: { reachable: boolean; reasons: string[]; visibleAreaRatio: number }; clippingAncestors: unknown[]; scrollAncestors: unknown[] };

async function helper() {
  // @ts-expect-error The generated helper is produced before Playwright starts.
  return import('../../dist/playwright-helper/index.mjs') as Promise<{ getViewportFactSheet(page: Page, target: string): Promise<Report> }>;
}

test('classifies all 20 seeded viewport cases', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 800 });
  await page.setContent(`<style>
    *{box-sizing:border-box} body{margin:0}.case{position:fixed;width:100px;height:50px;background:#48c6e8}
    #visible{left:20px;top:320px}#none{display:none}#hidden{visibility:hidden}#transparent{opacity:0}#zero{width:0;height:0}
    #below{top:900px}#above{top:-100px}#left{left:-200px;top:100px}#right{left:1100px;top:100px}
    #partial-viewport{left:960px;top:200px}#pointerless{left:20px;top:100px;pointer-events:none}
    #covered{left:150px;top:100px}.cover{position:fixed;left:150px;top:100px;width:100px;height:50px;background:#f15a3c;z-index:5}
    .clipper{position:fixed;left:300px;top:20px;width:80px;height:70px;overflow:hidden}.clipper .case{position:absolute;left:40px;top:10px}
    .fullclip{position:fixed;left:420px;top:20px;width:80px;height:70px;overflow:hidden}.fullclip .case{position:absolute;left:100px;top:10px}
    .scroller{position:fixed;left:520px;top:20px;width:120px;height:80px;overflow:auto}.scroller .wide{width:260px;height:50px;background:#48c6e8}
    #fixed{left:20px;top:180px}#transformed{left:150px;top:180px;transform:translateX(10px)}#contentbox{left:290px;top:180px;padding:10px;border:2px solid}
    .opacity-parent{position:fixed;left:450px;top:180px;opacity:0}.opacity-parent .case{position:relative}
    .hidden-parent{position:fixed;left:600px;top:180px;visibility:hidden}.hidden-parent .case{position:relative}
    #partial-top{left:740px;top:-20px}
  </style>
  <div id="visible" class="case"></div><div id="none" class="case"></div><div id="hidden" class="case"></div><div id="transparent" class="case"></div><div id="zero" class="case"></div>
  <div id="below" class="case"></div><div id="above" class="case"></div><div id="left" class="case"></div><div id="right" class="case"></div><div id="partial-viewport" class="case"></div><div id="pointerless" class="case"></div>
  <div id="covered" class="case"></div><div class="cover"></div><div class="clipper"><div id="clipped" class="case"></div></div><div class="fullclip"><div id="fully-clipped" class="case"></div></div>
  <div class="scroller"><div id="scroll-child" class="wide"></div></div><div id="fixed" class="case"></div><div id="transformed" class="case"></div><div id="contentbox" class="case"></div>
  <div class="opacity-parent"><div id="ancestor-opacity" class="case"></div></div><div class="hidden-parent"><div id="ancestor-hidden" class="case"></div></div><div id="partial-top" class="case"></div>`);
  const { getViewportFactSheet } = await helper();
  const checks: Array<[string, string]> = [
    ['#visible','no-blocking-condition-detected'],['#none','display-none'],['#hidden','visibility-hidden'],['#transparent','zero-opacity'],['#zero','zero-size'],
    ['#below','below-viewport'],['#above','above-viewport'],['#left','left-of-viewport'],['#right','right-of-viewport'],['#partial-viewport','partially-outside-viewport'],
    ['#pointerless','pointer-events-none'],['#covered','occluded-at-visible-center'],['#clipped','clipped-by-ancestor'],['#fully-clipped','clipped-by-ancestor'],
    ['#scroll-child','clipped-by-ancestor'],['#fixed','no-blocking-condition-detected'],['#transformed','no-blocking-condition-detected'],['#contentbox','no-blocking-condition-detected'],
    ['#ancestor-opacity','ancestor-zero-opacity'],['#ancestor-hidden','visibility-hidden'],
  ];
  let correct = 0;
  const failures: Array<{ selector: string; expected: string; actual: string[] }> = [];
  for (const [selector, reason] of checks) {
    const report = await getViewportFactSheet(page, selector);
    if (report.verdict.reasons.includes(reason)) correct += 1;
    else failures.push({ selector, expected: reason, actual: report.verdict.reasons });
  }
  expect(failures, `${correct}/20 classifications matched`).toEqual([]);
});

test('picker captures a hovered element and Escape cancels cleanly', async ({ page }) => {
  await page.setContent('<button id="target" style="width:140px;height:48px">Choose me</button>');
  await page.evaluate(() => {
    Object.defineProperty(window, 'chrome', { configurable: true, value: {
      runtime: { sendMessage: (message: unknown) => { (window as typeof window & { __pickerMessage?: unknown }).__pickerMessage = message; } },
    } });
  });
  const picker = await readFile('.output/chrome-mv3/picker.js', 'utf8');
  await page.addScriptTag({ content: picker });
  await page.locator('#target').hover();
  await page.locator('#target').click();
  const capture = await page.evaluate(() => (window as typeof window & { __pickerMessage?: { type: string; report: { target: { selector: string } } } }).__pickerMessage);
  expect(capture?.type).toBe('VFS_REPORT');
  expect(capture?.report.target.selector).toBe('#target');

  await page.evaluate(() => { (window as typeof window & { __pickerMessage?: unknown }).__pickerMessage = undefined; });
  await page.addScriptTag({ content: picker });
  await page.keyboard.press('Escape');
  const cancellation = await page.evaluate(() => (window as typeof window & { __pickerMessage?: { type: string } }).__pickerMessage);
  expect(cancellation?.type).toBe('VFS_CANCELLED');
  await expect(page.locator('#viewport-fact-sheet-picker')).toHaveCount(0);
});

test('the advertised single-file helper works in a clean consumer without engine.js', async ({ page }) => {
  const consumer = await mkdtemp(join(tmpdir(), 'vfs-helper-'));
  try {
    const helper = await readFile('dist/site/downloads/viewport-fact-sheet-playwright.mjs');
    await writeFile(join(consumer, 'viewport-fact-sheet-playwright.mjs'), helper);
    const imported = (await import(`${pathToFileURL(join(consumer, 'viewport-fact-sheet-playwright.mjs')).href}?clean-consumer`)) as { getViewportFactSheet(page: Page, target: string): Promise<Report> };
    await page.setContent('<button id="reachable">Reach me</button>');
    await expect(imported.getViewportFactSheet(page, '#reachable')).resolves.toMatchObject({ verdict: { reachable: true } });
  } finally {
    await rm(consumer, { recursive: true, force: true });
  }
});
