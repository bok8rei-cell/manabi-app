// ===== ホーム・ずかん・きろく・せってい =====

const GRADE_PILL_LABEL = { 1: '1年生', 3: '3年生', 5: '5年生', 7: '中1' };
const SUBJECT_ICON = { math: '🔢', kanji: '✏️', kotowaza: '📜', rikashakai: '🔬', eigo: '🔤' };

function gradeKey() { return `manabi_grade_${playerTag()}`; }

function loadGrade() {
  const g = Number(localStorage.getItem(gradeKey()));
  return ALL_GRADES.includes(g) ? g : null;
}

function saveGrade(g) { localStorage.setItem(gradeKey(), String(g)); }

function syncBeforeShow(showFn) { showFn(); }

function showTab(name) {
  if (name === 'home') renderHome();
  else if (name === 'zukan') renderZukan();
  else if (name === 'report') { renderReport(); }
  else if (name === 'settings') renderSettings();
  showScreen(name);
}

function refreshHome() {
  const home = byId('screen-home');
  if (home && !home.classList.contains('hidden')) renderHome();
}

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 11) return 'おはよう';
  if (h < 17) return 'こんにちは';
  return 'こんばんは';
}

// ---- ホーム ----
function renderHome() {
  state.grade = loadGrade();
  const grade = state.grade;
  const name = state.playerName.trim();
  const streak = currentDayStreak();
  const pet = loadPet();
  const mission = grade ? getMission(grade) : null;
  const allDone = mission && mission.items.every(it => it.done);

  byId('home-hello').textContent = name ? `${timeGreeting()}、${name}` : timeGreeting();
  const chip = byId('home-streak');
  chip.textContent = streak > 0 ? `🔥 ${streak}日れんぞく` : '🔥 きょうから スタート';
  chip.classList.toggle('dim', streak === 0);

  byId('home-pet').innerHTML = petSVG(petStage(pet.xp), allDone ? 'cheer' : 'happy', 84);
  let say;
  if (!name) say = 'なまえを おしえてね！\n「せってい」で いれられるよ。';
  else if (!grade) say = 'まず 学年を えらんでね！';
  else if (allDone) say = 'きょうの ミッション クリア！\nすごいね！';
  else if (studiedToday()) say = 'いいちょうし！\nもうすこし やってみる？';
  else if (streak > 0) say = 'きのうも がんばったね！\nきょうも いっしょに やろう！';
  else say = 'きょうも いっしょに\nやろう！';
  byId('home-bubble').textContent = say;

  const body = byId('home-body');
  body.innerHTML = '';

  if (!name) {
    const card = el('div', 'panel name-card');
    card.appendChild(el('div', 'name-card-text', 'なまえを いれると、きろくや ポコが のこるよ'));
    const b = el('button', 'sub-btn wide', '✏️ なまえを いれる');
    b.addEventListener('click', () => {
      showTab('settings');
      byId('player-name').focus();
    });
    card.appendChild(b);
    body.appendChild(card);
  }

  // 学年
  const pills = el('div', 'grade-pills');
  pills.setAttribute('role', 'group');
  pills.setAttribute('aria-label', '学年');
  ALL_GRADES.forEach(g => {
    const b = el('button', 'pill' + (g === grade ? ' active' : ''), GRADE_PILL_LABEL[g]);
    b.setAttribute('aria-pressed', g === grade ? 'true' : 'false');
    b.addEventListener('click', () => {
      saveGrade(g);
      renderHome();
    });
    pills.appendChild(b);
  });
  body.appendChild(pills);

  if (!grade) return;

  // きょうのミッション
  const doneCount = mission.items.filter(it => it.done).length;
  const card = el('div', 'mission-card');
  const head = el('div', 'mission-head');
  head.appendChild(el('div', 'mission-title', 'きょうの ミッション'));
  head.appendChild(el('div', 'mission-count', `${doneCount}/${mission.items.length}`));
  card.appendChild(head);
  mission.items.forEach(item => {
    const row = el('div', 'mission-item' + (item.done ? ' done' : ''));
    row.appendChild(el('span', 'mark', item.done ? '✓' : '○'));
    const label = item.kind === 'review'
      ? `にがて ふくしゅう`
      : `${subjectNameOf(grade, item.subject)} ${item.n}もん`;
    row.appendChild(el('span', null, label));
    card.appendChild(row);
  });
  const next = mission.items.find(it => !it.done);
  if (next) {
    const b = el('button', 'main-btn', doneCount === 0 ? 'はじめる' : 'つづける');
    b.addEventListener('click', () => startMissionItem(next));
    card.appendChild(b);
  } else {
    card.appendChild(el('div', 'mission-clear', '🎉 ぜんぶ クリア！ また あした！'));
  }
  body.appendChild(card);

  // 教科
  body.appendChild(el('h3', 'section-title', 'すきな きょうかで あそぶ'));
  const grid = el('div', 'subject-grid');
  SUBJECTS.forEach(subj => {
    if (subj.grades && !subj.grades.includes(grade)) return;
    const d = getDiff(grade, subj.key);
    const t = el('button', `tile ${subj.key}`);
    t.appendChild(el('span', 'tile-ico', SUBJECT_ICON[subj.key] || '📘'));
    t.appendChild(el('span', 'tile-name', subjectLabel(grade, subj)));
    t.appendChild(el('span', 'tile-level', `${DIFF_STARS[d]} ${DIFF_LABELS[d]}`));
    t.addEventListener('click', () => startDrill(subj.key));
    grid.appendChild(t);
  });
  body.appendChild(grid);

  // にがて
  const mistakes = loadMistakes().filter(m => m.grade === grade);
  if (mistakes.length > 0) {
    const due = dueMistakes(grade).length;
    const mc = el('div', 'panel mistake-card');
    mc.appendChild(el('div', 'mistake-text', `💪 にがて ${mistakes.length}もん`));
    mc.appendChild(el('div', 'mistake-sub', due > 0 ? `いま ふくしゅうできるのは ${due}もん` : 'あしたから また ふくしゅうできるよ'));
    if (due > 0) {
      const b = el('button', 'sub-btn wide', 'ふくしゅうする');
      b.addEventListener('click', () => startMistakeReview(10));
      mc.appendChild(b);
    }
    body.appendChild(mc);
  }

  // タイムアタック
  const speed = el('button', 'speed-banner', '⚡ 1けたの数 10問タイムアタック');
  speed.id = 'speed-open-btn';
  speed.addEventListener('click', () => showScreen('speed'));
  body.appendChild(speed);
}

// ---- ずかん ----
function renderZukan() {
  const root = byId('zukan-content');
  root.innerHTML = '';
  const pet = loadPet();
  const prog = petProgress(pet.xp);

  const hero = el('div', 'zukan-hero');
  const img = el('div', 'zukan-pet');
  img.innerHTML = petSVG(prog.stage, 'happy', 120);
  hero.appendChild(img);
  hero.appendChild(el('div', 'zukan-name', PET_STAGES[prog.stage].name));
  const bar = el('div', 'bar');
  const fill = el('div', 'bar-fill coral');
  fill.style.width = `${prog.pct}%`;
  bar.appendChild(fill);
  hero.appendChild(bar);
  hero.appendChild(el('div', 'pet-note', prog.need > 0 ? `あと ${prog.need}もん せいかいすると しんか！` : 'いちばん おおきく そだったよ！'));
  const coin = el('div', 'zukan-coin', `💰 ${pet.coins} コイン`);
  hero.appendChild(coin);
  root.appendChild(hero);

  root.appendChild(el('h3', 'section-title', 'そだつ すがた'));
  const stages = el('div', 'stage-row');
  PET_STAGES.forEach((st, i) => {
    const cell = el('div', 'stage' + (i <= prog.stage ? '' : ' locked'));
    const pic = el('div', 'stage-pic');
    pic.innerHTML = petSVG(i, 'happy', 52);
    cell.appendChild(pic);
    cell.appendChild(el('div', 'stage-name', i <= prog.stage ? st.name : '？？？'));
    stages.appendChild(cell);
  });
  root.appendChild(stages);

  root.appendChild(el('h3', 'section-title', 'バッジ'));
  const grid = el('div', 'badge-grid');
  computeBadges().forEach(b => {
    const cell = el('div', 'badge' + (b.got ? ' got' : ''));
    cell.appendChild(el('div', 'badge-ico', b.got ? b.icon : '🔒'));
    cell.appendChild(el('div', 'badge-name', b.label));
    cell.appendChild(el('div', 'badge-hint', b.hint));
    grid.appendChild(cell);
  });
  root.appendChild(grid);
}

// ---- きろく ----
function renderReport() {
  const container = byId('report-content');
  container.innerHTML = '';

  container.appendChild(el('div', 'report-who',
    state.playerName
      ? `👤 ${state.playerName} のきろく`
      : '👤 なまえ未設定（「せってい」でなまえを入れると、その子の記録になります）'));

  const mistakes = loadMistakes();
  const sum = el('div', 'panel');
  sum.appendChild(el('div', 'report-line', `💪 にがて：${mistakes.length}もん　🔥 れんぞく：${currentDayStreak()}日（さいこう ${playerBestStreak()}日）`));
  container.appendChild(sum);

  ALL_GRADES.forEach(grade => {
    const card = el('div', 'report-card');
    card.appendChild(el('h3', null, gradeLabel(grade)));
    let hasAnyData = false;

    SUBJECTS.forEach(subj => {
      if (subj.grades && !subj.grades.includes(grade)) return;
      const p = loadProgress(grade, subj.key);
      const row = el('div', 'report-row');
      row.appendChild(el('span', 'subject-name', subjectLabel(grade, subj)));

      if (p.total === 0) {
        row.appendChild(el('span', 'report-empty', 'まだやっていない'));
      } else {
        hasAnyData = true;
        const rate = Math.round((p.correct / p.total) * 100);
        const detail = el('span', 'subject-detail', `${p.total}問中${p.correct}問正解　れんぞく${p.streak || 0}日　`);
        detail.appendChild(el('span', 'subject-rate ' + (rate >= 80 ? 'high' : rate >= 50 ? 'mid' : 'low'), `${rate}%`));
        row.appendChild(detail);
      }
      card.appendChild(row);
    });

    if (!hasAnyData) card.appendChild(el('div', 'report-empty pad', 'この学年はまだ学習記録がありません。'));
    container.appendChild(card);
  });

  const rank = el('button', 'sub-btn wide', '🏆 この たんまつの ランキング');
  rank.addEventListener('click', () => syncBeforeShow(showRankingScreen));
  container.appendChild(rank);
  const speed = el('button', 'sub-btn wide', '⚡ タイムアタックの ランキング');
  speed.addEventListener('click', () => syncBeforeShow(showSpeedRankingScreen));
  container.appendChild(speed);
}

function showReportScreen() {
  renderReport();
  showScreen('report');
}

// ---- せってい ----
function renderSettings() {
  playerNameInput.value = state.playerName;
  byId('sound-toggle').checked = FX.soundOn();
}
