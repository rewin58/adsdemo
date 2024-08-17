const CACHE_NAME = 'my-pwa-cache-v1';
const APP_SHELL_URLS = [
    './',
    './index.html',
    './app.js',
    './icon.png',
    './manifest.json'
];

const APP_DOMAIN = 'https://microsoftedge.github.io/Demos/pwamp';

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(APP_SHELL_URLS))
    );
});

self.addEventListener('activate', (event) => {
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
    const url = new URL(event.request.url);

    // 处理对 '/app' 的请求
    if (url.pathname === '/app' || url.pathname.startsWith('/app/')) {
        event.respondWith(handleAppRequest(event.request));
        return;
    }

    // 处理PWA自身的资源请求
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});

async function handleAppRequest(request) {
    const originalUrl = new URL(request.url);
    const appPath = originalUrl.pathname === '/app' ? '/' : originalUrl.pathname.replace('/app', '');
    const appUrl = new URL(appPath + originalUrl.search, APP_DOMAIN);

    try {
        const response = await fetch(appUrl);
        
        // 处理HTML响应
        if (response.headers.get('Content-Type')?.includes('text/html')) {
            const text = await response.text();
            const modifiedHtml = text.replace(new RegExp(APP_DOMAIN, 'g'), originalUrl.origin + '/app');
            return new Response(modifiedHtml, {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
            });
        }

        return response;
    } catch (error) {
        console.error('Proxy request failed:', error);
        return new Response('Error: Unable to load content', { status: 500 });
    }
}