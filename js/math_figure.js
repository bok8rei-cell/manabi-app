// ===== 算数：図の ある もんだい（時計・ものさし・グラフ・図形）=====
// 問題に figure（SVG の 文字）を もたせると、問題文の うえに 図が 出る。
// 1年：時計（なんじ／はん）・かたちの かず　2年：時計（なんじなんぷん）・ものさし
// 3年：時計（○ふんご）・ものさし（mm）・ぼうグラフ　4年：おれせんグラフ・ますの めんせき・三角形の 角
// 5年：円グラフ・三角形の めんせき　6年：円（円周・めんせき）
// 解説は 問題ごとに explain で もたせる（人が かいた ひつようは ない）。

const _fgPick = (arr) => arr[randInt(0, arr.length - 1)];
const _fgDec = (x) => String(Math.round(x * 100) / 100);
const _fgFont = 'font-family="sans-serif"';

Object.assign(MATH_UNIT_LABELS, {
  fClock1: 'とけい（なんじ）', fShape1: 'かたちの かず', fClock2: 'とけい（なんじ なんぷん）', fRuler2: 'ものさし（cm）',
  fClock3: 'とけい（○ふんご）', fRuler3: 'ものさし（mm）', fBar3: 'ぼうグラフ', fLine4: 'おれせんグラフ', fGrid4: 'ますの めんせき',
  fAngle5: '三角形の 角', fProtractor4: '分度器（角の 大きさ）', fPie5: '円グラフ', fTri5: '三角形の めんせき', fCircle6: '円（図）'
});

function _fgSvg(w, h, inner) {
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${w}px" role="img" aria-label="もんだいの ず" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

// ---------- 時計 ----------
function _fgClockSvg(h, m) {
  let s = '<circle cx="50" cy="50" r="46" fill="#fff" stroke="#444" stroke-width="3"/>';
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 * Math.PI) / 180, long = i % 5 === 0;
    const r1 = 44, r2 = long ? 39 : 41.5;
    s += `<line x1="${(50 + r1 * Math.sin(a)).toFixed(2)}" y1="${(50 - r1 * Math.cos(a)).toFixed(2)}" x2="${(50 + r2 * Math.sin(a)).toFixed(2)}" y2="${(50 - r2 * Math.cos(a)).toFixed(2)}" stroke="#444" stroke-width="${long ? 1.6 : 0.8}"/>`;
  }
  for (let i = 1; i <= 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    s += `<text x="${(50 + 32 * Math.sin(a)).toFixed(2)}" y="${(50 - 32 * Math.cos(a) + 3.6).toFixed(2)}" font-size="10" font-weight="bold" text-anchor="middle" ${_fgFont} fill="#222">${i}</text>`;
  }
  const ha = ((((h % 12) + m / 60) * 30) * Math.PI) / 180, ma = ((m * 6) * Math.PI) / 180;
  s += `<line x1="50" y1="50" x2="${(50 + 23 * Math.sin(ha)).toFixed(2)}" y2="${(50 - 23 * Math.cos(ha)).toFixed(2)}" stroke="#E53935" stroke-width="4.2" stroke-linecap="round"/>`;
  s += `<line x1="50" y1="50" x2="${(50 + 36 * Math.sin(ma)).toFixed(2)}" y2="${(50 - 36 * Math.cos(ma)).toFixed(2)}" stroke="#1E88E5" stroke-width="2.6" stroke-linecap="round"/>`;
  s += '<circle cx="50" cy="50" r="2.6" fill="#333"/>';
  return `<svg viewBox="0 0 100 100" width="100%" style="max-width:170px" role="img" aria-label="とけい" xmlns="http://www.w3.org/2000/svg">${s}</svg>`;
}

const _fgTime = (h, m) => `${h}じ${m === 0 ? '' : (m === 30 ? 'はん' : m + 'ふん')}`;
const _fgTimeFull = (h, m) => (m === 0 ? `${h}じちょうど` : `${h}じ${m}ふん`);
const _fgLen = (cm, mm) => (mm === 0 ? `${cm}cm` : `${cm}cm${mm}mm`);
const _fgH = (h) => ((h - 1 + 12) % 12) + 1;   // 1〜12 に そろえる

function fClock1(diff) {
  lastMathType = 'fClock1';
  const h = randInt(1, 12);
  const half = diff >= 1 && Math.random() < 0.5;
  const m = half ? 30 : 0;
  const ans = _fgTime(h, m);
  const set = new Set([ans, _fgTime(_fgH(h + 1), m), _fgTime(_fgH(h - 1), m), _fgTime(h, half ? 0 : 30)]);
  const choices = shuffleArray(Array.from(set));
  return {
    question: half ? 'とけいを よんで、なんじ（なんじはん）か えらぼう' : 'とけいを よんで、なんじか えらぼう', type: 'choice', choices, answer: ans, figure: _fgClockSvg(h, m),
    explain: half ? `ながい はりが 6（ちょうど したに）のときは「はん」。みじかい はりが ${h}と ${_fgH(h + 1)}の あいだ → ${_fgTime(h, 30)}` : `ながい はりが 12 に あるときは「ちょうど」。みじかい はりが ${h} → ${h}じ`
  };
}

function fClock2() {
  lastMathType = 'fClock2';
  const h = randInt(1, 12), m = randInt(1, 11) * 5;
  const ans = _fgTimeFull(h, m);
  const set = new Set([ans, _fgTimeFull(h, (m + 5) % 60), _fgTimeFull(_fgH(h + 1), m), _fgTimeFull(h, m / 5), _fgTimeFull(_fgH(h - 1), m)]);
  const arr = Array.from(set).filter(x => x !== ans);
  const choices = shuffleArray([ans, ...shuffleArray(arr).slice(0, 3)]);
  return {
    question: 'とけいを よんで、なんじ なんぷんか えらぼう', type: 'choice', choices, answer: ans, figure: _fgClockSvg(h, m),
    explain: `みじかい はりは ${h}と ${_fgH(h + 1)}の あいだ。${h}を すぎているから ${h}じ。ながい はりが ${m / 5}を さすとき、${m / 5}×5 ＝ ${m}ふん。\n${ans}`
  };
}

function fClock3() {
  lastMathType = 'fClock3';
  const h = randInt(1, 12), m = randInt(0, 11) * 5;
  const add = _fgPick([10, 15, 20, 25, 30, 35, 40, 45]);
  let total = h * 60 + m + add;
  let nh = Math.floor(total / 60) % 12; if (nh === 0) nh = 12;
  const nm = total % 60;
  const ans = _fgTimeFull(nh, nm);
  const wrong = [_fgTimeFull(nh, (nm + 5) % 60), _fgTimeFull(_fgH(nh + 1), nm), _fgTimeFull(nh, (nm + 55) % 60), _fgTimeFull(_fgH(nh - 1), nm), _fgTimeFull(_fgH(h), (m + add) % 60)];
  const arr = Array.from(new Set(wrong)).filter(x => x !== ans);
  const choices = shuffleArray([ans, ...shuffleArray(arr).slice(0, 3)]);
  return {
    question: `この とけいの 時こくの ${add}分あとは、なんじ なんぷん？`, type: 'choice', choices, answer: ans, figure: _fgClockSvg(h, m),
    explain: `いまの 時こくは ${_fgTimeFull(h, m)}。${m} ＋ ${add} ＝ ${m + add}ふん${m + add >= 60 ? `（60ふんで 1じかんだから ${m + add - 60}ふん、1じかん すすむ）` : ''}\n${ans}`
  };
}

// ---------- かたちの かず ----------
function fShape1() {
  lastMathType = 'fShape1';
  const kinds = [['さんかく', '△'], ['しかく', '□'], ['まる', '○']];
  const counts = kinds.map(() => randInt(1, 5));
  const tIdx = randInt(0, 2);
  const cells = [];
  kinds.forEach((k, i) => { for (let j = 0; j < counts[i]; j++) cells.push(i); });
  const arranged = shuffleArray(cells);
  let s = '';
  arranged.forEach((kind, idx) => {
    const col = idx % 5, row = Math.floor(idx / 5);
    const x = 24 + col * 44, y = 26 + row * 44;
    if (kind === 0) s += `<path d="M${x} ${y - 16} L${x + 17} ${y + 14} L${x - 17} ${y + 14} Z" fill="#FFB74D" stroke="#E65100" stroke-width="2"/>`;
    else if (kind === 1) s += `<rect x="${x - 15}" y="${y - 15}" width="30" height="30" fill="#81D4FA" stroke="#0277BD" stroke-width="2"/>`;
    else s += `<circle cx="${x}" cy="${y}" r="16" fill="#A5D6A7" stroke="#2E7D32" stroke-width="2"/>`;
  });
  const rows = Math.ceil(arranged.length / 5);
  const ans = counts[tIdx];
  const set = new Set([ans, ans + 1, Math.max(0, ans - 1), ans + 2]);
  const choices = shuffleArray(Array.from(set).map(String));
  return {
    question: `${kinds[tIdx][0]}（${kinds[tIdx][1]}）は いくつ あるかな？`, type: 'choice', choices, answer: String(ans), figure: _fgSvg(230, 10 + rows * 44, s),
    explain: `${kinds[tIdx][0]}だけを 1つずつ かぞえよう。ぜんぶで ${ans}こ。`
  };
}

// ---------- ものさし ----------
function _fgRulerSvg(lenMm, mmTicks) {
  const maxCm = mmTicks ? 10 : 15, scale = mmTicks ? 30 : 20;   // 1cm の はば
  const W = maxCm * scale + 30;
  let s = `<rect x="10" y="40" width="${maxCm * scale + 10}" height="34" rx="3" fill="#FFF3C4" stroke="#A67C00" stroke-width="1.6"/>`;
  for (let cm = 0; cm <= maxCm; cm++) {
    const x = 15 + cm * scale;
    s += `<line x1="${x}" y1="40" x2="${x}" y2="${mmTicks ? 62 : 58}" stroke="#333" stroke-width="1.6"/><text x="${x}" y="${mmTicks ? 72 : 70}" font-size="9" text-anchor="middle" ${_fgFont} fill="#333">${cm}</text>`;
    if (mmTicks && cm < maxCm) for (let mm = 1; mm < 10; mm++) {
      const xx = x + mm * scale / 10;
      s += `<line x1="${xx.toFixed(2)}" y1="40" x2="${xx.toFixed(2)}" y2="${mm === 5 ? 54 : 48}" stroke="#333" stroke-width="${mm === 5 ? 1.2 : 0.8}"/>`;
    }
  }
  const bw = (lenMm / 10) * scale;   // えんぴつの さきの はしが ちょうど この 長さ
  s += `<rect x="15" y="10" width="${(bw - 9).toFixed(2)}" height="20" rx="3" fill="#EF9A9A" stroke="#C62828" stroke-width="1.6"/><path d="M${(15 + bw - 9).toFixed(2)} 10 L${(15 + bw).toFixed(2)} 20 L${(15 + bw - 9).toFixed(2)} 30 Z" fill="#FFCC80" stroke="#C62828" stroke-width="1.4"/>`;
  s += `<line x1="15" y1="8" x2="15" y2="40" stroke="#1E88E5" stroke-width="1.2" stroke-dasharray="3 2"/>`;
  return _fgSvg(W, 82, s);
}

function fRuler2() {
  lastMathType = 'fRuler2';
  const L = randInt(3, 14);
  return {
    question: 'えんぴつの 長さは なんcmですか？\n（0の めもりから はかるよ）', type: 'input', inputType: 'number', answer: String(L), figure: _fgRulerSvg(L * 10, false),
    explain: `えんぴつの はしが 0の めもりに そろっているよ。もう一方の はしは ${L}の めもり。だから ${L}cm。`
  };
}

function fRuler3() {
  lastMathType = 'fRuler3';
  const cm = randInt(2, 8), mm = randInt(1, 9);
  const ans = _fgLen(cm, mm);
  const set = new Set([ans, _fgLen(cm, (mm + 1) % 10), _fgLen(cm + 1, mm), _fgLen(mm, cm), _fgLen(cm, Math.max(1, mm - 1))]);
  const arr = Array.from(set).filter(x => x !== ans);
  const choices = shuffleArray([ans, ...shuffleArray(arr).slice(0, 3)]);
  return {
    question: 'えんぴつの 長さは なんcm なんmmですか？', type: 'choice', choices, answer: ans, figure: _fgRulerSvg(cm * 10 + mm, true),
    explain: `はしは ${cm}の めもりより ${mm}めもり（${mm}mm）すすんでいるよ。1めもりが 1mm。だから ${cm}cm ${mm}mm。`
  };
}

// ---------- ぼうグラフ ----------
function fBar3() {
  lastMathType = 'fBar3';
  const themes = [
    { title: 'すきな くだもの', cats: ['りんご', 'みかん', 'バナナ', 'ぶどう'], unit: '人' },
    { title: 'すきな きょうか', cats: ['こくご', 'さんすう', 'たいいく', 'ずこう'], unit: '人' },
    { title: 'かっている ペット', cats: ['いぬ', 'ねこ', 'とり', 'さかな'], unit: '人' }
  ];
  const th = _fgPick(themes);
  let vals;
  do { vals = th.cats.map(() => randInt(2, 12)); } while (new Set(vals).size < 4);
  const max = 12;
  const W = 260, H = 170, x0 = 40, y0 = 140, bw = 36, gap = 14, hs = 10;   // 1めもり ＝ 1人 → 10px
  let s = `<text x="130" y="14" font-size="12" font-weight="bold" text-anchor="middle" ${_fgFont}>${th.title}</text>`;
  for (let v = 0; v <= max; v += 1) {   // 1めもりごとに せんを ひき、2ごとに かずを かく
    const y = y0 - v * hs;
    s += `<line x1="${x0}" y1="${y}" x2="${W - 10}" y2="${y}" stroke="${v % 2 === 0 ? '#ccc' : '#eee'}" stroke-width="1"/>${v % 2 === 0 ? `<text x="${x0 - 6}" y="${y + 3.4}" font-size="9" text-anchor="end" ${_fgFont}>${v}</text>` : ''}`;
  }
  s += `<line x1="${x0}" y1="${y0 - max * hs}" x2="${x0}" y2="${y0}" stroke="#333" stroke-width="1.6"/><line x1="${x0}" y1="${y0}" x2="${W - 10}" y2="${y0}" stroke="#333" stroke-width="1.6"/>`;
  s += `<text x="4" y="12" font-size="9" ${_fgFont}>（${th.unit}）</text>`;
  const colors = ['#EF5350', '#FFB74D', '#FFD54F', '#9575CD'];
  vals.forEach((v, i) => {
    const x = x0 + gap + i * (bw + gap);
    s += `<rect x="${x}" y="${y0 - v * hs}" width="${bw}" height="${v * hs}" fill="${colors[i]}" stroke="#555" stroke-width="1"/><text x="${x + bw / 2}" y="${y0 + 13}" font-size="9.5" text-anchor="middle" ${_fgFont}>${th.cats[i]}</text>`;
  });
  const fig = _fgSvg(W, H, s);
  const kind = randInt(0, 2);
  if (kind === 0) {
    const i = vals.indexOf(Math.max(...vals));
    return { question: `${th.title}の グラフです。いちばん おおいのは どれですか？`, type: 'choice', choices: shuffleArray(th.cats.slice()), answer: th.cats[i], figure: fig,
      explain: `ぼうが いちばん たかいのは「${th.cats[i]}」（${vals[i]}${th.unit}）。` };
  }
  if (kind === 1) {
    const i = randInt(0, 3);
    return { question: `「${th.cats[i]}」は なん${th.unit}ですか？`, type: 'input', inputType: 'number', answer: String(vals[i]), figure: fig,
      explain: `「${th.cats[i]}」の ぼうの うえの はしを よこに たどって、たての めもりを よむと ${vals[i]}。` };
  }
  let a = randInt(0, 3), b = randInt(0, 3);
  while (b === a) b = randInt(0, 3);
  return { question: `「${th.cats[a]}」と「${th.cats[b]}」では、なん${th.unit} ちがいますか？`, type: 'input', inputType: 'number', answer: String(Math.abs(vals[a] - vals[b])), figure: fig,
    explain: `「${th.cats[a]}」は ${vals[a]}${th.unit}、「${th.cats[b]}」は ${vals[b]}${th.unit}。ちがいは ひきざんで ${Math.max(vals[a], vals[b])} － ${Math.min(vals[a], vals[b])} ＝ ${Math.abs(vals[a] - vals[b])}。` };
}

// ---------- おれせんグラフ ----------
function fLine4() {
  lastMathType = 'fLine4';
  const themes = [
    { title: '1日の きおんの へんか', xs: ['6じ', '9じ', '12じ', '15じ', '18じ', '21じ'], unit: '℃', ask: 'じこく' },
    { title: '月べつの きおん', xs: ['4月', '5月', '6月', '7月', '8月', '9月'], unit: '℃', ask: '月' }
  ];
  const th = _fgPick(themes);
  let vals;
  do {   // 5℃ごとの 目もりの うえに ある あたいだけ（目で よみとれる）。いちばん たかい ところは 1つだけ
    vals = [randInt(2, 4) * 5];
    for (let i = 1; i < 6; i++) vals.push(Math.max(5, Math.min(30, vals[i - 1] + _fgPick([-10, -5, -5, 5, 5, 10]))));
  } while (vals.filter(v => v === Math.max(...vals)).length > 1 || Math.max(...vals) - Math.min(...vals) < 15 || vals.every((v, i) => i === 0 || v !== vals[i - 1] || true) === false);
  const W = 280, H = 190, x0 = 44, y0 = 156, hs = 4.2, dx = 38;   // 1めもり 5℃ ＝ 21px
  let s = `<text x="140" y="14" font-size="12" font-weight="bold" text-anchor="middle" ${_fgFont}>${th.title}</text><text x="4" y="30" font-size="9" ${_fgFont}>（${th.unit}）</text>`;
  for (let v = 0; v <= 30; v += 5) {
    const y = y0 - v * hs;
    s += `<line x1="${x0}" y1="${y}" x2="${W - 8}" y2="${y}" stroke="#ddd" stroke-width="1"/><text x="${x0 - 6}" y="${y + 3.4}" font-size="9" text-anchor="end" ${_fgFont}>${v}</text>`;
  }
  s += `<line x1="${x0}" y1="${y0 - 30 * hs}" x2="${x0}" y2="${y0}" stroke="#333" stroke-width="1.6"/><line x1="${x0}" y1="${y0}" x2="${W - 8}" y2="${y0}" stroke="#333" stroke-width="1.6"/>`;
  const pts = vals.map((v, i) => [x0 + 22 + i * dx, y0 - v * hs]);
  s += `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="#E53935" stroke-width="2.2"/>`;
  pts.forEach(([x, y], i) => { s += `<circle cx="${x}" cy="${y}" r="3.4" fill="#E53935"/><text x="${x}" y="${y0 + 13}" font-size="9.5" text-anchor="middle" ${_fgFont}>${th.xs[i]}</text>`; });
  const fig = _fgSvg(W, H, s);
  if (Math.random() < 0.5) {
    const i = vals.indexOf(Math.max(...vals));
    const others = shuffleArray(th.xs.filter(x => x !== th.xs[i])).slice(0, 3);
    return { question: `${th.title}の グラフです。いちばん たかいのは、いつですか？`, type: 'choice', choices: shuffleArray([th.xs[i], ...others]), answer: th.xs[i], figure: fig,
      explain: `てんが いちばん たかい ところは「${th.xs[i]}」（${vals[i]}${th.unit}）。` };
  }
  let a = randInt(0, 4);
  while (vals[a + 1] === vals[a]) a = (a + 1) % 5;
  const b = a + 1;
  const d = vals[b] - vals[a];
  return { question: `${th.xs[a]}から ${th.xs[b]}で、${th.unit}は どれだけ ${d >= 0 ? 'あがり' : 'さがり'}ましたか？`, type: 'input', inputType: 'number', answer: String(Math.abs(d)), figure: fig,
    explain: `${th.xs[a]}は ${vals[a]}${th.unit}、${th.xs[b]}は ${vals[b]}${th.unit}。ちがいは ${Math.max(vals[a], vals[b])} － ${Math.min(vals[a], vals[b])} ＝ ${Math.abs(d)}。` };
}

// ---------- ますの めんせき（4年）----------
function fGrid4() {
  lastMathType = 'fGrid4';
  const a = randInt(4, 7), b = randInt(4, 7), c = randInt(1, a - 2), d = randInt(1, b - 2);   // a×b から 右うえの c×d を とる
  const u = 26;
  let s = '';
  for (let r = 0; r < b; r++) for (let q = 0; q < a; q++) {
    const cut = (q >= a - c && r < d);
    if (!cut) s += `<rect x="${12 + q * u}" y="${10 + r * u}" width="${u}" height="${u}" fill="#B3E5FC" stroke="#0277BD" stroke-width="1"/>`;
  }
  const W = 24 + a * u, H = 20 + b * u;
  const ans = a * b - c * d;
  return { question: 'この かたちの 面積は なんcm²ですか？\n（ますは 1つが 1cm²）', type: 'input', inputType: 'number', answer: String(ans), figure: _fgSvg(W, H, s),
    explain: `大きな 長方形（たて ${b}ます × よこ ${a}ます ＝ ${a * b}cm²）から、かけている ぶぶん（${d}×${c} ＝ ${c * d}cm²）を ひく。${a * b} － ${c * d} ＝ ${ans}。` };
}

// ---------- 三角形の 角（5年）----------
function fAngle5() {
  lastMathType = 'fAngle5';
  let a, b;
  do { a = randInt(3, 9) * 10; b = randInt(3, 9) * 10; } while (a + b >= 150 || a + b < 70);
  const c = 180 - a - b;
  const rad = (d) => d * Math.PI / 180;
  const AB = 150, AC = AB * Math.sin(rad(b)) / Math.sin(rad(c));
  const cxr = AC * Math.cos(rad(a)), cyr = AC * Math.sin(rad(a));   // Aを 原点、うえが プラスの ざひょう
  const sc = Math.min(1, 100 / cyr);   // たかさが 100に おさまる ように ちぢめる
  const ax = 20, ay = 128;
  const P = (x, y) => [(ax + x * sc).toFixed(1), (ay - y * sc).toFixed(1)];
  const A = P(0, 0), B = P(AB, 0), C = P(cxr, cyr);
  let s = `<path d="M${A[0]} ${A[1]} L${B[0]} ${B[1]} L${C[0]} ${C[1]} Z" fill="#FFF9C4" stroke="#F9A825" stroke-width="2.4"/>`;
  s += `<text x="${(Number(A[0]) + 22).toFixed(1)}" y="${(Number(A[1]) - 6).toFixed(1)}" font-size="12" font-weight="bold" ${_fgFont} fill="#1565C0">${a}°</text>`;
  s += `<text x="${(Number(B[0]) - 48).toFixed(1)}" y="${(Number(B[1]) - 6).toFixed(1)}" font-size="12" font-weight="bold" ${_fgFont} fill="#1565C0">${b}°</text>`;
  s += `<text x="${(Number(C[0]) - 5).toFixed(1)}" y="${(Number(C[1]) + 24).toFixed(1)}" font-size="14" font-weight="bold" ${_fgFont} fill="#C62828">？</text>`;
  return { question: '三角形の 3つの 角の 大きさの わは 180°です。\n？の 角は なん度ですか？', type: 'input', inputType: 'number', answer: String(c), figure: _fgSvg(200, 140, s),
    explain: `3つの 角の わは 180°。まず ${a} ＋ ${b} ＝ ${a + b}。180 － ${a + b} ＝ ${c}。` };
}

// ---------- 分度器（4年）----------
function fProtractor4() {
  lastMathType = 'fProtractor4';
  const th = randInt(2, 16) * 10;   // 20〜160°
  const cx = 110, cy = 112, R = 90;
  let s = `<path d="M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy} Z" fill="#E3F2FD" stroke="#1565C0" stroke-width="2"/>`;
  for (let d = 0; d <= 180; d += 10) {
    const a = d * Math.PI / 180, long = d % 30 === 0;
    const x1 = cx + R * Math.cos(a), y1 = cy - R * Math.sin(a), x2 = cx + (R - (long ? 12 : 8)) * Math.cos(a), y2 = cy - (R - (long ? 12 : 8)) * Math.sin(a);
    s += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#1565C0" stroke-width="1.4"/>`;
    if (d % 30 === 0) s += `<text x="${(cx + (R - 22) * Math.cos(a)).toFixed(1)}" y="${(cy - (R - 22) * Math.sin(a) + 3.5).toFixed(1)}" font-size="9" text-anchor="middle" ${_fgFont} fill="#1565C0">${d}</text>`;
  }
  const a = th * Math.PI / 180;
  s += `<line x1="${cx}" y1="${cy}" x2="${cx + R + 10}" y2="${cy}" stroke="#333" stroke-width="2.4"/><line x1="${cx}" y1="${cy}" x2="${(cx + (R + 10) * Math.cos(a)).toFixed(1)}" y2="${(cy - (R + 10) * Math.sin(a)).toFixed(1)}" stroke="#C62828" stroke-width="2.4"/><circle cx="${cx}" cy="${cy}" r="3" fill="#333"/>`;
  return { question: '赤い 線と 黒い 線で できる 角の 大きさは なん度ですか？\n（右はしの 0から はかるよ）', type: 'input', inputType: 'number', answer: String(th), figure: _fgSvg(220, 124, s),
    explain: `分度器の 右はしの 0から、赤い 線まで めもりを よむと ${th}。だから ${th}°。（10°ずつ めもりが あるよ）` };
}

// ---------- 円グラフ（5年）----------
function fPie5() {
  lastMathType = 'fPie5';
  const cats = _fgPick([['りんご', 'みかん', 'バナナ', 'その他'], ['こくご', 'さんすう', 'りか', 'しゃかい'], ['ごはん', 'パン', 'めん', 'その他']]);
  let ps;
  do { ps = [randInt(2, 9), randInt(2, 9), randInt(2, 9)].map(x => x * 5); } while (ps[0] + ps[1] + ps[2] >= 95);
  ps.push(100 - ps[0] - ps[1] - ps[2]);
  const target = randInt(0, 3);
  const colors = ['#EF5350', '#FFB74D', '#66BB6A', '#64B5F6'];
  const cx = 100, cy = 95, r = 70;
  let s = '', ang = -90;
  ps.forEach((p, i) => {
    const sweep = p * 3.6, a1 = ang * Math.PI / 180, a2 = (ang + sweep) * Math.PI / 180;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1), x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    s += `<path d="M${cx} ${cy} L${x1.toFixed(2)} ${y1.toFixed(2)} A${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z" fill="${colors[i]}" stroke="#fff" stroke-width="2"/>`;
    const mid = (ang + sweep / 2) * Math.PI / 180;
    const label = i === target ? '？' : `${p}%`;
    s += `<text x="${(cx + r * 0.62 * Math.cos(mid)).toFixed(1)}" y="${(cy + r * 0.62 * Math.sin(mid) + 4).toFixed(1)}" font-size="${p <= 15 ? 9 : 11}" font-weight="bold" text-anchor="middle" ${_fgFont} fill="#222">${cats[i]}</text><text x="${(cx + r * 0.62 * Math.cos(mid)).toFixed(1)}" y="${(cy + r * 0.62 * Math.sin(mid) + 17).toFixed(1)}" font-size="11" font-weight="bold" text-anchor="middle" ${_fgFont} fill="#222">${label}</text>`;
    ang += sweep;
  });
  const fig = _fgSvg(200, 180, s);
  if (Math.random() < 0.5) {
    const others = ps.filter((_, i) => i !== target);
    return { question: `円グラフです。「${cats[target]}」は なん％ですか？\n（ぜんたいは 100％）`, type: 'input', inputType: 'number', answer: String(ps[target]), figure: fig,
      explain: `ほかの ぶぶんの わは ${others.join(' ＋ ')} ＝ ${others.reduce((x, y) => x + y, 0)}％。ぜんたいの 100％から ひいて、100 － ${others.reduce((x, y) => x + y, 0)} ＝ ${ps[target]}％。` };
  }
  const N = _fgPick([40, 60, 80, 100, 200]);
  const ans = (N * ps[target]) / 100;
  return { question: `ぜんたいで ${N}人です。「${cats[target]}」は なん人ですか？\n（円グラフの ？は のこりの ぶんです）`, type: 'input', inputType: 'number', answer: String(ans), figure: fig,
    explain: `「${cats[target]}」は 100 － ${ps.filter((_, i) => i !== target).reduce((x, y) => x + y, 0)} ＝ ${ps[target]}％。${N}人の ${ps[target]}％だから ${N} × ${ps[target] / 100} ＝ ${ans}人。` };
}

// ---------- 三角形の 面積（5年）----------
function fTri5() {
  lastMathType = 'fTri5';
  let b, h;
  do { b = randInt(4, 12); h = randInt(3, 10); } while ((b * h) % 2 !== 0);
  const kind = Math.random() < 0.6 ? 'tri' : 'para';
  const sx = 12, base = 150, k = Math.min(18, 150 / b), W = b * k, Hh = h * k;
  let s = '';
  if (kind === 'tri') {
    const top = sx + W * 0.3;
    s += `<path d="M${sx} ${Hh + 16} L${sx + W} ${Hh + 16} L${top} 16 Z" fill="#FFF9C4" stroke="#F9A825" stroke-width="2.4"/>`;
    s += `<line x1="${top}" y1="16" x2="${top}" y2="${Hh + 16}" stroke="#C62828" stroke-width="1.6" stroke-dasharray="4 3"/><rect x="${top}" y="${Hh + 6}" width="10" height="10" fill="none" stroke="#C62828" stroke-width="1.2"/>`;
  } else {
    const off = Math.min(W * 0.3, 40);
    s += `<path d="M${sx} ${Hh + 16} L${sx + W} ${Hh + 16} L${sx + W + off} 16 L${sx + off} 16 Z" fill="#E1F5FE" stroke="#0288D1" stroke-width="2.4"/>`;
    s += `<line x1="${sx + off}" y1="16" x2="${sx + off}" y2="${Hh + 16}" stroke="#C62828" stroke-width="1.6" stroke-dasharray="4 3"/><rect x="${sx + off}" y="${Hh + 6}" width="10" height="10" fill="none" stroke="#C62828" stroke-width="1.2"/>`;
  }
  s += `<text x="${sx + W / 2}" y="${Hh + 33}" font-size="12" font-weight="bold" text-anchor="middle" ${_fgFont} fill="#1565C0">底辺 ${b}cm</text><text x="${(kind === 'tri' ? sx + W * 0.3 : sx + Math.min(W * 0.3, 40)) + 6}" y="${Hh / 2 + 20}" font-size="12" font-weight="bold" ${_fgFont} fill="#C62828">高さ ${h}cm</text>`;
  const ans = kind === 'tri' ? (b * h) / 2 : b * h;
  const name = kind === 'tri' ? '三角形' : '平行四辺形';
  return { question: `${name}の 面積は なんcm²ですか？`, type: 'input', inputType: 'number', answer: String(ans), figure: _fgSvg(sx * 2 + W + 50, Hh + 44, s),
    explain: kind === 'tri' ? `三角形の 面積 ＝ 底辺 × 高さ ÷ 2。${b} × ${h} ÷ 2 ＝ ${b * h} ÷ 2 ＝ ${ans}（cm²）` : `平行四辺形の 面積 ＝ 底辺 × 高さ。${b} × ${h} ＝ ${ans}（cm²）` };
}

// ---------- 円（6年）----------
function fCircle6() {
  lastMathType = 'fCircle6';
  const r = randInt(2, 10), d = r * 2;
  const circumference = Math.random() < 0.5;
  const sc = 7, R = r * sc, cx = 110, cy = 20 + R;
  let s = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#E1F5FE" stroke="#0288D1" stroke-width="2.4"/><line x1="${cx - R}" y1="${cy}" x2="${cx + R}" y2="${cy}" stroke="#C62828" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="2.4" fill="#C62828"/>`;
  s += `<text x="${cx}" y="${cy - 6}" font-size="12" font-weight="bold" text-anchor="middle" ${_fgFont} fill="#C62828">直径 ${d}cm</text>`;
  const fig = _fgSvg(220, 40 + 2 * R, s);
  if (circumference) return { question: '円の まわりの 長さ（円周）は なんcmですか？\n（円周率は 3.14）', type: 'input', inputType: 'text', answer: _fgDec(d * 3.14), figure: fig,
    explain: `円周 ＝ 直径 × 円周率。${d} × 3.14 ＝ ${_fgDec(d * 3.14)}（cm）` };
  return { question: '円の 面積は なんcm²ですか？\n（円周率は 3.14）', type: 'input', inputType: 'text', answer: _fgDec(r * r * 3.14), figure: fig,
    explain: `半径 ＝ ${d} ÷ 2 ＝ ${r}cm。円の 面積 ＝ 半径 × 半径 × 円周率。${r} × ${r} × 3.14 ＝ ${_fgDec(r * r * 3.14)}（cm²）` };
}

// ---- 学年ごとの よびだし：その学年に ふさわしい 図の もんだいを 1つ（ない ときは null）----
const _HARD_FIG = [fClock3, fLine4, fPie5, fTri5, fCircle6, fAngle5];   // やさしい（0）には 出さない
function genFigure(grade, diff) {
  if (Math.random() >= (diff === 0 ? 0.07 : 0.12)) return null;
  const table = {
    1: [fClock1, fShape1],
    2: [fClock2, fRuler2, fRuler3],
    3: [fClock3, fBar3],
    4: [fLine4, fGrid4, fProtractor4, fBar3],
    5: [fPie5, fTri5, fAngle5, fLine4],
    6: [fCircle6, fPie5, fLine4]
  };
  let list = table[grade];
  if (!list) return null;
  if (diff === 0) list = list.filter(f => !_HARD_FIG.includes(f));
  if (list.length === 0) return null;
  return _fgPick(list)(diff);
}
