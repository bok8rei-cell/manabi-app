// ===== ホーム・ずかん・きろく・せってい =====

const GRADE_PILL_LABEL = { 1: '1年', 2: '2年', 3: '3年', 4: '4年', 5: '5年', 6: '6年', 7: '中1' };
const SUBJECT_ICON = { math: '🔢', kanji: '✏️', kotowaza: '📜', rikashakai: '🔬', eigo: '🔤' };

function gradeKey(name) { return `manabi_grade_${playerTag(name)}`; }

function loadGrade(name) {
  const g = Number(localStorage.getItem(gradeKey(name)));
  return ALL_GRADES.includes(g) ? g : null;
}

function saveGrade(g) { localStorage.setItem(gradeKey(), String(g)); }

function syncBeforeShow(showFn) { showFn(); }

function showTab(name) {
  if (name === 'home') renderHome();
  else if (name === 'zukan') renderZukan();
  else if (name === 'report') { renderReport(); }
  else if (name === 'settings') renderSettings();
  else if (name === 'parent') { renderParent(); autoSync(); }
  showScreen(name);
}

function refreshHome() {
  const home = byId('screen-home');
  if (home && !home.classList.contains('hidden')) renderHome();
  const parent = byId('screen-parent');
  if (parent && !parent.classList.contains('hidden')) renderParent();
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

  byId('home-pet').innerHTML = petSVG(petStage(pet.growth), allDone ? 'cheer' : 'happy', 84);
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

  // ふくしゅうの おすすめ（正解率が低い教科は、前の学年に もどって ふくしゅう）
  const recs = getRecommendations(state.playerName, grade).slice(0, 2);
  if (recs.length > 0) {
    const rc = el('div', 'rec-card');
    rc.appendChild(el('div', 'rec-title', '💡 ふくしゅうの おすすめ'));
    recs.forEach(rec => {
      rc.appendChild(el('div', 'rec-text', recommendText(rec)));
      const label = rec.to ? `${gradeLabel(rec.to)}の ${subjectNameOf(rec.to, rec.subject)}を やってみる` : 'にがてを ふくしゅうする';
      const b = el('button', 'sub-btn wide', label);
      b.addEventListener('click', () => (rec.to ? startDrill(rec.subject, rec.to) : startMistakeReview(10)));
      rc.appendChild(b);
    });
    body.appendChild(rc);
  }

  // 教科
  const titleRow = el('div', 'title-row');
  titleRow.appendChild(el('h3', 'section-title', 'きょうかを えらぶ'));
  const seg = el('div', 'seg');
  seg.setAttribute('role', 'group');
  seg.setAttribute('aria-label', 'もんだいの かず');
  [3, 10].forEach(n => {
    const b = el('button', 'seg-btn' + (n === getDrillSize() ? ' active' : ''), `${n}もん`);
    b.setAttribute('aria-pressed', n === getDrillSize() ? 'true' : 'false');
    b.addEventListener('click', () => { setDrillSize(n); renderHome(); });
    seg.appendChild(b);
  });
  titleRow.appendChild(seg);
  body.appendChild(titleRow);
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
  const prog = petProgress(pet.growth);

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
  hero.appendChild(el('div', 'pet-note', prog.need > 0 ? `そだち ${prog.have}/${prog.span}　まいにち つづけると しんかするよ` : 'いちばん おおきく そだったよ！'));
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

  // だれの きろくか えらべる（子どもが複数いるとき）
  const names = loadPlayerNames();
  if (names.length > 1) {
    const chips = el('div', 'name-chips report-chips');
    names.forEach(n => {
      const b = el('button', 'name-chip' + (n === state.playerName ? ' selected' : ''), n);
      b.addEventListener('click', () => { selectPlayerName(n); renderReport(); });
      chips.appendChild(b);
    });
    container.insertBefore(chips, container.children[1]);
  }

  // この 1しゅうかん
  const days = lastDays(7);
  const weekQ = days.reduce((a, d) => a + d.q, 0);
  const weekC = days.reduce((a, d) => a + d.c, 0);
  const week = el('div', 'panel');
  week.appendChild(el('h3', null, 'この 1しゅうかん'));
  week.appendChild(el('div', 'report-line', weekQ > 0
    ? `${weekQ}もん やって、${weekC}もん せいかい（${Math.round((weekC / weekQ) * 100)}%）　べんきょうした日：${days.filter(d => d.q > 0).length}日`
    : 'まだ きろくが ありません。'));
  week.appendChild(buildWeekBars(days));
  container.appendChild(week);

  // にがて（教科べつ）
  const weak = el('div', 'panel');
  weak.appendChild(el('h3', null, 'にがて（まちがえた もんだい）'));
  if (mistakes.length === 0) {
    weak.appendChild(el('div', 'report-empty', 'いまは にがてが ありません。'));
  } else {
    const bySubject = {};
    mistakes.forEach(m => {
      const key = `${m.grade}|${m.subject}`;
      bySubject[key] = (bySubject[key] || 0) + 1;
    });
    Object.keys(bySubject).sort((a, b) => bySubject[b] - bySubject[a]).forEach(key => {
      const [g, subj] = key.split('|');
      const row = el('div', 'report-row');
      row.appendChild(el('span', 'subject-name', `${gradeLabel(Number(g))} ${subjectNameOf(Number(g), subj)}`));
      row.appendChild(el('span', 'subject-detail', `${bySubject[key]}もん`));
      weak.appendChild(row);
    });
    const det = el('details', 'wrong-list');
    det.appendChild(el('summary', null, 'もんだいを みる'));
    mistakes.slice(0, 20).forEach(m => {
      const row = el('div', 'wrong-row');
      row.appendChild(el('div', 'wrong-q', (m.problem.emoji ? m.problem.emoji + ' ' : '') + m.problem.question));
      row.appendChild(el('div', 'wrong-a', `こたえ：${m.problem.answer}`));
      det.appendChild(row);
    });
    weak.appendChild(det);
  }
  container.appendChild(weak);

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
  renderSkipList();
}

// 「まだ ならってない」で けしたものの一覧（もどす）
function renderSkipList() {
  const box = byId('skip-list');
  box.innerHTML = '';
  const entries = Object.entries(loadSkips()).filter(([, e]) => e && e.on);
  if (entries.length === 0) {
    box.appendChild(el('div', 'report-empty', 'いまは ありません。'));
    return;
  }
  entries.forEach(([id, e]) => {
    const parts = id.split('|');
    const subject = parts[0];
    const grade = parts[1];
    const key = parts.slice(2).join('|');
    const row = el('div', 'skip-row');
    row.appendChild(el('span', 'skip-name', `${gradeLabel(Number(grade))} ${subjectNameOf(Number(grade), subject)}：${e.label || key}`));
    const b = el('button', 'sub-btn', 'もどす');
    b.addEventListener('click', () => {
      setSkip(subject, grade, key, e.label, false);
      renderSkipList();
    });
    row.appendChild(b);
    box.appendChild(row);
  });
}

// ---- 1しゅうかんのぼうグラフ（きろく・おうちの人の画面で共通）----
function buildWeekBars(days) {
  const maxQ = Math.max(1, ...days.map(d => d.q));
  const bars = el('div', 'week');
  const DOW = ['日', '月', '火', '水', '木', '金', '土'];
  days.forEach(d => {
    const col = el('div', 'week-col' + (d.date === localDateStr() ? ' today' : ''));
    col.appendChild(el('div', 'week-num', d.q > 0 ? String(d.q) : ''));
    const bar = el('div', 'week-bar' + (d.q > 0 ? ' on' : ''));
    bar.style.height = `${d.q > 0 ? Math.max(8, Math.round((d.q / maxQ) * 70)) : 4}px`;
    col.appendChild(bar);
    col.appendChild(el('div', 'week-dow', DOW[d.dow]));
    col.setAttribute('aria-label', `${d.date} ${d.q}もん`);
    bars.appendChild(col);
  });
  return bars;
}

// ---- おうちの人の画面：子ども全員のようすを1画面で ----
function formatDay(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dow = ['日', '月', '火', '水', '木', '金', '土'][new Date(y, m - 1, d).getDay()];
  return `${m}月${d}日（${dow}）`;
}

function renderParent() {
  const root = byId('parent-content');
  root.innerHTML = '';
  const today = localDateStr();

  // どうきの ようす・いますぐ さいしんにする
  const head = el('div', 'panel');
  const hasCode = !!getActiveSyncCode();
  const err = localStorage.getItem('manabi_lasterr');
  head.appendChild(el('div', 'report-line', hasCode
    ? (err ? 'どうきが できていません（くわしくは「せってい」→「どうき」）' : (lastSyncText() || 'まだ どうきしていません'))
    : 'あいことばが まだ ありません。「せってい」→「データを どうきする」で いれてね。'));
  const refresh = el('button', 'sub-btn wide', '🔄 いま さいしんに する');
  refresh.addEventListener('click', async () => {
    refresh.disabled = true;
    refresh.textContent = 'どうきしています…';
    await autoSync();
    renderParent();
  });
  head.appendChild(refresh);
  root.appendChild(head);

  const names = loadPlayerNames();
  if (names.length === 0) {
    root.appendChild(el('div', 'panel', 'まだ 子どもの きろくが ありません。あいことばを いれて「いま さいしんに する」を おしてね。'));
    return;
  }

  names.forEach(name => {
    const card = el('div', 'panel child-card');
    const grade = loadGrade(name);
    const pet = loadPet(name);
    const streakInfo = loadDayStreak(name);
    const hist = loadHistory(name);
    const todayQ = (hist[today] || { q: 0 }).q;
    const days = lastDays(7, name);
    const weekQ = days.reduce((a, d) => a + d.q, 0);
    const weekC = days.reduce((a, d) => a + d.c, 0);

    const title = el('div', 'child-head');
    title.appendChild(el('h3', null, name));
    title.appendChild(el('span', 'child-sub', `${grade ? gradeLabel(grade) : '学年 みせってい'} ・ ${PET_STAGES[petStage(pet.growth)].name}`));
    card.appendChild(title);

    // きょう
    const doneToday = streakInfo.last === today;
    const daysAgo = streakInfo.last ? Math.round((new Date(today) - new Date(streakInfo.last)) / 86400000) : null;
    let todayText, todayCls;
    if (doneToday) { todayText = `✅ きょうは やりました（${todayQ}もん）`; todayCls = 'ok'; }
    else if (daysAgo === null) { todayText = '⏳ まだ いちども やっていません'; todayCls = 'wait'; }
    else if (daysAgo <= 1) { todayText = '⏳ きょうは まだ です'; todayCls = 'wait'; }
    else { todayText = `⚠️ ${daysAgo}日 やっていません`; todayCls = 'warn'; }
    card.appendChild(el('div', 'today-line ' + todayCls, todayText));

    getRecommendations(name, grade).slice(0, 3).forEach(rec => {
      card.appendChild(el('div', 'parent-rec', '💡 ' + recommendText(rec)));
    });
    card.appendChild(el('div', 'report-line', `🔥 れんぞく ${currentDayStreak(name)}日（さいこう ${Math.max(streakInfo.best, currentDayStreak(name))}日）　📅 さいごに やった日：${streakInfo.last ? formatDay(streakInfo.last) : 'まだ'}`));

    // この1しゅうかん
    card.appendChild(el('div', 'report-line', weekQ > 0
      ? `この 1しゅうかん：${weekQ}もん（せいかい ${Math.round((weekC / weekQ) * 100)}%）　${days.filter(d => d.q > 0).length}日 べんきょう`
      : 'この 1しゅうかん：まだ やっていません'));
    card.appendChild(buildWeekBars(days));

    // 教科べつ（せいかいりつ）
    const rows = [];
    ALL_GRADES.forEach(g => SUBJECTS.forEach(subj => {
      if (subj.grades && !subj.grades.includes(g)) return;
      const p = loadProgress(g, subj.key, name);
      if (p.total > 0) rows.push({ g, subj, p });
    }));
    if (rows.length > 0) {
      card.appendChild(el('div', 'child-section', '教科べつの せいかいりつ'));
      rows.sort((x, y) => y.p.total - x.p.total).slice(0, 6).forEach(({ g, subj, p }) => {
        const rate = Math.round((p.correct / p.total) * 100);
        const row = el('div', 'report-row');
        row.appendChild(el('span', 'subject-name', `${gradeLabel(g)} ${subjectLabel(g, subj)}`));
        const detail = el('span', 'subject-detail', `${p.total}もん中 `);
        detail.appendChild(el('span', 'subject-rate ' + (rate >= 80 ? 'high' : rate >= 50 ? 'mid' : 'low'), `${rate}%`));
        row.appendChild(detail);
        card.appendChild(row);
      });
    }

    // にがて
    const mistakes = loadMistakes(name);
    if (mistakes.length > 0) {
      const by = {};
      mistakes.forEach(m => { const k = `${m.grade}|${m.subject}`; by[k] = (by[k] || 0) + 1; });
      const top = Object.keys(by).sort((x, y) => by[y] - by[x]).slice(0, 3)
        .map(k => { const [g, subj] = k.split('|'); return `${subjectNameOf(Number(g), subj)} ${by[k]}もん`; });
      card.appendChild(el('div', 'child-section', `💪 にがて ${mistakes.length}もん`));
      card.appendChild(el('div', 'report-line', top.join('　')));
    }
    root.appendChild(card);
  });
}
