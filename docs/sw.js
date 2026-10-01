// Funciona sin conexión. La página se pide primero a la red para recibir siempre la última versión.
const CACHE = "incentivos-v4";
const FILES = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const same = new URL(e.request.url).origin === location.origin;
  e.respondWith(caches.open(CACHE).then(async c => {
    try {
      const r = await fetch(e.request);
      if (r.ok && same) c.put(e.request, r.clone());
      return r;
    } catch (err) {
      return (await c.match(e.request)) || (await c.match("index.html"));
    }
  }));
});
