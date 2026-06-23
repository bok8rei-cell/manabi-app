// ===== BRAIN QUEST：零式 メインスクリプト =====

const APP_VERSION = 'v23';
const TOTAL_QUESTIONS = 10;
const DONT_KNOW = '__DONTKNOW__';

// バージョンチェック: 新しいバージョンが利用可能なら Service Worker を更新
function checkAndUpdateServiceWorker() {
  const lastVersion = localStorage.getItem('manabi_app_version');
  if (lastVersion !== APP_VERSION) {
    localStorage.setItem('manabi_app_version', APP_VERSION);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => reg.unregister());
      });
    }
  }
}

checkAndUpdateServiceWorker();

const SUBJECTS = [
  { key: 'math',      label: '算数',          kanaLabel: 'さんすう',              cls: '' },
  { key: 'kanji',     label: '国語（漢字）',   kanaLabel: 'こくご（かんじ）',      cls: 'kokugo' },
  { key: 'kotowaza',  label: 'ことわざ・慣用句', kanaLabel: 'ことわざ・かんようく', cls: 'kokugo', grades: [3, 5, 7] },
  { key: 'rikashakai',label: '理科・社会',     kanaLabel: 'りか・しゃかい',        cls: 'rikashakai', grades: [3, 5, 7] },
  { key: 'eigo',      label: '英語',          kanaLabel: 'えいご',               cls: 'eigo' }
];

const ALL_GRADES = [1, 3, 5, 7];

function gradeLabel(grade) {
  return grade === 7 ? '中学1年生' : `${grade}年生`;
}

function subjectLabel(grade, subj) {
  if (grade === 1) return subj.kanaLabel;
  if (grade === 7 && subj.key === 'math') return '数学';
  if (subj.key === 'kotowaza' && grade === 7) return '熟語・ことわざ';
  return subj.label;
}

const GENERATORS = {
  math:       generateMathProblem,
  kanji:      generateKanjiProblem,
  kotowaza:   generateKotowazaProblem,
  rikashakai: generateRikaShakaiProblem,
  eigo:       generateEigoProblem
};

// ===== 難易度管理 =====
const DIFF_KEY = 'manabi_diff';
const DIFF_LABELS = ['やさしい', 'ふつう', 'むずかしい'];
const DIFF_STARS  = ['⭐', '⭐⭐', '⭐⭐⭐'];

function getDiff(grade, subject) {
  const raw = localStorage.getItem(`${DIFF_KEY}_${grade}_${subject}`);
  return raw !== null ? parseInt(raw) : 1;
}

function setDiff(grade, subject, level) {
  const v = Math.max(0, Math.min(2, level));
  localStorage.setItem(`${DIFF_KEY}_${grade}_${subject}`, String(v));
  return v;
}

// 管理者用: すべての難易度をリセット
function resetAllDifficultiesToEasy() {
  ALL_GRADES.forEach(grade => {
    SUBJECTS.forEach(subj => {
      setDiff(grade, subj.key, 0);
    });
  });
  console.log('✓ すべての難易度をリセットしました');
}

// ===== 昇段チャレンジシステム =====
const CHALLENGE_KEY = 'manabi_challenge';
const CHALLENGE_ATTEMPT_KEY = 'manabi_challenge_attempt';

function getChallengeKey(grade, subject, diffLevel) {
  return `${CHALLENGE_KEY}_${grade}_${subject}_${diffLevel}`;
}

function getChallengeAttemptKey(grade, subject, diffLevel) {
  return `${CHALLENGE_ATTEMPT_KEY}_${grade}_${subject}_${diffLevel}`;
}

function hasChallenge(grade, subject) {
  const cur = getDiff(grade, subject);
  if (cur >= 2) return false;
  const nextLevel = cur + 1;
  const key = getChallengeKey(grade, subject, nextLevel);
  return localStorage.getItem(key) !== null;
}

function offerChallenge(grade, subject) {
  const cur = getDiff(grade, subject);
  if (cur >= 2) return null;
  const nextLevel = cur + 1;
  const key = getChallengeKey(grade, subject, nextLevel);
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem(key, today);
  return nextLevel;
}

function canAttemptChallenge(grade, subject, diffLevel) {
  const attemptKey = getChallengeAttemptKey(grade, subject, diffLevel);
  const lastAttempt = localStorage.getItem(attemptKey);
  const today = new Date().toISOString().slice(0, 10);
  return lastAttempt !== today;
}

function markChallengeAttempt(grade, subject, diffLevel) {
  const attemptKey = getChallengeAttemptKey(grade, subject, diffLevel);
  const today = new Date().toISOString().slice(0, 10);
  localStorage.setItem(attemptKey, today);
}

function passChallengeAndUpgrade(grade, subject, diffLevel) {
  setDiff(grade, subject, diffLevel);
  const key = getChallengeKey(grade, subject, diffLevel);
  localStorage.removeItem(key);
  const attemptKey = getChallengeAttemptKey(grade, subject, diffLevel);
  localStorage.removeItem(attemptKey);
}

function teacherEvaluate(grade, subject, correct, total) {
  const rate = correct / total;
  const cur  = getDiff(grade, subject);
  let next   = cur;
  let comment, badge, showChallenge = false;

  if (rate >= 0.8) {
    if (cur < 2) {
      offerChallenge(grade, subject);
      showChallenge = true;
      comment = rate === 1 ? '🌟 かんぺき！すごいです！' : '✨ よくできました！';
      badge = '🚀 つぎのレベルに チャレンジできます！';
    } else {
      comment = rate === 1 ? '🌟 かんぺき！すごいです！' : '✨ よくできました！';
      badge = '🏆 もうさいこうレベル！';
    }
  } else if (rate >= 0.5) {
    comment = '👍 よくがんばりました！';
    badge = '➡️ このままつづけよう';
  } else {
    next = Math.max(0, cur - 1);
    setDiff(grade, subject, next);
    comment = '💪 もう少しれんしゅうしよう！';
    badge = next < cur ? '⬇️ もう少しやさしくします' : 'このレベルでもう少し！';
    return { comment, badge, level: next, showChallenge: false };
  }

  return { comment, badge, level: cur, showChallenge };
}

// ---- アプリの状態 ----
const state = {
  grade: null,
  subject: null,
  questionIndex: 0,
  correctCount: 0,
  incorrectCount: 0,
  currentProblem: null,
  selectedChoice: null,
  answered: false,
  playerName: ''
};

// ---- なまえ入力 ----
const playerNameInput = document.getElementById('player-name');
const playerNameSaved = document.getElementById('player-name-saved');
state.playerName = localStorage.getItem('manabi_playername') || '';
playerNameInput.value = state.playerName;

function loadPlayerNames() {
  const raw = localStorage.getItem('manabi_playernames');
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function selectPlayerName(name) {
  state.playerName = name;
  localStorage.setItem('manabi_playername', state.playerName);
  playerNameInput.value = name;
  renderPlayerNameSaved();
  if (cloudDb) performCloudSync().catch(() => {});
}

function deletePlayerName(name) {
  const names = loadPlayerNames().filter(n => n !== name);
  localStorage.setItem('manabi_playernames', JSON.stringify(names));
  if (state.playerName === name) {
    state.playerName = '';
    localStorage.removeItem('manabi_playername');
    playerNameInput.value = '';
  }
  renderPlayerNameSaved();
}

function renderPlayerNameSaved() {
  playerNameSaved.innerHTML = '';
  loadPlayerNames().forEach(name => {
    const btn = document.createElement('button');
    btn.className = 'name-chip';
    if (name === state.playerName) btn.classList.add('selected');
    btn.textContent = name;
    btn.addEventListener('click', () => selectPlayerName(name));

    let pressTimer;
    const startPress = () => {
      pressTimer = setTimeout(() => deletePlayerName(name), 700);
    };
    const cancelPress = () => clearTimeout(pressTimer);
    btn.addEventListener('touchstart', startPress, { passive: true });
    btn.addEventListener('touchend',   cancelPress);
    btn.addEventListener('touchmove',  cancelPress);
    btn.addEventListener('mousedown',  startPress);
    btn.addEventListener('mouseup',    cancelPress);
    btn.addEventListener('mouseleave', cancelPress);

    playerNameSaved.appendChild(btn);
  });
}

function registerPlayerName(name) {
  if (!name) return;
  const names = loadPlayerNames();
  if (!names.includes(name)) {
    names.unshift(name);
    localStorage.setItem('manabi_playernames', JSON.stringify(names.slice(0, 10)));
  }
  renderPlayerNameSaved();
}

renderPlayerNameSaved();

playerNameInput.addEventListener('input', () => {
  state.playerName = playerNameInput.value.trim();
  localStorage.setItem('manabi_playername', state.playerName);
  renderPlayerNameSaved();
});
playerNameInput.addEventListener('change', () => {
  registerPlayerName(state.playerName);
  if (cloudDb && state.playerName) performCloudSync().catch(() => {});
});

// ---- 画面切り替え ----
function showScreen(name) {
  document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
  document.getElementById(`screen-${name}`).classList.remove('hidden');
}

// ---- 進捗の保存・読み込み ----
function progressKey(grade, subject) {
  return `manabi_progress_g${grade}_${subject}`;
}

function loadProgress(grade, subject) {
  const raw = localStorage.getItem(progressKey(grade, subject));
  if (!raw) return { correct: 0, total: 0, best: 0, streak: 0, lastDate: null };
  try {
    return JSON.parse(raw);
  } catch (e) {
    return { correct: 0, total: 0, best: 0, streak: 0, lastDate: null };
  }
}

function saveProgress(grade, subject, sessionCorrect, sessionTotal) {
  const p = loadProgress(grade, subject);
  p.correct += sessionCorrect;
  p.total += sessionTotal;
  if (sessionCorrect > p.best) p.best = sessionCorrect;

  const today = new Date().toISOString().slice(0, 10);
  if (p.lastDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (p.lastDate === yesterday) {
      p.streak = (p.streak || 0) + 1;
    } else {
      p.streak = 1;
    }
    p.lastDate = today;
  }

  localStorage.setItem(progressKey(grade, subject), JSON.stringify(p));
  return p;
}

// ---- ホーム画面 ----
document.querySelectorAll('.grade-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    state.grade = Number(btn.dataset.grade);
    showSubjectScreen();
  });
});

// 画面を開く前に、同期コードが設定されていればクラウドの最新データを取り込む
const SYNC_CONTENT_IDS = {
  showReportScreen: 'report-content',
  showRankingScreen: 'ranking-content',
  showSpeedRankingScreen: 'speedranking-content'
};

async function syncBeforeShow(showFn) {
  showFn(); // まず即座に画面を表示
  const container = document.getElementById(SYNC_CONTENT_IDS[showFn.name]);
  const syncCode = syncCodeInput.value.trim();

  if (!getActiveSyncCode()) {
    // なまえも同期コードも未設定 → 案内を表示
    if (container) {
      const notice = document.createElement('div');
      notice.className = 'sync-notice';
      notice.textContent = '💡 ホーム画面でなまえを入力すると、他の端末のデータも自動で見られます。';
      container.prepend(notice);
    }
    return;
  }

  if (!cloudDb) return;

  // 同期コードあり → ローディング表示してクラウド同期
  let loadingEl = null;
  if (container) {
    loadingEl = document.createElement('div');
    loadingEl.className = 'sync-loading';
    loadingEl.textContent = '☁️ 最新データを取得中...';
    container.prepend(loadingEl);
  }

  try {
    await performCloudSync();
    showFn(); // 同期後に再描画
  } catch (e) {
    if (loadingEl && loadingEl.parentNode) {
      loadingEl.className = 'sync-notice sync-notice-error';
      loadingEl.textContent = '⚠️ クラウドとの同期に失敗しました。通信環境を確認してください。';
    }
  }
}

document.getElementById('report-open-btn').addEventListener('click', () => {
  syncBeforeShow(showReportScreen);
});

document.getElementById('ranking-open-btn').addEventListener('click', () => {
  syncBeforeShow(showRankingScreen);
});

document.getElementById('sync-open-btn').addEventListener('click', () => {
  document.getElementById('sync-message').textContent = '';
  showScreen('sync');
});

// ---- 端末間のデータ同期（書き出し・読み込み） ----
function collectSyncData() {
  const data = { progress: {}, ranking: {}, playerName: state.playerName };
  ALL_GRADES.forEach(grade => {
    SUBJECTS.forEach(subj => {
      const key = progressKey(grade, subj.key);
      const raw = localStorage.getItem(key);
      if (raw) data.progress[key] = JSON.parse(raw);
    });
    const rKey = rankingKey(grade);
    const raw = localStorage.getItem(rKey);
    if (raw) data.ranking[rKey] = JSON.parse(raw);
  });
  const speedRaw = localStorage.getItem(SPEED_RANKING_KEY);
  if (speedRaw) data.ranking[SPEED_RANKING_KEY] = JSON.parse(speedRaw);
  return data;
}

// ===== 全プレイヤーのデータを一括抽出（クラウド保存用） =====
function collectAllPlayersData() {
  const allData = { version: 1, allPlayers: {} };

  // ローカルストレージの全キーをスキャン
  const allKeys = Object.keys(localStorage);

  // プレイヤー名を抽出（manabi_player_name_* パターン）
  const playerNames = new Set();
  allKeys.forEach(key => {
    // プレイヤー名キー：manabi_player_name または manabi_player_name_N
    if (key === 'manabi_player_name' || key.match(/^manabi_player_name_\d+$/)) {
      const name = localStorage.getItem(key);
      if (name) playerNames.add(name);
    }
  });

  // ランキングデータから名前も抽出
  const rankingKeys = Object.keys(localStorage).filter(k => k.match(/^manabi_ranking/));
  rankingKeys.forEach(key => {
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const ranking = JSON.parse(raw);
        if (Array.isArray(ranking)) {
          ranking.forEach(entry => {
            if (entry.name) playerNames.add(entry.name);
          });
        }
      } catch (e) {}
    }
  });

  // 各プレイヤーのデータを集約
  playerNames.forEach(playerName => {
    const playerData = { progress: {}, ranking: {} };

    // このプレイヤーの進捗データ
    ALL_GRADES.forEach(grade => {
      SUBJECTS.forEach(subj => {
        const key = progressKey(grade, subj.key);
        const raw = localStorage.getItem(key);
        if (raw) {
          try {
            const progress = JSON.parse(raw);
            // このプレイヤーの記録かチェック（ランキングから推測）
            playerData.progress[key] = progress;
          } catch (e) {}
        }
      });
    });

    // ランキングデータ（プレイヤー名でフィルタ）
    rankingKeys.forEach(key => {
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const ranking = JSON.parse(raw);
          if (Array.isArray(ranking)) {
            playerData.ranking[key] = ranking.filter(entry => entry.name === playerName);
          }
        } catch (e) {}
      }
    });

    allData.allPlayers[playerName] = playerData;
  });

  return allData;
}

// クラウドに全プレイヤーデータを保存
async function saveAllPlayersToCloud() {
  if (!cloudDb) return false;

  const allData = collectAllPlayersData();
  const syncCode = '1'; // 固定で「1」を使用

  try {
    const docRef = cloudDb.collection('syncCodes').doc(syncCode);
    await docRef.set(allData);
    console.log('✓ 全プレイヤーデータをクラウドに保存しました');
    return true;
  } catch (e) {
    console.error('クラウド保存失敗:', e);
    return false;
  }
}

// ランキングの並び順（タイムアタックは時間が速い順、それ以外は正答率が高い順）
function rankingSortFn(key) {
  if (key === SPEED_RANKING_KEY) {
    return (a, b) => b.correct - a.correct || a.time - b.time || (a.date < b.date ? 1 : -1);
  }
  return (a, b) => b.rate - a.rate || b.correct - a.correct || (a.date < b.date ? 1 : -1);
}

function mergeProgress(a, b) {
  return {
    correct: (a.correct || 0) + (b.correct || 0),
    total: (a.total || 0) + (b.total || 0),
    best: Math.max(a.best || 0, b.best || 0),
    streak: Math.max(a.streak || 0, b.streak || 0),
    lastDate: [a.lastDate, b.lastDate].filter(Boolean).sort().pop() || null
  };
}

function applySyncData(data) {
  // 新しいデータ形式：allPlayers を含む
  if (data.allPlayers && typeof data.allPlayers === 'object') {
    Object.entries(data.allPlayers).forEach(([playerName, playerData]) => {
      // 各プレイヤーの進捗データを復元
      Object.entries(playerData.progress || {}).forEach(([key, value]) => {
        const raw = localStorage.getItem(key);
        const existing = raw ? JSON.parse(raw) : { correct: 0, total: 0, best: 0, streak: 0, lastDate: null };
        localStorage.setItem(key, JSON.stringify(mergeProgress(existing, value)));
      });

      // 各プレイヤーのランキングを復元
      Object.entries(playerData.ranking || {}).forEach(([key, value]) => {
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const merged = [...existing, ...value];
        merged.sort(rankingSortFn(key));
        localStorage.setItem(key, JSON.stringify(merged.slice(0, 20)));
      });

      // プレイヤー名を登録
      registerPlayerName(playerName);
    });
    return;
  }

  // 古いデータ形式：progress / ranking のトップレベル
  Object.entries(data.progress || {}).forEach(([key, value]) => {
    const raw = localStorage.getItem(key);
    const existing = raw ? JSON.parse(raw) : { correct: 0, total: 0, best: 0, streak: 0, lastDate: null };
    localStorage.setItem(key, JSON.stringify(mergeProgress(existing, value)));
  });

  Object.entries(data.ranking || {}).forEach(([key, value]) => {
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const merged = [...existing, ...value];
    merged.sort(rankingSortFn(key));
    localStorage.setItem(key, JSON.stringify(merged.slice(0, 20)));
  });

  if (data.playerName && !state.playerName) {
    state.playerName = data.playerName;
    localStorage.setItem('manabi_playername', state.playerName);
    document.getElementById('player-name').value = state.playerName;
  }
  if (data.playerName) registerPlayerName(data.playerName);
}

document.getElementById('sync-export-btn').addEventListener('click', () => {
  const json = JSON.stringify(collectSyncData());
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `manabi-data-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  document.getElementById('sync-message').textContent = '📤 ファイルを書き出しました！';
});

// ---- クラウド同期（Firestore） ----
const syncCodeInput = document.getElementById('sync-code');
syncCodeInput.value = localStorage.getItem('manabi_synccode') || '';
syncCodeInput.addEventListener('input', () => {
  localStorage.setItem('manabi_synccode', syncCodeInput.value.trim());
});

function mergeRankingList(existing, incoming, key) {
  const merged = [...existing, ...incoming];
  merged.sort(rankingSortFn(key));
  return merged.slice(0, 20);
}

function mergeSyncData(a, b) {
  const merged = { progress: {}, ranking: {}, playerName: a.playerName || b.playerName || '' };
  const progressKeys = new Set([...Object.keys(a.progress || {}), ...Object.keys(b.progress || {})]);
  progressKeys.forEach(key => {
    const pa = (a.progress || {})[key] || { correct: 0, total: 0, best: 0, streak: 0, lastDate: null };
    const pb = (b.progress || {})[key] || { correct: 0, total: 0, best: 0, streak: 0, lastDate: null };
    merged.progress[key] = mergeProgress(pa, pb);
  });
  const rankingKeys = new Set([...Object.keys(a.ranking || {}), ...Object.keys(b.ranking || {})]);
  rankingKeys.forEach(key => {
    merged.ranking[key] = mergeRankingList((a.ranking || {})[key] || [], (b.ranking || {})[key] || [], key);
  });
  return merged;
}

function cloudUnavailable(msg) {
  if (!cloudDb) {
    msg.textContent = 'クラウド同期が設定されていません。js/firebase-config.jsに設定を入力してください。';
    return true;
  }
  if (!getActiveSyncCode()) {
    msg.textContent = 'まずホーム画面でなまえを入力してください。';
    return true;
  }
  return false;
}

// 読み込み・書き込みをまとめて行い、ローカルとクラウドを同じ状態にする
// 同期キー：手動の同期コードがあればそれを使い、なければプレイヤー名で自動同期
function getActiveSyncCode() {
  return (localStorage.getItem('manabi_synccode') || '').trim()
      || state.playerName.trim();
}

async function performCloudSync() {
  const code = getActiveSyncCode();
  if (!cloudDb || !code) return null;
  const docRef = cloudDb.collection('syncCodes').doc(code);
  const snap = await docRef.get();
  const cloudData = snap.exists ? snap.data() : { progress: {}, ranking: {}, playerName: '' };
  const localData = collectSyncData();
  const merged = mergeSyncData(localData, cloudData);
  await docRef.set(merged);
  applySyncData(merged);
  return merged;
}

document.getElementById('cloud-upload-btn').addEventListener('click', async () => {
  const msg = document.getElementById('sync-message');
  if (cloudUnavailable(msg)) return;
  msg.textContent = '送信中...';
  try {
    await performCloudSync();
    msg.textContent = '☁️ クラウドに送りました！';
  } catch (e) {
    msg.textContent = '送信に失敗しました。通信環境を確認してください。';
  }
});

document.getElementById('cloud-download-btn').addEventListener('click', async () => {
  const msg = document.getElementById('sync-message');
  if (cloudUnavailable(msg)) return;
  msg.textContent = '受信中...';
  try {
    await performCloudSync();
    msg.textContent = '☁️ クラウドから受け取りました！';
    if (!document.getElementById('screen-report').classList.contains('hidden')) showReportScreen();
  } catch (e) {
    msg.textContent = '受信に失敗しました。通信環境を確認してください。';
  }
});

// 起動時に自動で1回クラウドと同期する（なまえ or 同期コードがあれば）
if (cloudDb && getActiveSyncCode()) {
  performCloudSync().catch(() => {});
}

document.getElementById('sync-import-btn').addEventListener('click', () => {
  const fileInput = document.getElementById('sync-import-file');
  const file = fileInput.files[0];
  const msg = document.getElementById('sync-message');
  if (!file) {
    msg.textContent = 'ファイルを選んでください。';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      applySyncData(data);
      msg.textContent = '📥 データを読み込みました！';
      if (!document.getElementById('screen-report').classList.contains('hidden')) showReportScreen();
    } catch (e) {
      msg.textContent = '読み込みに失敗しました。ファイルを確認してください。';
    }
  };
  reader.readAsText(file);
});

// ---- みんなの順位（ランキング） ----
function rankingKey(grade) {
  return `manabi_ranking_g${grade}`;
}

function loadRanking(grade) {
  const raw = localStorage.getItem(rankingKey(grade));
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function saveRankingEntry(grade, subjectKey, correct, total) {
  const name = state.playerName.trim();
  if (!name) return;

  const subj = SUBJECTS.find(s => s.key === subjectKey);
  const label = subjectLabel(grade, subj);
  const rate = Math.round((correct / total) * 100);

  const list = loadRanking(grade);
  list.push({
    name,
    subject: label,
    correct,
    total,
    rate,
    date: new Date().toISOString().slice(0, 10)
  });
  list.sort((a, b) => b.rate - a.rate || b.correct - a.correct || (a.date < b.date ? 1 : -1));
  localStorage.setItem(rankingKey(grade), JSON.stringify(list.slice(0, 20)));
}

function showRankingScreen() {
  const container = document.getElementById('ranking-content');
  container.innerHTML = '';

  ALL_GRADES.forEach(grade => {
    const card = document.createElement('div');
    card.className = 'report-card';

    const heading = document.createElement('h3');
    heading.textContent = gradeLabel(grade);
    card.appendChild(heading);

    const list = loadRanking(grade);
    if (list.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'report-empty';
      empty.textContent = 'まだ ランキングデータがありません。';
      card.appendChild(empty);
    } else {
      list.slice(0, 5).forEach((entry, i) => {
        const row = document.createElement('div');
        row.className = 'ranking-row';

        const rankEl = document.createElement('span');
        rankEl.className = 'ranking-rank';
        rankEl.textContent = `${i + 1}位`;

        const nameEl = document.createElement('span');
        nameEl.className = 'ranking-name';
        nameEl.textContent = entry.name;

        const detailEl = document.createElement('span');
        detailEl.className = 'ranking-detail';
        detailEl.textContent = `${entry.subject}　${entry.correct}/${entry.total}（${entry.rate}%）`;

        row.appendChild(rankEl);
        row.appendChild(nameEl);
        row.appendChild(detailEl);
        card.appendChild(row);
      });
    }

    container.appendChild(card);
  });

  showScreen('ranking');
}

// ---- がくしゅう状況レポート画面 ----
function showReportScreen() {
  const container = document.getElementById('report-content');
  container.innerHTML = '';

  ALL_GRADES.forEach(grade => {
    const card = document.createElement('div');
    card.className = 'report-card';

    const heading = document.createElement('h3');
    heading.textContent = gradeLabel(grade);
    card.appendChild(heading);

    let hasAnyData = false;

    SUBJECTS.forEach(subj => {
      if (subj.grades && !subj.grades.includes(grade)) return;

      const p = loadProgress(grade, subj.key);
      const label = subjectLabel(grade, subj);

      const row = document.createElement('div');
      row.className = 'report-row';

      const nameEl = document.createElement('span');
      nameEl.className = 'subject-name';
      nameEl.textContent = label;
      row.appendChild(nameEl);

      if (p.total === 0) {
        const emptyEl = document.createElement('span');
        emptyEl.className = 'report-empty';
        emptyEl.textContent = 'まだやっていない';
        row.appendChild(emptyEl);
      } else {
        hasAnyData = true;
        const rate = Math.round((p.correct / p.total) * 100);

        const detailEl = document.createElement('span');
        detailEl.className = 'subject-detail';

        const rateEl = document.createElement('span');
        rateEl.className = 'subject-rate';
        if (rate >= 80) rateEl.classList.add('high');
        else if (rate >= 50) rateEl.classList.add('mid');
        else rateEl.classList.add('low');
        rateEl.textContent = `${rate}%`;

        detailEl.textContent = `${p.total}問中${p.correct}問正解　れんぞく${p.streak || 0}日　`;
        detailEl.appendChild(rateEl);

        row.appendChild(detailEl);
      }

      card.appendChild(row);
    });

    if (!hasAnyData) {
      const note = document.createElement('div');
      note.className = 'report-empty';
      note.style.marginTop = '8px';
      note.textContent = 'この学年はまだ学習記録がありません。';
      card.appendChild(note);
    }

    container.appendChild(card);
  });

  showScreen('report');
}

function showSubjectScreen() {
  document.getElementById('subject-title').textContent = `${gradeLabel(state.grade)} きょうかをえらぼう`;

  const container = document.getElementById('subject-buttons');
  container.innerHTML = '';

  SUBJECTS.forEach(subj => {
    const available = !subj.grades || subj.grades.includes(state.grade);
    const btn = document.createElement('button');
    btn.className = `subject-btn ${subj.cls}`;
    btn.textContent = subjectLabel(state.grade, subj);
    if (!available) {
      btn.disabled = true;
      btn.textContent += '\n（3・5・中学1年生）';
    } else {
      const d = getDiff(state.grade, subj.key);
      btn.textContent += `\n${DIFF_STARS[d]} ${DIFF_LABELS[d]}`;
      btn.addEventListener('click', () => startQuiz(subj.key));
    }
    container.appendChild(btn);
  });

  showScreen('subject');
}

function renderProgressBox() {
  const box = document.getElementById('progress-box');
  let lines = [];
  SUBJECTS.forEach(subj => {
    const available = !subj.grades || subj.grades.includes(state.grade);
    if (!available) return;
    const p = loadProgress(state.grade, subj.key);
    if (p.total === 0) return;
    const rate = Math.round((p.correct / p.total) * 100);
    const label = subjectLabel(state.grade, subj);
    lines.push(`${label}：これまで ${p.total}問中 ${p.correct}問せいかい（${rate}%）　れんぞく${p.streak || 0}日`);
  });
  box.textContent = lines.length > 0 ? lines.join('\n') : 'きょうも がんばろう！';
}

// ---- もどるボタン ----
document.querySelectorAll('[data-back]').forEach(btn => {
  btn.addEventListener('click', () => {
    const dest = btn.dataset.back;
    if (dest === 'home') showScreen('home');
    if (dest === 'subject') showSubjectScreen();
  });
});

// ---- クイズ開始 ----
function startQuiz(subjectKey) {
  state.subject = subjectKey;
  state.questionIndex = 0;
  state.correctCount = 0;
  state.incorrectCount = 0;
  showScreen('quiz');
  nextQuestion();
}

function updateStats() {
  const total = state.correctCount + state.incorrectCount;
  const rate = total > 0 ? Math.round((state.correctCount / total) * 100) : 0;
  document.getElementById('quiz-correct').textContent = state.correctCount;
  document.getElementById('quiz-incorrect').textContent = state.incorrectCount;
  document.getElementById('quiz-rate').textContent = rate;
}

function nextQuestion() {
  state.answered = false;
  state.selectedChoice = null;
  const diff = getDiff(state.grade, state.subject);
  state.currentProblem = GENERATORS[state.subject](state.grade, diff);
  renderQuestion();
}

function renderQuestion() {
  document.getElementById('quiz-progress').textContent = `もんだい ${state.questionIndex + 1} / ${TOTAL_QUESTIONS}`;
  document.getElementById('quiz-question').textContent = state.currentProblem.question;
  document.getElementById('quiz-feedback').textContent = '';
  document.getElementById('quiz-feedback').className = 'quiz-feedback';
  updateStats();

  const area = document.getElementById('quiz-answer-area');
  area.innerHTML = '';

  const problem = state.currentProblem;

  const selectChoice = (btn, value) => {
    if (state.answered) return;
    state.selectedChoice = value;
    area.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
  };

  if (problem.type === 'choice') {
    problem.choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      if (problem.choiceFormat === 'kanji-kana') {
        const sp = choice.indexOf(' ');
        btn.innerHTML = `${choice.slice(0, sp)}<span class="choice-kana"> ${choice.slice(sp + 1)}</span>`;
      } else {
        btn.textContent = choice;
      }
      btn.addEventListener('click', () => selectChoice(btn, choice));
      area.appendChild(btn);
    });
  } else {
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'answer-input';
    input.inputMode = problem.inputType === 'number' ? 'numeric' : 'text';
    input.placeholder = problem.isFraction ? 'れい：3/4' : 'こたえ';
    input.addEventListener('input', () => {
      if (state.selectedChoice === DONT_KNOW) {
        state.selectedChoice = null;
        area.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
      }
    });
    area.appendChild(input);
    setTimeout(() => input.focus(), 0);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('quiz-action-btn').click();
    });
  }

  // 「わからない」ボタン（どの問題タイプでも選べる）
  const dontKnowBtn = document.createElement('button');
  dontKnowBtn.className = 'choice-btn dontknow-btn';
  dontKnowBtn.textContent = 'わからない';
  dontKnowBtn.addEventListener('click', () => {
    if (state.answered) return;
    if (problem.type === 'input') {
      const input = document.getElementById('answer-input');
      if (input) input.value = '';
    }
    selectChoice(dontKnowBtn, DONT_KNOW);
  });
  area.appendChild(dontKnowBtn);

  document.getElementById('quiz-action-btn').textContent = 'こたえる';
}

// ---- 答える／次へ ボタン ----
document.getElementById('quiz-action-btn').addEventListener('click', () => {
  if (!state.answered) {
    checkAnswer();
  } else {
    advance();
  }
});

function checkAnswer() {
  const problem = state.currentProblem;
  const isDontKnow = state.selectedChoice === DONT_KNOW;
  let correct = false;
  let userAnswer = null;

  if (!isDontKnow) {
    if (problem.type === 'choice') {
      userAnswer = state.selectedChoice;
      if (userAnswer === null) return; // 未選択なら何もしない
      correct = userAnswer === problem.answer;
    } else {
      const input = document.getElementById('answer-input');
      userAnswer = input.value;
      if (userAnswer.trim() === '') return; // 未入力なら何もしない
      correct = isMathAnswerCorrect(problem, userAnswer);
    }
  }

  if (problem.type === 'choice') {
    document.querySelectorAll('#quiz-answer-area .choice-btn').forEach(b => {
      if (b.textContent === problem.answer) b.classList.add('correct');
      else if (b.textContent === userAnswer && !correct) b.classList.add('wrong');
      b.disabled = true;
    });
  } else {
    document.getElementById('answer-input').disabled = true;
    document.querySelector('#quiz-answer-area .dontknow-btn').disabled = true;
  }

  state.answered = true;

  const fb = document.getElementById('quiz-feedback');
  if (isDontKnow) {
    state.incorrectCount++;
    fb.textContent = `🤔 こたえは「${problem.answer}」だよ。おぼえておこう！`;
    fb.classList.add('wrong');
  } else if (correct) {
    state.correctCount++;
    fb.textContent = '⭕ せいかい！';
    fb.classList.add('correct');
  } else {
    state.incorrectCount++;
    fb.textContent = `❌ ざんねん！ こたえは「${problem.answer}」`;
    fb.classList.add('wrong');
  }

  updateStats();
  document.getElementById('quiz-action-btn').textContent =
    state.questionIndex + 1 < TOTAL_QUESTIONS ? 'つぎへ' : 'けっかをみる';
}

function advance() {
  state.questionIndex++;
  if (state.questionIndex >= TOTAL_QUESTIONS) {
    finishQuiz();
  } else {
    nextQuestion();
  }
}

function finishQuiz() {
  const progress = saveProgress(state.grade, state.subject, state.correctCount, TOTAL_QUESTIONS);
  saveRankingEntry(state.grade, state.subject, state.correctCount, TOTAL_QUESTIONS);

  if (cloudDb && getActiveSyncCode()) {
    performCloudSync().catch(() => {});
  }

  document.getElementById('result-score').textContent = `${state.correctCount} / ${TOTAL_QUESTIONS} もん せいかい！`;

  let message;
  if (state.correctCount === TOTAL_QUESTIONS) {
    message = '🌟 パーフェクト！　すごいね！';
  } else if (state.correctCount >= TOTAL_QUESTIONS * 0.8) {
    message = '👏 よくできました！';
  } else if (state.correctCount >= TOTAL_QUESTIONS * 0.5) {
    message = '😊 もうすこし！がんばろう！';
  } else {
    message = '💪 つぎは もっとできるよ！';
  }
  message += `\n（れんぞく ${progress.streak || 0}日め）`;
  if (!state.playerName) {
    message += '\n\n💡 ホーム画面で なまえを入力すると\nランキングに登録されるよ！';
  }

  document.getElementById('result-message').textContent = message;

  // 先生の採点
  const ev = teacherEvaluate(state.grade, state.subject, state.correctCount, TOTAL_QUESTIONS);
  document.getElementById('teacher-comment').textContent = ev.comment;
  document.getElementById('teacher-badge').textContent   = ev.badge;
  document.getElementById('teacher-level').textContent   =
    `${DIFF_STARS[ev.level]} ${DIFF_LABELS[ev.level]}`;

  // チャレンジボタンの表示制御
  const challengeBtn = document.getElementById('challenge-btn');
  if (ev.showChallenge) {
    challengeBtn.style.display = 'block';
  } else {
    challengeBtn.style.display = 'none';
  }

  showScreen('result');
}

document.getElementById('retry-btn').addEventListener('click', () => {
  startQuiz(state.subject);
});

document.getElementById('home-btn').addEventListener('click', () => {
  showSubjectScreen();
});

// ===== ⚡ 1けたの数 10問タイムアタック =====
const SPEED_QUESTIONS = 10;
const SPEED_RANKING_KEY = 'manabi_speedranking';

let speedTimerInterval = null;
let speedStartTime = 0;

document.getElementById('speed-open-btn').addEventListener('click', () => {
  showScreen('speed');
});

function genSpeedProblem() {
  const a = randInt(1, 8);
  const b = randInt(1, 9 - a);
  const answer = a + b;
  const choiceSet = new Set([answer]);
  while (choiceSet.size < 4) {
    choiceSet.add(randInt(0, 9));
  }
  return { a, b, answer, choices: shuffleArray([...choiceSet]) };
}

function stopSpeedTimer() {
  if (speedTimerInterval) {
    clearInterval(speedTimerInterval);
    speedTimerInterval = null;
  }
}

function updateSpeedTimer() {
  const elapsed = (performance.now() - speedStartTime) / 1000;
  document.getElementById('speed-timer').textContent = `${elapsed.toFixed(1)}秒`;
}

function startSpeedQuiz() {
  state.speedIndex = 0;
  state.speedCorrect = 0;
  state.speedProblems = [];
  for (let i = 0; i < SPEED_QUESTIONS; i++) state.speedProblems.push(genSpeedProblem());

  showScreen('speedquiz');
  document.getElementById('speed-timer').textContent = '0.0秒';
  speedStartTime = performance.now();
  stopSpeedTimer();
  speedTimerInterval = setInterval(updateSpeedTimer, 100);
  renderSpeedQuestion();
}

function renderSpeedQuestion() {
  const p = state.speedProblems[state.speedIndex];
  state.speedAnswered = false;
  document.getElementById('speed-progress').textContent = `もんだい ${state.speedIndex + 1} / ${SPEED_QUESTIONS}`;
  document.getElementById('speed-question').textContent = `${p.a} ＋ ${p.b} = ？`;

  const fb = document.getElementById('speed-feedback');
  fb.textContent = '';
  fb.className = 'quiz-feedback';

  const area = document.getElementById('speed-choice-area');
  area.innerHTML = '';
  p.choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = `${choice}`;
    btn.addEventListener('click', () => submitSpeedAnswer(choice, btn));
    area.appendChild(btn);
  });
}

function submitSpeedAnswer(choice, btn) {
  if (state.speedAnswered) return;
  state.speedAnswered = true;

  const p = state.speedProblems[state.speedIndex];
  const correct = choice === p.answer;
  if (correct) state.speedCorrect++;

  const area = document.getElementById('speed-choice-area');
  area.querySelectorAll('.choice-btn').forEach(b => {
    b.disabled = true;
    if (Number(b.textContent) === p.answer) b.classList.add('correct');
    else if (b === btn) b.classList.add('wrong');
  });

  const fb = document.getElementById('speed-feedback');
  if (correct) {
    fb.textContent = '⭕';
    fb.classList.add('correct');
  } else {
    fb.textContent = `❌ こたえは ${p.answer}`;
    fb.classList.add('wrong');
  }

  setTimeout(() => {
    state.speedIndex++;
    if (state.speedIndex >= SPEED_QUESTIONS) {
      finishSpeedQuiz();
    } else {
      renderSpeedQuestion();
    }
  }, 400);
}

document.getElementById('speed-start-btn').addEventListener('click', () => {
  startSpeedQuiz();
});

document.getElementById('speed-quit-btn').addEventListener('click', () => {
  stopSpeedTimer();
  showScreen('speed');
});

function loadSpeedRanking() {
  const raw = localStorage.getItem(SPEED_RANKING_KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch (e) {
    return [];
  }
}

function saveSpeedRankingEntry(correct, total, time) {
  const name = state.playerName.trim();
  if (!name) return;

  const list = loadSpeedRanking();
  list.push({
    name,
    correct,
    total,
    time: Math.round(time * 100) / 100,
    date: new Date().toISOString().slice(0, 10)
  });
  list.sort((a, b) => b.correct - a.correct || a.time - b.time || (a.date < b.date ? 1 : -1));
  localStorage.setItem(SPEED_RANKING_KEY, JSON.stringify(list.slice(0, 20)));
}

function showSpeedRankingScreen() {
  const container = document.getElementById('speedranking-content');
  container.innerHTML = '';

  const countPerName = {};
  const list = loadSpeedRanking()
    .filter(e => e.correct === e.total)
    .filter(e => {
      countPerName[e.name] = (countPerName[e.name] || 0) + 1;
      return countPerName[e.name] <= 2;
    });

  if (list.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'report-empty';
    empty.textContent = 'まだ ランキングデータがありません。';
    container.appendChild(empty);
  } else {
    list.slice(0, 10).forEach((entry, i) => {
      const row = document.createElement('div');
      row.className = 'ranking-row';

      const rankEl = document.createElement('span');
      rankEl.className = 'ranking-rank';
      rankEl.textContent = `${i + 1}位`;

      const nameEl = document.createElement('span');
      nameEl.className = 'ranking-name';
      nameEl.textContent = entry.name;

      const detailEl = document.createElement('span');
      detailEl.className = 'ranking-detail';
      detailEl.textContent = `${entry.time.toFixed(1)}秒　（${entry.correct}/${entry.total}）`;

      row.appendChild(rankEl);
      row.appendChild(nameEl);
      row.appendChild(detailEl);
      container.appendChild(row);
    });
  }

  showScreen('speedranking');
}

function finishSpeedQuiz() {
  stopSpeedTimer();
  const elapsed = (performance.now() - speedStartTime) / 1000;

  document.getElementById('speed-result-time').textContent = `${elapsed.toFixed(2)}秒`;

  let message = `10問中 ${state.speedCorrect}問せいかい`;
  if (state.speedCorrect === SPEED_QUESTIONS) {
    message += '\n🌟 ぜんぶせいかい！すごい！';
    saveSpeedRankingEntry(state.speedCorrect, SPEED_QUESTIONS, elapsed);
  } else {
    message += '\n（ランキングは10問ぜんぶせいかいすると登録されるよ）';
  }
  if (!state.playerName) {
    message += '\n\n💡 ホーム画面で なまえを入力すると\nランキングに登録されるよ！';
  }

  document.getElementById('speed-result-message').textContent = message;

  if (cloudDb && getActiveSyncCode()) {
    performCloudSync().catch(() => {});
  }

  showScreen('speedresult');
}

document.getElementById('speed-retry-btn').addEventListener('click', () => {
  startSpeedQuiz();
});

document.getElementById('speed-ranking-btn').addEventListener('click', () => {
  syncBeforeShow(showSpeedRankingScreen);
});

document.getElementById('speed-ranking-open-btn').addEventListener('click', () => {
  syncBeforeShow(showSpeedRankingScreen);
});

document.getElementById('speed-home-btn').addEventListener('click', () => {
  showScreen('home');
});

// ===== チャレンジシステム =====
function getChallengeDialogText(grade) {
  const texts = {
    1: 'ほんとに\nやりますか？',
    3: 'ほんとに\nがんばりますか？',
    5: '本当に\n挑戦しますか？',
    7: '確実に\n挑戦しますか？'
  };
  return texts[grade] || '挑戦しますか？';
}

function getChallengeLevelName(diffLevel) {
  const names = ['やさしい', 'ふつう', 'むずかしい'];
  return names[diffLevel] || '？';
}

const challengeModal = document.getElementById('challenge-modal');
const challengeModalText = document.getElementById('challenge-modal-text');
const challengeConfirmBtn = document.getElementById('challenge-confirm-btn');
const challengeCancelBtn = document.getElementById('challenge-cancel-btn');

document.getElementById('challenge-btn').addEventListener('click', () => {
  const cur = getDiff(state.grade, state.subject);
  const nextLevel = cur + 1;
  const nextName = getChallengeLevelName(nextLevel);

  const dialogText = getChallengeDialogText(state.grade);
  const problemCount = nextLevel === 1 ? 15 : (nextLevel === 2 ? 20 : 25);
  const passScore = Math.ceil(problemCount * 0.8);

  let upgradeText;
  if (state.grade === 1) {
    upgradeText = `つぎのレベルへ！`;
  } else if (state.grade === 3) {
    upgradeText = `つぎのレベルへ！`;
  } else if (state.grade === 5) {
    upgradeText = `${nextName}へ 昇段！`;
  } else {
    upgradeText = `${nextName}へ 昇段！`;
  }

  challengeModalText.innerHTML = `${dialogText.split('\n').join('<br>')}<br><br>（${problemCount}問中${passScore}問正解で<br>${upgradeText}）`;
  challengeModal.classList.remove('hidden');
});

challengeCancelBtn.addEventListener('click', () => {
  challengeModal.classList.add('hidden');
});

challengeConfirmBtn.addEventListener('click', () => {
  challengeModal.classList.add('hidden');
  const cur = getDiff(state.grade, state.subject);
  const nextLevel = cur + 1;

  if (!canAttemptChallenge(state.grade, state.subject, nextLevel)) {
    alert('今日のチャレンジはもう実施済みです。明日チャレンジできます。');
    return;
  }

  markChallengeAttempt(state.grade, state.subject, nextLevel);
  startChallengeQuiz(nextLevel);
});

// ===== チャレンジテスト =====
const CHALLENGE_QUESTION_COUNTS = { 0: 15, 1: 20, 2: 25 };
const CHALLENGE_TIME_LIMITS = { 0: 10, 1: 15, 2: 20 };

const challengeState = {
  diffLevel: null,
  questionIndex: 0,
  correctCount: 0,
  incorrectCount: 0,
  currentProblem: null,
  selectedChoice: null,
  answered: false,
  problems: []
};

function generateChallengeProblemSet(diffLevel, total) {
  const problems = [];
  for (let i = 0; i < total; i++) {
    const problem = GENERATORS[state.subject](state.grade, diffLevel);
    problems.push(problem);
  }
  return problems;
}

function startChallengeQuiz(diffLevel) {
  const questionCount = CHALLENGE_QUESTION_COUNTS[diffLevel] || 15;
  challengeState.diffLevel = diffLevel;
  challengeState.questionIndex = 0;
  challengeState.correctCount = 0;
  challengeState.incorrectCount = 0;
  challengeState.selectedChoice = null;
  challengeState.answered = false;
  challengeState.problems = generateChallengeProblemSet(diffLevel, questionCount);

  const titleEl = document.getElementById('challenge-title');
  if (state.grade === 1) {
    titleEl.textContent = '🚀 チャレンジ';
  } else if (state.grade === 3) {
    titleEl.textContent = '🚀 チャレンジ';
  } else {
    titleEl.textContent = '🚀 チャレンジテスト';
  }

  const resultTitleEl = document.getElementById('challenge-result-title');
  if (state.grade === 1) {
    resultTitleEl.textContent = 'チャレンジ ぐあい';
  } else if (state.grade === 3) {
    resultTitleEl.textContent = 'チャレンジ ぐあい';
  } else {
    resultTitleEl.textContent = 'チャレンジ 結果';
  }

  showScreen('challenge-quiz');
  nextChallengeQuestion();
}

function nextChallengeQuestion() {
  challengeState.selectedChoice = null;
  challengeState.answered = false;

  const fb = document.getElementById('challenge-feedback');
  fb.textContent = '';
  fb.className = '';

  if (challengeState.questionIndex >= challengeState.problems.length) {
    finishChallengeQuiz();
    return;
  }

  challengeState.currentProblem = challengeState.problems[challengeState.questionIndex];
  const problem = challengeState.currentProblem;

  document.getElementById('challenge-progress').textContent =
    `${challengeState.questionIndex + 1} / ${challengeState.problems.length}`;

  document.getElementById('challenge-problem').textContent = problem.question;

  const choicesDiv = document.getElementById('challenge-choices');
  choicesDiv.innerHTML = '';

  if (!problem.choices) {
    console.error('チャレンジ問題にchoicesがありません:', problem);
    choicesDiv.innerHTML = '<p style="color:red;">エラー: 問題データが不正です</p>';
    return;
  }

  problem.choices.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = choice;
    btn.addEventListener('click', () => {
      challengeState.selectedChoice = choice;
      btn.classList.add('selected');
      document.querySelectorAll('#challenge-choices .choice-btn').forEach((b, idx) => {
        if (idx !== i) b.classList.remove('selected');
      });
    });
    choicesDiv.appendChild(btn);
  });

  document.getElementById('challenge-quiz-action-btn').textContent =
    challengeState.questionIndex + 1 < challengeState.problems.length ? 'こたえる' : 'けっかをみる';
}

function answerChallengeQuestion() {
  const problem = challengeState.currentProblem;
  const isDontKnow = challengeState.selectedChoice === DONT_KNOW;
  const correct = !isDontKnow && challengeState.selectedChoice === problem.answer;

  challengeState.answered = true;

  const fb = document.getElementById('challenge-feedback');
  if (isDontKnow) {
    challengeState.incorrectCount++;
    fb.textContent = `🤔 こたえは「${problem.answer}」だよ。おぼえておこう！`;
    fb.classList.add('wrong');
  } else if (correct) {
    challengeState.correctCount++;
    fb.textContent = '⭕ せいかい！';
    fb.classList.add('correct');
  } else {
    challengeState.incorrectCount++;
    fb.textContent = `❌ ざんねん！ こたえは「${problem.answer}」`;
    fb.classList.add('wrong');
  }

  document.getElementById('challenge-quiz-action-btn').textContent =
    challengeState.questionIndex + 1 < challengeState.problems.length ? 'つぎへ' : 'けっかをみる';
}

function advanceChallengeQuestion() {
  challengeState.questionIndex++;
  if (challengeState.questionIndex >= challengeState.problems.length) {
    finishChallengeQuiz();
  } else {
    nextChallengeQuestion();
  }
}

function finishChallengeQuiz() {
  const passScore = Math.ceil(challengeState.problems.length * 0.8);
  const rate = challengeState.correctCount / challengeState.problems.length;
  const passed = rate >= 0.8;
  const nextLevel = challengeState.diffLevel;

  document.getElementById('challenge-result-score').textContent =
    `${challengeState.correctCount} / ${challengeState.problems.length} もん せいかい！`;

  let message;
  if (passed) {
    let levelUpMsg;
    if (state.grade === 1) {
      levelUpMsg = `つぎのレベルへ\nすすみました！`;
    } else if (state.grade === 3) {
      levelUpMsg = `つぎのレベルへ\nすすみました！`;
    } else {
      levelUpMsg = `${getChallengeLevelName(nextLevel)}へ\n昇段しました！`;
    }
    message = `🎉 チャレンジ せいこう！\n${levelUpMsg}`;
    passChallengeAndUpgrade(state.grade, state.subject, nextLevel);
  } else {
    let retryMsg;
    if (state.grade === 1) {
      retryMsg = `あした\nもういちど チャレンジしてね！`;
    } else if (state.grade === 3) {
      retryMsg = `あした\nもう一度 チャレンジしてね！`;
    } else {
      retryMsg = `明日もう一度\nチャレンジしてね！`;
    }
    message = `💪 ざんねん！\n${retryMsg}`;
  }

  document.getElementById('challenge-result-message').textContent = message;

  if (passed) {
    document.getElementById('challenge-teacher-comment').textContent = '🌟 すごい！';
    document.getElementById('challenge-teacher-badge').textContent = '⬆️ レベルアップ成功！';
    document.getElementById('challenge-teacher-level').textContent =
      `${DIFF_STARS[nextLevel]} ${DIFF_LABELS[nextLevel]}`;
  } else {
    document.getElementById('challenge-teacher-comment').textContent = '頑張ってね';
    document.getElementById('challenge-teacher-badge').textContent = 'もう一度挑戦';
    const curDiff = getDiff(state.grade, state.subject);
    document.getElementById('challenge-teacher-level').textContent =
      `${DIFF_STARS[curDiff]} ${DIFF_LABELS[curDiff]}`;
  }

  showScreen('challenge-result');
}

document.getElementById('challenge-quiz-action-btn').addEventListener('click', () => {
  if (!challengeState.answered) {
    if (!challengeState.selectedChoice) {
      alert('こたえを えらんでください！');
      return;
    }
    answerChallengeQuestion();
  } else {
    advanceChallengeQuestion();
  }
});

document.getElementById('challenge-quit-btn').addEventListener('click', () => {
  showScreen('subject');
});

document.getElementById('challenge-result-next-btn').addEventListener('click', () => {
  showSubjectScreen();
});

document.getElementById('challenge-result-retry-btn').addEventListener('click', () => {
  const nextLevel = challengeState.diffLevel;
  if (!canAttemptChallenge(state.grade, state.subject, nextLevel)) {
    alert('今日のチャレンジはもう実施済みです。明日チャレンジできます。');
    return;
  }
  markChallengeAttempt(state.grade, state.subject, nextLevel);
  startChallengeQuiz(nextLevel);
});

document.getElementById('challenge-result-home-btn').addEventListener('click', () => {
  showSubjectScreen();
});

// ===== あたらしくする（更新）ボタン =====
document.getElementById('refresh-btn').addEventListener('click', async () => {
  const btn = document.getElementById('refresh-btn');
  btn.disabled = true;
  btn.style.opacity = '0.5';

  try {
    // 1. 全プレイヤーデータをクラウド保存
    await saveAllPlayersToCloud();

    // 2. Service Worker のキャッシュ削除
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        await reg.unregister();
      }
      // Cache Storage も削除
      const cacheNames = await caches.keys();
      for (const cacheName of cacheNames) {
        await caches.delete(cacheName);
      }
    }

    // 3. キャッシュバスター付きでリロード
    window.location.href = window.location.href + (window.location.href.includes('?') ? '&' : '?') + 'v=' + Date.now();
  } catch (e) {
    console.error('更新失敗:', e);
    btn.disabled = false;
    btn.style.opacity = '1';
    alert('更新に失敗しました。もう一度お試しください。');
  }
});

// ボタンにアニメーション効果
document.getElementById('refresh-btn').addEventListener('mousedown', function() {
  this.style.transform = 'scale(0.9)';
});

document.getElementById('refresh-btn').addEventListener('mouseup', function() {
  this.style.transform = 'scale(1)';
});

document.getElementById('refresh-btn').addEventListener('mouseleave', function() {
  this.style.transform = 'scale(1)';
});
