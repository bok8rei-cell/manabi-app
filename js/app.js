// ===== おうちまなびゲーム メインスクリプト =====

const TOTAL_QUESTIONS = 10;
const DONT_KNOW = '__DONTKNOW__';

const SUBJECTS = [
  { key: 'math', label: '算数', kanaLabel: 'さんすう', cls: '' },
  { key: 'kanji', label: '国語（漢字）', kanaLabel: 'こくご（かんじ）', cls: 'kokugo' },
  { key: 'rikashakai', label: '理科・社会', kanaLabel: 'りか・しゃかい', cls: 'rikashakai', grades: [3, 5, 7] },
  { key: 'eigo', label: '英語', kanaLabel: 'えいご', cls: 'eigo' }
];

const ALL_GRADES = [1, 3, 5, 7];

function gradeLabel(grade) {
  return grade === 7 ? '中学1年生' : `${grade}年生`;
}

function subjectLabel(grade, subj) {
  if (grade === 1) return subj.kanaLabel;
  if (grade === 7 && subj.key === 'math') return '数学';
  return subj.label;
}

const GENERATORS = {
  math: generateMathProblem,
  kanji: generateKanjiProblem,
  rikashakai: generateRikaShakaiProblem,
  eigo: generateEigoProblem
};

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

function renderPlayerNameSaved() {
  playerNameSaved.innerHTML = '';
  loadPlayerNames().forEach(name => {
    const btn = document.createElement('button');
    btn.className = 'name-chip';
    if (name === state.playerName) btn.classList.add('selected');
    btn.textContent = name;
    btn.addEventListener('click', () => selectPlayerName(name));
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

document.getElementById('report-open-btn').addEventListener('click', () => {
  showReportScreen();
});

document.getElementById('ranking-open-btn').addEventListener('click', () => {
  showRankingScreen();
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
  return data;
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
  Object.entries(data.progress || {}).forEach(([key, value]) => {
    const raw = localStorage.getItem(key);
    const existing = raw ? JSON.parse(raw) : { correct: 0, total: 0, best: 0, streak: 0, lastDate: null };
    localStorage.setItem(key, JSON.stringify(mergeProgress(existing, value)));
  });

  Object.entries(data.ranking || {}).forEach(([key, value]) => {
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const merged = [...existing, ...value];
    merged.sort((a, b) => b.rate - a.rate || b.correct - a.correct || (a.date < b.date ? 1 : -1));
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

function mergeRankingList(existing, incoming) {
  const merged = [...existing, ...incoming];
  merged.sort((a, b) => b.rate - a.rate || b.correct - a.correct || (a.date < b.date ? 1 : -1));
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
    merged.ranking[key] = mergeRankingList((a.ranking || {})[key] || [], (b.ranking || {})[key] || []);
  });
  return merged;
}

function cloudUnavailable(msg) {
  if (!cloudDb) {
    msg.textContent = 'クラウド同期が設定されていません。js/firebase-config.jsに設定を入力してください。';
    return true;
  }
  const code = syncCodeInput.value.trim();
  if (!code) {
    msg.textContent = '同期コードを入力してください。';
    return true;
  }
  return false;
}

// 読み込み・書き込みをまとめて行い、ローカルとクラウドを同じ状態にする
async function performCloudSync() {
  const code = (localStorage.getItem('manabi_synccode') || '').trim();
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

// 起動時に自動で1回クラウドと同期する（同期コードが設定されている場合のみ）
if (cloudDb && syncCodeInput.value.trim()) {
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
      btn.addEventListener('click', () => startQuiz(subj.key));
    }
    container.appendChild(btn);
  });

  renderProgressBox();
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
  state.currentProblem = GENERATORS[state.subject](state.grade);
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
      btn.textContent = choice;
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

  if (cloudDb && syncCodeInput.value.trim()) {
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
  showScreen('result');
}

document.getElementById('retry-btn').addEventListener('click', () => {
  startQuiz(state.subject);
});

document.getElementById('home-btn').addEventListener('click', () => {
  showSubjectScreen();
});
