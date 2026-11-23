// Zeitnachweis-Check – Offline-Speicher der Web-App
// Bei jeder neuen App-Version VERSION erhöhen, dann holen sich alle Geräte die neuen Dateien.
const VERSION = 'zn-web-22';
const DATEIEN = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

// Erst aus dem Speicher (startet auch ohne Internet), im Hintergrund aktualisieren
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async (c) => {
    const alt = await c.match(e.request, { ignoreSearch: true });
    const neu = fetch(e.request).then((r) => { if (r && r.ok) c.put(e.request, r.clone()); return r; }).catch(() => alt);
    return alt || neu;
  }));
});
