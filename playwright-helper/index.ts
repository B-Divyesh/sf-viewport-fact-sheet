import type { Locator, Page } from 'playwright';
import type { ViewportFactSheet } from '../src/types';

declare const __VIEWPORT_FACT_SHEET_ENGINE__: string;

// The release build embeds this generated browser-only source. Keeping it in
// this module makes the downloaded helper a complete, single-file consumer API.
const engineSource = __VIEWPORT_FACT_SHEET_ENGINE__;

export async function installViewportFactSheet(page: Page): Promise<void> {
  await page.addInitScript({ content: engineSource });
  await page.evaluate(engineSource);
}

export async function getViewportFactSheet(page: Page, target: string | Locator): Promise<ViewportFactSheet> {
  await installViewportFactSheet(page);
  const locator = typeof target === 'string' ? page.locator(target) : target;
  return locator.evaluate((element) => {
    const inspect = (window as typeof window & { __VIEWPORT_FACT_SHEET__?: (value: Element) => ViewportFactSheet }).__VIEWPORT_FACT_SHEET__;
    if (!inspect) throw new Error('Viewport Fact Sheet engine was not installed.');
    return inspect(element);
  });
}

export async function assertViewportReachable(page: Page, target: string | Locator): Promise<ViewportFactSheet> {
  const report = await getViewportFactSheet(page, target);
  if (!report.verdict.reachable) {
    throw new Error(`Element ${report.target.selector} is not viewport-reachable: ${report.verdict.reasons.join(', ')}`);
  }
  return report;
}

export type { ViewportFactSheet } from '../src/types';
