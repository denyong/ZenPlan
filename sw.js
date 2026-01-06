
const CACHE_NAME = 'calmexec-v3-permanent';
const CORE_ASSETS = [
  './',
  './index.html',
  './index.tsx',
  './manifest.json',
  'https://cdn.tailwindcss.com'
];

// 安装阶段：手动 fetch 资源以支持 no-cors
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] 正在构建本地镜像...');
      for (const url of CORE_ASSETS) {
        try {
          // 针对跨域资源使用 no-cors 模式
          const requestMode = url.includes('http') ? 'no-cors' : 'cors';
          const response = await fetch(url, { mode: requestMode });
          await cache.put(url, response);
        } catch (e) {
          console.warn('[SW] 预缓存失败:', url, e);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (url.pathname.includes('/analysis/')) return;

  const isLibrary = url.origin.includes('esm.sh') || url.origin.includes('tailwindcss.com');
  const isLocalStatic = CORE_ASSETS.some(asset => request.url.includes(asset.replace('./', '')));

  if (isLibrary || isLocalStatic || url.pathname.endsWith('.js') || url.pathname.endsWith('.tsx')) {
    event.respondWith(
      caches.match(request).then(async (cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        try {
          // 外部库若常规 fetch 失败，尝试 no-cors 模式
          const fetchOptions = isLibrary ? { mode: 'no-cors' } : {};
          const networkResponse = await fetch(request, fetchOptions);
          
          // 立即克隆，不透明响应 (type: opaque) 虽然 ok 为 false 但依然可以缓存
          if (networkResponse) {
            const cacheCopy = networkResponse.clone();
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, cacheCopy);
          }
          return networkResponse;
        } catch (e) {
          return null;
        }
      })
    );
    return;
  }

  // API 请求：网络优先
  if (url.pathname.includes('/api/v1/')) {
    event.respondWith(
      fetch(request)
        .then(async (networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const cacheCopy = networkResponse.clone();
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, cacheCopy);
          }
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
  }
});
