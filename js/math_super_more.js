// ===== 算数「ちょうむずかしい」（レベル3）：1・2・4・5・6年 =====
// 3年は math_super.js。ここは ほかの学年。どの学年も、その学年の 範囲の まま、
// 2だんかいの 文章題・ぎゃくむきの もんだい・単位の かんがえ など「考える力」が いる もんだいにする。
// 問題には params を持たせ、「解き方」（MATH_STEPS）は params から 作る（答えが 一致したときだけ 使われる）。

const _sP = (q, answer, key, params, extra) => Object.assign({ question: q, type: 'input', inputType: 'number', answer: String(answer), params }, extra || {});
const _sDec = (x) => String(Math.round(x * 1000) / 1000);
const _sOne = (arr) => arr[randInt(0, arr.length - 1)];

Object.assign(MATH_UNIT_LABELS, {
  s1Mix: 'たしざんと ひきざん（3つ）', s1Blank: '□－○＝△', s1Order: 'ならびかた', s1Diff: 'おなじ かずに する', s1Money: 'お金（10円・5円・1円）', s1Compare: 'けいさんの くらべっこ',
  s2Change: 'おつり（2つの 買いもの）', s2Mul: 'かけ算を 2かい', s2Blank: '□を使った かけ算（文章題）', s2Hundred: '100と 10と 1の かず', s2Minutes: '時間と 分（おうよう）', s2Length: '長さの けいさん（m と cm）',
  s4Mul3: '4けた×2けた', s4RevDiv: 'わり算の ぎゃくさん', s4Lshape: 'L字の 面積', s4DecDiv: '小数÷整数（おうよう）', s4Improper: '仮分数と 帯分数', s4Order: '計算の じゅんじょ（おうよう）',
  s5Lcm: '最小公倍数の 文章題', s5Gcd: '最大公約数の 文章題', s5Speed: '速さ（分速と km）', s5Pct: '割合（もとに する 量）', s5FracDec: '分数と 小数', s5AvgNext: '平均（つぎの 点）',
  s6FracMul: '分数のかけ算（おうよう）', s6Ratio: '比（全体から）', s6CircleArea: '円の面積（おうよう）', s6SpeedMin: '速さ（時速と 分）', s6Prop: '比例と 反比例', s6Eq: '□を求める式（2だんかい）'
});
Object.assign(MATH_HINT_MAX, { s4DecDiv: 2, s5FracDec: 2, s5Speed: 2, s6FracMul: 2, s6CircleArea: 2 });

const _sCoprime = (a, b) => gcd(a, b) === 1;

function genSuperMore(grade) {
  const table = {
    1: [s1Mix, s1Blank, s1Order, s1Diff, s1Money, s1Compare],
    2: [s2Change, s2Mul, s2Blank, s2Hundred, s2Minutes, s2Length],
    4: [s4Mul3, s4RevDiv, s4Lshape, s4DecDiv, s4Improper, s4Order],
    5: [s5Lcm, s5Gcd, s5Speed, s5Pct, s5FracDec, s5AvgNext],
    6: [s6FracMul, s6Ratio, s6CircleArea, s6SpeedMin, s6Prop, s6Eq]
  };
  const list = table[grade];
  if (!list) return null;
  const f = _sOne(list);
  const p = f();
  return p;
}

// ---------------- 1年 ----------------
function s1Mix() {
  lastMathType = 's1Mix';
  let a, b, c;
  do { a = randInt(4, 9); b = randInt(4, 9); c = randInt(3, 9); } while (a + b < 11 || c >= a + b);
  return _sP(`${a} ＋ ${b} － ${c} = ？`, a + b - c, 's1Mix', { a, b, c });
}
MATH_STEPS.s1Mix = (p) => { const { a, b, c } = p.params; return { value: a + b - c, lines: [
  'まえから じゅんに けいさんしよう', `${a} ＋ ${b} = ${a + b}`, `つぎに ${a + b} － ${c} を けいさんするよ`, `${a} ＋ ${b} － ${c} = ${a + b - c}` ] }; };

function s1Blank() {
  lastMathType = 's1Blank';
  const a = randInt(3, 9), b = randInt(3, 9);
  return _sP(`□ － ${a} ＝ ${b}\n□に はいる かずは？`, a + b, 's1Blank', { a, b });
}
MATH_STEPS.s1Blank = (p) => { const { a, b } = p.params; return { value: a + b, lines: [
  `□から ${a}を ひいたら ${b}に なったよ`, 'もとの かずは、ひいた かずを たすと わかるよ', `${b} ＋ ${a}`, `${b} ＋ ${a} = ${a + b}` ] }; };

function s1Order() {
  lastMathType = 's1Order';
  const a = randInt(3, 9), b = randInt(3, 9);
  return _sP(`まえから ${a}ばんめ、うしろから ${b}ばんめに ひろさんが います。\nぜんぶで なんにん ならんでいる？`, a + b - 1, 's1Order', { a, b });
}
MATH_STEPS.s1Order = (p) => { const { a, b } = p.params; return { value: a + b - 1, lines: [
  'ひろさんを 2かい かぞえて しまうよ', `${a} ＋ ${b} = ${a + b}`, 'ひろさんが 2かい はいっているので、1を ひこう', `${a + b} － 1 = ${a + b - 1}` ] }; };

function s1Diff() {
  lastMathType = 's1Diff';
  const b = randInt(3, 9), a = b + randInt(2, 9);
  return _sP(`あかい はなが ${a}本、しろい はなが ${b}本 あります。\nおなじ かずに するには、しろい はなを\nあと なん本 ふやせば いい？`, a - b, 's1Diff', { a, b });
}
MATH_STEPS.s1Diff = (p) => { const { a, b } = p.params; return { value: a - b, lines: [
  'おなじ かずに するには、ちがいの ぶんだけ ふやせば いいよ', `ちがいを もとめる：${a} － ${b}`, a >= 11 ? `${a}を 10と ${a - 10}に わけて かんがえよう` : `${a}から ${b}を ひこう`, `${a} － ${b} = ${a - b}（あと ${a - b}本）` ] }; };

function s1Money() {
  lastMathType = 's1Money';
  const a = randInt(2, 6), b = randInt(1, 4), c = randInt(1, 4);
  return _sP(`10円玉が ${a}まい、5円玉が ${b}まい、1円玉が ${c}まい あります。\nぜんぶで なん円？`, a * 10 + b * 5 + c, 's1Money', { a, b, c });
}
MATH_STEPS.s1Money = (p) => { const { a, b, c } = p.params; return { value: a * 10 + b * 5 + c, lines: [
  'お金の しゅるいごとに わけて かんがえよう', `10円玉 ${a}まいで ${a * 10}円、5円玉 ${b}まいで ${b * 5}円、1円玉 ${c}まいで ${c}円`, `${a * 10} ＋ ${b * 5} = ${a * 10 + b * 5}`, `${a * 10 + b * 5} ＋ ${c} = ${a * 10 + b * 5 + c}` ] }; };

function s1Compare() {
  lastMathType = 's1Compare';
  let a, b, c, d;
  do { a = randInt(3, 9); b = randInt(3, 9); c = randInt(3, 9); d = randInt(3, 9); } while (a + b === c + d || a + b < 11 || c + d < 11);
  return { question: `${a} ＋ ${b} と ${c} ＋ ${d} では、\nどちらが おおきい？`, type: 'choice', choices: ['ひだり', 'みぎ'], answer: a + b > c + d ? 'ひだり' : 'みぎ', params: { a, b, c, d } };
}
MATH_STEPS.s1Compare = (p) => { const { a, b, c, d } = p.params; const ans = a + b > c + d ? 'ひだり' : 'みぎ'; return { value: ans, lines: [
  'りょうほうの けいさんを してから くらべよう', `ひだり：${a} ＋ ${b} = ${a + b}`, `みぎ：${c} ＋ ${d} = ${c + d}`, `${a + b} と ${c + d} では ${ans}の ほうが おおきい` ] }; };

// ---------------- 2年 ----------------
function s2Change() {
  lastMathType = 's2Change';
  let a, b;
  do { a = randInt(3, 9) * 10; b = randInt(2, 8) * 10; } while (a + b === 100 || a + b === 200);
  const pay = a + b < 100 ? 100 : 200;
  return _sP(`${a}円の ノートと ${b}円の えんぴつを 買って、${pay}円 はらいました。\nおつりは なん円？`, pay - a - b, 's2Change', { a, b, pay });
}
MATH_STEPS.s2Change = (p) => { const { a, b, pay } = p.params; return { value: pay - a - b, lines: [
  'まず 2つの ねだんを あわせて、はらった お金から ひこう', `${a} ＋ ${b} = ${a + b}（円）`, `おつり ＝ ${pay} － ${a + b}`, `${pay} － ${a + b} = ${pay - a - b}` ] }; };

function s2Mul() {
  lastMathType = 's2Mul';
  const a = randInt(2, 9), b = randInt(2, 6);
  let c, d;
  do { c = randInt(2, 9); d = randInt(2, 6); } while (c === a);
  return _sP(`${a}こ 入りの はこが ${b}はこ、${c}こ 入りの はこが ${d}はこ あります。\nおかしは ぜんぶで なんこ？`, a * b + c * d, 's2Mul', { a, b, c, d });
}
MATH_STEPS.s2Mul = (p) => { const { a, b, c, d } = p.params; return { value: a * b + c * d, lines: [
  'はこの しゅるいごとに かけ算で もとめて、あわせよう', `${a} × ${b} = ${a * b}（こ）`, `${c} × ${d} = ${c * d}（こ）`, `${a * b} ＋ ${c * d} = ${a * b + c * d}` ] }; };

function s2Blank() {
  lastMathType = 's2Blank';
  const a = randInt(2, 9), x = randInt(2, 9);
  return _sP(`${a}こ ずつ ふくろに 入れて、ふくろが □ふくろ。\nぜんぶで ${a * x}こ です。\n□に はいる かずは？`, x, 's2Blank', { a, x });
}
MATH_STEPS.s2Blank = (p) => { const { a, x } = p.params; return { value: x, lines: [
  'かけ算の 九九を おもいだして さがそう', '□に はいる 数を、だんの 九九を じゅんに いって さがすよ', `${a}の だんを いってみよう（${a}、${a * 2}、${a * 3}…）`, `${a} × ${x} = ${a * x}` ] }; };

function s2Hundred() {
  lastMathType = 's2Hundred';
  const a = randInt(2, 9), b = randInt(10, 15), c = randInt(1, 9);
  return _sP(`100が ${a}こ、10が ${b}こ、1が ${c}こ で いくつ？`, a * 100 + b * 10 + c, 's2Hundred', { a, b, c });
}
MATH_STEPS.s2Hundred = (p) => { const { a, b, c } = p.params; return { value: a * 100 + b * 10 + c, lines: [
  'それぞれ いくつぶんかを もとめて あわせよう', `100が ${a}こ → ${a * 100}、10が ${b}こ → ${b * 10}`, `${a * 100} ＋ ${b * 10} ＝ ${a * 100 + b * 10}`, `${a * 100 + b * 10} ＋ ${c} = ${a * 100 + b * 10 + c}` ] }; };

function s2Minutes() {
  lastMathType = 's2Minutes';
  const m = randInt(65, 119);
  return _sP(`${m}分は、1時間 □分です。\n□に はいる かずは？`, m - 60, 's2Minutes', { m });
}
MATH_STEPS.s2Minutes = (p) => { const { m } = p.params; return { value: m - 60, lines: [
  '1時間は 60分だよ', `${m}分から 60分（1時間）を とろう`, `${m} － 60`, `${m} － 60 = ${m - 60}` ] }; };

function s2Length() {
  lastMathType = 's2Length';
  const a = randInt(1, 3), b = randInt(2, 9) * 10, c = randInt(2, 9) * 10 + 5;
  return _sP(`${a}m ${b}cm ＋ ${c}cm は、ぜんぶで なんcm？`, a * 100 + b + c, 's2Length', { a, b, c });
}
MATH_STEPS.s2Length = (p) => { const { a, b, c } = p.params; return { value: a * 100 + b + c, lines: [
  '1m ＝ 100cm だよ。ぜんぶ cmに そろえよう', `${a}m ＝ ${a * 100}cm`, `${a * 100} ＋ ${b} ＋ ${c}`, `${a * 100} ＋ ${b} ＋ ${c} = ${a * 100 + b + c}` ] }; };

// ---------------- 4年 ----------------
function s4Mul3() {
  lastMathType = 's4Mul3';
  const a = randInt(1000, 4999), b = randInt(12, 59);
  return _sP(`${a} × ${b} = ？`, a * b, 's4Mul3', { a, b });
}
MATH_STEPS.s4Mul3 = (p) => { const { a, b } = p.params; const t = Math.floor(b / 10) * 10, o = b % 10; return { value: a * b, lines: [
  'かける数を 10の まとまりと ばらに わけて かけよう', `${b} ＝ ${t} ＋ ${o}`, `${a} × ${o} = ${a * o}、${a} × ${t} = ${a * t}`, `${a * o} ＋ ${a * t} = ${a * b}` ] }; };

function s4RevDiv() {
  lastMathType = 's4RevDiv';
  const k = randInt(4, 9), q = randInt(6, 20), r = randInt(1, k - 1);
  return _sP(`ある数を ${k}で わると、商が ${q}で あまりが ${r}に なります。\nある数は いくつ？`, k * q + r, 's4RevDiv', { k, q, r });
}
MATH_STEPS.s4RevDiv = (p) => { const { k, q, r } = p.params; return { value: k * q + r, lines: [
  'わり算の たしかめの 式を つかおう：わる数 × 商 ＋ あまり ＝ わられる数', `${k} × ${q} = ${k * q}`, `${k * q} ＋ ${r}`, `${k * q} ＋ ${r} = ${k * q + r}` ] }; };

function s4Lshape() {
  lastMathType = 's4Lshape';
  const a = randInt(8, 15), b = randInt(8, 15), c = randInt(2, a - 3), d = randInt(2, b - 3);
  return _sP(`たて ${a}cm、よこ ${b}cmの 長方形から、\nたて ${c}cm、よこ ${d}cmの 長方形を きりとりました。\nのこりの 面積は 何cm²？`, a * b - c * d, 's4Lshape', { a, b, c, d });
}
MATH_STEPS.s4Lshape = (p) => { const { a, b, c, d } = p.params; return { value: a * b - c * d, lines: [
  '大きい 長方形の 面積から、きりとった 面積を ひこう', `大きい 長方形：${a} × ${b} = ${a * b}（cm²）`, `きりとった ぶぶん：${c} × ${d} = ${c * d}（cm²）`, `${a * b} － ${c * d} = ${a * b - c * d}` ] }; };

function s4DecDiv() {
  lastMathType = 's4DecDiv';
  const n = randInt(2, 9), y10 = randInt(2, 25);
  const x = Math.round(n * y10) / 10;
  return _sP(`${x}Lの ジュースを ${n}人で おなじ りょうずつ わけます。\n1人 なんL？`, _sDec(y10 / 10), 's4DecDiv', { x, n, y10 }, { inputType: 'text' });
}
MATH_STEPS.s4DecDiv = (p) => { const { x, n, y10 } = p.params; return { value: _sDec(y10 / 10), lines: [
  'わり算の しきを つくろう', `しき：${x} ÷ ${n}`, `${x}は 0.1が ${Math.round(x * 10)}こ ぶん → ${Math.round(x * 10)} ÷ ${n}`, `${x} ÷ ${n} = ${_sDec(y10 / 10)}` ] }; };

function s4Improper() {
  lastMathType = 's4Improper';
  const d = randInt(3, 9), n = randInt(1, d - 1), w = randInt(1, 4);
  if (Math.random() < 0.5) {
    return _sP(`帯分数 ${w}と ${n}/${d} を 仮分数（かぶんすう）に すると、\n分子は いくつ？（分母は ${d}）`, w * d + n, 's4Improper', { w, n, d });
  }
  return _sP(`仮分数 ${w * d + n}/${d} を 帯分数に すると、\n整数の ぶぶんは いくつ？`, w, 's4Improper', { w, n, d, back: true });
}
MATH_STEPS.s4Improper = (p) => {
  const { w, n, d, back } = p.params;
  if (back) return { value: w, lines: [
    '仮分数の 分子を 分母で わって、整数の ぶぶんを もとめよう', `${w * d + n} ÷ ${d}（${d}が なんこ ぶん ある？）`, `${w * d + n} ÷ ${d} = ${w} あまり ${n}`, `${w * d + n}/${d} ＝ ${w}と ${n}/${d}` ] };
  return { value: w * d + n, lines: [
    `1は ${d}/${d} と 同じだよ`, `${w} ＝ ${w * d}/${d}`, `${w * d}/${d} ＋ ${n}/${d}（分子を たす）`, `${w * d} ＋ ${n} = ${w * d + n}` ] };
};

function s4Order() {
  lastMathType = 's4Order';
  const a = randInt(10, 30), b = randInt(2, 9), c = randInt(2, 9), e = randInt(2, 6), d = e * randInt(2, 9);
  return _sP(`${a} ＋ ${b} × ${c} － ${d} ÷ ${e} ＝ ？`, a + b * c - d / e, 's4Order', { a, b, c, d, e });
}
MATH_STEPS.s4Order = (p) => { const { a, b, c, d, e } = p.params; return { value: a + b * c - d / e, lines: [
  '× と ÷ を さきに けいさんして、そのあと ＋ と － を まえから しよう', `${b} × ${c} = ${b * c}、${d} ÷ ${e} = ${d / e}`, `${a} ＋ ${b * c} － ${d / e}`, `${a} ＋ ${b * c} = ${a + b * c}、${a + b * c} － ${d / e} = ${a + b * c - d / e}` ] }; };

// ---------------- 5年 ----------------
function s5Lcm() {
  lastMathType = 's5Lcm';
  let a, b;
  do { a = randInt(3, 12); b = randInt(3, 12); } while (a === b || (a * b) / gcd(a, b) > 72 || a % b === 0 || b % a === 0);
  return _sP(`バスは ${a}分ごと、電車は ${b}分ごとに 出ます。\nいま 同時に 出ました。\nつぎに 同時に 出るのは 何分後？`, (a * b) / gcd(a, b), 's5Lcm', { a, b });
}
MATH_STEPS.s5Lcm = (p) => { const { a, b } = p.params; const l = (a * b) / gcd(a, b); const list = (x) => Array.from({ length: l / x }, (_, i) => x * (i + 1)).join('、'); return { value: l, lines: [
  '同時に 出る 時こくは、2つの 数の 公倍数だよ。いちばん はやいのは 最小公倍数', `${a}の 倍数：${list(a)}`, `${b}の 倍数：${list(b)}`, `はじめて 同じに なる 数 ＝ ${l}` ] }; };

function s5Gcd() {
  lastMathType = 's5Gcd';
  let g, x, y;
  do { g = randInt(2, 8); x = randInt(2, 6); y = randInt(2, 6); } while (x === y || !_sCoprime(x, y));
  return _sP(`たて ${g * x}cm、よこ ${g * y}cmの 長方形の 紙を、\n同じ 大きさの 正方形に すきまなく 切ります。\n正方形の 1辺は 最大 何cm？`, g, 's5Gcd', { a: g * x, b: g * y, g });
}
MATH_STEPS.s5Gcd = (p) => { const { a, b, g } = p.params; return { value: g, lines: [
  '正方形の 1辺は、たても よこも わりきれる 数。いちばん 大きいのは 最大公約数', `${a}の 約数：${_divisors(a)}`, `${b}の 約数：${_divisors(b)}`, `共通で いちばん 大きい 約数 ＝ ${g}` ] }; };

function s5Speed() {
  lastMathType = 's5Speed';
  const v = _sOne([50, 60, 70, 80, 90, 100]), t = _sOne([10, 15, 20, 25, 30, 40]);
  return _sP(`分速 ${v}mで ${t}分 歩きました。\n何km 歩いた？`, _sDec((v * t) / 1000), 's5Speed', { v, t }, { inputType: 'text' });
}
MATH_STEPS.s5Speed = (p) => { const { v, t } = p.params; return { value: _sDec((v * t) / 1000), lines: [
  '道のり ＝ 速さ × 時間。まず m で もとめて、あとで km に なおそう', `${v} × ${t} = ${v * t}（m）`, '1km ＝ 1000m だから、1000で わるよ', `${v * t} ÷ 1000 = ${_sDec((v * t) / 1000)}（km）` ] }; };

function s5Pct() {
  lastMathType = 's5Pct';
  const total = _sOne([40, 50, 80, 120, 200, 250, 400]);
  const p = _sOne([10, 20, 25, 30, 40, 50, 60, 75]);
  if ((total * p) % 100 !== 0) return s5Pct();
  const n = (total * p) / 100;
  return _sP(`ある 数の ${p}％が ${n}です。\nある 数は いくつ？`, total, 's5Pct', { n, p });
}
MATH_STEPS.s5Pct = (p) => { const { n, p: pc } = p.params; const total = (n * 100) / pc; return { value: total, lines: [
  'もとに する 量 ＝ くらべる 量 ÷ 割合。％は 100で わって 割合に しよう', `${pc}％ ＝ ${pc / 100}`, `${n} ÷ ${pc / 100}`, `${n} ÷ ${pc / 100} = ${total}` ] }; };

function s5FracDec() {
  lastMathType = 's5FracDec';
  if (Math.random() < 0.5) {
    const d = _sOne([2, 4, 5, 8, 20, 25]);
    const n = randInt(1, d - 1);
    return _sP(`${n}/${d} を 小数で あらわすと？`, _sDec(n / d), 's5FracDec', { n, d }, { inputType: 'text' });
  }
  const t = _sOne([25, 35, 45, 55, 65, 75, 15, 5, 125, 375, 625]);   // 0.t
  const dec = t >= 100 ? t / 1000 : t / 100;
  const den = t >= 100 ? 1000 : 100;
  const red = reduceFraction(t, den);
  return _sP(`${_sDec(dec)}を 分数で あらわすと？\n（やくぶんした 分数で こたえてね）`, fractionToString(red), 's5FracDec', { dec, t, den }, { inputType: 'text', isFraction: true, answerType: 'reducedFraction' });
}
MATH_STEPS.s5FracDec = (p) => {
  const { n, d, dec, t, den } = p.params;
  if (n !== undefined) return { value: _sDec(n / d), lines: [
    '分数は、分子 ÷ 分母 と 同じ 意味だよ', `${n} ÷ ${d}`, 'わりきれるまで わり算を しよう（0.1、0.01 の くらいを つかう）', `${n}/${d} = ${n} ÷ ${d} = ${_sDec(n / d)}` ] };
  const red = reduceFraction(t, den);
  return { value: fractionToString(red), lines: [
    `小数を 分母が ${den}の 分数に しよう`, `${_sDec(dec)} ＝ ${t}/${den}`, `${t}/${den} を 約分（最大公約数は ${gcd(t, den)}）`, `${_sDec(dec)} ＝ ${fractionToString(red)}` ] };
};

function s5AvgNext() {
  lastMathType = 's5AvgNext';
  const n = randInt(3, 5), m = randInt(70, 85), t = m + randInt(1, 3);
  const need = (n + 1) * t - n * m;
  if (need > 100) return s5AvgNext();
  return _sP(`これまでの ${n}回の テストの 平均は ${m}点です。\nつぎの テストで 平均を ${t}点に するには、\n何点 とれば いい？`, need, 's5AvgNext', { n, m, t });
}
MATH_STEPS.s5AvgNext = (p) => { const { n, m, t } = p.params; const need = (n + 1) * t - n * m; return { value: need, lines: [
  '平均 × 回数 ＝ 合計。いまの 合計と、ほしい 合計を くらべよう', `いまの 合計：${m} × ${n} = ${m * n}（点）`, `ほしい 合計（${n + 1}回）：${t} × ${n + 1} = ${t * (n + 1)}（点）`, `${t * (n + 1)} － ${m * n} = ${need}` ] }; };

// ---------------- 6年 ----------------
function s6FracMul() {
  lastMathType = 's6FracMul';
  let a, b, c, d, num, den;
  do {
    b = randInt(2, 9); a = randInt(1, b - 1); d = randInt(2, 9); c = randInt(1, d - 1);
    num = a * c; den = b * d;
  } while (gcd(num, den) === 1 || gcd(a, b) !== 1 || gcd(c, d) !== 1);
  const red = reduceFraction(num, den);
  return _sP(`${a}/${b} × ${c}/${d} ＝ ？\n（やくぶんした 分数で こたえてね）`, fractionToString(red), 's6FracMul', { a, b, c, d }, { inputType: 'text', isFraction: true, answerType: 'reducedFraction' });
}
MATH_STEPS.s6FracMul = (p) => { const { a, b, c, d } = p.params; const red = reduceFraction(a * c, b * d); return { value: fractionToString(red), lines: [
  '分数の かけ算は、分子どうし・分母どうしを かけるよ', `分子：${a} × ${c} = ${a * c}、分母：${b} × ${d} = ${b * d}`, `${a * c}/${b * d} を 約分しよう（最大公約数は ${gcd(a * c, b * d)}）`, `${a}/${b} × ${c}/${d} = ${fractionToString(red)}` ] }; };

function s6Ratio() {
  lastMathType = 's6Ratio';
  let a, b;
  do { a = randInt(2, 5); b = randInt(2, 5); } while (a === b || !_sCoprime(a, b));
  const k = randInt(2, 8);
  return _sP(`男子と 女子の 人数の 比は ${a}：${b}です。\n全員で ${k * (a + b)}人のとき、男子は 何人？`, a * k, 's6Ratio', { a, b, k });
}
MATH_STEPS.s6Ratio = (p) => { const { a, b, k } = p.params; return { value: a * k, lines: [
  '比の 合計を もとに して、1あたりの 人数を もとめよう', `${a} ＋ ${b} = ${a + b}（全体は ${a + b}ぶん）`, `1ぶんは ${k * (a + b)} ÷ ${a + b} = ${k}（人）`, `男子は ${a}ぶんだから ${k} × ${a} = ${a * k}` ] }; };

function s6CircleArea() {
  lastMathType = 's6CircleArea';
  const r = randInt(2, 10);
  if (Math.random() < 0.5) {
    return _sP(`直径 ${r * 2}cmの 円の 面積は 何cm²？\n（円周率は 3.14）`, _sDec(r * r * 3.14), 's6CircleArea', { r }, { inputType: 'text' });
  }
  return _sP(`直径 ${r * 2}cmの 円を 半分に した 半円の 面積は 何cm²？\n（円周率は 3.14）`, _sDec((r * r * 3.14) / 2), 's6CircleArea', { r, half: true }, { inputType: 'text' });
}
MATH_STEPS.s6CircleArea = (p) => { const { r, half } = p.params; const whole = _sDec(r * r * 3.14); const v = half ? _sDec((r * r * 3.14) / 2) : whole; return { value: v, lines: [
  `直径 ${r * 2}cm だから 半径は ${r}cm。円の 面積 ＝ 半径 × 半径 × 円周率`, `${r} × ${r} = ${r * r}`, `${r * r} × 3.14 = ${whole}${half ? '（円ぜんぶの 面積）' : ''}`, half ? `${whole} ÷ 2 = ${v}` : `面積は ${v}cm²` ] }; };

function s6SpeedMin() {
  lastMathType = 's6SpeedMin';
  const v = _sOne([24, 36, 48, 60, 72]), m = _sOne([10, 15, 20, 30, 45]);
  return _sP(`時速 ${v}kmの 自動車が ${m}分 走ると、何km 進む？`, _sDec((v * m) / 60), 's6SpeedMin', { v, m }, { inputType: 'text' });
}
MATH_STEPS.s6SpeedMin = (p) => { const { v, m } = p.params; return { value: _sDec((v * m) / 60), lines: [
  '時速は 1時間（60分）あたりの 道のり。分を 時間に なおそう', `${m}分 ＝ ${m}/60 時間`, `${v} × ${m} ÷ 60`, `${v} × ${m} ÷ 60 = ${_sDec((v * m) / 60)}（km）` ] }; };

function s6Prop() {
  lastMathType = 's6Prop';
  if (Math.random() < 0.5) {
    const a = randInt(2, 6), k = randInt(2, 9);
    let c;
    do { c = randInt(2, 12); } while (c === a);
    return _sP(`x と y は 比例して います。\nx が ${a}のとき y は ${a * k}です。\nx が ${c}のとき、y は いくつ？`, k * c, 's6Prop', { a, k, c });
  }
  const a = randInt(2, 6), b = randInt(3, 12);          // 反比例：x × y ＝ ${a * b}
  const k = a * b;
  const cands = [];
  for (let c = 2; c <= 24; c++) if (k % c === 0 && c !== a) cands.push(c);
  if (cands.length === 0) return s6Prop();
  const c = _sOne(cands);
  return _sP(`x と y は 反比例して います。\nx が ${a}のとき y は ${b}です。\nx が ${c}のとき、y は いくつ？`, k / c, 's6Prop', { a, b, c, inv: true });
}
MATH_STEPS.s6Prop = (p) => {
  const { a, k, b, c, inv } = p.params;
  if (inv) return { value: (a * b) / c, lines: [
    '反比例では、x × y の 値が いつも 同じ', `x × y ＝ ${a} × ${b} ＝ ${a * b}`, `x が ${c}のとき ${c} × y ＝ ${a * b} だから y ＝ ${a * b} ÷ ${c}`, `${a * b} ÷ ${c} = ${(a * b) / c}` ] };
  return { value: k * c, lines: [
    '比例では、y ÷ x の 値が いつも 同じ（比例定数）', `y ÷ x ＝ ${a * k} ÷ ${a} ＝ ${k}`, `y ＝ ${k} × x だから、x が ${c}のとき ${k} × ${c}`, `${k} × ${c} = ${k * c}` ] };
};

function s6Eq() {
  lastMathType = 's6Eq';
  const p = randInt(2, 9), x = randInt(2, 9), q = randInt(1, Math.min(10, p * x - 1));
  return _sP(`${p} × x － ${q} ＝ ${p * x - q} のとき、\nx は いくつ？`, x, 's6Eq', { p, q, x });
}
MATH_STEPS.s6Eq = (p) => { const { p: a, q, x } = p.params; return { value: x, lines: [
  '先に「－ ○」を もとに もどして、かけ算の ぶぶんだけに しよう', `${a} × x ＝ ${a * x - q} ＋ ${q} ＝ ${a * x}`, `x ＝ ${a * x} ÷ ${a}`, `${a * x} ÷ ${a} = ${x}` ] }; };
