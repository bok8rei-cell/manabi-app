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
// たしひきは「なぞる（ひかる たまを じゅんに タップ）→ みえる → あんざん → すうじ」の 4だんかい。
// あたらしい レベルの「なぞる」を はじめて ひらくと、さいしょに お手本（たまが 1つずつ うごく）を 見せる。
// 2もん つづけて まちがえたら「お手本を 見る／なぞりで れんしゅう」を 出す。
const SB_STEPS = ['nazoru', 'mieru', 'anzan', 'num'];
const SB_STEP_NAME = { nazoru: 'なぞる', mieru: 'みえる', anzan: 'あんざん', num: 'すうじ', test: 'テスト', read: 'よむ', set: 'おく', pair: 'ペア' };

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
  { id: 'c4b', title: 'くりあがり（5も つかう）', kind: 'calc', gen: 'ten5+', cols: 2 },
  { id: 'c5', title: 'くりさがりの ひきざん', kind: 'calc', gen: 'ten-', cols: 2 },
  { id: 'c5b', title: 'くりさがり（5も つかう）', kind: 'calc', gen: 'ten5-', cols: 2 },
  { id: 'c6', title: '3つの たしひき（1けた）', kind: 'calc', gen: 'three1', cols: 2 },
  { id: 'c7', title: '2けた と 1けた', kind: 'calc', gen: 'two1', cols: 2 },
  { id: 'c8', title: '2けた と 2けた', kind: 'calc', gen: 'two2', cols: 3 },
  { id: 'c9', title: '3つの たしひき（2けた）', kind: 'calc', gen: 'three2', cols: 3 }
];

// ---- はしご（ひゃくこ いじょうの レベル）：わざ × けた × くち × はやさ ----
// わざ T0 そのまま（1〜4 だけ）／T1 5を つかう／T2 10を つかう（くりあがり・くりさがり）／T3 5も 10も まざる
// 各レベルは「なぞる→みえる→あんざん→すうじ」の れんしゅう（すきな ときに）と、「しんきゅうテスト」。
// テスト：q もん ぜんぶ せいかい ＋ ぜんぶで limit びょう いない（まちがえたら そこで おわり）。ごうかくで つぎが ひらく。
// しっぱいしたら、その レベルを SB_RETRY_PRACTICE かい れんしゅう（クリア）してから また うけられる。なんかい でも うけられる。
const SB_LADDER_STEPS = ['nazoru', 'mieru', 'anzan', 'num', 'test'];
const SB_RETRY_PRACTICE = 2;      // テストに しっぱいしたら、なんかい れんしゅうして また うけられる？
const SB_TIME_SCALE = 1.3;        // せいげん じかんの ゆとり（みんなの きろくを 見て あとから ちょうせい する）
const SB_TIERS = {
  T0: { name: 'そのまま（1〜4だけ）', short: 'そのまま', f: 0.7 },
  T1: { name: '5を つかう', short: '5を つかう', f: 0.9 },
  T2: { name: '10を つかう（くりあがり・くりさがり）', short: '10を つかう', f: 1.0 },
  T3: { name: '5も 10も まざる', short: '5も 10も', f: 1.15 }
};
// 1もんの せいげん じかん（びょう）：よむ じかん 3びょう ＋ 口が ふえる ほど・けたが ふえる ほど ながく
function sbPerQ(tier, cols, terms, grade) {
  const g = [1, 0.8, 0.65][grade - 1] || 1;
  return Math.ceil((3 + 1.6 * (terms - 1) * (1 + 0.3 * (cols - 1)) * SB_TIERS[tier].f) * SB_TIME_SCALE * g);
}
function sbBuildLadder() {
  const out = [];
  const add = (tier, cols, terms, grade) => {
    const perQ = sbPerQ(tier, cols, terms, grade);
    const q = perQ <= 8 ? 20 : 10;   // かんたんな ときは 20もん、むずかしい ときは 10もん
    const speed = grade === 1 ? '' : (grade === 2 ? '（はやい）' : '（もっと はやい）');
    out.push({ id: `${tier}c${cols}t${terms}g${grade}`, title: `${SB_TIERS[tier].short}・${cols}けた・${terms}こ${speed}`, kind: 'ladder', tier, cols, terms, grade, perQ, q, limit: perQ * q });
  };
  const rows = (tier, list, grade) => list.sort((a, b) => a[0] - b[0] || a[1] - b[1]).forEach(([c, t]) => add(tier, c, t, grade));
  const grid = (cols, termsList) => cols.flatMap(c => termsList.map(t => [c, t]));
  rows('T0', [[2, 2], [3, 2], [4, 2], [3, 3]], 1);
  rows('T1', grid([1, 2, 3, 4, 5], [2, 3, 5]), 1);
  rows('T2', grid([1], [2, 3, 5, 7, 10]).concat(grid([2, 3, 4, 5], [2, 3, 5])), 1);
  rows('T3', grid([1, 2, 3, 4, 5], [2, 3, 5, 7, 10]), 1);
  rows('T3', grid([1, 2, 3, 4, 5], [3, 5, 7, 10]), 2);
  rows('T3', grid([1, 2, 3, 4, 5], [5, 7, 10]), 3);
  return out;
}
SB_LEVELS.push(...sbBuildLadder());
const sbIsCalc = (lv) => lv.kind === 'calc' || lv.kind === 'ladder';
// その レベルを クリアした（つぎが ひらく）か：はしごは テストに ごうかく、ほかは ふるい きまり
function sbIsCleared(lv, st) { return lv.kind === 'ladder' ? (st[lv.id] || 0) >= 5 : (st[lv.id] || 0) >= sbNeed(lv); }

// はしごの もんだい：わざの じょうけんを みたす まで つくる（けた＝1つの 数の けたすう。こたえは 1けた ふえて よい）
//  T0/T1：くりあがり・くりさがりが ない もんだいを つくる（T0 は 1〜4 だけ、T1 は 5を つかう こと）
//  T2：くりあがり・くりさがりが ある（できるだけ 5を つかわない ものを さきに さがす）／T3：5も 10も つかう
function sbGenLadder(lv) {
  const R = randInt;
  const maxV = Math.min(99999, Math.pow(10, lv.cols + (lv.terms > 3 ? 2 : 1)) - 1);
  const noCarry = lv.tier === 'T0' || lv.tier === 'T1';
  const hi = lv.tier === 'T0' ? 4 : 9;
  const nDigits = () => (Math.random() < 0.6 ? lv.cols : R(1, lv.cols));
  const text = (terms) => terms.map((x, i) => (i === 0 ? '' : (x < 0 ? ' － ' : ' ＋ ')) + Math.abs(x)).join('');
  const okTier = (m, strict) => {
    if (lv.tier === 'T0') return ![...m].some(x => x !== 'direct');
    if (lv.tier === 'T1') return m.has('five') && !m.has('ten');
    if (lv.tier === 'T2') return m.has('ten') && (!strict || !m.has('five'));
    return m.has('five') && m.has('ten');
  };
  // くりあがりの ない もんだい（けたごとに 0〜9 の はんいに おさめる）
  const genNoCarry = () => {
    const col = Array(SB_COLS).fill(0);   // 左から 万 千 百 十 一
    const terms = [];
    for (let j = 0; j < lv.terms; j++) {
      let done = false;
      for (let a = 0; a < 30 && !done; a++) {
        const sign = (j === 0 || Math.random() < 0.6) ? 1 : -1;
        const c = nDigits();
        const ds = []; let ok = true;
        for (let k = 0; k < c && ok; k++) {
          const pos = SB_COLS - 1 - k;   // 一のくらいから
          const bound = sign > 0 ? hi - col[pos] : Math.min(col[pos], hi);
          const lead = (k === c - 1);
          const lo = lead ? 1 : 0;
          if (bound < lo) ok = false; else ds[k] = R(lo, bound);
        }
        if (!ok) continue;
        let x = 0;
        for (let k = c - 1; k >= 0; k--) x = x * 10 + ds[k];
        for (let k = 0; k < c; k++) col[SB_COLS - 1 - k] += sign * ds[k];
        terms.push(sign * x);
        done = true;
      }
      if (!done) return null;
    }
    return terms;
  };
  // くりあがり・くりさがりが ある もんだい（ぜんたいの ごうけいが 0〜maxV）
  const genAny = () => {
    const rnd = () => { const c = nDigits(); let t = ''; for (let k = 0; k < c; k++) t += String(R(k === 0 ? 1 : 0, 9)); return Number(t); };
    const terms = [rnd()];
    let run = terms[0];
    for (let j = 1; j < lv.terms; j++) {
      const x = rnd();
      let sign = Math.random() < 0.4 ? -1 : 1;
      if (sign < 0 && run < x) sign = 1;
      if (sign > 0 && run + x > maxV) { if (run >= x) sign = -1; else return null; }
      terms.push(sign * x); run += sign * x;
    }
    return terms;
  };
  let last = null;
  for (let k = 0; k < 4000; k++) {
    const terms = noCarry ? genNoCarry() : genAny();
    if (!terms || terms.length < lv.terms) continue;
    const run = terms.reduce((a, x) => a + x, 0);
    if (run < 0 || run > maxV) continue;
    let plan;
    try { plan = sbPlan(terms); } catch (e) { continue; }
    if (plan.answer !== run) continue;
    last = { terms, answer: run, text: text(terms) };
    if (okTier(plan.methods, k < 1500)) return last;   // さいしょは きびしく、みつからなければ ゆるく（T2 だけ）
  }
  return last || { terms: [1, 1], answer: 2, text: '1 ＋ 1' };
}

// ---- きろく ----
function sbKey(name) { return `manabi_soroban_${playerTag(name)}`; }
// v1（さいしょの 版）の レベルの ならび。v2 で くりあがり・くりさがりを 2つに わけ、たしひきに「なぞる」を くわえた
const SB_OLD_IDS = ['r1', 'r2', 's1', 'r3', 's2', 'p5', 'c1', 'c2', 'c3', 'p10', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9'];
// きろくを いまの かたち（v2）に そろえる。どうき（sync.js）からも つかう
function sbNormalize(o) {
  o = o || {};
  const st = Object.assign({}, (o.st && typeof o.st === 'object') ? o.st : {});
  let lv = 0;
  if (o.v >= 2 && o.lvId) lv = SB_LEVELS.findIndex(l => l.id === o.lvId);
  else {
    const id = SB_OLD_IDS[Number(o.lv) || 0];
    lv = SB_LEVELS.findIndex(l => l.id === id);
    // v1 の たしひきの ほしは「みえる＝1」だった。まえに「なぞる」が 入ったので 1つ ずらす
    SB_LEVELS.forEach(l => { if (l.kind === 'calc' && st[l.id] > 0) st[l.id] = Math.min(SB_STEPS.length, st[l.id] + 1); });
  }
  lv = Math.max(0, Math.min(SB_LEVELS.length - 1, lv < 0 ? 0 : lv));
  while (lv + 1 < SB_LEVELS.length && sbIsCleared(SB_LEVELS[lv], st)) lv++;   // クリアずみの レベルの つぎを ひらく（さいしょの 版の ぶんも）
  const pairs = (m) => { const r = {}; if (m && typeof m === 'object') Object.keys(m).forEach(k => { if (Array.isArray(m[k])) r[k] = [Number(m[k][0]) || 0, Number(m[k][1]) || 0]; }); return r; };
  const triples = (m) => { const r = {}; if (m && typeof m === 'object') Object.keys(m).forEach(k => { if (Array.isArray(m[k])) r[k] = [Number(m[k][0]) || 0, Number(m[k][1]) || 0, Number(m[k][2]) || 0]; }); return r; };
  const nums = (m) => { const r = {}; if (m && typeof m === 'object') Object.keys(m).forEach(k => { r[k] = Number(m[k]) || 0; }); return r; };
  return { v: 2, lv, lvId: SB_LEVELS[lv].id, st, flash: (o.flash && typeof o.flash === 'object') ? o.flash : {}, day: pairs(o.day), lvs: pairs(o.lvs), ts: triples(o.ts), tn: nums(o.tn), checked: !!o.checked, t: o.t || 0 };
}
function sbLoad(name) { return sbNormalize(readJSON(sbKey(name), null)); }
// 1もん こたえる ごとの きろく（日ごと・レベルごとの [もんだい数, せいかい数]）。ぶんせき・親の画面用
function sbRecord(levelId, correct) {
  const d = sbLoad();
  const t = localDateStr();
  d.day[t] = d.day[t] || [0, 0];
  d.day[t][0]++; if (correct) d.day[t][1]++;
  const days = Object.keys(d.day).sort();
  while (days.length > 60) delete d.day[days.shift()];
  d.lvs[levelId] = d.lvs[levelId] || [0, 0];
  d.lvs[levelId][0]++; if (correct) d.lvs[levelId][1]++;
  sbSave(d);
}
function sbSave(d) { d.v = 2; d.lvId = SB_LEVELS[d.lv].id; d.t = Date.now(); writeJSON(sbKey(), d); }
function sbStepsOf(level) { return level.kind === 'ladder' ? SB_LADDER_STEPS : (level.kind === 'calc' ? SB_STEPS : [level.kind]); }
// つぎの レベルへ すすめる だんかい：たしひきは「あんざん」まで、ほかは 1かい クリア
function sbNeed(level) { return level.kind === 'ladder' ? 5 : (level.kind === 'calc' ? SB_STEPS.indexOf('anzan') + 1 : 1); }   // はしごは テストに ごうかく（=5）で つぎへ

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
    else if (gen === 'ten+' || gen === 'ten5+') {   // くりあがり：5を つかう うごかし方が まざるか どうかで わける
      const a = R(1, 9), b = R(2, 9); if (a + b < 10) continue;
      const m = sbPlan([a, b]).methods; if (m.has('five') !== (gen === 'ten5+')) continue;
      t = [a, b];
    }
    else if (gen === 'ten-' || gen === 'ten5-') {   // くりさがり：おなじく 5を つかうか どうかで わける
      const a = R(10, 18), b = R(2, 9); if (a - b > 9 || a - b < 0 || a % 10 >= b) continue;
      const m = sbPlan([a, -b]).methods; if (m.has('five') !== (gen === 'ten5-')) continue;
      t = [a, -b];
    }
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
  if (level.kind === 'ladder') return sbGenLadder(level);
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
  const trial = (typeof isTrial === 'function' && isTrial());
  let lastTier = null, hidden = 0;
  SB_LEVELS.forEach((lv, i) => {
    if (!trial && i > d.lv + 3) { hidden++; return; }   // まだ さきの レベルは すこしだけ 見せる
    if (lv.kind === 'ladder' && (lv.tier + lv.grade) !== lastTier) {
      lastTier = lv.tier + lv.grade;
      list.appendChild(el('div', 'sb-tier', `${SB_TIERS[lv.tier].name}${lv.grade === 2 ? '　はやい' : (lv.grade === 3 ? '　もっと はやい' : '')}`));
    }
    const got = d.st[lv.id] || 0, max = sbStepsOf(lv).length, open = i <= d.lv || trial;   // おためしモードは ぜんぶ ひらく
    const row = el('button', 'sb-level' + (open ? '' : ' locked') + (i === d.lv ? ' now' : ''));
    row.appendChild(el('span', 'sb-level-no', open ? String(i + 1) : '🔒'));
    row.appendChild(el('span', 'sb-level-title', lv.title));
    row.appendChild(el('span', 'sb-level-stars', '★'.repeat(got) + '☆'.repeat(max - got)));
    row.disabled = !open;
    row.addEventListener('click', () => sbLevelMenu(i));
    list.appendChild(row);
  });
  if (hidden > 0) list.appendChild(el('div', 'sb-step-note', `…あと ${hidden}レベル（テストに ごうかくすると つぎが ひらくよ）`));
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
  const demo = el('button', 'sub-btn wide sb-demo-btn', '📺 お手本を 見る（うごかしかた）');
  demo.addEventListener('click', () => sbDemo(sbMakeQuestion(lv), () => sbLevelMenu(i), `レベル ${i + 1} の お手本`));
  root.appendChild(demo);
  const info = { nazoru: 'ひかる たまを じゅんばんに タップ。ゆびで うごかしかたを おぼえよう', mieru: 'おいた たまに 色が つくよ', anzan: 'たまの 色が かわらないよ。あたまの なかで おぼえよう', num: 'たまなし。あたまの なかの そろばんで こたえよう', test: 'あたまの なかで けいさん。ぜんぶ せいかい ＋ じかん いない で ごうかく！ はやく・ただしく' };
  const trial = (typeof isTrial === 'function' && isTrial());   // おためしモードは ぜんぶ ひらく
  steps.forEach((st, k) => {
    if (st === 'test') {
      const avail = sbTestAvail(d, lv), passed = (d.st[lv.id] || 0) >= 5;
      const b = el('button', (avail ? 'main-btn' : 'sub-btn') + ' wide sb-step', `⏱ ${passed ? '★ ' : ''}しんきゅうテスト（${lv.q}もん・${lv.limit}びょう いない）${avail ? '' : ' 🔒'}`);
      b.disabled = !avail;
      b.addEventListener('click', () => sbTestStart(i));
      root.appendChild(b);
      root.appendChild(el('div', 'sb-step-note', avail ? info.test : `あと ${d.tn[lv.id]}かい この レベルを れんしゅう（クリア）したら また うけられるよ`));
      const t = d.ts[lv.id];
      if (t && t[0] > 0) root.appendChild(el('div', 'sb-step-note', `これまで ${t[0]}かい うけて ${t[1]}かい ごうかく${t[2] > 0 ? `（ベスト ${t[2]}びょう）` : ''}`));
      return;
    }
    const open = k <= got || trial;
    const b = el('button', (open ? (k === got ? 'main-btn' : 'sub-btn') : 'sub-btn') + ' wide sb-step', `${k < got ? '★ ' : ''}${k + 1}. ${SB_STEP_NAME[st]}${open ? '' : ' 🔒'}`);
    b.disabled = !open;
    b.addEventListener('click', () => sbStart(i, st));
    root.appendChild(b);
    root.appendChild(el('div', 'sb-step-note', info[st]));
  });
}

function sbStart(levelIndex, step, opts) {
  const lv = SB_LEVELS[levelIndex];
  if (step === 'test') { sbTestStart(levelIndex); return; }
  sb = Object.assign({ li: levelIndex, lv, step, n: 0, correct: 0, total: SB_Q, check: false, wrongRun: 0 }, opts || {});
  sbPlaying(true);
  // はじめての「なぞる」は、さいしょに お手本を 見せてから
  if (step === 'nazoru' && !(sbLoad().st[lv.id] > 0)) {
    const ex = sbMakeQuestion(lv);
    sbDemo(ex, () => { sbPlaying(true); sbNext(); }, 'まずは お手本を 見よう', 'なぞって みよう！');
    return;
  }
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
    else if (out.textContent.length < 5) out.textContent = (out.textContent === '0' ? '' : out.textContent) + k;
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
  if (sb.n >= sb.total) { sbRoot().innerHTML = ''; sbFinish(); return; }
  sb.q = sbMakeQuestion(sb.lv, sb.step);
  sb.helped = false;   // お手本を 見た／なぞりで まちがえた ときは ほしに かぞえない
  sbShowQ();
}

// いまの もんだいを 出す（お手本の あとに おなじ もんだいへ もどる ときも ここ）
function sbShowQ() {
  const root = sbRoot();
  root.innerHTML = '';
  sbHeader(root);
  const lv = sb.lv, step = sb.step, q = sb.q;
  const area = el('div', 'sb-area');
  root.appendChild(area);
  const fb = el('div', 'sb-feedback');
  const answer = (val) => sbJudge(val, area, fb);
  if (sbIsCalc(lv) && !sb.check) {
    const help = el('button', 'sb-help-btn', '📺 お手本');
    help.addEventListener('click', () => { if (sb.answered) return; sbDemo(q, () => { sb.helped = true; sbPlaying(true); sbShowQ(); }, 'この もんだいの お手本', 'じぶんで やって みよう'); });
    area.appendChild(help);
  }

  if (step === 'nazoru') {
    sbGuide(area, q, answer);
  } else if (step === 'read') {
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
    const hist = [];   // タップ ごとの たまの かず（そろばんで けいさん したかを たしかめる）
    const wrap = el('div', 'sb-board-wrap');
    const mode = step === 'anzan' ? 'anzan' : 'mieru';
    const draw = () => { wrap.innerHTML = sbBoardSVG(digits, mode); };
    draw();
    wrap.addEventListener('pointerdown', (e) => {
      const t = e.target.closest('.sb-bead');
      if (!t || sb.answered) return;
      e.preventDefault();
      sbTap(digits, Number(t.dataset.col), t.dataset.kind, Number(t.dataset.i));
      hist.push(sbValue(digits));
      FX.tap();
      if (mode === 'anzan') { t.classList.add('pulse'); setTimeout(() => t.classList.remove('pulse'), 160); }
      else draw();
    });
    area.appendChild(wrap);
    const row = el('div', 'sb-row');
    const clear = el('button', 'sub-btn', 'はらう（0に する）');
    clear.addEventListener('click', () => { if (sb.answered) return; digits.fill(0); hist.push('C'); draw(); });   // はらったら そこから やりなおし
    const ok = el('button', 'main-btn', 'こたえる');
    ok.addEventListener('click', () => {
      // たしひきは、さいしょの 数を たまで おいて、そこから うごかして こたえに たどりついた ときだけ せいかい
      // （あたまの なかや 紙で けいさんして、こたえの たまだけ おいても せいかいに しない）
      const skipped = q.terms ? !sbUsedBoard(hist, q.terms) : false;
      sbJudge(sbValue(digits), area, fb, { skipped });
    });
    row.appendChild(clear); row.appendChild(ok);
    area.appendChild(row);
  }
  root.appendChild(fb);
  sb.answered = false;
}

// たまの うごきに、とちゅうの かず（さいしょの 数 → とちゅうの ごうけい）が じゅんばんに 出てきたか
function sbUsedBoard(hist, terms) {
  const need = [];
  terms.slice(0, -1).reduce((s, x) => { s += x; need.push(s); return s; }, 0);
  let k = 0;
  const from = hist.lastIndexOf('C') + 1;   // さいごに はらった あとの うごきだけ みる（はらって こたえだけ おきなおすのは だめ）
  hist.slice(from).forEach(v => { if (k < need.length && v === need[k]) k++; });
  return k === need.length;
}

function sbJudge(val, area, fb, opt) {
  if (!sb || sb.answered) return;
  sb.answered = true;
  const skipped = !!(opt && opt.skipped) && val === sb.q.answer;   // こたえの たまだけ おいた
  const ok = val === sb.q.answer && !skipped;
  const counted = ok && !sb.helped;
  if (counted) sb.correct++;
  sbRecord(sb.flash ? 'flash' : sb.lv.id, counted);
  if (typeof sameSubjectTick === 'function') sameSubjectTick('soroban', () => { sb = null; sbPlaying(false); showTab('home'); });   // おなじ きょうかばかり（js/balance.js）
  if (ok) FX.correct(); else FX.wrong();
  sb.wrongRun = ok ? 0 : (sb.wrongRun || 0) + 1;
  fb.innerHTML = '';
  fb.className = 'sb-feedback ' + (ok ? 'ok' : 'ng');
  fb.appendChild(el('div', 'sb-fb-title', counted ? 'せいかい！' : (ok ? 'できた！' : (skipped ? 'たまで けいさん しよう！' : `おしい！ こたえは ${sb.q.answer}`))));
  if (ok && !counted) fb.appendChild(el('div', 'sb-fb-sub', sb.step === 'nazoru' ? 'ちがう たまを タップした ので、この もんだいは ほしに かぞえないよ' : 'お手本を 見た ので、この もんだいは ほしに かぞえないよ'));
  if (skipped) {
    const t = sb.q.terms;
    fb.appendChild(el('div', 'sb-fb-sub', `まず ${t[0]}を たまで おいて、そこから たまを うごかして けいさん しよう。こたえの たまだけ おいても せいかいに ならないよ`));
  }
  if (!ok && !sb.flash && !skipped) {
    if (sb.step !== 'read') fb.appendChild(el('div', 'sb-fb-sub', `きみの こたえ：${val}`));
    const pic = el('div', 'sb-board-wrap small');
    pic.innerHTML = sbBoardSVG(sbDigits(sb.q.answer, SB_COLS), 'show');
    fb.appendChild(pic);
    // たしひき：うごかしかたを ことばで 見せる
    if (sbIsCalc(sb.lv) && sb.q.terms) {
      const how = el('div', 'sb-how');
      how.appendChild(el('div', 'sb-how-title', '🖐 うごかしかた'));
      sbPlan(sb.q.terms).heads.forEach(h => how.appendChild(el('div', 'sb-how-line', h)));
      fb.appendChild(how);
    }
    // 2もん つづけて まちがえたら、お手本・なぞりに もどれるように
    if (sbIsCalc(sb.lv) && !sb.check && sb.wrongRun >= 2) {
      fb.appendChild(el('div', 'sb-fb-sub sb-stuck', 'むずかしい ときは、お手本を 見てから なぞって みよう'));
      const q = sb.q;
      const d1 = el('button', 'main-btn wide', '📺 この もんだいの お手本を 見る');
      d1.addEventListener('click', () => sbDemo(q, () => { sb.n++; sbPlaying(true); sbNext(); }, 'この もんだいの お手本', 'つぎの もんだいへ'));
      fb.appendChild(d1);
      if (sb.step !== 'nazoru') {
        const d2 = el('button', 'sub-btn wide', '✍️ なぞりで れんしゅう する');
        d2.addEventListener('click', () => sbStart(sb.li, 'nazoru'));
        fb.appendChild(d2);
      }
    }
  }
  area.querySelectorAll('button').forEach(b => { b.disabled = true; });
  const next = el('button', 'main-btn wide', sb.n + 1 < sb.total ? 'つぎへ' : 'けっかを 見る');
  next.addEventListener('click', () => { sb.n++; if (sb.flash) sbFlashNext(); else sbNext(); });
  fb.appendChild(next);
  next.scrollIntoView({ block: 'nearest' });
}

// ごほうび（ふつうの べんきょうと おなじ あつかい）
function sbReward(correct, total, extra) {
  recordHistory(correct, total);
  const award = awardPet({ xp: correct, coins: correct * 3 + (extra || 0), perfect: false, mission: false, cleared: 0, levelKey: '' });
  if (typeof autoSync === 'function') autoSync();
  return award;
}
function sbRewardLines(root, correct, award, extra) {
  { const sn = (typeof sameSubjectNote === 'function') ? sameSubjectNote('soroban') : ''; if (sn) root.appendChild(el('div', 'note', sn)); }
  root.appendChild(el('div', 'note gold', `💰 +${correct * 3 + (extra || 0)}コイン${extra ? `（ごうかく ボーナス +${extra}）` : ''}`));
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
  let retryLeft = 0;
  if (pass) {
    d.st[lv.id] = Math.max(d.st[lv.id] || 0, Math.min(k, lv.kind === 'ladder' ? 4 : 99));   // はしごの ほし5は テストに ごうかくした とき だけ
    if (d.st[lv.id] >= sbNeed(lv) && d.lv <= li && li + 1 < SB_LEVELS.length) { d.lv = li + 1; unlocked = true; }
    if ((d.tn[lv.id] || 0) > 0) d.tn[lv.id]--;     // テストに しっぱいした あとの れんしゅう
    retryLeft = d.tn[lv.id] || 0;
    sbSave(d);
  } else { retryLeft = d.tn[lv.id] || 0; }
  const award = sbReward(correct, total);
  root.appendChild(el('h2', 'result-title', pass ? 'クリア！' : 'おつかれさま！'));
  const score = el('div', 'result-score');
  score.appendChild(el('span', 'big', String(correct)));
  score.appendChild(el('span', 'unit', ` / ${total} もん`));
  root.appendChild(score);
  root.appendChild(el('div', 'result-message', pass ? (unlocked ? `レベル ${li + 2}「${SB_LEVELS[li + 1].title}」が ひらいたよ！` : `「${SB_STEP_NAME[step]}」クリア！`) : `${SB_PASS}もん せいかいで クリアだよ。もういちど やってみよう`));
  sbRewardLines(root, correct, award);
  if (retryLeft > 0) root.appendChild(el('div', 'sb-step-note', `テストに もどるまで あと ${retryLeft}かい（この レベルの れんしゅうを クリア）`));
  else if (pass && lv.kind === 'ladder' && (d.tn[lv.id] || 0) === 0 && d.st[lv.id] < 5 && k >= 4) root.appendChild(el('div', 'sb-step-note', 'つぎは しんきゅうテスト！'));
  if (pass) FX.clear();
  const btns = el('div', 'result-buttons');
  if (pass && k < steps.length) { const b = el('button', 'main-btn', `つぎは「${SB_STEP_NAME[steps[k]]}」`); b.addEventListener('click', () => sbStart(li, steps[k])); btns.appendChild(b); }   // テストは sbStart から sbTestStart へ
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

// ===== うごかしかたの てじゅん（お手本・なぞり・まちがえた ときの せつめい）=====
// そろばんの きほんの うごかしかた：左の くらいから じゅんに、
//  ・そのまま 入れる／とる
//  ・5の 合成・分解（たす：5を 入れて □を とる／ひく：□を 入れて 5を とる）
//  ・10の 合成・分解（たす：□を とって となりに 1を 入れる／ひく：となりから 1を とって □を 入れる）
// steps：1かい タップする ごとの {col, kind, i, head（だい ひょうし）, note（なかの うごき）, text（たまの うごき）}
const SB_COL_NAME = ['一', '十', '百', '千', '万'];
function sbColName(c) { return `${SB_COL_NAME[SB_COLS - 1 - c]}の くらい`; }

function sbPlan(terms) {
  const digits = Array(SB_COLS).fill(0), steps = [], heads = [], methods = new Set();
  let head = '', note = '', term = 0, depth = 0, label = '';
  const push = (col, kind, i, text) => { sbTap(digits, col, kind, i); steps.push({ col, kind, i, text, head, note, term }); };
  const five = (c, on) => push(c, 'five', 0, on ? '5の たまを 入れる' : '5の たまを とる');
  const ones = (c, to) => { const from = digits[c] % 5; if (to === from) return; push(c, 'one', to > from ? to - 1 : to, to > from ? `1の たまを ${to - from}こ 入れる` : `1の たまを ${from - to}こ とる`); };
  const say = (text, method) => {
    if (term > 0) methods.add(method);
    if (depth === 0) { head = `${label}　${text}`; note = ''; if (term > 0) heads.push(head); } else note = text;
  };
  function addAt(c, d) {
    if (d <= 0) return;
    if (c < 0) throw new Error('soroban overflow');
    const v = digits[c];
    if (v + d <= 9 && !(d >= 5 && v >= 5) && v % 5 + d % 5 <= 4) {
      say(`${sbColName(c)}に ${d}を 入れる`, 'direct');
      if (d >= 5) five(c, true);
      if (d % 5) ones(c, v % 5 + d % 5);
    } else if (v + d <= 9) {
      say(`${sbColName(c)}：${d}を たすには、5を 入れて ${5 - d}を とる`, 'five');
      five(c, true); ones(c, v % 5 - (5 - d));
    } else {
      say(`${sbColName(c)}：${d}を たすには、${10 - d}を とって、となりの くらいに 1を 入れる`, 'ten');
      depth++; subAt(c, 10 - d); addAt(c - 1, 1); depth--;
    }
  }
  function subAt(c, d) {
    if (d <= 0) return;
    if (c < 0) throw new Error('soroban underflow');
    const v = digits[c];
    if (v >= d && (d < 5 || v >= 5) && v % 5 >= d % 5) {
      say(`${sbColName(c)}から ${d}を とる`, 'direct');
      if (d >= 5) five(c, false);
      if (d % 5) ones(c, v % 5 - d % 5);
    } else if (v >= d) {
      say(`${sbColName(c)}：${d}を ひくには、${5 - d}を 入れて 5を とる`, 'five');
      ones(c, v % 5 + (5 - d)); five(c, false);
    } else {
      say(`${sbColName(c)}：${d}を ひくには、となりの くらいから 1を とって、${10 - d}を 入れる`, 'ten');
      depth++; subAt(c - 1, 1); addAt(c, 10 - d); depth--;
    }
  }
  terms.forEach((x, ti) => {
    term = ti; depth = 0;
    const s = String(Math.abs(x));
    label = ti === 0 ? `まず ${x}を おく：` : (x < 0 ? `－${-x}：` : `＋${x}：`);
    for (let j = 0; j < s.length; j++) {
      const c = SB_COLS - s.length + j, d = Number(s[j]);
      if (!d) continue;
      if (ti === 0 || x > 0) addAt(c, d); else subAt(c, d);
    }
  });
  return { steps, heads, methods, answer: sbValue(digits) };
}

// なぞる：つぎに うごかす たまが ひかる。じゅんばんどおりに タップする
function sbGuide(area, q, answer) {
  const plan = sbPlan(q.terms);
  area.appendChild(el('div', 'sb-ask', 'ひかる たまを じゅんばんに タップしよう'));
  area.appendChild(el('div', 'sb-expr', `${q.text} ＝ ？`));
  const cap = el('div', 'sb-caption');
  area.appendChild(cap);
  const wrap = el('div', 'sb-board-wrap');
  area.appendChild(wrap);
  const digits = Array(SB_COLS).fill(0);
  let k = 0;
  sb.missTap = 0;
  const draw = () => {
    wrap.innerHTML = sbBoardSVG(digits, 'mieru');
    cap.innerHTML = '';
    const st = plan.steps[k];
    if (!st) return;
    cap.appendChild(el('div', 'sb-cap-head', st.head));
    cap.appendChild(el('div', 'sb-cap-text', (st.note ? st.note + '\n→ ' : '') + st.text));
    const t = wrap.querySelector(`.sb-bead[data-col="${st.col}"][data-kind="${st.kind}"][data-i="${st.i}"]`);
    if (t) t.classList.add('sb-target');
  };
  draw();
  wrap.addEventListener('pointerdown', (e) => {
    const t = e.target.closest('.sb-bead');
    if (!t || sb.answered) return;
    e.preventDefault();
    const st = plan.steps[k];
    if (!st) return;
    if (Number(t.dataset.col) === st.col && t.dataset.kind === st.kind && Number(t.dataset.i) === st.i) {
      sbTap(digits, st.col, st.kind, st.i);
      FX.tap();
      k++;
      draw();
      if (k >= plan.steps.length) { if (sb.missTap > 0) sb.helped = true; setTimeout(() => answer(sbValue(digits)), 300); }
    } else {
      sb.missTap++;
      cap.classList.remove('shake'); void cap.offsetWidth; cap.classList.add('shake');
      showToast('ひかっている たまを タップしてね');
    }
  });
}

// お手本：たまが 1つずつ うごく（ことばと よみあげ つき）。おわったら onDone
function sbDemo(q, onDone, title, doneLabel) {
  const plan = sbPlan(q.terms);
  const token = {};
  sbDemo.cur = token;
  sbPlaying(false);
  const root = sbRoot();
  root.innerHTML = '';
  root.appendChild(el('h2', 'page-title', `📺 ${title || 'お手本'}`));
  root.appendChild(el('div', 'sb-expr', `${q.text} ＝ ？`));
  const cap = el('div', 'sb-caption');
  root.appendChild(cap);
  const wrap = el('div', 'sb-board-wrap');
  root.appendChild(wrap);
  const row = el('div', 'sb-row');
  const again = el('button', 'sub-btn', '🔁 もういちど');
  const done = el('button', 'main-btn', doneLabel || 'おわり');
  row.appendChild(again); row.appendChild(done);
  root.appendChild(row);
  const digits = Array(SB_COLS).fill(0);
  let k = 0, lastHead = '';
  const show = (st) => {
    wrap.innerHTML = sbBoardSVG(digits, 'mieru');
    if (st) { const t = wrap.querySelector(`.sb-bead[data-col="${st.col}"][data-kind="${st.kind}"][data-i="${st.i}"]`); if (t) t.classList.add('sb-target'); }
  };
  const tick = () => {
    if (sbDemo.cur !== token) return;
    cap.innerHTML = '';
    if (k >= plan.steps.length) { cap.appendChild(el('div', 'sb-cap-head', `こたえは ${q.answer}`)); show(null); return; }
    const st = plan.steps[k];
    cap.appendChild(el('div', 'sb-cap-head', st.head));
    cap.appendChild(el('div', 'sb-cap-text', (st.note ? st.note + '\n→ ' : '') + st.text));
    if (st.head !== lastHead) { lastHead = st.head; try { FX.speak(st.head.replace(/[：　]/g, ' ')); } catch (e) { /* よみあげ できなくても よい */ } }
    show(st);
    setTimeout(() => {
      if (sbDemo.cur !== token) return;
      sbTap(digits, st.col, st.kind, st.i);
      FX.tap();
      show(null);
      k++;
      setTimeout(tick, 900);
    }, 1300);
  };
  again.addEventListener('click', () => sbDemo(q, onDone, title, doneLabel));
  done.addEventListener('click', () => { sbDemo.cur = null; if (FX.stopSpeak) FX.stopSpeak(); onDone(); });
  show(null);
  setTimeout(tick, 700);
}

// ===== きろく・おうちの人の 画面 =====
function sbRate(pair) { return pair && pair[0] > 0 ? Math.round(pair[1] / pair[0] * 100) : null; }
function sbSummary(name) {
  const d = sbLoad(name);
  const tot = Object.keys(d.lvs).reduce((a, k) => [a[0] + d.lvs[k][0], a[1] + d.lvs[k][1]], [0, 0]);
  const days = [];
  for (let i = 6; i >= 0; i--) days.push(addDaysStr(localDateStr(), -i));
  const week = days.reduce((a, k) => { const p = d.day[k] || [0, 0]; return [a[0] + p[0], a[1] + p[1]]; }, [0, 0]);
  const today = d.day[localDateStr()] || [0, 0];
  const stars = SB_LEVELS.reduce((a, l) => a + (d.st[l.id] || 0), 0);
  const maxStars = SB_LEVELS.reduce((a, l) => a + sbStepsOf(l).length, 0);
  // つまずいている レベル：10もん いじょう やって せいかいりつが いちばん ひくい（クリアずみの 4だんかいは のぞく）
  let weak = null;
  SB_LEVELS.forEach(l => {
    const p = d.lvs[l.id]; if (!p || p[0] < 10) return;
    const r = p[1] / p[0];
    if (r < 0.8 && (!weak || r < weak.r)) weak = { l, r, p };
  });
  const started = tot[0] > 0 || d.lv > 0 || Object.keys(d.st).length > 0;
  const tests = Object.keys(d.ts).reduce((a, k) => [a[0] + d.ts[k][0], a[1] + (d.ts[k][1] > 0 ? 1 : 0)], [0, 0]);   // [うけた かいすう, ごうかくした レベル数]
  return { d, tot, week, today, stars, maxStars, weak, started, tests, flashBest: Object.keys(d.flash).filter(k => k !== '_last').map(k => ({ k, v: d.flash[k] })) };
}
function sbRateClass(r) { return r >= 80 ? 'high' : r >= 50 ? 'mid' : 'low'; }

function sbLines(card, s, withTitle) {
  const lv = s.d.lv;
  card.appendChild(el('div', 'report-line', `いまの レベル：${lv + 1} / ${SB_LEVELS.length}「${SB_LEVELS[lv].title}」　★ ${s.stars} / ${s.maxStars}`));
  const row = el('div', 'report-row');
  row.appendChild(el('span', 'subject-name', 'ぜんぶの せいかいりつ'));
  const det = el('span', 'subject-detail', `${s.tot[0]}もん中 `);
  const r = sbRate(s.tot);
  if (r !== null) det.appendChild(el('span', 'subject-rate ' + sbRateClass(r), `${r}%`)); else det.appendChild(el('span', 'report-empty', 'まだ'));
  row.appendChild(det);
  card.appendChild(row);
  const wr = sbRate(s.week);
  card.appendChild(el('div', 'report-line', `この 1しゅうかん：${s.week[0]}もん${wr !== null ? `（せいかい ${wr}%）` : ''}　きょう：${s.today[0]}もん`));
  if (s.tests[0] > 0) card.appendChild(el('div', 'report-line', `⏱ しんきゅうテスト：ごうかく ${s.tests[1]}レベル（うけた ${s.tests[0]}かい）`));
  if (s.weak) card.appendChild(el('div', 'report-line', `🔍 つまずいている レベル：${SB_LEVELS.indexOf(s.weak.l) + 1}「${s.weak.l.title}」${Math.round(s.weak.r * 100)}%（${s.weak.p[0]}もん）→ お手本・なぞりで れんしゅう`));
  if (s.flashBest.length) card.appendChild(el('div', 'report-line', `⚡ フラッシュの ベスト：${s.flashBest.map(f => `${f.k.replace(/^(\d)-(\d+)-(\w+)$/, (m, a, b, c) => `${a}けた${b}こ・${SB_FLASH_SPEED[c] ? SB_FLASH_SPEED[c][0] : c}`)} ${f.v}/5`).join('、')}`));
}

// 子どもの「きろく」画面
function appendSorobanReport(container) {
  if (!state.playerName.trim()) return;
  const s = sbSummary();
  const panel = el('div', 'panel');
  panel.appendChild(el('h3', null, '🧮 そろばん'));
  if (!s.started) panel.appendChild(el('div', 'report-empty', 'まだ やっていません。'));
  else sbLines(panel, s);
  container.appendChild(panel);
}

// おうちの人の 画面：ひとりぶん
function appendSorobanParent(card, name) {
  const s = sbSummary(name);
  if (!s.started) return;
  card.appendChild(el('div', 'child-section', '🧮 そろばん'));
  sbLines(card, s);
}

// ===== しんきゅうテスト（スピード）=====
// あたまの なかで けいさんして すうじで こたえる。q もん ぜんぶ せいかい ＋ ぜんぶで limit びょう いない。まちがえたら そこで おわり。
function sbTestAvail(d, lv) { return (typeof isTrial === 'function' && isTrial()) || !((d.tn[lv.id] || 0) > 0); }

function sbTestStart(li) {
  const lv = SB_LEVELS[li], d = sbLoad();
  if (!sbTestAvail(d, lv)) { showToast(`あと ${d.tn[lv.id]}かい れんしゅうしたら、また うけられるよ`); return; }
  sb = { li, lv, step: 'test', test: true, n: 0, correct: 0, total: lv.q, t0: Date.now(), token: Math.random() };
  sbPlaying(true);
  sbTestQ();
}

function sbTestStop() { if (sb && sb.timer) { clearInterval(sb.timer); sb.timer = null; } }

function sbTestQ() {
  const root = sbRoot();
  root.innerHTML = '';
  sbTestStop();
  const quit = el('button', 'back-btn', '← やめる');
  quit.addEventListener('click', () => { sbTestStop(); sbMenu(); });
  root.appendChild(quit);
  const head = el('div', 'sb-head');
  head.appendChild(el('span', 'sb-head-title', `⏱ しんきゅうテスト・レベル ${sb.li + 1}`));
  head.appendChild(el('span', 'sb-head-count', `${sb.n + 1} / ${sb.total}`));
  root.appendChild(head);
  const bar = el('div', 'sb-timer');
  const fill = el('div', 'sb-timer-fill');
  bar.appendChild(fill);
  const left = el('div', 'sb-timer-left', '');
  root.appendChild(bar);
  root.appendChild(left);
  const q = sb.q = sbGenLadder(sb.lv);
  sb.qStart = Date.now();
  const area = el('div', 'sb-area');
  area.appendChild(el('div', 'sb-ask', 'あたまの なかで けいさん！ はやく・ただしく'));
  area.appendChild(el('div', 'sb-expr sb-expr-long', `${q.text} ＝ ？`));
  area.appendChild(sbKeypad((val) => sbTestAnswer(val)));
  root.appendChild(area);
  const token = sb.token;
  const limitMs = sb.lv.limit * 1000;
  const tick = () => {
    if (!sb || sb.token !== token || !sb.test) { return; }
    const el1 = Date.now() - sb.t0;
    const remain = Math.max(0, limitMs - el1);
    fill.style.width = `${Math.max(0, remain / limitMs * 100)}%`;
    fill.classList.toggle('low', remain / limitMs < 0.25);
    left.textContent = `のこり ${Math.ceil(remain / 1000)}びょう`;
    if (remain <= 0) sbTestEnd('time');
  };
  tick();
  sb.timer = setInterval(tick, 250);
}

function sbTestAnswer(val) {
  if (!sb || !sb.test || sb.ended) return;
  const ok = val === sb.q.answer;
  sbRecord(sb.lv.id, ok);
  recordDaySubject('soroban');   // しんきゅうテストの 最中は ひとこと・かくにんを 出さない
  if (!ok) { sb.lastWrong = { q: sb.q, val }; FX.wrong(); sbTestEnd('wrong'); return; }
  sb.correct++;
  FX.correct();
  sb.n++;
  if (Date.now() - sb.t0 > sb.lv.limit * 1000) { sbTestEnd('time'); return; }
  if (sb.n >= sb.total) sbTestEnd('done'); else sbTestQ();
}

function sbTestEnd(reason) {
  if (!sb || sb.ended) return;
  sb.ended = true;
  sbTestStop();
  sbPlaying(false);
  const { li, lv } = sb;
  const sec = Math.round((Date.now() - sb.t0) / 100) / 10;
  const pass = reason === 'done' && sec <= lv.limit;
  const d = sbLoad();
  const ts = d.ts[lv.id] || [0, 0, 0];
  ts[0]++;
  if (pass) { ts[1]++; ts[2] = ts[2] > 0 ? Math.min(ts[2], sec) : sec; }
  d.ts[lv.id] = ts;
  let unlocked = false;
  if (pass) {
    d.st[lv.id] = 5;
    d.tn[lv.id] = 0;
    if (d.lv <= li && li + 1 < SB_LEVELS.length) { d.lv = li + 1; unlocked = true; }
  } else {
    d.tn[lv.id] = SB_RETRY_PRACTICE;
  }
  sbSave(d);
  const extra = pass ? 30 : 0;
  const award = sbReward(sb.correct, sb.n + (reason === 'wrong' ? 1 : 0), extra);
  const root = sbRoot();
  root.innerHTML = '';
  root.appendChild(el('h2', 'result-title', pass ? '🎉 ごうかく！' : 'ざんねん…'));
  const score = el('div', 'result-score');
  score.appendChild(el('span', 'big', String(sb.correct)));
  score.appendChild(el('span', 'unit', ` / ${sb.total} もん`));
  root.appendChild(score);
  root.appendChild(el('div', 'sb-step-note', `じかん ${sec}びょう（せいげん ${lv.limit}びょう）`));
  let msg;
  if (pass) msg = unlocked ? `レベル ${li + 2}「${SB_LEVELS[li + 1].title}」が ひらいたよ！` : 'ごうかく！';
  else if (reason === 'time') msg = 'じかんぎれ！ もっと はやく けいさん できるように なろう';
  else msg = 'まちがえたので ここで おわり。ぜんぶ せいかいで ごうかく';
  root.appendChild(el('div', 'result-message', msg));
  if (!pass && sb.lastWrong) root.appendChild(el('div', 'sb-fb-sub', `${sb.lastWrong.q.text} ＝ ${sb.lastWrong.q.answer}（きみの こたえ：${sb.lastWrong.val}）`));
  if (!pass) root.appendChild(el('div', 'sb-step-note', `このレベルを あと ${SB_RETRY_PRACTICE}かい れんしゅう（クリア）したら、また テストが うけられるよ`));
  sbRewardLines(root, sb.correct, award, extra);
  if (pass) FX.clear();
  const btns = el('div', 'result-buttons');
  if (pass && unlocked) { const b = el('button', 'main-btn', 'つぎの レベルへ'); b.addEventListener('click', () => sbLevelMenu(li + 1)); btns.appendChild(b); }
  else if (!pass) { const b = el('button', 'main-btn', 'れんしゅうする'); b.addEventListener('click', () => sbLevelMenu(li)); btns.appendChild(b); }
  const menu = el('button', 'sub-btn wide', 'レベルを えらぶ');
  menu.addEventListener('click', sbMenu);
  btns.appendChild(menu);
  root.appendChild(btns);
}
