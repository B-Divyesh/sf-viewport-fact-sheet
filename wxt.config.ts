import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Viewport Fact Sheet',
    description: 'Export deterministic evidence for element visibility, clipping, offset, and viewport reachability.',
    version: '1.0.0',
    permissions: ['activeTab', 'scripting', 'storage'],
    action: {
      default_title: 'Open Viewport Fact Sheet',
      default_popup: 'popup.html',
    },
    commands: {
      'pick-element': {
        suggested_key: { default: 'Alt+Shift+V', mac: 'Alt+Shift+V' },
        description: 'Pick an element for a viewport fact sheet',
      },
    },
    icons: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      128: 'icon/128.png',
    },
  },
});
