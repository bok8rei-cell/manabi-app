// オフラインでも使えるようにするための サービスワーカー
// ファイルを更新したら CACHE_NAME のバージョンを上げてください
const CACHE_NAME = 'manabi-app-v43.25';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/firebase-config.js',
  './js/algebra.js',
  './js/math.js',
  './js/math_jh.js',
  './js/kanji.js',
  './js/kokugo_jh.js',
  './js/dokkai.js',
  './js/rikashakai.js',
  './js/rikashakai_more.js',
  './js/rika_jh.js',
  './js/shakai_jh.js',
  './js/eigo.js',
  './js/eigo_jh.js',
  './js/store.js',
  './js/core.js',
  './js/lock.js',
  './js/fx.js',
  './js/pet.js',
  './js/bonus.js',
  './js/weekly.js',
  './js/balance.js',
  './js/shop.js',
  './js/pokobody.js',
  './js/room.js',
  './js/message.js',
  './js/solo.js',
  './js/explain.js',
  './js/steps.js',
  './js/math_extra.js',
  './js/math_super.js',
  './js/math_super_more.js',
  './js/math_figure.js',
  './js/steps_jh.js',
  './js/sync.js',
  './js/ranking.js',
  './js/speed.js',
  './js/quiz.js',
  './js/recommend.js',
  './js/focus.js',
  './js/home.js',
  './js/samples.js',
  './js/update.js',
  './js/boot.js',
  './icons/icon.svg',
  './icons/icon-180.png',
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
        if (response && response.ok) {   // エラーの ページは キャッシュしない
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() =>
        // オフライン：URLの ?以降（?u=… や ?v=…）が ちがっても、おなじ ファイルを 使う。
        // ページ（アプリの 開きなおし）を ひらく ときは、どの URLでも index.html を 出す。
        caches.match(event.request, { ignoreSearch: true }).then((hit) => {
          if (hit) return hit;
          if (event.request.mode === 'navigate') return caches.match('./index.html', { ignoreSearch: true });
          return hit;
        })
      )
  );
});
