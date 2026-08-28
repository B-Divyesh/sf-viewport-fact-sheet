import { collectFactSheet, selectorFor } from './inspector';

declare global { interface Window { __viewportFactSheetPicker?: boolean } }

(() => {
  if (window.__viewportFactSheetPicker) return;
  window.__viewportFactSheetPicker = true;
  const host = document.createElement('div');
  host.id = 'viewport-fact-sheet-picker';
  host.setAttribute('aria-hidden', 'true');
  const shadow = host.attachShadow({ mode: 'closed' });
  shadow.innerHTML = `
    <style>
      :host{all:initial} .outline{position:fixed;z-index:2147483646;pointer-events:none;border:2px solid #f15a3c;background:rgba(72,198,232,.12);box-shadow:0 0 0 1px #071a2b,0 0 0 3px rgba(72,198,232,.7)}
      .label{position:fixed;z-index:2147483647;pointer-events:none;max-width:min(420px,calc(100vw - 24px));padding:7px 10px;background:#071a2b;color:#f4f0e7;border:1px solid #48c6e8;font:600 12px/1.35 ui-monospace,SFMono-Regular,Consolas,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:4px 4px 0 rgba(7,26,43,.25)}
      .hint{position:fixed;z-index:2147483647;left:50%;top:12px;transform:translateX(-50%);pointer-events:none;padding:10px 14px;background:#f4f0e7;color:#09263b;border:1px solid #09263b;font:600 12px/1.3 ui-monospace,SFMono-Regular,Consolas,monospace;box-shadow:4px 4px 0 #48c6e8}
    </style><div class="outline"></div><div class="label"></div><div class="hint">CLICK TO CAPTURE · ESC TO CANCEL</div>`;
  const outline = shadow.querySelector<HTMLElement>('.outline')!;
  const label = shadow.querySelector<HTMLElement>('.label')!;
  document.documentElement.append(host);
  let candidate: Element | null = null;
  const previousCursor = document.documentElement.style.cursor;
  document.documentElement.style.setProperty('cursor', 'crosshair', 'important');

  const clean = () => {
    window.__viewportFactSheetPicker = false;
    document.documentElement.style.cursor = previousCursor;
    host.remove();
    window.removeEventListener('pointermove', move, true);
    window.removeEventListener('click', select, true);
    window.removeEventListener('keydown', key, true);
  };
  const move = (event: PointerEvent) => {
    const element = event.target instanceof Element ? event.target : null;
    if (!element || element === host || host.contains(element)) return;
    candidate = element;
    const box = element.getBoundingClientRect();
    Object.assign(outline.style, { left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` });
    label.textContent = `${selectorFor(element)} · ${Math.round(box.width)} × ${Math.round(box.height)}`;
    const labelTop = box.top > 48 ? box.top - 36 : Math.min(innerHeight - 38, box.bottom + 6);
    Object.assign(label.style, { left: `${Math.max(8, Math.min(innerWidth - 220, box.left))}px`, top: `${Math.max(8, labelTop)}px` });
  };
  const select = (event: MouseEvent) => {
    event.preventDefault(); event.stopImmediatePropagation();
    const selected = candidate || (event.target instanceof Element ? event.target : null);
    if (!selected) return;
    try {
      const report = collectFactSheet(selected);
      clean();
      chrome.runtime.sendMessage({ type: 'VFS_REPORT', report });
    } catch (error) {
      clean();
      chrome.runtime.sendMessage({ type: 'VFS_ERROR', error: error instanceof Error ? error.message : String(error) });
    }
  };
  const key = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') return;
    event.preventDefault(); clean();
    chrome.runtime.sendMessage({ type: 'VFS_CANCELLED' });
  };
  window.addEventListener('pointermove', move, true);
  window.addEventListener('click', select, true);
  window.addEventListener('keydown', key, true);
})();
