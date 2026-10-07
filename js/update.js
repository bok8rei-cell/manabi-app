// ===== あたらしくする（更新）ボタン =====
// 学習データは localStorage に残るので、キャッシュだけを消して再読み込みする。
document.getElementById('refresh-btn').addEventListener('click', async () => {
  const btn = document.getElementById('refresh-btn');
  btn.disabled = true;
  btn.classList.add('busy');

  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.unregister();
      }
    }
    if (window.caches) {
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
      }
    }

    // キャッシュバスター付きでリロード
    window.location.href = window.location.href + (window.location.href.includes('?') ? '&' : '?') + 'v=' + Date.now();
  } catch (e) {
    console.error('更新失敗:', e);
    btn.disabled = false;
    btn.classList.remove('busy');
    showToast('こうしんに しっぱいしました。もういちど ためしてね');
  }
});
