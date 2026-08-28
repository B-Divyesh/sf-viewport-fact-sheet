import { writeFile } from 'node:fs/promises';
const types = `import type { Locator, Page } from 'playwright';
export interface FactRect { x:number; y:number; top:number; right:number; bottom:number; left:number; width:number; height:number }
export interface ViewportFactSheet { schemaVersion:'1.0'; capturedAt:string; page:{url:string;title:string}; target:{selector:string;tag:string;id:string|null;classes:string[];role:string|null}; verdict:{reachable:boolean;inViewport:boolean;rendered:boolean;hitTest:string;visibleAreaRatio:number;reasons:string[]}; viewport:{width:number;height:number;scrollX:number;scrollY:number;devicePixelRatio:number}; geometry:{borderBox:FactRect;visibleBox:FactRect|null;documentOffset:{x:number;y:number};viewportCenterDelta:{x:number;y:number}}; boxModel:unknown; styles:Record<string,string>; clippingAncestors:unknown[]; scrollAncestors:unknown[]; hitTest:{point:{x:number;y:number}|null;topElement:string|null} }
export declare function installViewportFactSheet(page:Page):Promise<void>;
export declare function getViewportFactSheet(page:Page,target:string|Locator):Promise<ViewportFactSheet>;
export declare function assertViewportReachable(page:Page,target:string|Locator):Promise<ViewportFactSheet>;
`;
await writeFile(new URL('../dist/playwright-helper/index.d.ts', import.meta.url), types);
