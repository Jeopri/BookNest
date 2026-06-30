const CACHE = 'book-inventory-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(['/offline'])
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(
    fetch(request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((cache) => {
          if (request.url.startsWith(self.location.origin)) {
            cache.put(request, clone);
          }
        });
        return res;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match('/offline'))
      )
  );
});
