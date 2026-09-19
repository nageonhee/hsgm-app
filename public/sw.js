// 이전 PWA 캐시 전면 삭제 및 서비스 워커 무효화
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName); // 모든 구버전 캐시 즉시 제거
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 항상 네트워크 최신 데이터를 가져오도록 처리
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
