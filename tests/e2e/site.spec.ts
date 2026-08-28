import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('landing page has working product actions and no serious accessibility violations', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: /Stop guessing/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Download for Chromium/ })).toHaveAttribute('href', '/downloads/viewport-fact-sheet-chrome.zip');
  await expect(page.getByRole('heading', { name: 'One selection. A checkable answer.' })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || ''))).toEqual([]);
  expect(errors).toEqual([]);
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
