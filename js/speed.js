// ===== ⚡ 1けたの数 10問タイムアタック =====
const SPEED_QUESTIONS = 10;
const SPEED_RANKING_KEY = 'manabi_speedranking';

let speedTimerInterval = null;
let speedStartTime = 0;

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
    FX.correct();
  } else {
    fb.textContent = `❌ こたえは ${p.answer}`;
    fb.classList.add('wrong');
    FX.wrong();
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
    date: localDateStr()
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
    FX.clear();
  } else {
    message += '\n（ランキングは10問ぜんぶせいかいすると登録されるよ）';
  }
  if (!state.playerName) {
    message += '\n\n💡 「せってい」で なまえを入れると\nランキングに登録されるよ！';
  }

  touchDayStreak();
  document.getElementById('speed-result-message').textContent = message;

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
  showTab('home');
});
