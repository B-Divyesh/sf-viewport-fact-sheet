import './skip-link';

const DEMO_KEY = 'demo:vfs:workspace';
const SAMPLE = {
  schemaVersion: '1.0',
  target: '#checkout-panel',
  geometry: { borderBox: { width: 420, height: 288 }, visibleAreaRatio: 0.37 },
  clippingAncestors: ['.demo-clipper'],
  verdict: { reachable: false, hitTest: '#sample-sticky-footer', reasons: ['clipped-by-ancestor', 'occluded-at-visible-center'] },
};

type DemoState = typeof SAMPLE & { loadedAt: string };

function loadDemo(): DemoState {
  const stored = localStorage.getItem(DEMO_KEY);
  if (stored) {
    try { return JSON.parse(stored) as DemoState; }
    catch { localStorage.removeItem(DEMO_KEY); }
  }
  const state = { ...SAMPLE, loadedAt: new Date().toISOString() };
  localStorage.setItem(DEMO_KEY, JSON.stringify(state));
  return state;
}

function render(state: DemoState, message: string) {
  document.querySelector('#visible-area')!.textContent = `${Math.round(state.geometry.visibleAreaRatio * 100)}%`;
  document.querySelector('#centre-hit')!.textContent = state.verdict.hitTest;
  document.querySelector('#clipper-name')!.textContent = state.clippingAncestors[0];
  document.querySelector('#reason-code')!.textContent = state.verdict.reasons.at(-1)!;
  document.querySelector('#report-note')!.textContent = message;
}

let state = loadDemo();
render(state, 'Sample report loaded from demo storage.');

document.querySelector<HTMLButtonElement>('#reset-demo')!.addEventListener('click', () => {
  localStorage.removeItem(DEMO_KEY);
  state = loadDemo();
  render(state, 'Sample report reset.');
});

document.querySelector<HTMLAnchorElement>('#start-real')!.addEventListener('click', () => {
  localStorage.removeItem(DEMO_KEY);
});

document.querySelector<HTMLButtonElement>('#download-sample')!.addEventListener('click', () => {
  const file = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(file);
  link.download = 'viewport-fact-sheet-demo.json';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 250);
});

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
