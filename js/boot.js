// ===== 起動時の配線 =====

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    FX.tap();
    showTab(btn.dataset.tab);
  });
});

document.querySelectorAll('[data-back]').forEach(btn => {
  btn.addEventListener('click', () => showTab(btn.dataset.back));
});

byId('solo-toggle').addEventListener('change', (e) => {
  setSoloOn(e.target.checked);
  autoSync();
});

byId('sound-toggle').addEventListener('change', (e) => {
  try { localStorage.setItem('manabi_sound', e.target.checked ? 'on' : 'off'); } catch (err) { /* 無視 */ }
  if (e.target.checked) FX.correct();
});

byId('sync-open-btn').addEventListener('click', () => {
  byId('sync-message').textContent = lastSyncText();
  showScreen('sync');
});

// おうちの人用の端末は、最初に「おうちの人の画面」を出す
byId('parent-open-btn').addEventListener('click', () => showTab('parent'));
const parentToggle = byId('parent-mode-toggle');
parentToggle.checked = localStorage.getItem('manabi_parentmode') === '1';
parentToggle.addEventListener('change', async (e) => {
  if (!(await requireParent('おうちの人用の スイッチ'))) { e.target.checked = !e.target.checked; return; }
  try { localStorage.setItem('manabi_parentmode', e.target.checked ? '1' : '0'); } catch (err) { /* 無視 */ }
});

// ほかのアプリから戻ってきたときにも、自動で合わせる（iPad はアプリを閉じずに置いておくことが多いため）
let lastAutoSyncAt = Date.now();
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && Date.now() - lastAutoSyncAt > 30000) {
    lastAutoSyncAt = Date.now();
    autoSync();
  }
});

// アプリを ひらいている あいだは、1ぷんごとに 自動で合わせる（3人が どうじに やっても 数字が ずれつづけないように）。
// 通信は 裏で 動くだけなので、勉強の じゃまには ならない。画面が かくれている間・オフラインの間は うごかさない
const AUTO_SYNC_EVERY_MS = 60 * 1000;
setInterval(() => {
  if (document.visibilityState !== 'visible') return;
  if (Date.now() - lastAutoSyncAt < AUTO_SYNC_EVERY_MS - 5000) return;   // さっき 合わせたばかりなら 休む
  lastAutoSyncAt = Date.now();
  autoSync();
}, AUTO_SYNC_EVERY_MS);

cleanOldMissions();
showTab(localStorage.getItem('manabi_parentmode') === '1' ? 'parent' : 'home');
autoSync();
