const CACHE_NAME = 'move-strong-rehab-v2.1.3';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css?v=2.1.3',
  './app.js?v=2.1.3',
  './health-model.js?v=2.1.3',
  './exercise-instructions.js?v=2.1.3',
  './health-os.js?v=2.1.3',
  './navigation.js?v=2.1.3',
  './push-client.js?v=2.1.3',
  './health-os.css?v=2.1.3',
  './manifest.webmanifest',
  './assets/icons/move-strong-192.png',
  './assets/icons/move-strong-512.png',
  './assets/icons/badge-96.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith('move-strong-rehab-') && key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
    const client = clients.find(c => c.url.startsWith(self.registration.scope));
    return client ? client.focus() : self.clients.openWindow('./');
  }));
});

self.addEventListener('push', event => {
  let data = {};
  try { data = event.data?.json() || {}; } catch {}
  event.waitUntil(self.registration.showNotification(data.title || 'Move Strong reminder', {
    body: data.body || 'Open your daily plan.', tag: data.tag || 'move-strong-reminder',
    icon: './assets/icons/move-strong-192.png', badge: './assets/icons/badge-96.png',
    data: { url: self.registration.scope }
  }));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  // Fetch current Android install metadata, retaining an offline fallback.
  if (requestUrl.pathname.endsWith('/manifest.webmanifest')) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        const response = await fetch(event.request, { cache: 'no-cache' });
        if (!response.ok) throw new Error('Manifest unavailable');
        await cache.put(event.request, response.clone());
        return response;
      } catch {
        return (await cache.match(event.request)) || Response.error();
      }
    })());
    return;
  }
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
