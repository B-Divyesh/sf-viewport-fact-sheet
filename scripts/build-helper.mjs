import { build } from 'esbuild';
import { mkdir, readFile } from 'node:fs/promises';

const output = new URL('../dist/playwright-helper/', import.meta.url);
await mkdir(output, { recursive: true });

// Keep the engine as a separately inspectable build artifact, then embed its
// exact source in the public helper so consumers never need a hidden sibling.
const enginePath = new URL('engine.js', output);
await build({
  entryPoints: [new URL('../src/playwright-engine.ts', import.meta.url).pathname],
  bundle: true,
  format: 'iife',
  target: 'chrome110',
  minify: true,
  outfile: enginePath.pathname,
});
const engine = await readFile(enginePath, 'utf8');
await build({
  entryPoints: [new URL('../playwright-helper/index.ts', import.meta.url).pathname],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node18',
  external: ['playwright'],
  define: { __VIEWPORT_FACT_SHEET_ENGINE__: JSON.stringify(engine) },
  outfile: new URL('index.mjs', output).pathname,
});
