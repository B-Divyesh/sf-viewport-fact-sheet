import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('landing page has working product actions and no serious accessibility violations', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: /Stop guessing/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Download for Chromium/ })).toHaveAttribute('href', '/downloads/viewport-fact-sheet-chrome.zip');
  await expect(page.getByRole('link', { name: 'Download single-file helper' })).toHaveAttribute('href', '/downloads/viewport-fact-sheet-playwright.mjs');
  await expect(page.getByRole('heading', { name: 'One selection. A checkable answer.' })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
  expect(errors).toEqual([]);
});

test('published downloads have the advertised bytes and the skip link moves focus to main', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  const extension = await page.request.get('/downloads/viewport-fact-sheet-chrome.zip');
  expect(extension.headers()['content-type']).toContain('application/zip');
  expect((await extension.body()).subarray(0, 4).toString()).toBe('PK\x03\x04');
  const helper = await page.request.get('/downloads/viewport-fact-sheet-playwright.mjs');
  expect(helper.headers()['content-type']).toContain('javascript');
  expect(await helper.text()).toContain('__VIEWPORT_FACT_SHEET__');
  const helperBundle = await page.request.get('/downloads/viewport-fact-sheet-playwright.zip');
  expect(helperBundle.headers()['content-type']).toContain('application/zip');
});

test('mobile layout stays usable at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Stop guessing/ })).toBeVisible();
  const bodyWidth = await page.locator('body').evaluate((body) => body.scrollWidth);
  expect(bodyWidth).toBeLessThanOrEqual(390);
  await expect(page.getByRole('link', { name: /Download for Chromium/ })).toBeVisible();
});

test('privacy and terms pages expose clear policy text', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page.locator('h1')).toHaveText('Privacy, measured.');
  await page.goto('/terms/');
  await expect(page.locator('h1')).toHaveText('Terms of use.');
});
