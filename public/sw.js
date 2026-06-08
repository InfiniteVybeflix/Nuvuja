// Nuvuja Service Worker
const CACHE_NAME = 'nuvuja-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Install: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Nuvuja SW] Failed to cache some assets:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Network-first strategy with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone).catch((err) => {
              console.warn('[Nuvuja SW] Cache put failed:', err);
            });
          });
        }
        return response;
      })
      .catch((error) => {
        console.warn('[Nuvuja SW] Fetch failed, trying cache:', error.message);
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // Return a simple offline response for navigation requests
          if (request.mode === 'navigate') {
            return new Response(
              '<html><body style="background:#020617;color:#e2e8f0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;"><div style="text-align:center;"><h1>ᓄᕙᔭ</h1><p>You are offline. Please check your connection.</p></div></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          }
          throw error;
        });
      })
  );
});
