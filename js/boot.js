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

cleanOldMissions();
showTab('home');
autoSync();
