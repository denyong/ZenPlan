
const CACHE_NAME = 'calmexec-v3-permanent';
// 这里的列表是系统启动的最核心资源
const CORE_ASSETS = [
  './',
  './index.html',
  './index.tsx',
  './manifest.json',
  'https://cdn.tailwindcss.com'
];

// 安装阶段：强制把核心资源和一些常用的 esm.sh 库抓取到本地
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] 正在构建本地镜像...');
      return cache.addAll(CORE_ASSETS);
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

  // 1. 忽略非 GET 请求
  if (request.method !== 'GET') return;

  // 2. 忽略流式分析接口（必须联网）
  if (url.pathname.includes('/analysis/')) return;

  // 3. 策略：缓存优先 (Cache First) 
  // 针对静态资源、第三方库(esm.sh)、CDN 脚本。
  // 一旦存入缓存，除非用户手动清空浏览器数据，否则永远不再请求网络。
  const isLibrary = url.origin.includes('esm.sh') || url.origin.includes('tailwindcss.com');
  const isLocalStatic = CORE_ASSETS.some(asset => request.url.includes(asset.replace('./', '')));

  if (isLibrary || isLocalStatic || url.pathname.endsWith('.js') || url.pathname.endsWith('.tsx')) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const cacheCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, cacheCopy);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 4. 针对普通 API 请求：网络优先 (Network First)
  if (url.pathname.includes('/api/v1/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const cacheCopy = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, cacheCopy);
          });
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
  }
});
