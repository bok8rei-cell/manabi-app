// オフラインでも使えるようにするための サービスワーカー
// ファイルを更新したら CACHE_NAME のバージョンを上げてください
const CACHE_NAME = 'manabi-app-v35';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/firebase-config.js',
  './js/math.js',
  './js/kanji.js',
  './js/rikashakai.js',
  './js/eigo.js',
  './js/app.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // 自分のサイト（同一オリジン）のファイルだけをキャッシュ対象にする。
  // Firebase / Firestore など外部への通信は一切横取りせず、そのまま通す。
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // ネットワーク優先：オンラインなら常に最新を取得してキャッシュも更新する。
  // 通信に失敗したときだけキャッシュ（オフライン用）にフォールバックする。
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
