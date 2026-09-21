// Basic offline-first service worker for the 4-20mA & Modbus Calculator PWA.
// Strategy: cache the app shell on install, then serve cache-first with a
// network fallback (and background cache refresh) for everything else.
// Bump CACHE_NAME whenever you ship a new build so old caches get purged.

const CACHE_NAME = 'signal-modbus-calc-v1';

// Keep this list minimal and accurate to your deployed base path.
// Vite fingerprints built JS/CSS filenames, so we only pre-cache the shell
// here; hashed build assets get cached opportunistically at runtime instead.
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle same-origin GET requests; let everything else pass through.
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached); // offline: fall back to whatever we have cached

      // Cache-first for instant loads; refresh the cache in the background.
      return cached || networkFetch;
    })
  );
});
