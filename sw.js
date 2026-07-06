const CACHE_NAME = "duen-hotel-room-v2"; // bump de version pour forcer le rafraîchissement du cache
const APP_SHELL = [
  "index.html",
  "manifest.json",
  "firebase-config.js",
  "favicon-192.png",
  "favicon-512.png",
  "sw.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Stratégie : App shell "cache first" (assets locaux). Le reste (Firestore, CDN)
// passe directement au réseau — IndexedDB gère déjà le mode hors-ligne des données.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // On ne gère que le GET, même origine. Tout le reste (Firestore, CDN, POST...)
  // passe directement au réseau sans interception.
  if (url.origin !== self.location.origin) return;
  if (event.request.method !== "GET") return;

  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      try {
        const networkResponse = await fetch(event.request);

        // On ne clone/cache QUE les réponses "basic" (même origine, valides).
        // Les réponses opaques/redirigées/erreurs ne se clonent pas de façon
        // fiable et sont la cause la plus fréquente de l'erreur
        // "Response body is already used".
        if (networkResponse && networkResponse.ok && networkResponse.type === "basic") {
          // Cloner IMMÉDIATEMENT, avant tout autre traitement du corps.
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(() => {
              /* mise en cache best-effort — on ignore un échec ponctuel */
            });
          });
        }

        return networkResponse;
      } catch (err) {
        // Hors ligne / échec réseau : on retombe sur le cache s'il existe,
        // sinon on laisse l'erreur remonter (page non disponible hors ligne).
        if (cached) return cached;
        throw err;
      }
    })()
  );
});