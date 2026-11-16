// ===== そろばん（あんざん）モード =====
// そろばんの たま（5の たま 1こ・1の たま 4こ）を タップして 数を おき、あたまの なかで たまを うごかす「そろばん式 あんざん」を れんしゅうする。
// 学年では なく「そろばんの レベル」で すすむ（どの学年の ホームからも 入れる）。
// ・入門：たまを よむ／たまを おく／あわせて 5・10
// ・たしひき：1つの レベルを「みえる（たまに 色が つく）→ あんざん（色が つかない）→ すうじ（たまなし）」の 3だんかいで れんしゅう
// ・フラッシュ あんざん：数が じゅんに 出るので たしていく（けた・口数・はやさを えらぶ）
// きろく `manabi_soroban_{なまえ}` = { lv: いま すすめる レベル, st: { レベルid: クリアした だんかい 1〜3 }, flash: { 設定: ベスト }, t }
// どうき：lv・st・flash は 大きい ほう。ごほうびは ふつうの べんきょうと おなじ（せいかい 1もん 3コイン、そだちポイントに かぞえる）。

const SB_COLS = 5;         // そろばんは いつも 5けた（万のくらいまで）ならべる。つかわない けたも 見せる
const SB_Q = 6;            // 1かいの もんだい数
const SB_PASS = 5;         // これだけ せいかいで クリア
const SB_STEPS = ['mieru', 'anzan', 'num'];
const SB_STEP_NAME = { mieru: 'みえる', anzan: 'あんざん', num: 'すうじ', read: 'よむ', set: 'おく', pair: 'ペア' };

// kind：read（たまを よむ）／set（たまを おく）／pair（あわせて n）／calc（たしひき。3だんかい）
const SB_LEVELS = [
  { id: 'r1', title: 'たまを よもう（1〜4）', kind: 'read', lo: 1, hi: 4, cols: 1 },
  { id: 'r2', title: 'たまを よもう（5〜9）', kind: 'read', lo: 5, hi: 9, cols: 1 },
  { id: 's1', title: 'たまを おこう（1〜9）', kind: 'set', lo: 1, hi: 9, cols: 1 },
  { id: 'r3', title: '2けたの たまを よもう', kind: 'read', lo: 10, hi: 99, cols: 2 },
  { id: 's2', title: '2けたの たまを おこう（りょう手で）', kind: 'set', lo: 10, hi: 99, cols: 2 },
  { id: 'p5', title: 'あわせて 5', kind: 'pair', sum: 5, cols: 1 },
  { id: 'c1', title: 'たしざん・ひきざん（そのまま）', kind: 'calc', gen: 'direct', cols: 1 },
  { id: 'c2', title: '5を つかう たしざん', kind: 'calc', gen: 'five+', cols: 1 },
  { id: 'c3', title: '5を つかう ひきざん', kind: 'calc', gen: 'five-', cols: 1 },
  { id: 'p10', title: 'あわせて 10', kind: 'pair', sum: 10, cols: 1 },
  { id: 'c4', title: 'くりあがりの たしざん', kind: 'calc', gen: 'ten+', cols: 2 },
  { id: 'c5', title: 'くりさがりの ひきざん', kind: 'calc', gen: 'ten-', cols: 2 },
  { id: 'c6', title: '3つの たしひき（1けた）', kind: 'calc', gen: 'three1', cols: 2 },
  { id: 'c7', title: '2けた と 1けた', kind: 'calc', gen: 'two1', cols: 2 },
  { id: 'c8', title: '2けた と 2けた', kind: 'calc', gen: 'two2', cols: 3 },
  { id: 'c9', title: '3つの たしひき（2けた）', kind: 'calc', gen: 'three2', cols: 3 }
];

// ---- きろく ----
function sbKey(name) { return `manabi_soroban_${playerTag(name)}`; }
function sbLoad(name) {
  const o = readJSON(sbKey(name), null) || {};
  return { lv: Math.max(0, Math.min(SB_LEVELS.length - 1, Number(o.lv) || 0)), st: (o.st && typeof o.st === 'object') ? o.st : {}, flash: (o.flash && typeof o.flash === 'object') ? o.flash : {}, checked: !!o.checked, t: o.t || 0 };
}
function sbSave(d) { d.t = Date.now(); writeJSON(sbKey(), d); }
function sbStepsOf(level) { return level.kind === 'calc' ? SB_STEPS : [level.kind]; }
// つぎの レベルへ すすめる だんかい：たしひきは「あんざん」まで、ほかは 1かい クリア
function sbNeed(level) { return level.kind === 'calc' ? 2 : 1; }

// ---- そろばんの 絵 ----
// digits：ひだりから じゅんの 数字（0〜9）。mode：'mieru'（おいた たまに 色）／'anzan'（色も いちも かわらない）／'show'（こたえを 見せる）
function sbBoardSVG(digits, mode) {
  const n = digits.length, W = 84, H = 232, barY = 74;
  let s = `<rect x="2" y="2" width="${n * W - 4}" height="${H - 4}" rx="12" fill="#6B4226"/><rect x="8" y="8" width="${n * W - 16}" height="${H - 16}" rx="8" fill="#FFF7EA"/>`;
  s += `<rect x="8" y="${barY - 4}" width="${n * W - 16}" height="8" fill="#6B4226"/>`;
  digits.forEach((d, c) => {
    const cx = c * W + W / 2;
    const lit = mode !== 'anzan';
    const five = lit && d >= 5, ones = lit ? d % 5 : 0;
    s += `<rect x="${cx - 2}" y="10" width="4" height="${H - 20}" fill="#C9A77C"/>`;
    if (c === n - 1 || c === n - 4) s += `<circle cx="${cx}" cy="${barY}" r="2.6" fill="#fff"/>`;   // 一のくらい・千のくらいの しるし（定位点）
    const bead = (y, on, kind, i) => `<ellipse class="sb-bead" data-col="${c}" data-kind="${kind}" data-i="${i}" cx="${cx}" cy="${y}" rx="31" ry="13" fill="${on ? (kind === 'five' ? '#F97316' : '#FBBF24') : '#E9DCC9'}" stroke="${on ? '#B45309' : '#B9A58B'}" stroke-width="2"/>`;
    s += bead(five ? barY - 20 : 28, five, 'five', 0);
    for (let i = 0; i < 4; i++) {
      const on = i < ones;
      const slot = on ? i : i + 1;   // おいた たまは はりに よせる。おいていない たまは 1つ ぶん さがる
      s += bead(barY + 20 + slot * 27, on, 'one', i);
    }
  });
  const names = ['一', '十', '百', '千', '万'];
  let lab = '';
  for (let c = 0; c < n; c++) lab += `<text x="${c * W + W / 2}" y="${H + 16}" font-size="14" font-weight="800" text-anchor="middle" fill="#8B5A2B">${names[n - 1 - c] || ''}</text>`;
  return `<svg class="sb-board" viewBox="0 0 ${n * W} ${H + 22}" style="max-width:${Math.min(460, n * 100)}px" aria-hidden="true">${s}${lab}</svg>`;
}
const sbDigits = (v, cols) => String(v).padStart(cols, '0').slice(-cols).split('').map(Number);
const sbValue = (digits) => digits.reduce((s, d) => s * 10 + d, 0);

// たまを タップ：5の たまは つけ／けし。1の たまは、その たまが まだなら そこまで 入れ、もう 入っていれば その たまから 下を はずす
function sbTap(digits, col, kind, i) {
  const d = digits[col], five = d >= 5 ? 5 : 0, ones = d % 5;
  if (kind === 'five') digits[col] = (five ? 0 : 5) + ones;
  else digits[col] = five + (i < ones ? i : i + 1);
}

// ---- もんだいを つくる ----
// 1けたの たま：そのまま たせるか・5を つかうか（そろばんの うごかし方で わける）
const sbDirectAdd = (a, b) => (Math.floor(a / 5) + Math.floor(b / 5) <= 1) && (a % 5 + b % 5 <= 4);
const sbDirectSub = (a, b) => (Math.floor(b / 5) <= Math.floor(a / 5)) && (b % 5 <= a % 5);
function sbGenCalc(gen) {
  const R = randInt;
  for (let k = 0; k < 500; k++) {
    let t;
    if (gen === 'direct') { const a = R(1, 9), b = R(1, 9); if (Math.random() < 0.5) { if (a + b > 9 || !sbDirectAdd(a, b)) continue; t = [a, b]; } else { if (a <= b || !sbDirectSub(a, b)) continue; t = [a, -b]; } }
    else if (gen === 'five+') { const a = R(1, 4), b = R(1, 4); if (a + b < 5) continue; t = [a, b]; }
    else if (gen === 'five-') { const a = R(5, 8), b = R(1, 4); if (b <= a % 5) continue; t = [a, -b]; }
    else if (gen === 'ten+') { const a = R(2, 9), b = R(2, 9); if (a + b < 10) continue; t = [a, b]; }
    else if (gen === 'ten-') { const a = R(11, 18), b = R(2, 9); if (a - b > 9 || a - b < 1 || a % 10 >= b) continue; t = [a, -b]; }
    else if (gen === 'three1') { const a = R(2, 9), b = R(2, 9), c = R(1, 9); const s1 = a + b; if (Math.random() < 0.5) { if (s1 - c < 0) continue; t = [a, b, -c]; } else { if (a - c < 0) continue; t = [a, -c, b]; } }
    else if (gen === 'two1') { const a = R(11, 89), b = R(2, 9); if (Math.random() < 0.5) t = [a, b]; else t = [a, -b]; }
    else if (gen === 'two2') { const a = R(11, 89), b = R(11, 89); if (Math.random() < 0.5) t = [a, b]; else { if (a <= b) continue; t = [a, -b]; } }
    else { const a = R(11, 60), b = R(11, 60), c = R(11, 60); if (Math.random() < 0.5) t = [a, b, c]; else { if (a + b - c < 0) continue; t = [a, b, -c]; } }
    const ans = t.reduce((s, x) => s + x, 0);
    if (ans < 0) continue;
    return { terms: t, answer: ans, text: t.map((x, i) => (i === 0 ? '' : (x < 0 ? ' － ' : ' ＋ ')) + Math.abs(x)).join('') };
  }
  return { terms: [1, 1], answer: 2, text: '1 ＋ 1' };
}
function sbMakeQuestion(level, step) {
  if (level.kind === 'read' || level.kind === 'set') { const v = randInt(level.lo, level.hi); return { answer: v, text: String(v) }; }
  if (level.kind === 'pair') { const v = randInt(1, level.sum - 1); return { answer: level.sum - v, text: String(v), given: v }; }
  return sbGenCalc(level.gen);
}

// ---- 画面 ----
let sb = null;   // いま あそんでいる じょうたい

function sbRoot() { return byId('soroban-content'); }
function sbPlaying(on) { const sec = byId('screen-soroban'); if (sec) sec.classList.toggle('playing', !!on); }

function openSoroban() {
  if (!state.playerName.trim()) { showToast('さきに なまえを えらんでね'); return; }
  showScreen('soroban');
  sbMenu();
}

function sbMenu() {
  sb = null;
  sbPlaying(false);
  const root = sbRoot();
  root.innerHTML = '';
  const d = sbLoad();
  const back = el('button', 'back-btn', '← もどる');
  back.addEventListener('click', () => showTab('home'));
  root.appendChild(back);
  root.appendChild(el('h2', 'page-title', '🧮 そろばん'));
  root.appendChild(el('p', 'lead', 'たまを あたまに おもいうかべて けいさん しよう！'));

  if (!d.checked && d.lv === 0 && Object.keys(d.st).length === 0) {
    const first = el('div', 'panel sb-first');
    first.appendChild(el('div', 'sb-first-title', 'はじめに えらんでね'));
    const b1 = el('button', 'main-btn wide', '🌱 はじめから やる');
    b1.addEventListener('click', () => { const x = sbLoad(); x.checked = true; sbSave(x); sbMenu(); });
    const b2 = el('button', 'sub-btn wide', '📏 レベルチェックを する（そろばんを やったことが ある人）');
    b2.addEventListener('click', sbStartCheck);
    first.appendChild(b1); first.appendChild(b2);
    root.appendChild(first);
    return;
  }

  const flash = el('button', 'main-btn wide sb-flash-btn', '⚡ フラッシュ あんざん');
  flash.addEventListener('click', sbFlashMenu);
  root.appendChild(flash);

  const list = el('div', 'sb-levels');
  SB_LEVELS.forEach((lv, i) => {
    const got = d.st[lv.id] || 0, max = sbStepsOf(lv).length, open = i <= d.lv;
    const row = el('button', 'sb-level' + (open ? '' : ' locked') + (i === d.lv ? ' now' : ''));
    row.appendChild(el('span', 'sb-level-no', open ? String(i + 1) : '🔒'));
    row.appendChild(el('span', 'sb-level-title', lv.title));
    row.appendChild(el('span', 'sb-level-stars', '★'.repeat(got) + '☆'.repeat(max - got)));
    row.disabled = !open;
    row.addEventListener('click', () => sbLevelMenu(i));
    list.appendChild(row);
  });
  root.appendChild(list);
  const chk = el('button', 'sub-btn wide', '📏 レベルチェックを やりなおす');
  chk.addEventListener('click', sbStartCheck);
  root.appendChild(chk);
}

// レベルを ひらく：だんかいを えらぶ
function sbLevelMenu(i) {
  const lv = SB_LEVELS[i], d = sbLoad(), got = d.st[lv.id] || 0, steps = sbStepsOf(lv);
  if (steps.length === 1) { sbStart(i, steps[0]); return; }
  const root = sbRoot();
  root.innerHTML = '';
  const back = el('button', 'back-btn', '← レベルを えらぶ');
  back.addEventListener('click', sbMenu);
  root.appendChild(back);
  root.appendChild(el('h2', 'page-title', `レベル ${i + 1}`));
  root.appendChild(el('p', 'lead', lv.title));
  const info = { mieru: 'おいた たまに 色が つくよ', anzan: 'たまの 色が かわらないよ。あたまの なかで おぼえよう', num: 'たまなし。あたまの なかの そろばんで こたえよう' };
  steps.forEach((st, k) => {
    const open = k <= got;
    const b = el('button', (open ? (k === got ? 'main-btn' : 'sub-btn') : 'sub-btn') + ' wide sb-step', `${k < got ? '★ ' : ''}${k + 1}. ${SB_STEP_NAME[st]}${open ? '' : ' 🔒'}`);
    b.disabled = !open;
    b.addEventListener('click', () => sbStart(i, st));
    root.appendChild(b);
    root.appendChild(el('div', 'sb-step-note', info[st]));
  });
}

function sbStart(levelIndex, step, opts) {
  const lv = SB_LEVELS[levelIndex];
  sb = Object.assign({ li: levelIndex, lv, step, n: 0, correct: 0, total: SB_Q, check: false }, opts || {});
  sbPlaying(true);
  sbNext();
}

function sbKeypad(onOk) {
  const wrap = el('div', 'sb-pad');
  const out = el('div', 'sb-pad-out', '');
  wrap.appendChild(out);
  const grid = el('div', 'sb-pad-grid');
  const press = (k) => {
    if (k === 'けす') out.textContent = out.textContent.slice(0, -1);
    else if (k === 'OK') { if (out.textContent !== '') onOk(Number(out.textContent)); }
    else if (out.textContent.length < 4) out.textContent = (out.textContent === '0' ? '' : out.textContent) + k;
    FX.tap();
  };
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'けす', '0', 'OK'].forEach(k => {
    const b = el('button', 'sb-key' + (k === 'OK' ? ' ok' : (k === 'けす' ? ' del' : '')), k);
    b.addEventListener('click', () => press(k));
    grid.appendChild(b);
  });
  wrap.appendChild(grid);
  return wrap;
}

function sbHeader(root) {
  const quit = el('button', 'back-btn', '← やめる');
  quit.addEventListener('click', () => { if (sb && sb.flash) sbFlashMenu(); else sbMenu(); });
  root.appendChild(quit);
  const head = el('div', 'sb-head');
  head.appendChild(el('span', 'sb-head-title', sb.check ? '📏 レベルチェック' : (sb.flash ? '⚡ フラッシュ あんざん' : `レベル ${sb.li + 1}・${SB_STEP_NAME[sb.step]}`)));
  head.appendChild(el('span', 'sb-head-count', `${sb.n + 1} / ${sb.total}`));
  root.appendChild(head);
}

function sbNext() {
  const root = sbRoot();
  root.innerHTML = '';
  if (sb.n >= sb.total) { sbFinish(); return; }
  sbHeader(root);
  const lv = sb.lv, step = sb.step;
  const q = sb.q = sbMakeQuestion(lv, step);
  const area = el('div', 'sb-area');
  root.appendChild(area);
  const fb = el('div', 'sb-feedback');
  const answer = (val) => sbJudge(val, area, fb);

  if (step === 'read') {
    area.appendChild(el('div', 'sb-ask', 'この たまは いくつ？'));
    const b = el('div', 'sb-board-wrap'); b.innerHTML = sbBoardSVG(sbDigits(q.answer, SB_COLS), 'show'); area.appendChild(b);
    area.appendChild(sbKeypad(answer));
  } else if (step === 'pair') {
    area.appendChild(el('div', 'sb-ask', `あわせて ${lv.sum}に なる かずは？`));
    area.appendChild(el('div', 'sb-expr', `${q.given} と □`));
    const b = el('div', 'sb-board-wrap'); b.innerHTML = sbBoardSVG(sbDigits(q.given, SB_COLS), 'show'); area.appendChild(b);
    area.appendChild(sbKeypad(answer));
  } else if (step === 'num') {
    area.appendChild(el('div', 'sb-ask', 'あたまの なかの そろばんで けいさんしよう'));
    area.appendChild(el('div', 'sb-expr', `${q.text} ＝ ？`));
    area.appendChild(sbKeypad(answer));
  } else {
    // たまを おく（set）／たしひき（mieru・anzan）
    area.appendChild(el('div', 'sb-ask', step === 'set' ? 'この かずを たまで おこう' : (step === 'anzan' ? 'たまの 色は かわらないよ。おぼえながら うごかそう' : 'たまを うごかして けいさんしよう')));
    area.appendChild(el('div', 'sb-expr', step === 'set' ? q.text : `${q.text} ＝ ？`));
    const digits = Array(SB_COLS).fill(0);
    const wrap = el('div', 'sb-board-wrap');
    const mode = step === 'anzan' ? 'anzan' : 'mieru';
    const draw = () => { wrap.innerHTML = sbBoardSVG(digits, mode); };
    draw();
    wrap.addEventListener('pointerdown', (e) => {
      const t = e.target.closest('.sb-bead');
      if (!t || sb.answered) return;
      e.preventDefault();
      sbTap(digits, Number(t.dataset.col), t.dataset.kind, Number(t.dataset.i));
      FX.tap();
      if (mode === 'anzan') { t.classList.add('pulse'); setTimeout(() => t.classList.remove('pulse'), 160); }
      else draw();
    });
    area.appendChild(wrap);
    const row = el('div', 'sb-row');
    const clear = el('button', 'sub-btn', 'はらう（0に する）');
    clear.addEventListener('click', () => { if (sb.answered) return; digits.fill(0); draw(); });
    const ok = el('button', 'main-btn', 'こたえる');
    ok.addEventListener('click', () => answer(sbValue(digits)));
    row.appendChild(clear); row.appendChild(ok);
    area.appendChild(row);
  }
  root.appendChild(fb);
  sb.answered = false;
}

function sbJudge(val, area, fb) {
  if (!sb || sb.answered) return;
  sb.answered = true;
  const ok = val === sb.q.answer;
  if (ok) { sb.correct++; FX.correct(); } else FX.wrong();
  fb.innerHTML = '';
  fb.className = 'sb-feedback ' + (ok ? 'ok' : 'ng');
  fb.appendChild(el('div', 'sb-fb-title', ok ? 'せいかい！' : `おしい！ こたえは ${sb.q.answer}`));
  if (!ok && !sb.flash) {
    if (sb.step !== 'read') fb.appendChild(el('div', 'sb-fb-sub', `きみの こたえ：${val}`));
    const pic = el('div', 'sb-board-wrap small');
    pic.innerHTML = sbBoardSVG(sbDigits(sb.q.answer, SB_COLS), 'show');
    fb.appendChild(pic);
  }
  area.querySelectorAll('button').forEach(b => { b.disabled = true; });
  const next = el('button', 'main-btn wide', sb.n + 1 < sb.total ? 'つぎへ' : 'けっかを 見る');
  next.addEventListener('click', () => { sb.n++; if (sb.flash) sbFlashNext(); else sbNext(); });
  fb.appendChild(next);
  next.scrollIntoView({ block: 'nearest' });
}

// ごほうび（ふつうの べんきょうと おなじ あつかい）
function sbReward(correct, total) {
  recordHistory(correct, total);
  const award = awardPet({ xp: correct, coins: correct * 3, perfect: false, mission: false, cleared: 0, levelKey: '' });
  if (typeof autoSync === 'function') autoSync();
  return award;
}
function sbRewardLines(root, correct, award) {
  root.appendChild(el('div', 'note gold', `💰 +${correct * 3}コイン`));
  ((award && award.bonuses) || []).forEach(b => root.appendChild(el('div', 'note gold', `🎁 ${b.label} +${b.coins}コイン`)));
  if (award && award.earned && award.earned.length > 0) root.appendChild(el('div', 'note warm', `🌱 そだちポイント +${award.earned.length}`));
  if (award && award.levelUp) FX.levelUp();
}

function sbFinish() {
  const root = sbRoot();
  root.innerHTML = '';
  sbPlaying(false);
  if (sb.check) { sbCheckStep(); return; }
  const { li, lv, step, correct, total } = sb;
  const pass = correct >= SB_PASS;
  const d = sbLoad();
  const steps = sbStepsOf(lv), k = steps.indexOf(step) + 1;
  let unlocked = false;
  if (pass) {
    d.st[lv.id] = Math.max(d.st[lv.id] || 0, k);
    if (d.st[lv.id] >= sbNeed(lv) && d.lv <= li && li + 1 < SB_LEVELS.length) { d.lv = li + 1; unlocked = true; }
    sbSave(d);
  }
  const award = sbReward(correct, total);
  root.appendChild(el('h2', 'result-title', pass ? 'クリア！' : 'おつかれさま！'));
  const score = el('div', 'result-score');
  score.appendChild(el('span', 'big', String(correct)));
  score.appendChild(el('span', 'unit', ` / ${total} もん`));
  root.appendChild(score);
  root.appendChild(el('div', 'result-message', pass ? (unlocked ? `レベル ${li + 2}「${SB_LEVELS[li + 1].title}」が ひらいたよ！` : `「${SB_STEP_NAME[step]}」クリア！`) : `${SB_PASS}もん せいかいで クリアだよ。もういちど やってみよう`));
  sbRewardLines(root, correct, award);
  if (pass) FX.clear();
  const btns = el('div', 'result-buttons');
  if (pass && k < steps.length) { const b = el('button', 'main-btn', `つぎは「${SB_STEP_NAME[steps[k]]}」`); b.addEventListener('click', () => sbStart(li, steps[k])); btns.appendChild(b); }
  else if (pass && unlocked) { const b = el('button', 'main-btn', 'つぎの レベルへ'); b.addEventListener('click', () => sbLevelMenu(li + 1)); btns.appendChild(b); }
  const again = el('button', pass ? 'sub-btn wide' : 'main-btn', 'もういちど');
  again.addEventListener('click', () => sbStart(li, step));
  btns.appendChild(again);
  const menu = el('button', 'sub-btn wide', 'レベルを えらぶ');
  menu.addEventListener('click', sbMenu);
  btns.appendChild(menu);
  root.appendChild(btns);
}

// ---- レベルチェック：たしひきの レベルを やさしい じゅんに 3もんずつ（すうじで こたえる）。ぜんぶ せいかいなら つぎへ ----
function sbStartCheck() {
  const calc = SB_LEVELS.map((lv, i) => i).filter(i => SB_LEVELS[i].kind === 'calc');
  sb = { check: true, list: calc, ci: 0, passed: -1, totalCorrect: 0, totalAsked: 0 };
  sbCheckRun();
}
function sbCheckRun() {
  const i = sb.list[sb.ci];
  sb = Object.assign(sb, { li: i, lv: SB_LEVELS[i], step: 'num', n: 0, correct: 0, total: 3 });
  sbPlaying(true);
  sbNext();
}
function sbCheckStep() {
  sb.totalCorrect += sb.correct; sb.totalAsked += sb.total;
  if (sb.correct === sb.total && sb.ci + 1 < sb.list.length) { sb.passed = sb.ci; sb.ci++; sbCheckRun(); return; }
  if (sb.correct === sb.total) sb.passed = sb.ci;
  // はじめる レベル：さいごに ぜんぶ できた レベルの つぎ（1つも できなければ たしひきの さいしょ…では なく 入門の はじめ）
  const d = sbLoad();
  const start = sb.passed < 0 ? 0 : Math.min(SB_LEVELS.length - 1, sb.list[sb.passed] + 1);
  d.lv = Math.max(d.lv, start);
  d.checked = true;
  sbSave(d);
  const award = sbReward(sb.totalCorrect, sb.totalAsked);
  const root = sbRoot();
  root.innerHTML = '';
  root.appendChild(el('h2', 'result-title', 'レベルチェック おわり！'));
  root.appendChild(el('div', 'result-message', `レベル ${d.lv + 1}「${SB_LEVELS[d.lv].title}」から はじめよう`));
  root.appendChild(el('div', 'sb-step-note', 'まえの レベルも いつでも れんしゅう できるよ'));
  sbRewardLines(root, sb.totalCorrect, award);
  const b = el('button', 'main-btn wide', 'レベルを 見る');
  b.addEventListener('click', sbMenu);
  root.appendChild(b);
  sbPlaying(false);
}

// ---- フラッシュ あんざん ----
const SB_FLASH_SPEED = { slow: ['ゆっくり', 1500], mid: ['ふつう', 1000], fast: ['はやい', 650] };
function sbFlashMenu() {
  sb = null;
  sbPlaying(false);
  const root = sbRoot();
  root.innerHTML = '';
  const back = el('button', 'back-btn', '← もどる');
  back.addEventListener('click', sbMenu);
  root.appendChild(back);
  root.appendChild(el('h2', 'page-title', '⚡ フラッシュ あんざん'));
  root.appendChild(el('p', 'lead', '数が じゅんばんに 出るよ。ぜんぶ たして こたえよう！'));
  const d = sbLoad();
  const last = d.flash._last || { digits: 1, count: 3, speed: 'slow' };
  const pick = (label, options, cur) => {
    const box = el('div', 'sb-pick');
    box.appendChild(el('div', 'sb-pick-label', label));
    const row = el('div', 'sb-pick-row');
    let value = cur;
    options.forEach(([v, name]) => {
      const b = el('button', 'sb-chip' + (v === cur ? ' on' : ''), name);
      b.addEventListener('click', () => { value = v; row.querySelectorAll('.sb-chip').forEach(x => x.classList.remove('on')); b.classList.add('on'); });
      row.appendChild(b);
    });
    box.appendChild(row);
    root.appendChild(box);
    return () => value;
  };
  const gd = pick('けた', [[1, '1けた'], [2, '2けた']], last.digits);
  const gc = pick('いくつ 出る？', [[3, '3こ'], [5, '5こ'], [7, '7こ'], [10, '10こ']], last.count);
  const gs = pick('はやさ', Object.keys(SB_FLASH_SPEED).map(k => [k, SB_FLASH_SPEED[k][0]]), last.speed);
  const go = el('button', 'main-btn wide', 'スタート！');
  go.addEventListener('click', () => {
    const cfg = { digits: gd(), count: gc(), speed: gs() };
    const x = sbLoad(); x.flash._last = cfg; sbSave(x);
    sb = { flash: true, cfg, n: 0, correct: 0, total: 5, lv: { cols: 3 }, step: 'flash' };
    sbPlaying(true);
    sbFlashNext();
  });
  root.appendChild(go);
  const key = `${last.digits}-${last.count}-${last.speed}`;
  if (d.flash[key]) root.appendChild(el('div', 'sb-step-note', `まえの せってい の ベスト：5もん中 ${d.flash[key]}もん`));
}
function sbFlashNext() {
  const root = sbRoot();
  root.innerHTML = '';
  if (sb.n >= sb.total) { sbFlashFinish(); return; }
  sbHeader(root);
  const { digits, count, speed } = sb.cfg;
  const nums = Array.from({ length: count }, () => (digits === 1 ? randInt(1, 9) : randInt(10, 99)));
  sb.q = { answer: nums.reduce((s, x) => s + x, 0) };
  sb.answered = false;
  const area = el('div', 'sb-area');
  const stage = el('div', 'sb-flash-stage', 'よーい…');
  area.appendChild(stage);
  root.appendChild(area);
  const fb = el('div', 'sb-feedback');
  root.appendChild(fb);
  const ms = SB_FLASH_SPEED[speed][1];
  const token = sb.token = Math.random();
  let i = -1;
  const tick = () => {
    if (!sb || sb.token !== token) return;   // やめた
    i++;
    if (i < nums.length) {
      stage.textContent = '';
      setTimeout(() => { if (sb && sb.token === token) { stage.textContent = String(nums[i]); FX.tap(); } }, Math.min(120, ms * 0.15));
      setTimeout(tick, ms);
    } else {
      stage.textContent = '？';
      area.appendChild(sbKeypad((val) => {
        sbJudge(val, area, fb);
        if (val !== sb.q.answer) fb.insertBefore(el('div', 'sb-fb-sub', nums.join(' ＋ ')), fb.lastChild);
      }));
    }
  };
  setTimeout(tick, 900);
}
function sbFlashFinish() {
  const root = sbRoot();
  root.innerHTML = '';
  sbPlaying(false);
  const { correct, total, cfg } = sb;
  const d = sbLoad();
  const key = `${cfg.digits}-${cfg.count}-${cfg.speed}`;
  d.flash[key] = Math.max(d.flash[key] || 0, correct);
  sbSave(d);
  const award = sbReward(correct, total);
  root.appendChild(el('h2', 'result-title', correct === total ? 'パーフェクト！' : 'おつかれさま！'));
  const score = el('div', 'result-score');
  score.appendChild(el('span', 'big', String(correct)));
  score.appendChild(el('span', 'unit', ` / ${total} もん`));
  root.appendChild(score);
  root.appendChild(el('div', 'result-message', `${cfg.digits}けた・${cfg.count}こ・${SB_FLASH_SPEED[cfg.speed][0]}`));
  sbRewardLines(root, correct, award);
  if (correct === total) FX.clear();
  const btns = el('div', 'result-buttons');
  const again = el('button', 'main-btn', 'もういちど');
  again.addEventListener('click', () => { sb = { flash: true, cfg, n: 0, correct: 0, total: 5, lv: { cols: 3 }, step: 'flash' }; sbPlaying(true); sbFlashNext(); });
  const menu = el('button', 'sub-btn wide', 'せっていを かえる');
  menu.addEventListener('click', sbFlashMenu);
  btns.appendChild(again); btns.appendChild(menu);
  root.appendChild(btns);
}
