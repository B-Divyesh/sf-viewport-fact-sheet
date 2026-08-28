const CACHE = 'viewport-fact-sheet-v3';
const SHELL = ['/', '/assets/viewport-blueprint-hero-mobile.20260828.webp', '/assets/viewport-blueprint-hero.20260828.webp', '/privacy/', '/terms/'];
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL))));
self.addEventListener('activate', (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))));
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);
      if (response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
      return response;
    } catch {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      if (event.request.mode === 'navigate') {
        const shell = await caches.match('/');
        return shell || new Response('Offline: the application shell is not cached.', { status: 503, statusText: 'Service Unavailable', headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      }
      return new Response('Offline: this resource is not cached.', { status: 503, statusText: 'Service Unavailable', headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});
