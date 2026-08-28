import { expect, test, chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const populatedReport = {
  target: { tag: 'button', selector: '#save', id: 'save', classes: ['primary'] },
  geometry: { borderBox: { x: 20, y: 30, width: 140, height: 48 }, viewportCenterDelta: { x: -320, y: -240 } },
  styles: { position: 'fixed', zIndex: '3', overflowX: 'visible', overflowY: 'visible' },
  verdict: { reachable: true, inViewport: true, visibleAreaRatio: 1, hitTest: '#save', reasons: ['no-blocking-condition-detected'] },
  clippingAncestors: [],
  scrollAncestors: [],
  diagnostics: Array.from({ length: 48 }, (_, index) => ({ index, explanation: 'A deliberately long but non-sensitive diagnostic value for JSON keyboard scrolling coverage.' })),
};

test('the packaged popup has valid tabs and keyboard-accessible populated JSON', async () => {
  const profile = await mkdtemp(join(tmpdir(), 'vfs-popup-'));
  const context = await chromium.launchPersistentContext(profile, {
    headless: false,
    ignoreDefaultArgs: ['--disable-extensions'],
    args: [`--disable-extensions-except=${resolve('.output/chrome-mv3')}`, `--load-extension=${resolve('.output/chrome-mv3')}`],
  });
  try {
    const worker = context.serviceWorkers()[0] ?? await context.waitForEvent('serviceworker');
    const extensionId = new URL(worker.url()).host;
    const popup = await context.newPage();
    await popup.goto(`chrome-extension://${extensionId}/popup.html`);
    await popup.evaluate(async (report) => { await chrome.storage.local.set({ latestReport: report }); }, populatedReport);
    await popup.reload();
    await expect(popup.locator('#report')).toBeVisible();
    await expect(popup.getByRole('tablist', { name: 'Report views' })).toBeVisible();
    await popup.getByRole('tab', { name: 'Summary' }).press('ArrowRight');
    await expect(popup.getByRole('tab', { name: 'JSON' })).toHaveAttribute('aria-selected', 'true');
    await popup.locator('#json').focus();
    await expect(popup.locator('#json')).toBeFocused();
    const results = await new AxeBuilder({ page: popup }).analyze();
    expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
  } finally {
    await context.close();
    await rm(profile, { recursive: true, force: true });
  }
});
