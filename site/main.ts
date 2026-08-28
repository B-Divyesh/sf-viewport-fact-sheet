import './skip-link';

const networkNote = document.querySelector<HTMLElement>('#network-note')!;
const syncNetwork = () => { networkNote.hidden = navigator.onLine; };
window.addEventListener('online', syncNetwork);
window.addEventListener('offline', syncNetwork);
syncNetwork();

document.querySelector('#copy-code')?.addEventListener('click', async (event) => {
  const button = event.currentTarget as HTMLButtonElement;
  const code = document.querySelector('#code-sample')?.textContent || '';
  try { await navigator.clipboard.writeText(code); button.textContent = 'Copied'; }
  catch { button.textContent = 'Select code to copy'; }
  window.setTimeout(() => { button.textContent = 'Copy'; }, 1600);
});

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => undefined));
