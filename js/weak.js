// ===== にがて とっくん（まいにちの ミッションの 1つ）と、そつぎょう =====
// ・「にがて」＝ その学年の 算数で、さいきん 20もんの じりき せいかいが 95%みまんの たんげん（store.js の unitRate）。
//   はんの すくない（ふるい きろく だけで 1しゅうかん いじょう やっていない）ものは ふくめない。
// ・まいにちの ミッションに「🎯 にがて とっくん 10もん」を ひとつ くわえる（にがてが あるとき）。
//   にがて 2つ ぶんを えらび、その たんげんの もんだい（かずだけ ちがう）と「さかのぼり」を まぜて 10もん。
// ・そつぎょう：にがてだった たんげんが さいきん 20もんで 95%に なったら 100コイン（1たんげん 1かい）。
// ・おうちの人の 画面：にがての へんか（まえ 20もん → いま）と、まちがえた こたえの かたち。

const WEAK_Q = 10;
const GRAD_COINS = 100;

function weakUnitKeys(label) {
  return Object.keys(MATH_UNIT_LABELS).filter(k => MATH_UNIT_LABELS[k] === label);
}

// いまの レベルで じっさいに 出る たんげん（昇段チャレンジ だけの たんげんは とっくんに できない）。1かい しらべたら おぼえておく
const _weakProd = {};
function producibleUnits(grade, diff) {
  const k = grade + "|" + diff;
  if (_weakProd[k]) return _weakProd[k];
  const set = new Set();
  for (let i = 0; i < 1200; i++) { try { const p = generateMathProblem(grade, diff); if (p && p.unitLabel) set.add(p.unitLabel); } catch (e) { /* 無視 */ } }
  return (_weakProd[k] = set);
}

// いま とっくん する たんげん（ひくい じゅんに 2つまで）。算数だけ
function weakTargets(grade, name) {
  const u = loadUnits(name);
  const out = [];
  const diff = getDiff(grade, "math");
  const prod = new Set([...producibleUnits(grade, diff), ...(diff > 2 ? producibleUnits(grade, 2) : [])]);   // ちょうむずかしい の 子も、ふつうの たんげんを とっくん できる
  Object.keys(u).forEach(k => {
    const [g, subj, unit] = k.split('|');
    if (Number(g) !== grade || subj !== 'math') return;
    const r = unitRate(u[k]);
    if (!r || r.rate >= UNIT_GOAL || weakUnitKeys(unit).length === 0 || !prod.has(unit)) return;
    out.push({ unit, rate: r.rate, n: r.n });
  });
  return out.sort((a, b) => a.rate - b.rate).slice(0, 2);
}

// とっくんの もんだいを つくる：{ problems:[{problem, subject}], units:[たんげんの なまえ] }。つくれなければ null
function buildWeakSession(grade) {
  const targets = weakTargets(grade);
  if (targets.length === 0) return null;
  const diff = getDiff(grade, 'math');
  const problems = [], seen = new Set();
  const add = (p) => { if (!p || !p.question || seen.has(p.question)) return false; seen.add(p.question); problems.push({ problem: p, subject: 'math' }); return true; };
  const mainN = targets.length === 1 ? [7] : [4, 4];
  const bridgeN = targets.length === 1 ? 3 : 1;
  targets.forEach((t, ti) => {
    const keys = weakUnitKeys(t.unit);
    let got = 0;
    for (let tries = 0; tries < 400 && got < mainN[ti]; tries++) {
      const key = keys[randInt(0, keys.length - 1)];
      const p = mathProblemOfType(grade, diff, key, null) || (diff > 2 ? mathProblemOfType(grade, 2, key, null) : null);
      if (p && p.unitLabel === t.unit && add(p)) got++;
    }
    const gens = (typeof BRIDGE_MAP !== 'undefined' && BRIDGE_MAP[t.unit]) || [];
    for (let b = 0; b < bridgeN && gens.length; b++) {
      const g = gens[randInt(0, gens.length - 1)];
      for (let tries = 0; tries < 10; tries++) { if (add(_bTag(g()))) break; }
    }
  });
  if (problems.length < 5) return null;
  return { problems: shuffleArray(problems), units: targets.map(t => t.unit) };
}

// ミッションに「にがて とっくん」を くわえる（その日の ミッションに まだ なければ。1日 1かいだけ たしかめる）
function ensureWeakItem(mission, grade) {
  if (!mission || mission.weakChecked) return false;
  mission.weakChecked = true;
  if (mission.bonus || mission.items.some(it => it.kind === 'weak')) { writeJSON(missionKey(grade), mission); return false; }
  const t = weakTargets(grade);
  if (t.length > 0) mission.items.push({ id: 'm4', kind: 'weak', n: WEAK_Q, done: false, units: t.map(x => x.unit) });
  writeJSON(missionKey(grade), mission);
  return t.length > 0;
}

// そつぎょう：にがて だった（w）たんげんが さいきん 20もんで 95%に なった とき 1かいだけ。たんげんの なまえを かえす
function checkGraduation(subject, grade, unit) {
  if (!unit) return null;
  const e = loadUnits()[`${grade}|${subject}|${unit}`];
  if (!e || !e.w || typeof e.r !== 'string' || e.r.length < UNIT_RECENT_N) return null;
  const win = e.r.slice(-UNIT_RECENT_N);
  const ok = win.split('').filter(x => x === '1').length;
  if (ok / UNIT_RECENT_N < UNIT_GOAL) return null;
  const p = loadPet();
  const paid = petPaid(p);
  const key = `${grade}|${subject}|${unit}`;
  if (paid.grad.includes(key)) return null;
  paid.grad.push(key);
  p.coins += GRAD_COINS;
  writeJSON(petKey(), p);
  return unit;
}
function graduatedCount(name) { return petPaid(loadPet(name)).grad.length; }

// ---- おうちの人の 画面 ----
// たんげんごとの、さいきん 20もん と その まえ 20もんの せいかいりつ
function unitTrend(e) {
  if (!e || typeof e.r !== 'string' || e.r.length < UNIT_RECENT_N + 10) return null;
  const rate = (s) => s.split('').filter(x => x === '1').length / s.length;
  const now = e.r.slice(-UNIT_RECENT_N), before = e.r.slice(0, e.r.length - UNIT_RECENT_N);
  return { before: Math.round(rate(before) * 100), now: Math.round(rate(now) * 100) };
}

// まちがえた こたえ：その たんげんの さいきん 3つ（もんだい → こたえた もの／せいかい）
function wrongExamples(name, grade, unit, n) {
  const list = readJSON(wrongKey(name), []);
  const out = [];
  (Array.isArray(list) ? list : []).forEach(w => {
    if (out.length >= (n || 3) || w.g !== grade || w.u !== unit || w.y === 'わからない') return;
    const q = String(w.q || '').replace(/\s*\n\s*/g, ' ');
    if (!out.some(o => o.q === q && o.y === w.y)) out.push({ q, y: w.y, a: w.a });
  });
  return out;
}

function appendWeakParent(card, name) {
  const u = loadUnits(name);
  const rows = [];
  Object.keys(u).forEach(k => {
    const r = unitRate(u[k]);
    if (r && r.rate < UNIT_GOAL) rows.push({ k, r, tr: unitTrend(u[k]) });
  });
  const gc = graduatedCount(name);
  if (rows.length === 0 && gc === 0) return;
  card.appendChild(el('div', 'child-section', '🔍 よわい たんげん（さいきん 20もんで じりきで せいかい した わりあい。95%で そつぎょう）'));
  if (rows.length === 0) card.appendChild(el('div', 'report-line', '🎉 いま よわい たんげんは ありません'));
  rows.sort((x, y) => x.r.rate - y.r.rate).slice(0, 4).forEach(w => {
    const [g, subj, unit] = w.k.split('|');
    const row = el('div', 'report-row');
    row.appendChild(el('span', 'subject-name', `${gradeLabel(Number(g))} ${subjectNameOf(Number(g), subj)}　${unit}`));
    const rate = Math.round(w.r.rate * 100);
    const detail = el('span', 'subject-detail', `${w.r.recent ? 'さいきん ' : 'これまでの ごうけい '}${w.r.ok}/${w.r.n} `);
    detail.appendChild(el('span', 'subject-rate ' + (rate >= 80 ? 'high' : rate >= 50 ? 'mid' : 'low'), `${rate}%`));
    row.appendChild(detail);
    card.appendChild(row);
    if (w.tr) card.appendChild(el('div', 'report-line weak-trend', `　📈 まえ 20もん ${w.tr.before}% → いま ${w.tr.now}%`));
    if (subj === 'math') wrongExamples(name, Number(g), unit, 3).forEach(x => card.appendChild(el('div', 'report-line weak-wrong', `　✗ ${x.q} → ${x.y}（せいかい ${x.a}）`)));
  });
  if (gc > 0) card.appendChild(el('div', 'report-line', `🎓 そつぎょうした たんげん：${gc}こ`));
}
