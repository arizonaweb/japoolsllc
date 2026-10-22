// J & A Pools LLC — minimal service worker.
// Network-first for page loads so visitors always see the latest site;
// falls back to the last cached copy of the page when offline.
const CACHE = 'ja-pools-shell-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || req.mode !== 'navigate') return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put('/', copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match('/').then((r) => r || Response.error()))
  );
});
