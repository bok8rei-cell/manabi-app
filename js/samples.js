// ===== もんだいを 見る（おうちの人の 画面から ひらく）=====
// 学年・教科・レベルを えらぶと、そのレベルで 出る もんだいを 5もん ならべて 見せる。
// 答えと 解説（ヒント）も 出る。学校の 先生などに「いま こんな もんだいを やっています」と スマホで 見せる ため。
// ここで 作る もんだいは、成績・きろく・「さいきん出した もんだい」には のこさない（GENERATORS を そのまま 呼ぶ）。

const samplesState = { name: '', grade: 3, subject: 'math', diff: 1 };
const SAMPLE_COUNT = 5;

function sampleDiffOf(name, grade, subject) {
  if (!name) return null;
  const raw = localStorage.getItem(`${DIFF_KEY}_${playerTag(name)}_${grade}_${subject}`);
  return raw !== null ? parseInt(raw) : 0;
}

function openSamples() {
  const names = loadPlayerNames();
  const n = names.includes(samplesState.name) ? samplesState.name : (names[0] || '');
  samplesState.name = n;
  const g = n ? loadGrade(n) : null;
  samplesState.grade = g || samplesState.grade || 3;
  syncSamplesSubject();
  const cur = sampleDiffOf(n, samplesState.grade, samplesState.subject);
  if (cur !== null) samplesState.diff = Math.min(cur, maxDiff(samplesState.grade, samplesState.subject));
  renderSamples();
  showScreen('samples');
}

function syncSamplesSubject() {
  const subs = SUBJECTS.filter(s => subjectAvailable(s.key, samplesState.grade));
  if (!subs.some(s => s.key === samplesState.subject)) samplesState.subject = subs[0].key;
  samplesState.diff = Math.min(samplesState.diff, maxDiff(samplesState.grade, samplesState.subject));
}

function samplePills(parent, items, selectedKey, onPick) {
  const row = el('div', 'name-chips');
  items.forEach(it => {
    const b = el('button', 'name-chip' + (String(it.key) === String(selectedKey) ? ' selected' : ''), it.label);
    b.addEventListener('click', () => onPick(it.key));
    row.appendChild(b);
  });
  parent.appendChild(row);
}

function renderSamples() {
  const root = byId('samples-content');
  root.innerHTML = '';
  const st = samplesState;

  // えらぶ ところ
  const ctrl = el('div', 'panel');
  ctrl.appendChild(el('p', 'panel-desc', '学校の 先生などに 見せる ための ページです。ここで 出る もんだいは、きろくには のこりません。'));
  const names = loadPlayerNames();
  if (names.length > 0) {
    ctrl.appendChild(el('div', 'child-section', 'だれの レベルで 見る？'));
    samplePills(ctrl, names.map(n => ({ key: n, label: n })), st.name, (n) => {
      st.name = n;
      const g = loadGrade(n);
      if (g) st.grade = g;
      syncSamplesSubject();
      const cur = sampleDiffOf(n, st.grade, st.subject);
      if (cur !== null) st.diff = Math.min(cur, maxDiff(st.grade, st.subject));
      renderSamples();
    });
  }
  ctrl.appendChild(el('div', 'child-section', '学年'));
  samplePills(ctrl, ALL_GRADES.map(g => ({ key: g, label: gradeLabel(g) })), st.grade, (g) => {
    st.grade = g; syncSamplesSubject(); renderSamples();
  });
  ctrl.appendChild(el('div', 'child-section', '教科'));
  samplePills(ctrl, SUBJECTS.filter(s => subjectAvailable(s.key, st.grade)).map(s => ({ key: s.key, label: subjectLabel(st.grade, s) })), st.subject, (k) => {
    st.subject = k; syncSamplesSubject(); renderSamples();
  });
  ctrl.appendChild(el('div', 'child-section', 'レベル'));
  const cur = sampleDiffOf(st.name, st.grade, st.subject);
  const levels = [];
  for (let d = 0; d <= maxDiff(st.grade, st.subject); d++) {
    levels.push({ key: d, label: `${DIFF_STARS[d]} ${DIFF_LABELS[d]}${cur === d ? '（いま）' : ''}` });
  }
  samplePills(ctrl, levels, st.diff, (d) => { st.diff = d; renderSamples(); });
  root.appendChild(ctrl);

  // 見出し（スマホの がめんで 見せる とき わかりやすい ように）
  const subj = SUBJECTS.find(s => s.key === st.subject);
  root.appendChild(el('div', 'sample-title', `${gradeLabel(st.grade)}　${subj ? subjectLabel(st.grade, subj) : ''}　${DIFF_STARS[st.diff]} ${DIFF_LABELS[st.diff]}`));

  // もんだい
  const seen = new Set();
  let made = 0;
  for (let t = 0; t < 200 && made < SAMPLE_COUNT; t++) {
    let p;
    try { p = GENERATORS[st.subject](st.grade, st.diff); } catch (e) { break; }
    if (!p || seen.has(p.question)) continue;
    seen.add(p.question);
    made++;
    const card = el('div', 'panel sample-card');
    card.appendChild(el('div', 'sample-no', `もんだい ${made}`));
    card.appendChild(el('div', 'sample-q', p.question));
    if (p.type === 'choice' && Array.isArray(p.choices)) {
      const ul = el('div', 'sample-choices', p.choices.map((c, i) => `${'①②③④⑤⑥'[i] || '・'} ${c}`).join('\n'));
      card.appendChild(ul);
    }
    card.appendChild(el('div', 'sample-ans', `こたえ：${p.answer}`));
    let ex = '';
    try { ex = explainProblem(p, st.subject, st.grade) || ''; } catch (e) { ex = ''; }
    if (ex) card.appendChild(el('div', 'sample-ex', `とき方・かいせつ\n${ex}`));
    root.appendChild(card);
  }

  const more = el('button', 'main-btn', '🔄 ほかの もんだいを 出す');
  more.addEventListener('click', () => { renderSamples(); window.scrollTo(0, 0); });
  root.appendChild(more);
}
