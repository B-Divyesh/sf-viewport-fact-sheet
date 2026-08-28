import { defineBackground } from 'wxt/utils/define-background';
import type { ViewportFactSheet } from '../src/types';

const injectPicker = async (tabId?: number) => {
  if (!tabId) throw new Error('No active browser tab was found.');
  await chrome.scripting.executeScript({ target: { tabId }, files: ['picker.js'] });
};

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message: { type?: string; report?: ViewportFactSheet; error?: string }, _sender, sendResponse) => {
    if (message.type === 'VFS_REPORT' && message.report) {
      chrome.storage.local.set({ latestReport: message.report, latestError: null, pickerState: 'captured' });
      chrome.action.setBadgeText({ text: '1' });
      chrome.action.setBadgeBackgroundColor({ color: '#F15A3C' });
    } else if (message.type === 'VFS_ERROR') {
      chrome.storage.local.set({ latestError: message.error || 'Inspection failed.', pickerState: 'error' });
    } else if (message.type === 'VFS_CANCELLED') {
      chrome.storage.local.set({ pickerState: 'cancelled' });
    } else if (message.type === 'VFS_START') {
      chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => injectPicker(tab?.id))
        .then(() => { chrome.storage.local.set({ latestError: null, pickerState: 'picking' }); sendResponse({ ok: true }); })
        .catch((error: Error) => { sendResponse({ ok: false, error: friendlyError(error.message) }); });
      return true;
    }
    return false;
  });

  chrome.commands.onCommand.addListener(async (command) => {
    if (command !== 'pick-element') return;
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await injectPicker(tab?.id);
      await chrome.storage.local.set({ latestError: null, pickerState: 'picking' });
    } catch (error) {
      await chrome.storage.local.set({ latestError: friendlyError(error instanceof Error ? error.message : String(error)), pickerState: 'error' });
    }
  });
});

function friendlyError(message: string): string {
  if (/Cannot access|chrome:\/\/|edge:\/\/|extensions page|The URL/i.test(message)) return 'This browser page is protected. Open a normal website and try again.';
  return `The picker could not start: ${message}`;
}
