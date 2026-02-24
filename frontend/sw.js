// Service Worker for offline support
const CACHE_NAME = 'klimat-test-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/app.js'
];

// Install service worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache opened');
                return cache.addAll(urlsToCache);
            })
    );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version if found
                if (response) {
                    return response;
                }
                
                // Otherwise fetch from network
                return fetch(event.request)
                    .then(response => {
                        // Don't cache API responses
                        if (event.request.url.includes('/api/')) {
                            return response;
                        }
                        
                        // Cache other responses
                        return caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, response.clone());
                                return response;
                            });
                    });
            })
    );
});

// Background sync for completed tasks
self.addEventListener('sync', event => {
    if (event.tag === 'sync-tasks') {
        event.waitUntil(syncTasks());
    }
});

async function syncTasks() {
    // This would sync with backend
    // For test, we just log
    console.log('Background sync triggered - would upload pending tasks');
}