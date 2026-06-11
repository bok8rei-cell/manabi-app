// ===== おうちまなびゲーム メインスクリプト =====

const TOTAL_QUESTIONS = 10;

const SUBJECTS = [
  { key: 'math', label: '算数', cls: '' },
  { key: 'kanji', label: '国語（漢字）', cls: 'kokugo' },
  { key: 'rikashakai', label: '理科・社会', cls: 'rikashakai', grades: [3, 5] },
  { key: 'eigo', label: '英語', cls: 'eigo' }
];

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
  score: 0,
  currentProblem: null,
  selectedChoice: null,
  answered: false
};

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
    if (state.grade === 1) {
      showWeek1Screen();
    } else {
      showSubjectScreen();
    }
  });
});

// ---- 1年生：1週間プログラム画面 ----
function showWeek1Screen() {
  const container = document.getElementById('week1-days');
  container.innerHTML = '';

  let totalDone = 0;
  WEEK1_PLAN.forEach(plan => {
    const p = loadProgress(1, `week1_day${plan.day}`);
    const done = p.total > 0;
    if (done) totalDone++;

    const btn = document.createElement('button');
    btn.className = 'week1-day-btn' + (done ? ' done' : '') + (plan.day === 7 ? ' review' : '');
    let label = `${plan.day}にちめ\n${plan.title}`;
    if (done) label += `\n（さいご：${p.correct}/${p.total}）`;
    btn.textContent = label;
    btn.addEventListener('click', () => startWeek1Quiz(plan.day));
    container.appendChild(btn);
  });

  const box = document.getElementById('week1-progress-box');
  box.textContent = totalDone === 0
    ? 'まずは「1にちめ」から はじめよう！'
    : `${totalDone} / 7にち やったよ！`;

  showScreen('week1');
}

document.getElementById('week1-free-btn').addEventListener('click', () => {
  showSubjectScreen();
});

function showSubjectScreen() {
  document.getElementById('subject-title').textContent = `${state.grade}年生 きょうかをえらぼう`;

  const container = document.getElementById('subject-buttons');
  container.innerHTML = '';

  SUBJECTS.forEach(subj => {
    const available = !subj.grades || subj.grades.includes(state.grade);
    const btn = document.createElement('button');
    btn.className = `subject-btn ${subj.cls}`;
    btn.textContent = subj.label;
    if (!available) {
      btn.disabled = true;
      btn.textContent += '\n（3・5年生）';
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
    lines.push(`${subj.label}：これまで ${p.total}問中 ${p.correct}問せいかい（${rate}%）　れんぞく${p.streak || 0}日`);
  });
  box.textContent = lines.length > 0 ? lines.join('\n') : 'きょうも がんばろう！';
}

// ---- もどるボタン ----
document.querySelectorAll('[data-back]').forEach(btn => {
  btn.addEventListener('click', () => {
    const dest = btn.dataset.back;
    if (dest === 'home') {
      if (state.grade === 1) showWeek1Screen();
      else showScreen('home');
    }
    if (dest === 'subject') {
      if (state.mode === 'week1') showWeek1Screen();
      else showSubjectScreen();
    }
  });
});

// ---- クイズ開始 ----
function startQuiz(subjectKey) {
  state.mode = 'free';
  state.subject = subjectKey;
  state.problemQueue = null;
  state.questionIndex = 0;
  state.score = 0;
  showScreen('quiz');
  nextQuestion();
}

function startWeek1Quiz(day) {
  state.mode = 'week1';
  state.week1Day = day;
  state.subject = `week1_day${day}`;
  state.problemQueue = buildWeek1Problems(day);
  state.questionIndex = 0;
  state.score = 0;
  showScreen('quiz');
  nextQuestion();
}

function nextQuestion() {
  state.answered = false;
  state.selectedChoice = null;
  state.currentProblem = state.problemQueue
    ? state.problemQueue[state.questionIndex]
    : GENERATORS[state.subject](state.grade);
  renderQuestion();
}

function renderQuestion() {
  document.getElementById('quiz-progress').textContent = `もんだい ${state.questionIndex + 1} / ${TOTAL_QUESTIONS}`;
  document.getElementById('quiz-score').textContent = state.score;
  document.getElementById('quiz-question').textContent = state.currentProblem.question;
  document.getElementById('quiz-feedback').textContent = '';
  document.getElementById('quiz-feedback').className = 'quiz-feedback';

  const area = document.getElementById('quiz-answer-area');
  area.innerHTML = '';

  const problem = state.currentProblem;

  if (problem.type === 'choice') {
    problem.choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = choice;
      btn.addEventListener('click', () => {
        if (state.answered) return;
        state.selectedChoice = choice;
        area.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
      area.appendChild(btn);
    });
  } else {
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'answer-input';
    input.inputMode = problem.inputType === 'number' ? 'numeric' : 'text';
    input.placeholder = problem.isFraction ? 'れい：3/4' : 'こたえ';
    area.appendChild(input);
    setTimeout(() => input.focus(), 0);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('quiz-action-btn').click();
    });
  }

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
  let correct = false;
  let userAnswer = null;

  if (problem.type === 'choice') {
    userAnswer = state.selectedChoice;
    if (userAnswer === null) return; // 未選択なら何もしない
    correct = userAnswer === problem.answer;

    document.querySelectorAll('#quiz-answer-area .choice-btn').forEach(b => {
      if (b.textContent === problem.answer) b.classList.add('correct');
      else if (b.textContent === userAnswer && !correct) b.classList.add('wrong');
      b.disabled = true;
    });
  } else {
    const input = document.getElementById('answer-input');
    userAnswer = input.value;
    if (userAnswer.trim() === '') return; // 未入力なら何もしない
    correct = isMathAnswerCorrect(problem, userAnswer);
    input.disabled = true;
  }

  state.answered = true;

  const fb = document.getElementById('quiz-feedback');
  if (correct) {
    state.score++;
    fb.textContent = '⭕ せいかい！';
    fb.classList.add('correct');
  } else {
    fb.textContent = `❌ ざんねん！ こたえは「${problem.answer}」`;
    fb.classList.add('wrong');
  }

  document.getElementById('quiz-score').textContent = state.score;
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
  const progress = saveProgress(state.grade, state.subject, state.score, TOTAL_QUESTIONS);

  document.getElementById('result-score').textContent = `${state.score} / ${TOTAL_QUESTIONS} もん せいかい！`;

  let message;
  if (state.score === TOTAL_QUESTIONS) {
    message = '🌟 パーフェクト！　すごいね！';
  } else if (state.score >= TOTAL_QUESTIONS * 0.8) {
    message = '👏 よくできました！';
  } else if (state.score >= TOTAL_QUESTIONS * 0.5) {
    message = '😊 もうすこし！がんばろう！';
  } else {
    message = '💪 つぎは もっとできるよ！';
  }
  message += `\n（れんぞく ${progress.streak || 0}日め）`;

  document.getElementById('result-message').textContent = message;
  document.getElementById('home-btn').textContent =
    state.mode === 'week1' ? '1しゅうかんプログラムへ' : 'きょうかをえらぶ';
  showScreen('result');
}

document.getElementById('retry-btn').addEventListener('click', () => {
  if (state.mode === 'week1') {
    startWeek1Quiz(state.week1Day);
  } else {
    startQuiz(state.subject);
  }
});

document.getElementById('home-btn').addEventListener('click', () => {
  if (state.mode === 'week1') {
    showWeek1Screen();
  } else {
    showSubjectScreen();
  }
});
