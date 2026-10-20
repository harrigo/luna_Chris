// Minimal service worker: makes the game installable but caches NOTHING,
// so every launch loads the latest deployed build.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.cache === 'only-if-cached' && e.request.mode !== 'same-origin') return;
  e.respondWith(fetch(e.request));
});
