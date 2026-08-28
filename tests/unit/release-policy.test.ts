import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('static release policy', () => {
  it('keeps downloads out of the SPA fallback and serves their real MIME types', async () => {
    const config = JSON.parse(await readFile('site/public/staticwebapp.config.json', 'utf8')) as {
      navigationFallback: { exclude: string[] };
      globalHeaders: Record<string, string>;
      mimeTypes: Record<string, string>;
      routes: Array<{ route: string; headers: Record<string, string> }>;
    };
    expect(config.navigationFallback.exclude).toContain('/downloads/*');
    expect(config.mimeTypes).toMatchObject({ '.zip': 'application/zip', '.mjs': 'text/javascript' });
    expect(config.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
    expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');
    expect(config.routes.find((route) => route.route === '/assets/*')?.headers['Cache-Control']).toContain('immutable');
  });
});
