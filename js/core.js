// ===== BRAIN QUEST：零式 メインスクリプト =====

const APP_VERSION = 'v37.0';
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

// 画面にアプリのバージョンを表示（端末が最新版を読めているかの確認用）
(function showAppVersion() {
  const el = document.getElementById('app-version-label');
  if (el) el.textContent = 'バージョン ' + APP_VERSION;
})();

// 旧形式（プレイヤー共通だった）進捗・難易度・昇段チャレンジを一度だけ削除し、
// 名前別にリセットする。以降は manabi_*_{なまえ}_... を使う。
(function migrateToPerPlayer() {
  if (localStorage.getItem('manabi_perplayer_migrated') === '2') return;
  const subj = '(math|kanji|kotowaza|rikashakai|eigo)';
  const legacyProgress  = new RegExp(`^manabi_progress_g\\d+_${subj}$`);
  const legacyDiff      = new RegExp(`^manabi_diff_\\d+_${subj}$`);
  const legacyChallenge = new RegExp(`^manabi_challenge(_attempt)?_\\d+_${subj}_\\d+$`);
  const toDelete = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (legacyProgress.test(key) || legacyDiff.test(key) || legacyChallenge.test(key)) {
      toDelete.push(key);
    }
  }
  toDelete.forEach(k => localStorage.removeItem(k));
  localStorage.setItem('manabi_perplayer_migrated', '2');
})();

// ===== 自動アップデート =====
// サーバーの version.json を必ずネットから取得し（HTTPキャッシュも回避）、
// 今動いているコードが古ければ、SWとキャッシュを全部消して強制リロードする。
// これで iOS のホーム画面アプリが古いまま固まっても、自力で最新へ更新できる。
async function checkForUpdate() {
  try {
    const res = await fetch('version.json?cb=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    const latest = data && data.version;
    if (!latest || latest === APP_VERSION) return;

    // 同じバージョンへのリロードを何度も繰り返さないための安全弁
    if (sessionStorage.getItem('manabi_updating_to') === latest) return;
    sessionStorage.setItem('manabi_updating_to', latest);

    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }
    if (window.caches) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
    // ナビゲーションにユニークなクエリを付けて、HTTP/CDNキャッシュも確実に外す
    location.replace(location.pathname + '?u=' + encodeURIComponent(latest) + '.' + Date.now());
  } catch (e) {
    // オフライン等は無視（次回オンライン時に再チェック）
  }
}
checkForUpdate();

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
  const raw = localStorage.getItem(`${DIFF_KEY}_${playerTag()}_${grade}_${subject}`);
  // 初期値は「やさしい(0)」。入門期は足場（1年漢字はふりがな付き）から始め、
  // 昇段チャレンジで ふつう→むずかしい へ上げていく。
  return raw !== null ? parseInt(raw) : 0;
}

function setDiff(grade, subject, level) {
  const v = Math.max(0, Math.min(2, level));
  localStorage.setItem(`${DIFF_KEY}_${playerTag()}_${grade}_${subject}`, String(v));
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
  return `${CHALLENGE_KEY}_${playerTag()}_${grade}_${subject}_${diffLevel}`;
}

function getChallengeAttemptKey(grade, subject, diffLevel) {
  return `${CHALLENGE_ATTEMPT_KEY}_${playerTag()}_${grade}_${subject}_${diffLevel}`;
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
  const today = localDateStr();
  localStorage.setItem(key, today);
  return nextLevel;
}

function canAttemptChallenge(grade, subject, diffLevel) {
  const attemptKey = getChallengeAttemptKey(grade, subject, diffLevel);
  const lastAttempt = localStorage.getItem(attemptKey);
  const today = localDateStr();
  return lastAttempt !== today;
}

function markChallengeAttempt(grade, subject, diffLevel) {
  const attemptKey = getChallengeAttemptKey(grade, subject, diffLevel);
  const today = localDateStr();
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
  // なまえを切り替えたら、ホームの表示（ミッション・ポコ）も その子のものに更新する
  if (typeof refreshHome === 'function') refreshHome();
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
});

// ---- 画面切り替え ----
// 下のタブバーを出す画面
const TAB_SCREENS = ['home', 'zukan', 'report', 'settings'];

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(el => el.classList.add('hidden'));
  document.getElementById(`screen-${name}`).classList.remove('hidden');
  const tabbar = document.getElementById('tabbar');
  if (tabbar) tabbar.classList.toggle('hidden', !TAB_SCREENS.includes(name));
  document.querySelectorAll('.tab-btn').forEach(b => {
    const active = b.dataset.tab === name;
    b.classList.toggle('active', active);
    if (active) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  });
  if (name !== 'quiz' && typeof FX !== 'undefined') FX.stopSpeak();
  window.scrollTo(0, 0);
}

// ---- 進捗の保存・読み込み（プレイヤーごとに分ける）----
// なまえ未設定のときは共通の「_」バケツに入れる。プレイヤー識別はこの関数に統一
// （進捗・難易度・昇段チャレンジで共通利用）。
function playerTag(name = state.playerName) {
  return (name || '').trim() || '_';
}
function progressKey(grade, subject, name = state.playerName) {
  return `manabi_progress_${playerTag(name)}_g${grade}_${subject}`;
}
// 旧形式（プレイヤー共通で全員合算されていた）進捗キーかどうか。
// リセット対象であり、同期でも無視して水増しデータを復活させない。
function isLegacyProgressKey(key) {
  return /^manabi_progress_g\d+_(math|kanji|kotowaza|rikashakai|eigo)$/.test(key);
}
// 旧形式（プレイヤー共通）の難易度キーかどうか。同期でも無視する。
function isLegacyDiffKey(key) {
  return /^manabi_diff_\d+_(math|kanji|kotowaza|rikashakai|eigo)$/.test(key);
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

  const today = localDateStr();
  if (p.lastDate !== today) {
    const yesterday = addDaysStr(today, -1);
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
