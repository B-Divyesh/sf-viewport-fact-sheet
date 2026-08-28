import { collectFactSheet } from './inspector';

declare global { interface Window { __VIEWPORT_FACT_SHEET__?: typeof collectFactSheet } }
window.__VIEWPORT_FACT_SHEET__ = collectFactSheet;
