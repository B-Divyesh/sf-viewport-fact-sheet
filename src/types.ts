export type EdgeFlags = { top: boolean; right: boolean; bottom: boolean; left: boolean };

export interface FactRect {
  x: number;
  y: number;
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}

export interface AncestorFact {
  selector: string;
  overflowX: string;
  overflowY: string;
  rect: FactRect;
  scroll: { left: number; top: number; width: number; height: number; clientWidth: number; clientHeight: number };
  clips: EdgeFlags;
}

export interface ViewportFactSheet {
  schemaVersion: '1.0';
  capturedAt: string;
  page: { url: string; title: string };
  target: { selector: string; tag: string; id: string | null; classes: string[]; role: string | null; accessibleName: string | null };
  verdict: {
    reachable: boolean;
    inViewport: boolean;
    rendered: boolean;
    hitTest: 'target' | 'descendant' | 'ancestor' | 'occluded' | 'outside-viewport' | 'not-rendered';
    visibleAreaRatio: number;
    reasons: string[];
  };
  viewport: { width: number; height: number; scrollX: number; scrollY: number; devicePixelRatio: number };
  geometry: { borderBox: FactRect; visibleBox: FactRect | null; documentOffset: { x: number; y: number }; viewportCenterDelta: { x: number; y: number } };
  boxModel: {
    margin: Record<'top' | 'right' | 'bottom' | 'left', number>;
    border: Record<'top' | 'right' | 'bottom' | 'left', number>;
    padding: Record<'top' | 'right' | 'bottom' | 'left', number>;
    content: { width: number; height: number };
  };
  styles: Record<string, string>;
  clippingAncestors: AncestorFact[];
  scrollAncestors: AncestorFact[];
  hitTest: { point: { x: number; y: number } | null; topElement: string | null };
}
