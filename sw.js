
const CACHE_NAME = 'calmexec-v4-permanent';
const CORE_ASSETS = [
  './',
  './index.html',
  './index.tsx',
  './manifest.json',
  'https://cdn.tailwindcss.com'
];

// 安装阶段：预缓存核心资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] 正在构建本地镜像...');
      for (const url of CORE_ASSETS) {
        try {
          const isRemote = url.startsWith('http');
          const response = await fetch(url, { mode: isRemote ? 'no-cors' : 'cors' });
          await cache.put(url, response);
        } catch (e) {
          console.warn('[SW] 预缓存失败:', url, e);
        }
      }
    })
  );
  self.skipWaiting();
});

// 激活阶段：清理旧版本缓存
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

// 拦截并处理请求
self.addEventListener('fetch', (event) => {
  const { request } = event;
  let url;
  
  try {
    // 必须确保 request.url 存在且有效
    if (!request.url) return;
    url = new URL(request.url);
  } catch (e) {
    // 捕获 Invalid URL 异常，防止 SW 线程崩溃
    return;
  }

  // 严格过滤：仅处理 http/https 协议
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // 忽略非 GET 请求和特定的 AI 流式接口
  if (request.method !== 'GET') return;
  if (url.pathname.includes('/analysis/')) return;

  const isLibrary = url.origin.includes('esm.sh') || url.origin.includes('tailwindcss.com');
  
  // 检查是否为核心静态资源
  const isLocalStatic = CORE_ASSETS.some(asset => {
    try {
      const base = self.location.href;
      if (!base || base === 'about:blank') return false;
      const absoluteAssetUrl = new URL(asset, base).href;
      return url.href === absoluteAssetUrl;
    } catch (e) {
      return false;
    }
  });

  // 静态资源策略：缓存优先
  if (isLibrary || isLocalStatic || url.pathname.endsWith('.js') || url.pathname.endsWith('.tsx')) {
    event.respondWith(
      caches.match(request).then(async (cachedResponse) => {
        if (cachedResponse) return cachedResponse;

        try {
          const fetchOptions = isLibrary ? { mode: 'no-cors' } : {};
          const networkResponse = await fetch(request, fetchOptions);
          
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

  // API 业务请求策略：网络优先
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
        .catch(() => {
          return caches.match(request);
        })
    );
  }
});
