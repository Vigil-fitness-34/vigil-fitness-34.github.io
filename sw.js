/* VIGIL Service Worker – macht die App offline-fähig.
   Version erhöhen, wenn index.html geändert wurde, damit Handys das Update laden. */
const CACHE = 'vigil-v10';
const FONTS = 'vigil-fonts';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png',
  './img/bg_beach.jpg', './img/bg_mountain.jpg', './img/bg_park.jpg', './img/bg_rooftop.jpg', './img/bg_studio.jpg', './img/bg_track.jpg', './img/i_aura_fire.jpg', './img/i_aura_focus.jpg', './img/i_aura_motiv.jpg', './img/i_aura_nature.jpg', './img/i_aura_shadow.jpg', './img/i_aura_storm.jpg', './img/i_bag.jpg', './img/i_band.jpg', './img/i_beanie.jpg', './img/i_belt.jpg', './img/i_bottle.jpg', './img/i_cap.jpg', './img/i_champ.jpg', './img/i_crown.jpg', './img/i_cuffs.jpg', './img/i_friend.jpg', './img/i_helm.jpg', './img/i_hoodie.jpg', './img/i_mission.jpg', './img/i_motiv.jpg', './img/i_phones.jpg', './img/i_prohoodie.jpg', './img/i_protein.jpg', './img/i_regen.jpg', './img/i_skin_earth.jpg', './img/i_skin_fire.jpg', './img/i_skin_ice.jpg', './img/i_skin_moon.jpg', './img/i_skin_shadow.jpg', './img/i_skin_std.jpg', './img/i_skin_thunder.jpg', './img/i_street.jpg', './img/i_tank.jpg', './img/i_towel.jpg', './img/i_vest.jpg', './img/i_watch.jpg', './img/i_xp.jpg', './img/wolf6.webp'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== FONTS).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // App-Dateien: sofort aus dem Cache (schnell im Gym), im Hintergrund aktualisieren.
  if (url.origin === location.origin) {
    const key = req.mode === 'navigate' ? './index.html' : req;
    e.respondWith(caches.open(CACHE).then(async cache => {
      const cached = await cache.match(key, { ignoreSearch: true });
      const network = fetch(req).then(res => {
        if (res && res.ok) cache.put(key, res.clone());
        return res;
      }).catch(() => null);
      if (cached) { e.waitUntil(network); return cached; }
      return (await network) || new Response('Offline', { status: 503, statusText: 'Offline' });
    }));
    return;
  }

  // Google Fonts: einmal laden, danach offline aus dem Cache.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONTS).then(async cache => {
      const cached = await cache.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
        return res;
      } catch (err) {
        return new Response('', { status: 504 });
      }
    }));
  }
});
