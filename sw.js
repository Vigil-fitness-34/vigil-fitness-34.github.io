// Offline-Speicher der Web-App (erzeugt von scripts/handy.js)
const SPEICHER = 'sales-universe-1793052681323';
const DATEIEN = ["./","index.html","manifest.webmanifest","icon-180.png","icon-192.png","icon-512-maskable.png","icon-512.png","fonts/inter-400.woff2","fonts/inter-500.woff2","fonts/inter-600.woff2","fonts/inter-700.woff2","ton/richtig.mp3","ton/falsch.mp3","ton/fertig.mp3"];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SPEICHER).then((c) => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  // Nur eigene Speicher löschen: VIGIL, Sonnenklar und Lernklar liegen auf derselben Adresse
  e.waitUntil(caches.keys().then((alle) => Promise.all(alle.filter((n) => n.startsWith('sales-universe-') && n !== SPEICHER).map((n) => caches.delete(n)))).then(() => self.clients.claim()));
});
// Tägliche Erinnerung: Der Server schickt nur einen leeren Anstoß, der Text steht hier
self.addEventListener('push', (e) => {
  const en = (self.navigator.language || '').startsWith('en');
  e.waitUntil(self.registration.showNotification('Sales Universe', {
    body: en ? 'A few minutes of sales today? Your streak is waiting.' : 'Ein paar Minuten Sales heute? Deine Serie wartet.',
    icon: 'icon-192.png', badge: 'icon-192.png', tag: 'erinnerung', renotify: false,
  }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((offen) => (offen.length ? offen[0].focus() : self.clients.openWindow('./'))));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  // Andere Apps auf derselben Adresse (eigene Ordner) nicht anfassen
  const pfad = new URL(e.request.url).pathname;
  if (['/vigil', '/sonnenklar', '/uni', '/webseite'].some((o) => pfad === o || pfad.startsWith(o + '/'))) return;
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
