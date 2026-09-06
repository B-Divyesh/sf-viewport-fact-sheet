import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('static release policy', () => {
  it('makes the deployment build produce and verify every advertised download', async () => {
    const pkg = JSON.parse(await readFile('package.json', 'utf8')) as { scripts: Record<string, string> };
    expect(pkg.scripts['build:site']).toContain('build:extension');
    expect(pkg.scripts['build:site']).toContain('build:helper');
    expect(pkg.scripts['build:site']).toContain('package-release.mjs');
    expect(pkg.scripts['build:site']).toContain('verify-release.mjs');
  });

  it('uses a real 404 response and cache-safe download headers', async () => {
    const config = JSON.parse(await readFile('site/public/staticwebapp.config.json', 'utf8')) as {
      navigationFallback?: unknown;
      globalHeaders: Record<string, string>;
      mimeTypes: Record<string, string>;
      routes: Array<{ route: string; headers: Record<string, string> }>;
      responseOverrides: Record<string, { rewrite: string }>;
    };
    expect(config.navigationFallback).toBeUndefined();
    expect(config.responseOverrides['404']).toEqual({ rewrite: '/404.html' });
    expect(config.mimeTypes).toMatchObject({ '.zip': 'application/zip', '.mjs': 'text/javascript' });
    expect(config.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
    expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');
    expect(config.routes.find((route) => route.route === '/assets/*')?.headers['Cache-Control']).toContain('immutable');
    expect(config.routes.find((route) => route.route === '/downloads/*')?.headers['Cache-Control']).toContain('must-revalidate');
  });

  it('uses the offline shell only for navigation and gives uncached artifacts a truthful failure', async () => {
    const worker = await readFile('site/public/sw.js', 'utf8');
    expect(worker).toContain("event.request.mode === 'navigate'");
    expect(worker).toContain('status: 503');
    expect(worker).toContain('Offline: this resource is not cached.');
  });
});
