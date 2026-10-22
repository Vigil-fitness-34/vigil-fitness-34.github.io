// Offline-Speicher der Web-App (erzeugt von scripts/handy.js)
const SPEICHER = 'sales-universe-1792692617811';
const DATEIEN = ["./","index.html","manifest.webmanifest","icon-180.png","icon-192.png","icon-512-maskable.png","icon-512.png","fonts/inter-400.woff2","fonts/inter-500.woff2","fonts/inter-600.woff2","fonts/inter-700.woff2"];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SPEICHER).then((c) => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((alle) => Promise.all(alle.filter((n) => n !== SPEICHER).map((n) => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then((r) => {
      const kopie = r.clone();
      caches.open(SPEICHER).then((c) => c.put('index.html', kopie));
      return r;
    }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
