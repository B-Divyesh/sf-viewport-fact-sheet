import './style.css';
import type { ViewportFactSheet } from '../../src/types';

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const pick = $('#pick') as HTMLButtonElement;
const notice = $('#notice');
let report: ViewportFactSheet | null = null;

function announce(message: string, error = false) {
  notice.textContent = message; notice.hidden = !message; notice.classList.toggle('error', error);
}

async function load() {
  const stored = await chrome.storage.local.get(['latestReport', 'latestError', 'pickerState']);
  if (stored.latestError) announce(stored.latestError, true);
  else if (stored.pickerState === 'picking') announce('Picker is active on the page. Click an element or press Esc.');
  if (stored.latestReport) render(stored.latestReport as ViewportFactSheet);
}

function render(next: ViewportFactSheet) {
  report = next;
  $('#empty').hidden = true; $('#report').hidden = false;
  $('#status').textContent = `${next.target.tag} captured`;
  $('#selector').textContent = next.target.selector;
  const verdict = next.verdict.reachable ? 'Reachable now' : next.verdict.inViewport ? 'Visible, not reachable' : 'Outside usable viewport';
  $('#verdict-title').textContent = verdict;
  $('#verdict-block').className = `verdict ${next.verdict.reachable ? 'pass' : 'fail'}`;
  $('#ratio').textContent = `${Math.round(next.verdict.visibleAreaRatio * 100)}% visible`;
  const box = next.geometry.borderBox;
  const facts: Array<[string, string]> = [
    ['Border box', `${box.width} × ${box.height} px`],
    ['Viewport position', `x ${box.x}, y ${box.y}`],
    ['Centre offset', `${signed(next.geometry.viewportCenterDelta.x)} x / ${signed(next.geometry.viewportCenterDelta.y)} y`],
    ['Hit test', next.verdict.hitTest],
    ['Position / z-index', `${next.styles.position} / ${next.styles.zIndex}`],
    ['Overflow', `${next.styles.overflowX} / ${next.styles.overflowY}`],
  ];
  $('#facts').innerHTML = facts.map(([term, value]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('');
  $('#reasons').innerHTML = next.verdict.reasons.map((reason) => `<li>${escapeHtml(humanize(reason))}</li>`).join('');
  const chain = [...next.clippingAncestors.map((item) => ({ ...item, kind: 'clip' })), ...next.scrollAncestors.filter((item) => !next.clippingAncestors.some((clip) => clip.selector === item.selector)).map((item) => ({ ...item, kind: 'scroll' }))];
  $('#chain').innerHTML = chain.length ? chain.map((item) => `<li><span>${escapeHtml(item.kind)}</span><code>${escapeHtml(item.selector)}</code><small>${escapeHtml(item.overflowX)} / ${escapeHtml(item.overflowY)}</small></li>`).join('') : '<li class="none">No clipping or scroll ancestors</li>';
  $('#json').textContent = JSON.stringify(next, null, 2);
}

pick.addEventListener('click', async () => {
  pick.disabled = true; announce('Starting picker…');
  try {
    const response = await chrome.runtime.sendMessage({ type: 'VFS_START' }) as { ok: boolean; error?: string };
    if (!response?.ok) throw new Error(response?.error || 'The active tab did not respond.');
    announce('Picker active. Click an element on the page or press Esc.');
    window.close();
  } catch (error) {
    announce(error instanceof Error ? error.message : String(error), true); pick.disabled = false;
  }
});

const tabs = [...document.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    const next = tabs[(index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
    activateTab(next); next.focus();
  });
});
function activateTab(active: HTMLButtonElement) {
  tabs.forEach((tab) => { const selected = tab === active; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; $(`#${tab.getAttribute('aria-controls')}`).hidden = !selected; });
}

$('#copy').addEventListener('click', async () => { if (!report) return; await navigator.clipboard.writeText(JSON.stringify(report, null, 2)); announce('JSON copied to clipboard.'); });
$('#download').addEventListener('click', () => {
  if (!report) return; const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = `viewport-fact-sheet-${new Date().toISOString().slice(0, 10)}.json`; link.click(); setTimeout(() => URL.revokeObjectURL(url), 500);
});
$('#clear').addEventListener('click', async () => { await chrome.storage.local.remove(['latestReport', 'latestError']); await chrome.action.setBadgeText({ text: '' }); report = null; $('#report').hidden = true; $('#empty').hidden = false; $('#status').textContent = 'No element captured'; announce('Report cleared.'); });
chrome.storage.onChanged.addListener((changes) => { if (changes.latestReport?.newValue) render(changes.latestReport.newValue as ViewportFactSheet); if (changes.latestError?.newValue) announce(String(changes.latestError.newValue), true); });

const signed = (value: number) => `${value >= 0 ? '+' : ''}${value}px`;
const humanize = (value: string) => value.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');
const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character]!);
load();
