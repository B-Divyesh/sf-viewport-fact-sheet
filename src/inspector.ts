import type { AncestorFact, EdgeFlags, FactRect, ViewportFactSheet } from './types';

const round = (value: number) => Math.round(value * 100) / 100;
const px = (value: string) => round(Number.parseFloat(value) || 0);
const opacity = (value: string) => value === '' ? 1 : Number(value);

function rect(value: Pick<DOMRect, 'x' | 'y' | 'top' | 'right' | 'bottom' | 'left' | 'width' | 'height'>): FactRect {
  return {
    x: round(value.x), y: round(value.y), top: round(value.top), right: round(value.right),
    bottom: round(value.bottom), left: round(value.left), width: round(value.width), height: round(value.height),
  };
}

function escapeCss(value: string): string {
  if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(value);
  return value.replace(/[^a-zA-Z0-9_-]/g, (character) => `\\${character}`);
}

/**
 * Keep useful route context for ordinary web pages without ever serializing a
 * URL scheme whose pathname can itself contain document or local-file data.
 */
export function safePageUrl(location: Location): string {
  if (location.protocol === 'http:' || location.protocol === 'https:') {
    return `${location.origin}${location.pathname}`;
  }
  if (location.protocol === 'chrome-extension:' || location.protocol === 'moz-extension:') {
    return `${location.origin}${location.pathname}`;
  }
  return location.protocol;
}

export function selectorFor(element: Element): string {
  if (element.id) return `#${escapeCss(element.id)}`;
  const testId = element.getAttribute('data-testid');
  if (testId) return `[data-testid="${testId.replace(/"/g, '\\"')}"]`;
  const segments: string[] = [];
  let current: Element | null = element;
  while (current && current.nodeType === 1 && segments.length < 5) {
    let segment = current.tagName.toLowerCase();
    const stableClasses = [...current.classList].filter((name) => !/^(active|selected|hover|focus|css-|jsx-)/.test(name)).slice(0, 2);
    if (stableClasses.length) segment += stableClasses.map((name) => `.${escapeCss(name)}`).join('');
    if (current.parentElement) {
      const siblings = [...current.parentElement.children].filter((node) => node.tagName === current!.tagName);
      if (siblings.length > 1) segment += `:nth-of-type(${siblings.indexOf(current) + 1})`;
    }
    segments.unshift(segment);
    const candidate = segments.join(' > ');
    try { if (element.ownerDocument.querySelectorAll(candidate).length === 1) return candidate; } catch { /* keep building */ }
    current = current.parentElement;
  }
  return segments.join(' > ');
}

function intersect(a: FactRect, b: FactRect): FactRect | null {
  const left = Math.max(a.left, b.left);
  const right = Math.min(a.right, b.right);
  const top = Math.max(a.top, b.top);
  const bottom = Math.min(a.bottom, b.bottom);
  if (right <= left || bottom <= top) return null;
  return rect({ x: left, y: top, left, right, top, bottom, width: right - left, height: bottom - top });
}

function ancestorFact(element: Element, style: CSSStyleDeclaration, targetRect: FactRect): AncestorFact {
  const elementRect = rect(element.getBoundingClientRect());
  const clips: EdgeFlags = {
    top: targetRect.top < elementRect.top,
    right: targetRect.right > elementRect.right,
    bottom: targetRect.bottom > elementRect.bottom,
    left: targetRect.left < elementRect.left,
  };
  const html = element as HTMLElement;
  return {
    selector: selectorFor(element), overflowX: style.overflowX, overflowY: style.overflowY, rect: elementRect,
    scroll: { left: html.scrollLeft, top: html.scrollTop, width: html.scrollWidth, height: html.scrollHeight, clientWidth: html.clientWidth, clientHeight: html.clientHeight },
    clips,
  };
}

export function collectFactSheet(element: Element): ViewportFactSheet {
  const doc = element.ownerDocument;
  const view = doc.defaultView;
  if (!view) throw new Error('This document has no active viewport.');
  const style = view.getComputedStyle(element);
  const targetRect = rect(element.getBoundingClientRect());
  const viewportRect = rect({ x: 0, y: 0, left: 0, top: 0, right: view.innerWidth, bottom: view.innerHeight, width: view.innerWidth, height: view.innerHeight });
  let visibleBox = intersect(targetRect, viewportRect);
  const clippingAncestors: AncestorFact[] = [];
  const scrollAncestors: AncestorFact[] = [];
  let effectiveOpacity = opacity(style.opacity);
  let ancestor = element.parentElement;
  while (ancestor) {
    const ancestorStyle = view.getComputedStyle(ancestor);
    effectiveOpacity *= opacity(ancestorStyle.opacity);
    const fact = ancestorFact(ancestor, ancestorStyle, targetRect);
    const clipsX = /(hidden|clip|scroll|auto)/.test(ancestorStyle.overflowX);
    const clipsY = /(hidden|clip|scroll|auto)/.test(ancestorStyle.overflowY);
    const scrollsX = /(scroll|auto)/.test(ancestorStyle.overflowX) && (ancestor as HTMLElement).scrollWidth > (ancestor as HTMLElement).clientWidth;
    const scrollsY = /(scroll|auto)/.test(ancestorStyle.overflowY) && (ancestor as HTMLElement).scrollHeight > (ancestor as HTMLElement).clientHeight;
    if (scrollsX || scrollsY) scrollAncestors.push(fact);
    if (clipsX || clipsY) {
      clippingAncestors.push(fact);
      if (visibleBox) {
        const clipRect = fact.rect;
        const axisRect: FactRect = {
          ...clipRect,
          left: clipsX ? clipRect.left : -Number.MAX_SAFE_INTEGER,
          right: clipsX ? clipRect.right : Number.MAX_SAFE_INTEGER,
          top: clipsY ? clipRect.top : -Number.MAX_SAFE_INTEGER,
          bottom: clipsY ? clipRect.bottom : Number.MAX_SAFE_INTEGER,
        };
        visibleBox = intersect(visibleBox, axisRect);
      }
    }
    ancestor = ancestor.parentElement;
  }

  const rendered = element.isConnected && style.display !== 'none' && style.visibility !== 'hidden' && effectiveOpacity > 0 && targetRect.width > 0 && targetRect.height > 0;
  const inViewport = rendered && visibleBox !== null;
  const area = targetRect.width * targetRect.height;
  const visibleAreaRatio = area > 0 && visibleBox ? round((visibleBox.width * visibleBox.height) / area) : 0;
  let point: { x: number; y: number } | null = null;
  let topElement: Element | null = null;
  let hitTest: ViewportFactSheet['verdict']['hitTest'] = rendered ? 'outside-viewport' : 'not-rendered';
  if (inViewport && visibleBox) {
    point = { x: round(visibleBox.left + visibleBox.width / 2), y: round(visibleBox.top + visibleBox.height / 2) };
    topElement = doc.elementFromPoint(point.x, point.y);
    if (topElement === element) hitTest = 'target';
    else if (topElement && element.contains(topElement)) hitTest = 'descendant';
    else if (topElement && topElement.contains(element)) hitTest = 'ancestor';
    else hitTest = 'occluded';
  }
  const reasons: string[] = [];
  if (!element.isConnected) reasons.push('detached-from-document');
  if (style.display === 'none') reasons.push('display-none');
  if (style.visibility === 'hidden') reasons.push('visibility-hidden');
  if (opacity(style.opacity) === 0) reasons.push('zero-opacity');
  else if (effectiveOpacity === 0) reasons.push('ancestor-zero-opacity');
  if (targetRect.width <= 0 || targetRect.height <= 0) reasons.push('zero-size');
  if (targetRect.bottom <= 0) reasons.push('above-viewport');
  if (targetRect.top >= view.innerHeight) reasons.push('below-viewport');
  if (targetRect.right <= 0) reasons.push('left-of-viewport');
  if (targetRect.left >= view.innerWidth) reasons.push('right-of-viewport');
  if (visibleAreaRatio < 1 && clippingAncestors.some((item) => Object.values(item.clips).some(Boolean))) reasons.push('clipped-by-ancestor');
  if (visibleAreaRatio > 0 && visibleAreaRatio < 1 && !reasons.includes('clipped-by-ancestor')) reasons.push('partially-outside-viewport');
  if (hitTest === 'occluded') reasons.push('occluded-at-visible-center');
  if (hitTest === 'ancestor' && style.pointerEvents !== 'none') reasons.push('ancestor-wins-hit-test');
  if (style.pointerEvents === 'none') reasons.push('pointer-events-none');
  if (!reasons.length) reasons.push('no-blocking-condition-detected');
  const reachable = rendered && inViewport && style.pointerEvents !== 'none' && (hitTest === 'target' || hitTest === 'descendant');
  const safeUrl = safePageUrl(view.location);
  const boxSizing = style.boxSizing;
  const horizontalExtras = px(style.paddingLeft) + px(style.paddingRight) + px(style.borderLeftWidth) + px(style.borderRightWidth);
  const verticalExtras = px(style.paddingTop) + px(style.paddingBottom) + px(style.borderTopWidth) + px(style.borderBottomWidth);
  return {
    schemaVersion: '1.0', capturedAt: new Date().toISOString(), page: { url: safeUrl, title: doc.title },
    // Do not resolve ARIA labels: labels are page text and reports are retained/exported.
    target: { selector: selectorFor(element), tag: element.tagName.toLowerCase(), id: element.id || null, classes: [...element.classList], role: element.getAttribute('role') },
    verdict: { reachable, inViewport, rendered, hitTest, visibleAreaRatio, reasons },
    viewport: { width: view.innerWidth, height: view.innerHeight, scrollX: round(view.scrollX), scrollY: round(view.scrollY), devicePixelRatio: view.devicePixelRatio },
    geometry: {
      borderBox: targetRect, visibleBox,
      documentOffset: { x: round(targetRect.left + view.scrollX), y: round(targetRect.top + view.scrollY) },
      viewportCenterDelta: { x: round(targetRect.left + targetRect.width / 2 - view.innerWidth / 2), y: round(targetRect.top + targetRect.height / 2 - view.innerHeight / 2) },
    },
    boxModel: {
      margin: { top: px(style.marginTop), right: px(style.marginRight), bottom: px(style.marginBottom), left: px(style.marginLeft) },
      border: { top: px(style.borderTopWidth), right: px(style.borderRightWidth), bottom: px(style.borderBottomWidth), left: px(style.borderLeftWidth) },
      padding: { top: px(style.paddingTop), right: px(style.paddingRight), bottom: px(style.paddingBottom), left: px(style.paddingLeft) },
      content: { width: round(boxSizing === 'border-box' ? Math.max(0, targetRect.width - horizontalExtras) : px(style.width)), height: round(boxSizing === 'border-box' ? Math.max(0, targetRect.height - verticalExtras) : px(style.height)) },
    },
    styles: {
      display: style.display, visibility: style.visibility, opacity: style.opacity, position: style.position,
      top: style.top, right: style.right, bottom: style.bottom, left: style.left, inset: style.inset,
      overflowX: style.overflowX, overflowY: style.overflowY, zIndex: style.zIndex,
      transform: style.transform, pointerEvents: style.pointerEvents, boxSizing: style.boxSizing, effectiveOpacity: String(round(effectiveOpacity)), clipPath: style.clipPath,
    },
    clippingAncestors, scrollAncestors,
    hitTest: { point, topElement: topElement ? selectorFor(topElement) : null },
  };
}
