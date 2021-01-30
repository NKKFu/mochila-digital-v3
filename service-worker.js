// Names of the two caches used in this version of the service worker.
// Change to v2, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
const PRECACHE = 'precache-v3';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
    './', // Alias for index.html
    'index.html',
    'style.css',
    'main.js',
    'manifest.webmanifest',
    'service-worker.js',
];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(PRECACHE)
        .then(cache => cache.addAll(PRECACHE_URLS))
        .then(self.skipWaiting())
    );
});

// The activate handler takes care of cleaning up old caches.
// self.addEventListener('activate', event => {
//     const currentCaches = [PRECACHE, RUNTIME];
//     event.waitUntil(
//         caches.keys().then(cacheNames => {
//             return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
//         }).then(cachesToDelete => {
//             return Promise.all(cachesToDelete.map(cacheToDelete => {
//                 return caches.delete(cacheToDelete);
//             }));
//         }).then(() => self.clients.claim())
//     );
// });

self.addEventListener('activate', function activator(event) {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(keys
                .filter((key) => {
                    return key.indexOf(PRECACHE) !== 0;
                })
                .map((key) => {
                    return caches.delete(key);
                })
            );
        })
    );
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(cachedResponse) {
            return cachedResponse || fetch(event.request);
        })
    );
});