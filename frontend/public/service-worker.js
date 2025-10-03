/* eslint-disable no-restricted-globals */
// Service Worker for EasyCart PWA
// This service worker provides offline support, caching, and performance improvements

const CACHE_VERSION = 'easycart-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/css/main.css',
  '/static/js/main.js',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Maximum cache sizes
const MAX_DYNAMIC_CACHE_SIZE = 50;
const MAX_IMAGE_CACHE_SIZE = 60;

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[ServiceWorker] Caching static assets');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, {cache: 'reload'})));
      })
      .catch((error) => {
        console.error('[ServiceWorker] Failed to cache static assets:', error);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('easycart-') && cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE && cacheName !== IMAGE_CACHE;
            })
            .map((cacheName) => {
              console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Helper function to limit cache size
const limitCacheSize = (cacheName, maxSize) => {
  caches.open(cacheName).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > maxSize) {
        cache.delete(keys[0]).then(() => limitCacheSize(cacheName, maxSize));
      }
    });
  });
};

// Helper function to check if request is for an image
const isImageRequest = (request) => {
  return request.destination === 'image' || 
         request.url.match(/\.(jpg|jpeg|png|gif|svg|webp|ico)$/i);
};

// Helper function to check if request is for API
const isAPIRequest = (request) => {
  return request.url.includes('/api/');
};

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip cross-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests with network-first strategy
  if (isAPIRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before caching
          const responseClone = response.clone();
          
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
            limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_SIZE);
          });
          
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return offline page for HTML requests
              if (request.headers.get('accept').includes('text/html')) {
                return caches.match('/index.html');
              }
              return new Response(JSON.stringify({ error: 'Network unavailable' }), {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
    return;
  }

  // Handle image requests with cache-first strategy
  if (isImageRequest(request)) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request)
            .then((response) => {
              const responseClone = response.clone();
              
              caches.open(IMAGE_CACHE).then((cache) => {
                cache.put(request, responseClone);
                limitCacheSize(IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE);
              });
              
              return response;
            })
            .catch(() => {
              // Return a placeholder image or nothing
              return new Response('', { status: 404 });
            });
        })
    );
    return;
  }

  // Handle other requests with cache-first, network fallback
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Update cache in background
          fetch(request)
            .then((response) => {
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, response);
              });
            })
            .catch(() => {
              // Ignore network errors in background update
            });
          
          return cachedResponse;
        }
        
        return fetch(request)
          .then((response) => {
            const responseClone = response.clone();
            
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
              limitCacheSize(DYNAMIC_CACHE, MAX_DYNAMIC_CACHE_SIZE);
            });
            
            return response;
          })
          .catch(() => {
            // For navigation requests, return the index.html
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return new Response('', { status: 404 });
          });
      })
  );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames
              .filter((cacheName) => cacheName.startsWith('easycart-'))
              .map((cacheName) => caches.delete(cacheName))
          );
        })
        .then(() => {
          return self.clients.matchAll();
        })
        .then((clients) => {
          clients.forEach((client) => {
            client.postMessage({ type: 'CACHE_CLEARED' });
          });
        })
    );
  }
});

// Background sync for offline actions (when available)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(
      // Sync cart data when back online
      fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then((response) => {
          console.log('[ServiceWorker] Cart synced successfully');
        })
        .catch((error) => {
          console.error('[ServiceWorker] Failed to sync cart:', error);
        })
    );
  }
});

// Push notification support
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification from EasyCart',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icon-192x192.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('EasyCart', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
