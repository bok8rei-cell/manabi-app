// ===== 学習セッション（ドリル／ミッション／にがて復習／チャレンジ共通） =====

const byId = (id) => document.getElementById(id);

const CHALLENGE_QUESTION_COUNTS = { 0: 15, 1: 20, 2: 25 };
const HINT_COST = 100;   // ヒント1回のコイン
const HINT_MAX = 3;      // 1もんで つかえる ヒントの回数（さいだい 300コイン）
const CORRECT_WORDS = ['せいかい！', 'やったね！', 'すごい！', 'いいね！'];

let session = null;
let toastTimer = null;

// ---- 小さなメッセージ・確認ダイアログ ----
function showToast(msg) {
  const t = byId('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2800);
}

// opts.cancelFirst：うっかり おさないように、「やめる」を 大きく 上に、「つかう」を 小さく 下に 出す
function askConfirm(text, okLabel, cancelLabel, onOk, opts) {
  const o = opts || {};
  const modal = byId('modal');
  byId('modal-text').textContent = text;
  const ok = byId('modal-ok');
  const cancel = byId('modal-cancel');
  ok.textContent = okLabel;
  cancel.textContent = cancelLabel;
  ok.className = o.cancelFirst ? 'sub-btn' : 'main-btn';
  cancel.className = o.cancelFirst ? 'main-btn' : 'sub-btn';
  modal.classList.toggle('cancel-first', !!o.cancelFirst);
  const close = () => modal.classList.add('hidden');
  ok.onclick = () => { close(); onOk(); };
  cancel.onclick = close;
  modal.onclick = (e) => { if (e.target === modal && o.cancelFirst) close(); };   // まわりを タップしても「やめる」
  modal.classList.remove('hidden');
  (o.cancelFirst ? cancel : ok).focus();
}

function subjectNameOf(grade, key) {
  const subj = SUBJECTS.find(s => s.key === key);
  return subj ? subjectLabel(grade, subj) : '';
}

// ---- セッション開始 ----
// opts: { mode: 'drill'|'mission'|'review'|'challenge', grade, subject, total,
//         problems?: [{problem, subject, id?}], fromMistakes?, missionItemId?, diffLevel? }
function startSession(opts) {
  session = Object.assign({
    index: 0, correct: 0, wrong: 0, combo: 0,
    newMistakes: 0, cleared: 0, wrongList: [],
    answered: false, selected: null, current: null, currentSubject: null, currentId: null,
    hintStage: 0, hintTexts: [], hintsUsed: 0, hintCost: 0,
    missionItemId: null, fromMistakes: false
  }, opts);
  state.grade = opts.grade;
  if (opts.subject) state.subject = opts.subject;
  showScreen('quiz');
  nextQuestion();
}

function startDrill(subject, grade) {
  startSession({ mode: 'drill', grade: grade || state.grade, subject, total: getDrillSize() });
}

function startMistakeReview(limit) {
  const due = dueMistakes(state.grade).slice(0, limit || 10);
  if (due.length === 0) {
    showToast('いまは ふくしゅうする にがてが ないよ。えらいね！');
    return;
  }
  startSession({
    mode: 'review', grade: state.grade, total: due.length, fromMistakes: true,
    problems: due.map(m => ({ problem: m.problem, subject: m.subject, id: m.id }))
  });
}

function startMissionItem(item) {
  const grade = state.grade;
  if (item.kind === 'review') {
    const due = dueMistakes(grade).slice(0, item.n);
    if (due.length === 0) {
      completeMissionItem(grade, item.id);
      showToast('にがては ぜんぶ クリア！');
      refreshHome();
      return;
    }
    startSession({
      mode: 'mission', grade, total: due.length, fromMistakes: true, missionItemId: item.id,
      problems: due.map(m => ({ problem: m.problem, subject: m.subject, id: m.id }))
    });
    return;
  }
  startSession({ mode: 'mission', grade, subject: item.subject, total: item.n, missionItemId: item.id });
}

// 「まだ ならってない」ものとして しるしのついた種類は、しばらく出さない
function makeProblem(grade, subject, diff) {
  let p;
  for (let i = 0; i < 100; i++) {
    p = GENERATORS[subject](grade, diff);
    if (!isSkipped(subject, grade, p.key)) break;
  }
  return p;
}

// 「まだ ならってない」：まちがいにも わからないにも数えず、おなじ種類を しばらく出さない
function notLearned() {
  const s = session;
  if (!s || s.answered) return;
  FX.stopSpeak();
  const p = s.current;
  const subject = s.currentSubject;
  if (p.key === undefined || p.key === null || p.key === '') {
    showToast('この もんだいは、つぎに すすんでね');
    return;
  }
  setSkip(subject, s.grade, p.key, p.unitLabel, true);
  showToast(`「${p.unitLabel || 'この もんだい'}」は、「せってい」で もどすまで ださないよ`);

  if (s.fromMistakes) {
    // にがてからも のぞく
    if (s.currentId) removeMistake(s.currentId);
    s.problems.splice(s.index, 1);
    s.total--;
    if (s.total <= 0) {
      // ふくしゅうする にがてが のこっていない：ミッションの「にがて」は クリア あつかいにして、ホームへ
      if (s.missionItemId) completeMissionItem(s.grade, s.missionItemId);
      session = null;
      showTab('home');
      return;
    }
    if (s.index >= s.total) { finishSession(); return; }
    nextQuestion();
    return;
  }
  if (s.problems) {
    // チャレンジ：同じ番号に、べつの問題を入れかえる
    s.problems[s.index] = { problem: makeProblem(s.grade, s.subject, s.diffLevel), subject: s.subject };
  }
  nextQuestion();
}

function nextQuestion() {
  session.answered = false;
  session.selected = null;
  if (session.problems) {
    const entry = session.problems[session.index];
    session.current = entry.problem;
    session.currentSubject = entry.subject;
    session.currentId = entry.id || null;
  } else {
    const diff = getDiff(session.grade, session.subject);
    session.current = makeProblem(session.grade, session.subject, diff);
    session.currentSubject = session.subject;
    session.currentId = null;
  }
  renderQuestion();
}

function quizTagText() {
  const name = subjectNameOf(session.grade, session.currentSubject);
  if (session.mode === 'challenge') return `🚀 チャレンジ ・ ${name}`;
  if (session.fromMistakes) return `💪 にがて ふくしゅう ・ ${name}`;
  if (session.mode === 'mission') return `⭐ ミッション ・ ${name}`;
  return name;
}

function renderQuestion() {
  const s = session;
  const p = s.current;

  byId('quiz-count').textContent = `${s.index + 1}/${s.total}`;
  const pct = Math.round((s.index / s.total) * 100);
  byId('quiz-bar').style.width = `${pct}%`;
  byId('quiz-bar-wrap').setAttribute('aria-valuenow', String(pct));
  byId('quiz-tag').textContent = quizTagText();
  byId('quiz-emoji').textContent = p.emoji || '';
  byId('quiz-emoji').classList.toggle('hidden', !p.emoji);
  byId('quiz-question').textContent = p.question;
  byId('quiz-read-btn').classList.toggle('hidden', !FX.canSpeak() || !!p.noRead);
  byId('quiz-read-btn').textContent = p.speakEn ? '🔊 えいごを きく' : '🔊 よみあげ';
  byId('quiz-hint').textContent = '';
  s.hintStage = 0;
  s.hintTexts = [];
  s.hint = computeHint(s);
  byId('quiz-hintbox').classList.add('hidden');
  byId('quiz-hintbox').textContent = '';
  const fb = byId('quiz-feedback');
  fb.className = 'feedback hidden';
  fb.innerHTML = '';

  const area = byId('quiz-answer-area');
  area.innerHTML = '';

  const selectChoice = (btn, value) => {
    if (s.answered) return;
    s.selected = value;
    area.querySelectorAll('.choice-btn, .dontknow-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    byId('quiz-hint').textContent = '';
    FX.tap();
  };

  if (p.type === 'choice') {
    const wrap = document.createElement('div');
    wrap.className = 'choices' + (p.choices.some(c => String(c).length > 7) ? ' col' : '');
    p.choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.dataset.value = choice;
      if (p.choiceFormat === 'kanji-kana') {
        const sp = choice.indexOf(' ');
        btn.textContent = choice.slice(0, sp);
        const kana = document.createElement('span');
        kana.className = 'choice-kana';
        kana.textContent = ' ' + choice.slice(sp + 1);
        btn.appendChild(kana);
      } else {
        btn.textContent = choice;
      }
      btn.addEventListener('click', () => selectChoice(btn, choice));
      wrap.appendChild(btn);
    });
    area.appendChild(wrap);
  } else {
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'answer-input';
    input.className = 'answer-input';
    input.autocomplete = 'off';
    input.inputMode = p.inputType === 'number' ? 'numeric' : 'text';
    input.placeholder = p.isFraction ? 'れい：3/4' : 'こたえ';
    input.setAttribute('aria-label', 'こたえ');
    input.addEventListener('input', () => {
      if (s.selected === DONT_KNOW) {
        s.selected = null;
        area.querySelectorAll('.dontknow-btn').forEach(b => b.classList.remove('selected'));
      }
      byId('quiz-hint').textContent = '';
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        byId('quiz-action-btn').click();
      }
    });
    area.appendChild(input);
    // iOS は「タップと同じ実行の流れの中」で focus したときだけ画面キーボードを出す
    input.focus();
  }

  const dk = document.createElement('button');
  dk.className = 'dontknow-btn';
  dk.textContent = 'わからない';
  dk.addEventListener('click', () => {
    if (s.answered) return;
    const input = byId('answer-input');
    if (input) input.value = '';
    selectChoice(dk, DONT_KNOW);
  });
  area.appendChild(dk);

  const nl = document.createElement('button');
  nl.className = 'notlearned-btn';
  nl.textContent = 'まだ ならってない';
  nl.addEventListener('click', () => notLearned());
  area.appendChild(nl);

  byId('quiz-action-btn').textContent = 'こたえる';
  updateHintUI();
}


// ---- ヒント（コインを つかう。1もんで 3回まで。チャレンジでは つかえない）----
// このもんだいで、ヒントを どう出すか：{ mode: 'steps' | 'choice' | null, lines, max }
//  steps … 算数の「解き方」を、考え方 → 途中 の じゅんに 見せる（答えが出てしまう 手前まで）
//  choice … えらぶ問題は、まちがいの選択肢を けしていく（4つの とき 3回まで）
function computeHint(s) {
  if (!s || s.mode === 'challenge' || !s.current) return { mode: null, lines: null, max: 0 };
  const lines = s.currentSubject === 'math' ? mathSteps(s.current, s.grade) : null;
  if (lines) {
    const plan = hintPlan(lines, s.current.answer);
    if (plan > 0) return { mode: 'steps', lines, max: Math.min(HINT_MAX, plan) };
  }
  if (s.current.type === 'choice') {
    const n = s.current.choices.length;
    // 答えが1もじのとき、3回目は 新しい情報が ないので 2回まで
    const one = String(s.current.answer).trim().length <= 1;
    const max = n >= 4 ? (one ? 2 : 3) : (n === 3 ? 1 : 0);
    if (max > 0) return { mode: 'choice', lines: null, max };
  }
  return { mode: null, lines: null, max: 0 };
}

function updateHintUI() {
  const s = session;
  const btn = byId('quiz-hintbtn');
  if (!s || s.answered || !s.hint || s.hint.max === 0 || s.hintStage >= s.hint.max) { btn.classList.add('hidden'); return; }
  const left = s.hint.max - s.hintStage;
  btn.innerHTML = '';
  btn.appendChild(document.createTextNode(`💡 ${s.hintStage === 0 ? 'ヒント' : 'つぎの ヒント'}（${HINT_COST}コイン）`));
  const sub = document.createElement('span');
  sub.className = 'coins';
  sub.textContent = `のこり ${left}かい`;
  btn.appendChild(sub);
  btn.classList.remove('hidden');
}

function useHint() {
  const s = session;
  if (!s || s.answered || !s.hint || s.hint.max === 0 || s.hintStage >= s.hint.max) return;
  const have = petBalance(loadPet());
  if (have < HINT_COST) {
    showToast(`コインが たりないよ（あと ${HINT_COST - have}コイン）。「わからない」を おすと こたえが みられるよ`);
    return;
  }
  // おしまちがいを ふせぐため、コインを つかう前に かならず たしかめる
  askConfirm(
    `ヒントを つかう？\n（${HINT_COST}コイン つかいます）\nいま ${have}コイン`,
    'つかう', 'やめる',
    () => revealHint(),
    { cancelFirst: true }
  );
}

function revealHint() {
  const s = session;
  if (!s || s.answered || !s.hint || s.hint.max === 0 || s.hintStage >= s.hint.max) return;
  if (!spendCoins(HINT_COST)) return;
  s.hintStage++;
  s.hintsUsed++;
  s.hintCost += HINT_COST;
  FX.tap();

  let text;
  if (s.hint.mode === 'steps') {
    text = hintLines(s.hint.lines, s.hintStage).join('\n');
  } else {
    // えらぶ問題：まちがいの選択肢を けしていく → 3回目は こたえの はじめの もじ（1もじの答えなら のこりの数）
    const area = byId('quiz-answer-area');
    if (s.hintStage <= 2) {
      const wrongs = [...area.querySelectorAll('.choice-btn')].filter(b => b.dataset.value !== s.current.answer && !b.classList.contains('eliminated'));
      if (wrongs.length > 1) {
        const b = wrongs[Math.floor(Math.random() * wrongs.length)];
        b.classList.add('eliminated');
        b.disabled = true;
        if (s.selected === b.dataset.value) { s.selected = null; b.classList.remove('selected'); }
      }
      s.hintTexts.push(s.hintStage === 1 ? 'まちがいの こたえを 1つ けしたよ' : 'もう 1つ けしたよ');
    } else {
      const ans = String(s.current.answer).trim();
      s.hintTexts.push(ans.length <= 1 ? 'のこった 2つから えらぼう' : `こたえは「${ans.charAt(0)}」から はじまるよ`);
    }
    text = s.hintTexts.join('\n');
  }
  const box = byId('quiz-hintbox');
  box.innerHTML = '';
  const title = document.createElement('div');
  title.className = 'hint-title';
  title.textContent = `💡 ヒント ${s.hintStage}/${s.hint.max}`;
  box.appendChild(title);
  box.appendChild(document.createTextNode(text));
  box.classList.remove('hidden');
  updateHintUI();
}

byId('quiz-hintbtn').addEventListener('click', useHint);

function checkAnswer() {
  const s = session;
  const p = s.current;
  const isDK = s.selected === DONT_KNOW;
  let ok = false;

  if (!isDK) {
    if (p.type === 'choice') {
      if (s.selected === null) {
        byId('quiz-hint').textContent = 'こたえを えらんでね';
        return;
      }
      ok = s.selected === p.answer;
    } else {
      const input = byId('answer-input');
      if (!input || input.value.trim() === '') {
        byId('quiz-hint').textContent = 'こたえを かいてね';
        return;
      }
      ok = isMathAnswerCorrect(p, input.value);
    }
  }

  s.answered = true;
  if (!s.fromMistakes) recordRecent(s.currentSubject, s.grade, ok && s.hintStage === 0);   // 最近の正解率（ヒントを使って正解したぶんは、自力ではないので 数えない）
  updateHintUI();

  // 選択肢の色づけ・入力欄のロック
  byId('quiz-answer-area').querySelectorAll('.choice-btn').forEach(b => {
    if (b.dataset.value === p.answer) b.classList.add('correct');
    else if (b.classList.contains('selected') && !ok) b.classList.add('wrong');
    b.disabled = true;
  });
  const input = byId('answer-input');
  if (input) input.disabled = true;
  byId('quiz-answer-area').querySelector('.dontknow-btn').disabled = true;
  byId('quiz-answer-area').querySelector('.notlearned-btn').disabled = true;

  if (ok) {
    s.correct++;
    s.combo++;
    FX.correct();
  } else {
    s.wrong++;
    s.combo = 0;
    FX.wrong();
    s.wrongList.push({ q: (p.emoji ? p.emoji + ' ' : '') + p.question, a: p.answer });
  }

  // にがて：まちがえたら保存、復習問題は結果に応じて更新
  if (s.fromMistakes) {
    if (s.currentId && resolveMistake(s.currentId, ok && s.hintStage === 0) === 'cleared') s.cleared++;
  } else if (!ok) {
    recordMistake(s.grade, s.currentSubject, p);
    s.newMistakes++;
  }

  showFeedback(ok, isDK, p);
  byId('quiz-action-btn').textContent = s.index + 1 < s.total ? 'つぎへ' : 'けっかをみる';
}

function showFeedback(ok, isDK, p) {
  const s = session;
  const fb = byId('quiz-feedback');
  fb.className = 'feedback ' + (ok ? 'ok' : 'ng');

  const pet = document.createElement('div');
  pet.className = 'fb-pet';
  pet.innerHTML = petSVG(petStage(loadPet().growth), ok ? 'cheer' : 'think', 44);

  const body = document.createElement('div');
  body.className = 'fb-body';

  const title = document.createElement('div');
  title.className = 'fb-title';
  if (ok) title.textContent = s.combo >= 3 ? `${s.combo}もん れんぞく せいかい！` : CORRECT_WORDS[Math.floor(Math.random() * CORRECT_WORDS.length)];
  else title.textContent = isDK ? 'だいじょうぶ！ いっしょに おぼえよう' : 'おしい！';
  body.appendChild(title);

  if (!ok) {
    const ans = document.createElement('div');
    ans.className = 'fb-ans';
    ans.textContent = `こたえは「${p.answer}」`;
    body.appendChild(ans);
  }

  const exp = explainProblem(p, s.currentSubject, s.grade);
  if (exp) {
    const e = document.createElement('div');
    e.className = 'fb-exp';
    e.textContent = exp;
    body.appendChild(e);
  }

  fb.innerHTML = '';
  fb.appendChild(pet);
  fb.appendChild(body);
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  fb.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
}

function advanceQuestion() {
  session.index++;
  if (session.index >= session.total) finishSession();
  else nextQuestion();
}

byId('quiz-action-btn').addEventListener('click', () => {
  if (!session) return;
  if (!session.answered) checkAnswer();
  else advanceQuestion();
});

byId('quiz-read-btn').addEventListener('click', () => {
  if (!session || !session.current) return;
  if (session.current.speakEn) FX.speakEn(session.current.speakEn);
  else FX.speak(session.current.question);
});

byId('quiz-quit-btn').addEventListener('click', () => {
  const leave = () => { FX.stopSpeak(); showTab('home'); };
  if (!session || (session.index === 0 && !session.answered)) { leave(); return; }
  askConfirm('やめる？\nここまでの スコアは のこらないよ。', 'やめる', 'つづける', leave);
});

// ---- チャレンジ ----
function getChallengeDialogText(grade) {
  const texts = {
    1: 'ほんとに\nやりますか？',
    3: 'ほんとに\nがんばりますか？',
    5: '本当に\n挑戦しますか？',
    7: '確実に\n挑戦しますか？'
  };
  return texts[grade] || '挑戦しますか？';
}

function confirmChallenge() {
  const grade = session.grade;
  const subject = session.subject;
  const next = getDiff(grade, subject) + 1;
  if (next > 2) return;
  const total = CHALLENGE_QUESTION_COUNTS[next];
  const pass = Math.ceil(total * 0.8);
  const upgrade = grade <= 3 ? 'つぎのレベルへ！' : `${DIFF_LABELS[next]}へ 昇段！`;
  askConfirm(
    `${getChallengeDialogText(grade)}\n\n（${total}問中${pass}問正解で\n${upgrade}）`,
    'やる', 'もどる',
    () => startChallenge(grade, subject, next)
  );
}

function startChallenge(grade, subject, diffLevel) {
  if (!canAttemptChallenge(grade, subject, diffLevel)) {
    showToast('きょうの チャレンジは もう やったよ。あした また ちょうせんしよう！');
    return;
  }
  markChallengeAttempt(grade, subject, diffLevel);
  const total = CHALLENGE_QUESTION_COUNTS[diffLevel] || 15;
  const problems = Array.from({ length: total }, () => ({
    problem: makeProblem(grade, subject, diffLevel),
    subject
  }));
  startSession({ mode: 'challenge', grade, subject, total, problems, diffLevel });
}

// ---- 結果 ----
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function starsFor(rate) {
  if (rate >= 0.9) return 3;
  if (rate >= 0.7) return 2;
  if (rate >= 0.4) return 1;
  return 0;
}

function finishSession() {
  FX.stopSpeak();
  const s = session;
  const total = s.total;
  const correct = s.correct;
  const rate = total ? correct / total : 0;

  const day = touchDayStreak();
  recordHistory(correct, total);

  if (!s.fromMistakes && s.mode !== 'challenge') {
    saveProgress(s.grade, s.subject, correct, total);
  }
  // ランキングとレベル判定は、ふつうの10もんのときだけ（3もんでは不安定なので）
  const fullDrill = s.mode === 'drill' && total === TOTAL_QUESTIONS;
  if (fullDrill) saveRankingEntry(s.grade, s.subject, correct, total);

  let ev = null;
  if (fullDrill) ev = teacherEvaluate(s.grade, s.subject, correct, total);

  let passed = false;
  if (s.mode === 'challenge') {
    passed = rate >= 0.8;
    if (passed) passChallengeAndUpgrade(s.grade, s.subject, s.diffLevel);
  }

  let coins = correct * 3 + (rate >= 0.8 && total >= 5 ? 20 : 0); // 3もんでは はやくかせげすぎないよう、ボーナスなし
  if (passed) coins += 50;
  let missionBonus = false;
  if (s.mode === 'mission' && s.missionItemId) {
    if (completeMissionItem(s.grade, s.missionItemId).allDone) {
      coins += 30;
      missionBonus = true;
    }
  }
  const perfect = correct === total && total >= 5 && !s.fromMistakes && s.hintsUsed === 0;
  const award = awardPet({ xp: correct, coins, perfect, mission: missionBonus, cleared: s.cleared });

  if (award.levelUp) FX.levelUp();
  else if (rate >= 0.8 || missionBonus) FX.clear();

  renderResult({ s, total, correct, rate, ev, passed, coins, missionBonus, award, day });
  showScreen('result');
  autoSync(); // あいことばが入っていれば、ほかの iPad とも自動で合わせる
}

function renderResult(r) {
  const { s, total, correct, rate, ev, passed, coins, missionBonus, award, day } = r;
  const root = byId('result-content');
  root.innerHTML = '';

  // タイトル
  let title = rate >= 0.5 ? 'クリア！' : 'おつかれさま！';
  if (s.mode === 'challenge') title = passed ? '🎉 チャレンジ せいこう！' : 'ざんねん… また あした！';
  root.appendChild(el('h2', 'result-title', title));

  // 星
  const stars = el('div', 'stars');
  stars.setAttribute('aria-label', `星 ${starsFor(rate)}こ`);
  for (let i = 0; i < 3; i++) stars.appendChild(el('span', 'star' + (i < starsFor(rate) ? ' on' : ''), '★'));
  root.appendChild(stars);

  // スコア
  const score = el('div', 'result-score');
  score.appendChild(el('span', 'big', String(correct)));
  score.appendChild(el('span', 'unit', ` / ${total} もん`));
  root.appendChild(score);

  let msg = rate === 1 ? 'パーフェクト！ すごいね！' : rate >= 0.8 ? 'よくできました！' : rate >= 0.5 ? 'もうすこし！ がんばろう！' : 'つぎは もっと できるよ！';
  if (s.mode === 'challenge') {
    msg = passed
      ? (s.grade <= 3 ? 'つぎのレベルへ すすみました！' : `${DIFF_LABELS[s.diffLevel]}へ 昇段しました！`)
      : 'あした もういちど ちょうせんしよう！';
  }
  root.appendChild(el('div', 'result-message', msg));

  // コイン・れんぞく
  const chips = el('div', 'stat-row');
  const coin = el('div', 'stat');
  coin.appendChild(el('div', 'stat-ico', '💰'));
  coin.appendChild(el('div', 'stat-num', `+${coins}`));
  coin.appendChild(el('div', 'stat-label', 'コイン'));
  const streak = el('div', 'stat');
  streak.appendChild(el('div', 'stat-ico', '🔥'));
  streak.appendChild(el('div', 'stat-num', `${day.count}日`));
  streak.appendChild(el('div', 'stat-label', 'れんぞく'));
  chips.appendChild(coin);
  chips.appendChild(streak);
  root.appendChild(chips);

  if (s.hintCost > 0) root.appendChild(el('div', 'note', `💡 ヒントで ${s.hintCost}コイン つかったよ（${s.hintsUsed}かい）`));
  if (missionBonus) root.appendChild(el('div', 'note gold', '🎊 きょうの ミッション ぜんぶ クリア！ ボーナス +30コイン'));

  // ポコ
  const prog = petProgress(award.pet.growth);
  const petCard = el('div', 'panel pet-card');
  const petImg = el('div', 'pet-img');
  petImg.innerHTML = petSVG(award.after, rate >= 0.8 ? 'cheer' : 'happy', 56);
  const petInfo = el('div', 'pet-info');
  petInfo.appendChild(el('div', 'pet-name', award.levelUp ? `ポコが しんかした！ ${PET_STAGES[award.after].name}` : `${PET_STAGES[award.after].name} が せいちょう中`));
  const bar = el('div', 'bar');
  const fill = el('div', 'bar-fill coral');
  fill.style.width = `${prog.pct}%`;
  bar.appendChild(fill);
  petInfo.appendChild(bar);
  petInfo.appendChild(el('div', 'pet-note', (prog.need > 0 ? `そだち ${prog.have}/${prog.span}${award.gain > 0 ? `（きょう +${award.gain}）` : ''}　まいにち つづけると しんか` : 'いちばん おおきく そだったよ！')));
  petCard.appendChild(petImg);
  petCard.appendChild(petInfo);
  root.appendChild(petCard);

  // にがて
  if (s.fromMistakes) {
    const left = loadMistakes().length;
    const text = s.cleared > 0
      ? `💪 にがてを ${s.cleared}もん そつぎょう！（のこり ${left}もん）`
      : `💪 にがては のこり ${left}もん。また ちょうせんしよう！`;
    root.appendChild(el('div', 'note', text));
  } else if (s.newMistakes > 0) {
    root.appendChild(el('div', 'note warm', `📝 にがてを ${s.newMistakes}もん みつけたよ。あした また でるから だいじょうぶ！`));
  }

  // レベル判定（ドリルのみ）
  if (ev) {
    const lv = el('div', 'panel level-card');
    lv.appendChild(el('div', 'level-title', ev.comment));
    lv.appendChild(el('div', 'level-badge', ev.badge));
    lv.appendChild(el('div', 'level-now', `${DIFF_STARS[ev.level]} ${DIFF_LABELS[ev.level]}`));
    root.appendChild(lv);
  } else if (s.mode === 'challenge') {
    const cur = getDiff(s.grade, s.subject);
    const lv = el('div', 'panel level-card');
    lv.appendChild(el('div', 'level-now', `${DIFF_STARS[cur]} ${DIFF_LABELS[cur]}`));
    root.appendChild(lv);
  }

  // まちがえた問題
  if (s.wrongList.length > 0) {
    const det = el('details', 'wrong-list');
    det.appendChild(el('summary', null, `まちがえた もんだい（${s.wrongList.length}）`));
    s.wrongList.slice(0, 8).forEach(w => {
      const row = el('div', 'wrong-row');
      row.appendChild(el('div', 'wrong-q', w.q));
      row.appendChild(el('div', 'wrong-a', `こたえ：${w.a}`));
      det.appendChild(row);
    });
    root.appendChild(det);
  }

  // ボタン
  const btns = byId('result-buttons');
  btns.innerHTML = '';
  const add = (label, cls, fn) => {
    const b = el('button', cls, label);
    b.addEventListener('click', fn);
    btns.appendChild(b);
  };

  if (s.mode === 'drill') {
    if (ev && ev.showChallenge) add('🚀 チャレンジ', 'main-btn', confirmChallenge);
    add('もういちど', (ev && ev.showChallenge) ? 'sub-btn wide' : 'main-btn', () => startDrill(s.subject, s.grade));
  } else if (s.mode === 'mission') {
    const next = getMission(s.grade).items.find(it => !it.done);
    if (next) add('つぎの ミッション', 'main-btn', () => startMissionItem(next));
  } else if (s.mode === 'review') {
    if (dueMistakes(s.grade).length > 0) add('つづけて ふくしゅう', 'main-btn', () => startMistakeReview(10));
  }
  // 前の学年で ふくしゅう中に、よくできるようになったら「もとの学年にもどろう」
  if (s.mode === 'drill') {
    const own = loadGrade();
    const next = readyToAdvance(s.subject, s.grade, own, state.playerName);
    if (next) {
      const toOwn = next === own;
      const note = el('div', 'note gold', `✨ ${gradeLabel(s.grade)}の ${subjectNameOf(s.grade, s.subject)}は、よく できているよ！ ${toOwn ? `${gradeLabel(own)}に もどって` : `つぎは ${gradeLabel(next)}で`} ちょうせんしよう`);
      byId('result-content').appendChild(note);
      add(`${gradeLabel(next)}の ${subjectNameOf(next, s.subject)}に ${toOwn ? 'もどる' : 'すすむ'}`, 'main-btn', () => startDrill(s.subject, next));
    }
  }
  add('ホームへ', btns.children.length ? 'sub-btn wide' : 'main-btn', () => showTab('home'));
}
