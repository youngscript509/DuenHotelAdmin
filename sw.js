// sw.js – Service Worker pour Duen Hotel PWA
const CACHE_NAME = 'duen-hotel-v2.1';
const urlsToCache = [
  '/',
  '/index.html',
  '/firebase-config.js',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  // Ajoutez ici d'autres ressources statiques si vous les séparez (CSS, JS)
  // Exemple : '/css/styles.css', '/js/app.js'
];

// Installation – mise en cache des ressources essentielles
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker : mise en cache des ressources');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation – nettoyage des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker : suppression de l\'ancien cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Stratégie : Stale-While-Revalidate pour les requêtes GET
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Mettre à jour le cache avec la nouvelle réponse
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
            });
            return networkResponse;
          })
          .catch(() => {
            // En cas d'échec réseau, on retourne la réponse en cache si elle existe
            return cachedResponse;
          });

        // Retourner la réponse en cache immédiatement si disponible, sinon attendre le réseau
        return cachedResponse || fetchPromise;
      })
  );
});