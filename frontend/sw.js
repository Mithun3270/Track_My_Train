// ═══════════════════════════════════════════════════════════════
// TrackMyTrain — Service Worker v10
// Strategies: Cache-First (shell) | Network-First (API) | Offline fallback
// ═══════════════════════════════════════════════════════════════

const CACHE_VERSION = 'trackmytrain-v11';
const OFFLINE_URL   = '/offline.html';

// Assets cached immediately on install (App Shell)
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// API paths that should use Network-First strategy
const API_PATHS = ['/api/trains', '/api/auth', '/api/seats', '/api/food', '/api/notifications'];

// ─── INSTALL: Cache all shell assets ───────────────────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing TrackMyTrain v10...');
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(SHELL_ASSETS))
      .then(() => {
        console.log('[SW] Shell assets cached ✅');
        return self.skipWaiting(); // Activate immediately
      })
  );
});

// ─── ACTIVATE: Remove old caches ───────────────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating & cleaning old caches...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_VERSION)
          .map(k => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ─── FETCH: Smart caching strategies ───────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET') return;
  if (!url.origin.startsWith(self.location.origin) &&
      !url.hostname.includes('tile.openstreetmap.org') &&
      !url.hostname.includes('fonts.googleapis.com') &&
      !url.hostname.includes('fonts.gstatic.com') &&
      !url.hostname.includes('unpkg.com') &&
      !url.hostname.includes('cdnjs.cloudflare.com')) {
    return;
  }

  const isAPI = API_PATHS.some(p => url.pathname.startsWith(p));
  const isMapTile = url.hostname.includes('tile.openstreetmap.org');
  const isCDN = url.hostname.includes('unpkg.com') ||
                url.hostname.includes('cdnjs.cloudflare.com') ||
                url.hostname.includes('fonts.googleapis.com') ||
                url.hostname.includes('fonts.gstatic.com');

  if (isAPI) {
    // ── Strategy: Network-First (API data) ──────────────────────
    // Try network → cache response → if offline → serve cached
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || new Response(
            JSON.stringify({ error: 'offline', message: 'No internet connection. Showing cached data.' }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );

  } else if (isMapTile) {
    // ── Strategy: Cache-First (map tiles — they rarely change) ──
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(request, clone));
          return response;
        }).catch(() => new Response('', { status: 503 }));
      })
    );

  } else if (isCDN) {
    // ── Strategy: Cache-First (CDN assets like Leaflet, jsPDF) ──
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(request, clone));
          return response;
        });
      })
    );

  } else {
    // ── Strategy: Cache-First with network fallback (App Shell) ─
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request)
          .then(response => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_VERSION).then(cache => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => {
            // If it's a navigation request, show the offline page
            if (request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            return new Response('', { status: 503 });
          });
      })
    );
  }
});

// ─── PUSH NOTIFICATIONS ────────────────────────────────────────
self.addEventListener('push', event => {
  let data = { title: '🚆 TrackMyTrain', body: 'You have a new train alert!' };
  try { data = event.data.json(); } catch(e) {}

  const options = {
    body: data.body || data.message,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-144.png',
    tag: data.tag || 'trackmytrain-notif',
    data: { url: data.url || '/' },
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    vibrate: [200, 100, 200],
    requireInteraction: data.priority === 'high',
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '🚆 TrackMyTrain', options)
  );
});

// ─── NOTIFICATION CLICK ────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // If app is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});

// ─── BACKGROUND SYNC (queue offline actions) ───────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-bookings') {
    console.log('[SW] Background sync: retrying queued bookings...');
    // In a full implementation, read from IndexedDB and retry
  }
});

console.log('[SW] TrackMyTrain Service Worker v10 loaded 🚆');
