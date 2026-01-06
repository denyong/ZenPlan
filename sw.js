
const CACHE_NAME = 'calmexec-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './index.tsx',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 优先从缓存获取，如果缓存没有则请求网络并更新缓存 (Stale-while-revalidate)
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      });
      return response || fetchPromise;
    }).catch(() => {
      // 如果网络也失败了，这里可以返回一个离线提示页面
    })
  );
});
