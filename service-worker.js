const CACHE_NAME = 'my-pwa-cache-v1';
const APP_SHELL_URLS = [
    './',
    './index.html',
    './app.js',
    './icon.png',
    './manifest.json',
    './app-shell.html'  // 新增的空白页面
];

self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL_URLS))
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activating.');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});