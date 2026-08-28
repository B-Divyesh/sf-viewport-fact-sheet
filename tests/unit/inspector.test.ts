import { describe, expect, it } from 'vitest';
import { collectFactSheet, selectorFor } from '../../src/inspector';

const makeRect = (left: number, top: number, width: number, height: number): DOMRect => ({
  x: left, y: top, left, top, width, height, right: left + width, bottom: top + height, toJSON: () => ({}),
});

describe('inspection engine', () => {
  it('builds a stable, unique selector without page text', () => {
    document.body.innerHTML = '<main><button data-testid="pay-now">A private card number</button></main>';
    const button = document.querySelector('button')!;
    expect(selectorFor(button)).toBe('[data-testid="pay-now"]');
    expect(selectorFor(button)).not.toContain('private');
  });

  it('reports a reachable element and strips query data from the page URL', () => {
    document.body.innerHTML = '<main><button id="pay">Pay now</button></main>';
    const button = document.querySelector('button')!;
    Object.defineProperty(button, 'getBoundingClientRect', { value: () => makeRect(20, 30, 140, 44) });
    Object.defineProperty(document.documentElement, 'getBoundingClientRect', { value: () => makeRect(0, 0, 1024, 768) });
    Object.defineProperty(document.body, 'getBoundingClientRect', { value: () => makeRect(0, 0, 1024, 768) });
    Object.defineProperty(document, 'elementFromPoint', { configurable: true, value: () => button });
    const report = collectFactSheet(button);
    expect(report.verdict.reachable).toBe(true);
    expect(report.geometry.borderBox).toMatchObject({ left: 20, top: 30, width: 140, height: 44 });
    expect(report.target).not.toHaveProperty('value');
    expect(report.page.url).not.toContain('?');
  });

  it('never resolves ARIA label text into an exported report', () => {
    document.body.innerHTML = '<label id="recovery-label">Account recovery token: VERIFY-SECRET-9281</label><input id="recovery" aria-labelledby="recovery-label" value="another-secret" />';
    const input = document.querySelector('#recovery')!;
    Object.defineProperty(input, 'getBoundingClientRect', { value: () => makeRect(20, 30, 140, 44) });
    Object.defineProperty(document, 'elementFromPoint', { configurable: true, value: () => input });
    const exported = JSON.stringify(collectFactSheet(input));
    expect(exported).not.toContain('VERIFY-SECRET-9281');
    expect(exported).not.toContain('another-secret');
    expect(JSON.parse(exported).target).not.toHaveProperty('accessibleName');
  });

  it('classifies direct CSS invisibility', () => {
    document.body.innerHTML = '<div id="hidden" style="visibility:hidden">Hidden</div>';
    const element = document.querySelector('#hidden')!;
    Object.defineProperty(element, 'getBoundingClientRect', { value: () => makeRect(10, 10, 100, 30) });
    const report = collectFactSheet(element);
    expect(report.verdict.reachable).toBe(false);
    expect(report.verdict.reasons).toContain('visibility-hidden');
  });
});
