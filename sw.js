
const CACHE_NAME = 'calmexec-v4-permanent';
const CORE_ASSETS = [
  './',
  './index.html',
  './index.tsx',
  './manifest.json',
  'https://cdn.tailwindcss.com'
];

/**
 * 辅助函数：安全地将路径解析为绝对 URL
 * 避免 'Failed to construct URL' 错误
 */
function resolveToAbsolute(path, base = self.location.href) {
  try {
    return new URL(path, base).href;
  } catch (e) {
    // 如果解析失败，返回原始路径
    return path;
  }
}

// 安装阶段：预缓存核心资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[SW] 正在构建本地镜像...');
      for (const assetPath of CORE_ASSETS) {
        try {
          const absoluteUrl = resolveToAbsolute(assetPath);
          const isRemote = absoluteUrl.startsWith('http');
          
          // 获取资源：CDN 资源采用 no-cors 以获取不透明响应
          const response = await fetch(absoluteUrl, { 
            mode: isRemote && !absoluteUrl.includes(self.location.origin) ? 'no-cors' : 'cors' 
          });
          
          // cache.put 要求第一个参数是 Request 或绝对 URL 字符串
          await cache.put(absoluteUrl, response);
        } catch (e) {
          console.warn('[SW] 预缓存失败:', assetPath, e);
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
    // request.url 理论上应始终是绝对 URL
    if (!request.url) return;
    url = new URL(request.url);
  } catch (e) {
    // 捕获 Invalid URL 异常，防止整个 SW 线程因个别非法请求挂掉
    return;
  }

  // 协议过滤
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // 业务逻辑过滤
  if (request.method !== 'GET') return;
  if (url.pathname.includes('/analysis/')) return;

  const isLibrary = url.origin.includes('esm.sh') || url.origin.includes('tailwindcss.com');
  
  // 匹配本地核心静态资源
  const isLocalStatic = CORE_ASSETS.some(asset => {
    const absoluteAssetUrl = resolveToAbsolute(asset);
    return url.href === absoluteAssetUrl;
  });

  // 1. 静态资源策略：缓存优先
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

  // 2. API 业务请求策略：网络优先
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
          // 离线时尝试返回缓存中的上一个成功请求
          return caches.match(request);
        })
    );
  }
});
