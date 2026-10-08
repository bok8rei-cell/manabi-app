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
parentToggle.addEventListener('change', (e) => {
  try { localStorage.setItem('manabi_parentmode', e.target.checked ? '1' : '0'); } catch (err) { /* 無視 */ }
});

cleanOldMissions();
showTab(localStorage.getItem('manabi_parentmode') === '1' ? 'parent' : 'home');
autoSync();
