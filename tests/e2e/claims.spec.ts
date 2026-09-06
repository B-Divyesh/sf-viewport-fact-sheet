import { expect, test, type Locator, type Page } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

type Report = {
  page: { url: string };
  geometry: { borderBox: { width: number; height: number } };
  verdict: { reachable: boolean; hitTest: string; reasons: string[] };
  clippingAncestors: Array<{ selector: string }>;
  scrollAncestors: Array<{ selector: string }>;
};

async function helper() {
  return import('../../dist/playwright-helper/index.mjs') as Promise<{
    getViewportFactSheet: (page: Page, target: string | Locator) => Promise<Report>;
    assertViewportReachable: (page: Page, target: string | Locator) => Promise<Report>;
  }>;
}

async function openDemo(page: Page) {
  await page.goto('/demo/');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Inspect a sample clipped element' })).toBeVisible();
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 600);
  });
}

test('@claim:box-geometry records a selected element’s box geometry', async ({ page }) => {
  await openDemo(page);
  const { getViewportFactSheet } = await helper();
  const report = await getViewportFactSheet(page, '#checkout-panel');
  expect(report.geometry.borderBox.width).toBeGreaterThan(250);
  expect(report.geometry.borderBox.height).toBeGreaterThan(200);
});

test('@claim:clipping-scroll-chain records clipping and scroll ancestors', async ({ page }) => {
  await openDemo(page);
  const { getViewportFactSheet } = await helper();
  const report = await getViewportFactSheet(page, '#checkout-panel');
  expect(report.clippingAncestors.map((item) => item.selector)).toContain('div.demo-clipper');
  expect(report.scrollAncestors.map((item) => item.selector)).toContain('div.demo-clipper');
});

test('@claim:hit-test-reachability reports a centre hit and unreachable verdict', async ({ page }) => {
  await openDemo(page);
  const { getViewportFactSheet } = await helper();
  const report = await getViewportFactSheet(page, '#checkout-panel');
  expect(report.verdict.reachable).toBe(false);
  expect(report.verdict.hitTest).toBe('occluded');
  expect(report.verdict.reasons).toContain('occluded-at-visible-center');
});

test('@claim:json-export downloads a versioned JSON report', async ({ page }) => {
  await openDemo(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download sample JSON' }).click();
  const download = await downloadPromise;
  const file = await readFile(await download.path()!, 'utf8');
  const report = JSON.parse(file) as { schemaVersion: string; verdict: { reachable: boolean } };
  expect(download.suggestedFilename()).toBe('viewport-fact-sheet-demo.json');
  expect(report).toMatchObject({ schemaVersion: '1.0', verdict: { reachable: false } });
});

test('@claim:free-download serves the extension archive without an account', async ({ page }) => {
  await openDemo(page);
  const response = await page.request.get('/downloads/viewport-fact-sheet-chrome.zip');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/zip');
  expect((await response.body()).subarray(0, 4).toString()).toBe('PK\x03\x04');
});

test('@claim:demo-isolation keeps sample state out of real storage', async ({ page, context }) => {
  await context.addInitScript(() => localStorage.setItem('vfs:real:workspace', JSON.stringify({ report: 'keep-this' })));
  await openDemo(page);
  const storage = await page.evaluate(() => ({ real: localStorage.getItem('vfs:real:workspace'), demo: localStorage.getItem('demo:vfs:workspace') }));
  expect(storage.real).toBe(JSON.stringify({ report: 'keep-this' }));
  expect(storage.demo).toContain('checkout-panel');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
});

test('@claim:demo-banner stays visible while reading the sample', async ({ page }) => {
  await openDemo(page);
  const banner = page.getByText('Demo — sample data, nothing is saved');
  await expect(banner).toBeVisible();
  expect((await banner.boundingBox())?.y).toBeGreaterThanOrEqual(0);
});

test('@claim:demo-exit discards sample state before returning home', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => localStorage.getItem('demo:vfs:workspace'))).toBeNull();
});

test('@claim:demo-reset restores the supplied sample report', async ({ page }) => {
  await openDemo(page);
  await page.evaluate(() => {
    const value = JSON.parse(localStorage.getItem('demo:vfs:workspace') || '{}');
    value.geometry.visibleAreaRatio = 0.12;
    localStorage.setItem('demo:vfs:workspace', JSON.stringify(value));
  });
  await page.reload();
  await expect(page.locator('#visible-area')).toHaveText('12%');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#visible-area')).toHaveText('37%');
  await expect(page.locator('#report-note')).toHaveText('Sample report reset.');
});

test('@claim:no-content-capture excludes page text and form values', async ({ page }) => {
  await openDemo(page);
  const pageSentinel = 'PRIVATE-PAGE-TEXT-7491';
  const valueSentinel = 'PRIVATE-FORM-VALUE-6038';
  const ariaSentinel = 'PRIVATE-ARIA-LABEL-1214';
  await page.goto(`data:text/html,<label for="recovery">${pageSentinel}</label><input id="recovery" aria-label="${ariaSentinel}" value="${valueSentinel}" style="width:100px;height:44px">`);
  const { getViewportFactSheet } = await helper();
  const report = await getViewportFactSheet(page, '#recovery');
  const exported = JSON.stringify(report);
  expect(exported).not.toContain(pageSentinel);
  expect(exported).not.toContain(valueSentinel);
  expect(exported).not.toContain(ariaSentinel);
});

test('@claim:url-sanitization excludes a page query string', async ({ page }) => {
  await page.goto('/demo/?private-token=do-not-export');
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 600);
  });
  const { getViewportFactSheet } = await helper();
  const report = await getViewportFactSheet(page, '#checkout-panel');
  expect(report.page.url).toBe('http://127.0.0.1:4173/demo/');
});

test('@claim:local-only-requests sends no demo data to another origin', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  await openDemo(page);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  expect(requests).not.toHaveLength(0);
  expect(requests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
});

test('@claim:no-site-cookies leaves the demo without site cookies', async ({ page }) => {
  await openDemo(page);
  expect(await page.evaluate(() => document.cookie)).toBe('');
});

test('@claim:extension-shortcut packages the documented picker shortcut', async ({ page }) => {
  await openDemo(page);
  const manifest = JSON.parse(await readFile('.output/chrome-mv3/manifest.json', 'utf8')) as { commands: Record<string, { suggested_key: { default: string } }> };
  expect(manifest.commands['pick-element'].suggested_key.default).toBe('Alt+Shift+V');
});

test('@claim:playwright-selector accepts a selector and returns a report', async ({ page }) => {
  await openDemo(page);
  const { getViewportFactSheet } = await helper();
  await expect(getViewportFactSheet(page, '#checkout-panel')).resolves.toMatchObject({ page: { url: 'http://127.0.0.1:4173/demo/' } });
});

test('@claim:playwright-locator accepts a locator and returns a report', async ({ page }) => {
  await openDemo(page);
  const { getViewportFactSheet } = await helper();
  await expect(getViewportFactSheet(page, page.locator('#checkout-panel'))).resolves.toMatchObject({ verdict: { reachable: false } });
});

test('@claim:reason-codes explain a failed reachability assertion', async ({ page }) => {
  await openDemo(page);
  const { assertViewportReachable } = await helper();
  await expect(assertViewportReachable(page, '#checkout-panel')).rejects.toThrow(/clipped-by-ancestor|occluded-at-visible-center/);
});

test('@claim:helper-types ships a NodeNext declaration with the helper', async ({ page }) => {
  await openDemo(page);
  const response = await page.request.get('/downloads/viewport-fact-sheet-playwright.zip');
  expect(response.status()).toBe(200);
  expect((await response.body()).subarray(0, 4).toString()).toBe('PK\x03\x04');
  const contents = execFileSync('unzip', ['-Z1', 'dist/site/downloads/viewport-fact-sheet-playwright.zip'], { encoding: 'utf8' });
  expect(contents.split('\n')).toContain('index.d.mts');
});

test('@claim:demo-keyboard keeps its report controls focusable on a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openDemo(page);
  const control = page.getByRole('button', { name: 'Download sample JSON' });
  await control.focus();
  await expect(control).toBeFocused();
  const box = await control.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
});

test('@claim:offline-demo reloads after its first visit', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto('http://127.0.0.1:4173/demo/');
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await page.reload();
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Inspect a sample clipped element' })).toBeVisible();
  } finally {
    await context.setOffline(false);
    await context.close();
  }
});
