// Page = network-first (updates apply on next load, cached copy used offline). CDN assets = cache-first.
const CACHE = 'roi-monitor-v2';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const same = new URL(r.url).origin === location.origin;
  e.respondWith(caches.open(CACHE).then(async c => {
    if (same) {
      try { const n = await fetch(r, { cache: 'no-store' }); if (n.ok) c.put(r, n.clone()); return n; }
      catch (_) { return (await c.match(r, { ignoreSearch: true })) || Response.error(); }
    }
    const hit = await c.match(r, { ignoreSearch: true });
    if (hit) return hit;
    const n = await fetch(r);
    if (n && (n.ok || n.type === 'opaque')) c.put(r, n.clone());
    return n;
  }));
});
