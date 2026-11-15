// ===== 算数の「さかのぼり」問題と、さくらんぼ計算 =====
// ・さかのぼり：さいきん 20もんで じりき 8わり みまんの たんげんには、ひとつ まえの だんかいの もんだいを まぜる（約35%）。
//   学年ごと さげる のではなく、その たんげんだけ、つまずいている ところの 手前に もどして れんしゅう する。
//   （例：小数のかけ算 → 整数で けいさん してから 小数点を うつ／あまりの 文章題 → あまりを どうするか）
// ・さくらんぼ計算（くりあがり）：1年の 算数に いつも 約3わり まぜる（学校の しゅくだいに あわせて）。
// math.js の generateMathProblem が いちばん はじめに bridgePick を よぶ。
// 「解き方」（ヒント・解説）は MATH_STEPS に 登録する（答えが 一致したときだけ 使われる）。

Object.assign(MATH_UNIT_LABELS, {
  bCherry: 'さくらんぼけいさん（くりあがり）', bCoin: 'お金を かぞえる', bOrder: 'ならびかた（まえと うしろ）',
  bRemUse: 'あまりを どうする？', bShopSum: '2つの 買いもの（だんかいで）', bChange: 'おつり（だんかいで）', bTime60: '時こく（60分の くぎり）',
  bDecMul: '小数のかけ算（小数点の いち）', bDecDiv: '小数のわり算（小数点の いち）', bLcmList: '公倍数を ならべて さがす', bGcdList: '公約数を ならべて さがす', bAvgSum: '平均（ごうけいから）'
});

// ヒントで 答えが わかって しまう ものは 1かいだけ（時こくの 文字の こたえ・小数点を うごかす さぎょう そのもの）
Object.assign(MATH_HINT_MAX, { bTime60: 1, bDecMul: 1, bDecDiv: 1 });

const CHERRY_RATE = 0.3;    // 1年の 算数に まぜる わりあい
const BRIDGE_RATE = 0.35;    // にがての たんげんが ある ときに、さかのぼりを 出す わりあい
const BRIDGE_BELOW = 0.8;    // この わりあい みまんの たんげんに さかのぼりを まぜる

const _bOne = (arr) => arr[randInt(0, arr.length - 1)];
const _bP = (q, answer, key, params, extra) => Object.assign({ question: q, type: 'input', inputType: 'number', answer: String(answer), params }, extra || {});
const _bDec = (x) => String(Math.round(x * 1000) / 1000);
const _bChoice = (q, answer, wrongs, key, params) => {
  const choices = shuffleArray([String(answer), ...wrongs.map(String)].filter((v, i, a) => a.indexOf(v) === i));
  return { question: q, type: 'choice', choices, answer: String(answer), params };
};

// ---------------- 1年：さくらんぼ計算 ----------------
function cherrySVG(a, b, left, right) {
  const c = (x, v) => `<circle cx="${x}" cy="98" r="18" fill="#FFE4E6" stroke="#E11D48" stroke-width="2.5"/><text x="${x}" y="106" font-size="22" font-weight="800" text-anchor="middle" fill="#3B2F2A">${v}</text>`;
  return `<svg viewBox="0 0 200 124" style="width:100%;max-width:240px;display:block;margin:0 auto" aria-hidden="true">` +
    `<text x="58" y="40" font-size="34" font-weight="800" text-anchor="middle" fill="#3B2F2A">${a}</text>` +
    `<text x="100" y="40" font-size="30" font-weight="800" text-anchor="middle" fill="#3B2F2A">＋</text>` +
    `<text x="142" y="40" font-size="34" font-weight="800" text-anchor="middle" fill="#3B2F2A">${b}</text>` +
    `<path d="M142 50 L120 80 M142 50 L164 80" stroke="#15803D" stroke-width="3" stroke-linecap="round"/>` +
    c(120, left) + c(164, right) + `</svg>`;
}
function bCherry() {
  lastMathType = 'bCherry';
  const a = randInt(5, 9), b = randInt(11 - a, 9);
  const need = 10 - a, rest = b - need;
  const v = _bOne(['need', 'need', 'split', 'split', 'ten', 'whole', 'whole', 'whole']);
  const params = { a, b, need, rest, v };
  if (v === 'need') return _bP(`${a} ＋ ${b} を さくらんぼで けいさんするよ。\n${a}は あと いくつで 10に なる？`, need, 'bCherry', params, { figure: cherrySVG(a, b, '？', '') });
  if (v === 'split') return _bP(`${a} ＋ ${b}：${a}は あと ${need}で 10。\n${b}を ${need}と □に わけるよ。□は いくつ？`, rest, 'bCherry', params, { figure: cherrySVG(a, b, need, '□') });
  if (v === 'ten') return _bP(`${a} ＋ ${need} ＝ 10。\nのこりの ${rest}を たすと？　10 ＋ ${rest} ＝ ？`, 10 + rest, 'bCherry', params, { figure: cherrySVG(a, b, need, rest) });
  return _bP(`${a} ＋ ${b} ＝ ？\n（さくらんぼで 10を つくって かんがえよう）`, a + b, 'bCherry', params, { figure: cherrySVG(a, b, need, rest) });
}
MATH_STEPS.bCherry = (p) => {
  const { a, b, need, rest, v } = p.params;
  if (v === 'need') return { value: need, lines: [`10に なるまで あと いくつか かんがえよう`, `${a}と いくつで 10？`, `${a} ＋ ${need} ＝ 10 だから、あと ${need}`] };
  if (v === 'split') return { value: rest, lines: [`${b}を、10を つくる ${need}と のこりに わけるよ`, `${b}から ${need}を とると いくつ のこる？`, `${b} － ${need} ＝ ${rest} だから □は ${rest}`] };
  if (v === 'ten') return { value: 10 + rest, lines: [`10の まとまりが できたね`, `10と ${rest}を あわせるよ`, `10 ＋ ${rest} ＝ ${10 + rest}`] };
  return { value: a + b, lines: [`${a}は あと ${need}で 10。${b}を ${need}と ${rest}に わけよう`, `${a} ＋ ${need} ＝ 10`, `10 ＋ ${rest} ＝ ${a + b}`] };
};

// ---------------- 1年：お金を かぞえる（硬貨の 絵つき）----------------
function coinSVG(n10, n5, n1) {
  const coins = [];
  for (let i = 0; i < n10; i++) coins.push(10);
  for (let i = 0; i < n5; i++) coins.push(5);
  for (let i = 0; i < n1; i++) coins.push(1);
  const per = 6, R = 16, gap = 38;
  const rows = Math.ceil(coins.length / per);
  let s = '';
  coins.forEach((v, i) => {
    const x = 22 + (i % per) * gap, y = 22 + Math.floor(i / per) * gap;
    if (v === 10) s += `<circle cx="${x}" cy="${y}" r="${R}" fill="#D08B57" stroke="#9A5B2E" stroke-width="2"/><text x="${x}" y="${y + 5}" font-size="13" font-weight="800" text-anchor="middle" fill="#fff">10</text>`;
    else if (v === 5) s += `<circle cx="${x}" cy="${y}" r="${R}" fill="#E9C46A" stroke="#B8860B" stroke-width="2"/><circle cx="${x}" cy="${y}" r="4" fill="#fff"/><text x="${x}" y="${y - 7}" font-size="9" font-weight="800" text-anchor="middle" fill="#6B4E00">5</text>`;
    else s += `<circle cx="${x}" cy="${y}" r="${R - 2}" fill="#E5E7EB" stroke="#9CA3AF" stroke-width="2"/><text x="${x}" y="${y + 5}" font-size="13" font-weight="800" text-anchor="middle" fill="#4B5563">1</text>`;
  });
  return `<svg viewBox="0 0 ${22 * 2 + (per - 1) * gap} ${rows * gap + 6}" style="width:100%;max-width:260px;display:block;margin:0 auto" aria-hidden="true">${s}</svg>`;
}
function bCoin() {
  lastMathType = 'bCoin';
  const v = _bOne(['10and1', '10and1', '10and5', 'all']);
  let n10 = randInt(1, 4), n5 = 0, n1 = 0;
  if (v === '10and1') n1 = randInt(1, 6);
  if (v === '10and5') n5 = 1;
  if (v === 'all') { n5 = 1; n1 = randInt(1, 4); }
  const total = n10 * 10 + n5 * 5 + n1;
  const parts = [`10円玉が ${n10}まい`];
  if (n5) parts.push(`5円玉が ${n5}まい`);
  if (n1) parts.push(`1円玉が ${n1}まい`);
  return _bP(`${parts.join('、')} あります。\nぜんぶで なん円？`, total, 'bCoin', { n10, n5, n1 }, { figure: coinSVG(n10, n5, n1) });
}
MATH_STEPS.bCoin = (p) => {
  const { n10, n5, n1 } = p.params; const total = n10 * 10 + n5 * 5 + n1;
  const lines = [`まず 10円玉を かぞえよう：10、20、30… と ふえるよ`, `10円玉 ${n10}まいで ${n10 * 10}円`];
  if (n5 && !n1) { lines.push('つぎに 5円玉 1まいを たそう', `${n10 * 10} ＋ 5 ＝ ${total}円`); return { value: total, lines }; }   // こたえは さいごの 行だけに 出す
  if (n5) lines.push(`5円玉を たすと ${n10 * 10} ＋ 5 ＝ ${n10 * 10 + 5}円`);
  if (n1) lines.push(`1円玉 ${n1}まいを たして ${total}円`);
  else lines.push(`ぜんぶで ${total}円`);
  return { value: total, lines };
};

// ---------------- 1年：ならびかた（まえと うしろ）----------------
function bOrder() {
  lastMathType = 'bOrder';
  const v = _bOne(['before', 'sum', 'sum']);
  if (v === 'before') {
    const a = randInt(3, 9);
    return _bP(`まえから ${a}ばんめに ひろさんが います。\nひろさんの まえには なんにん いる？`, a - 1, 'bOrder', { v, a });
  }
  const x = randInt(2, 6), y = randInt(2, 6);
  return _bP(`ひろさんの まえに ${x}にん、うしろに ${y}にん います。\nひろさんも いれて、ぜんぶで なんにん？`, x + y + 1, 'bOrder', { v, x, y });
}
MATH_STEPS.bOrder = (p) => {
  const q = p.params;
  if (q.v === 'before') return { value: q.a - 1, lines: ['ひろさんじしんは かぞえないよ', `${q.a}ばんめ だから、まえに いるのは ${q.a}より 1すくない`, `${q.a} － 1 ＝ ${q.a - 1}（${q.a - 1}にん）`] };
  return { value: q.x + q.y + 1, lines: ['まえの 人と うしろの 人に、ひろさんの 1にんを たすよ', `${q.x} ＋ ${q.y} ＝ ${q.x + q.y}`, `${q.x + q.y} ＋ 1 ＝ ${q.x + q.y + 1}（ひろさんの ぶん）`] };
};

// ---------------- 3年：あまりを どうする？ ----------------
function bRemUse() {
  lastMathType = 'bRemUse';
  const k = randInt(3, 8);
  const n = randInt(2, 8) * k + randInt(1, k - 1);   // あまりは かならず 1いじょう
  const q = Math.floor(n / k), r = n % k;
  const up = Math.random() < 0.5;
  if (up) return _bP(`${n}人が ${k}人ずつ ボートに のります。\n${n} ÷ ${k} ＝ ${q} あまり ${r}\nのこりの ${r}人も のるには、ボートは ぜんぶで なんそう いる？`, q + 1, 'bRemUse', { n, k, q, r, up });
  return _bP(`${n}まいの シールを ${k}まいずつ ふくろに 入れます。\n${n} ÷ ${k} ＝ ${q} あまり ${r}\n${k}まい ちょうど 入った ふくろは なんふくろ できる？`, q, 'bRemUse', { n, k, q, r, up });
}
MATH_STEPS.bRemUse = (p) => {
  const { n, k, q, r, up } = p.params;
  if (up) return { value: q + 1, lines: [`あまりの ${r}人も ボートに のらないと いけないね`, `${k}人のりの ボートが ${q}そうで、あと ${r}人 のこる`, `のこりの ${r}人の ために もう 1そう いるから ${q} ＋ 1 ＝ ${q + 1}そう`] };
  return { value: q, lines: [`あまりの ${r}まいでは、${k}まいの ふくろは できないね`, `ふくろの かずは、わり算の こたえの どこ？「あまり」の まえの かずだよ`, `あまりは つかわないので ${q}ふくろ`] };
};

// ---------------- 3年：2つの 買いもの・おつり（だんかいで）----------------
const _bItems = [['えんぴつ', '本'], ['ノート', 'さつ'], ['ガム', 'こ'], ['シール', 'まい'], ['けしゴム', 'こ'], ['あめ', 'こ']];
function bShopSum() {
  lastMathType = 'bShopSum';
  const [it, u] = _bOne(_bItems);
  if (Math.random() < 0.5) {
    const p = randInt(2, 9) * 10, n = randInt(2, 6);
    return _bP(`${it}は 1${u} ${p}円です。\n${n}${u} 買うと 何円？`, p * n, 'bShopSum', { v: 'one', p, n, u });
  }
  const t1 = randInt(3, 9) * 30, t2 = randInt(2, 9) * 40;
  return _bP(`${it}の だい金は ${t1}円、ほかの 買いものは ${t2}円 でした。\nあわせて 何円？`, t1 + t2, 'bShopSum', { v: 'sum', t1, t2 });
}
MATH_STEPS.bShopSum = (p) => {
  const q = p.params;
  if (q.v === 'one') return { value: q.p * q.n, lines: ['1つ ぶんの ねだん × いくつ で もとめるよ', `${q.p} × ${q.n}`, `${q.p} × ${q.n} ＝ ${q.p * q.n}（円）`] };
  return { value: q.t1 + q.t2, lines: ['2つの だい金を たすよ', `${q.t1} ＋ ${q.t2}`, `${q.t1} ＋ ${q.t2} ＝ ${q.t1 + q.t2}（円）`] };
};
function bChange() {
  lastMathType = 'bChange';
  const [it, u] = _bOne(_bItems);
  const p = randInt(3, 9) * 10, n = randInt(3, 8);
  const total = p * n, pay = total <= 500 ? 500 : 1000;
  if (Math.random() < 0.5) return _bP(`${it} 1${u} ${p}円を ${n}${u} 買います。\nだい金は 何円？`, total, 'bChange', { v: 'cost', p, n, total, pay });
  return _bP(`だい金は ${total}円です。\n${pay}円 はらうと、おつりは 何円？`, pay - total, 'bChange', { v: 'change', p, n, total, pay });
}
MATH_STEPS.bChange = (p) => {
  const q = p.params;
  if (q.v === 'cost') return { value: q.total, lines: ['だい金 ＝ 1つ ぶんの ねだん × いくつ', `${q.p} × ${q.n}`, `${q.p} × ${q.n} ＝ ${q.total}（円）`] };
  return { value: q.pay - q.total, lines: ['おつり ＝ はらった お金 － だい金', `${q.pay} － ${q.total}`, `${q.pay} － ${q.total} ＝ ${q.pay - q.total}（円）`] };
};

// ---------------- 3年：時こく（60分の くぎり）----------------
function bTime60() {
  lastMathType = 'bTime60';
  const h = randInt(1, 10), m = randInt(4, 11) * 5;
  if (Math.random() < 0.5) return _bP(`いま ${h}時${m}分です。\nあと 何分で ${h + 1}時に なる？`, 60 - m, 'bTime60', { v: 'toHour', h, m });
  const left = 60 - m, add = left + randInt(1, 4) * 5;
  const ans = `${h + 1}時${add - left}分`;
  return _bP(`いま ${h}時${m}分です。${add}分後は 何時何分？\n（「3時5分」のように 入力）`, ans, 'bTime60', { v: 'after', h, m, add, left }, { inputType: 'text', answerType: 'time' });
}
MATH_STEPS.bTime60 = (p) => {
  const q = p.params;
  if (q.v === 'toHour') return { value: 60 - q.m, lines: ['1時間は 60分。つぎの「ちょうど」まで かぞえよう', `60 － ${q.m}`, `60 － ${q.m} ＝ ${60 - q.m}（分）`] };
  return { value: `${q.h + 1}時${q.add - q.left}分`, lines: [`まず ${q.h + 1}時ちょうどまで あと ${q.left}分`, `${q.add}分の うち ${q.left}分で ${q.h + 1}時。のこりは ${q.add} － ${q.left} ＝ ${q.add - q.left}分`, `${q.h + 1}時から ${q.add - q.left}分 すすんで ${q.h + 1}時${q.add - q.left}分`] };
};

// ---------------- 5年：小数点の いち ----------------
function bDecMul() {
  lastMathType = 'bDecMul';
  const A = randInt(11, 99), n = randInt(2, 9);
  if (A % 10 === 0) return bDecMul();
  const a = A / 10, ans = _bDec(a * n), big = A * n;
  if (Math.random() < 0.55) return _bP(`${A} × ${n} ＝ ${big} です。\nでは、${a} × ${n} ＝ ？`, ans, 'bDecMul', { v: 'from', A, a, n, big }, { inputType: 'text' });
  const wrongs = [_bDec(big / 100), String(big), _bDec(big / 1000)].filter(x => x !== ans);
  return _bChoice(`${a} × ${n} の こたえは どれ？\n（${a}は だいたい ${Math.round(a)}。${Math.round(a)} × ${n} に ちかい ものを えらぼう）`, ans, wrongs, 'bDecMul', { v: 'pick', A, a, n, big });
}
MATH_STEPS.bDecMul = (p) => {
  const { A, a, n, big, v } = p.params; const ans = _bDec(a * n);
  const zero = big % 10 === 0 ? [`${big / 10}.0 の おわりの 0 は けすよ`] : [];
  if (v === 'from') return { value: ans, lines: [`${a}は ${A}の 10ぶんの1。だから こたえも ${big}の 10ぶんの1`, `${big}の 小数点を ひだりに 1つ うごかす`, ...zero, `${a} × ${n} ＝ ${ans}`] };
  return { value: ans, lines: [`まず 小数点を とって ${A} × ${n} ＝ ${big}`, `${a}は 小数第1位まで あるので、こたえも 小数点を ひだりに 1つ`, ...zero, `${a} × ${n} ＝ ${ans}`] };
};
function bDecDiv() {
  lastMathType = 'bDecDiv';
  const n = randInt(2, 9), Q = randInt(11, 19 + n * 2);
  if (Q % 10 === 0 || (Q * n) % 10 === 0) return bDecDiv();   // わられる かずが 整数に なる（3 ÷ 2 など）ものは つくらない
  const A = Q * n, a = A / 10, ans = _bDec(Q / 10);
  if (Math.random() < 0.55) return _bP(`${A} ÷ ${n} ＝ ${Q} です。\nでは、${a} ÷ ${n} ＝ ？`, ans, 'bDecDiv', { v: 'from', A, a, n, Q }, { inputType: 'text' });
  const wrongs = [String(Q), _bDec(Q / 100), _bDec(Q * 10)].filter(x => x !== ans);
  return _bChoice(`${a} ÷ ${n} の こたえは どれ？\n（わられる かずが 10ぶんの1 だと、こたえも 10ぶんの1）`, ans, wrongs, 'bDecDiv', { v: 'pick', A, a, n, Q });
}
MATH_STEPS.bDecDiv = (p) => {
  const { A, a, n, Q, v } = p.params; const ans = _bDec(Q / 10);
  if (v === 'from') return { value: ans, lines: [`${a}は ${A}の 10ぶんの1。わる かずは おなじ ${n}`, `だから こたえも ${Q}の 10ぶんの1`, `${a} ÷ ${n} ＝ ${ans}`] };
  return { value: ans, lines: [`小数点を とって ${A} ÷ ${n} ＝ ${Q}`, `わられる かずの 小数点の いちに あわせて、こたえにも 小数点を うつ`, `${a} ÷ ${n} ＝ ${ans}`] };
};

// ---------------- 5年：公倍数・公約数を ならべて さがす ----------------
const _bGcd = (x, y) => (y === 0 ? x : _bGcd(y, x % y));
function bLcmList() {
  lastMathType = 'bLcmList';
  let a, b, l;
  do { a = randInt(2, 9); b = randInt(2, 9); l = a * b / _bGcd(a, b); } while (a === b || l > 45 || l === Math.max(a, b) || l / Math.min(a, b) > 8);
  const list = (x) => { const out = []; for (let k = x; k <= l + x; k += x) out.push(k); return out.join('、') + '…'; };   // こたえの すこし さきまで ならべる
  return _bP(`${a}と ${b}の 公倍数で いちばん 小さい かずは？\n${a}の 倍数：${list(a)}\n${b}の 倍数：${list(b)}`, l, 'bLcmList', { a, b, l });
}
MATH_STEPS.bLcmList = (p) => { const { a, b, l } = p.params; return { value: l, lines: ['ふたつの ならびに どちらも 出てくる かずを さがそう', 'ちいさい ほうから じゅんに くらべていくよ', `${a}の 倍数にも ${b}の 倍数にも ある いちばん 小さい かずは ${l}`] }; };
function bGcdList() {
  lastMathType = 'bGcdList';
  let a, b, g;
  do { g = randInt(2, 9); a = g * randInt(2, 5); b = g * randInt(2, 5); } while (a === b || a > 45 || b > 45 || _bGcd(a, b) !== g);
  const divs = (x) => { const o = []; for (let k = 1; k <= x; k++) if (x % k === 0) o.push(k); return o.join('、'); };
  return _bP(`${a}と ${b}の 公約数で いちばん 大きい かずは？\n${a}の 約数：${divs(a)}\n${b}の 約数：${divs(b)}`, g, 'bGcdList', { a, b, g });
}
MATH_STEPS.bGcdList = (p) => { const { a, b, g } = p.params; return { value: g, lines: ['ふたつの ならびに どちらも 出てくる かずを さがそう', '大きい ほうから じゅんに くらべていくよ', `${a}の 約数にも ${b}の 約数にも ある いちばん 大きい かずは ${g}`] }; };

// ---------------- 5年：平均（ごうけいから）----------------
function bAvgSum() {
  lastMathType = 'bAvgSum';
  const k = 4, avg = randInt(8, 20);
  let xs;
  do { xs = Array.from({ length: k - 1 }, () => avg + randInt(-6, 6)); xs.push(avg * k - xs.reduce((s, x) => s + x, 0)); } while (xs.some(x => x < 1 || x > 40));
  const sum = avg * k;
  if (Math.random() < 0.5) return _bP(`${xs.join('、')} の ごうけいは？\n（平均を もとめる まえの だんかい）`, sum, 'bAvgSum', { v: 'sum', xs, sum, k, avg });
  return _bP(`${k}つの かずの ごうけいは ${sum} です。\nこの ${k}つの かずの 平均は？`, avg, 'bAvgSum', { v: 'avg', xs, sum, k, avg });
}
MATH_STEPS.bAvgSum = (p) => {
  const q = p.params;
  if (q.v === 'sum') return { value: q.sum, lines: ['ぜんぶ たそう。まえから じゅんに たしていこう', `${q.xs.slice(0, 2).join(' ＋ ')} ＝ ${q.xs[0] + q.xs[1]}`, `${q.xs.join(' ＋ ')} ＝ ${q.sum}`] };
  return { value: q.avg, lines: ['平均 ＝ ごうけい ÷ こすう', `${q.sum} ÷ ${q.k}`, `${q.sum} ÷ ${q.k} ＝ ${q.avg}`] };
};

// ---------------- どの たんげんに、どの さかのぼりを まぜるか ----------------
const BRIDGE_MAP = {
  'くりあがりの たしざん': [bCherry], 'くりあがりの もんだい': [bCherry],
  'お金（10円・5円・1円）': [bCoin], 'ならびかた': [bOrder],
  'あまりの いみ': [bRemUse], 'わり算の 切り上げ': [bRemUse],
  '2つの 買いもの': [bShopSum], 'おつり（おうよう）': [bChange], '時こくと時間': [bTime60],
  '小数のかけ算': [bDecMul], '小数のわり算': [bDecDiv],
  '最小公倍数': [bLcmList], '最小公倍数の 文章題': [bLcmList], '最大公約数': [bGcdList], '最大公約数の 文章題': [bGcdList],
  '平均': [bAvgSum], '平均（つぎの 点）': [bAvgSum]
};
const BRIDGE_GENS = { bCherry, bCoin, bOrder, bRemUse, bShopSum, bChange, bTime60, bDecMul, bDecDiv, bLcmList, bGcdList, bAvgSum };

function _bTag(p) {
  p.key = lastMathType;
  p.unitLabel = MATH_UNIT_LABELS[lastMathType] || '';
  return p;
}

// generateMathProblem の さいしょに よばれる。さくらんぼ／さかのぼりを 出す ときは その もんだい、出さない ときは null
function bridgePick(grade) {
  if (grade === 1 && Math.random() < CHERRY_RATE) return _bTag(bCherry());
  if (typeof loadUnits !== 'function' || typeof unitRate !== 'function') return null;
  const u = loadUnits();
  const cand = [];
  Object.keys(u).forEach(k => {
    const [g, s, unit] = k.split('|');
    if (Number(g) !== grade || s !== 'math' || !BRIDGE_MAP[unit]) return;
    const r = unitRate(u[k]);
    if (r && r.rate < BRIDGE_BELOW) cand.push(unit);
  });
  if (cand.length === 0 || Math.random() >= BRIDGE_RATE) return null;
  return _bTag(_bOne(BRIDGE_MAP[_bOne(cand)])());
}

// おなじ しゅるいの もんだいを もう1もん（まちがえた すぐ あとの「にた もんだい」）。つくれなければ null
function mathProblemOfType(grade, diff, key, notQuestion) {
  if (BRIDGE_GENS[key]) {
    for (let i = 0; i < 10; i++) { const p = _bTag(BRIDGE_GENS[key]()); if (p.question !== notQuestion) return p; }
    return null;
  }
  for (let i = 0; i < 200; i++) {
    const p = generateMathProblem(grade, diff);
    if (p && p.key === key && p.question !== notQuestion) return p;
  }
  return null;
}
