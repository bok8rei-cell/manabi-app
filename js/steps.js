// ===== 算数の「解き方」（なぜ）とヒントの材料 =====
// 問題の種類(problem.key)ごとに、考え方 → 途中の計算 → 答え、の順に並んだ行を作る。
// 作った答えが問題の答えと一致したときだけ使う（まちがった解き方は出さない）。
// ヒント：1回目＝考え方だけ／2回目＝考え方＋途中1／3回目＝答えの手前まで。「なぜ」：ぜんぶ。

const MATH_STEPS = {};

const _nums = (q) => (q.replace(/\n/g, ' ').match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
const _gcd = (a, b) => (b ? _gcd(b, a % b) : a);
const _dec = (x) => String(Math.round(x * 100) / 100);
const _red = (n, d) => { const g = _gcd(Math.abs(n), d); return d / g === 1 ? String(n / g) : `${n / g}/${d / g}`; };
const _firstMultiples = (a, n = 5) => Array.from({ length: n }, (_, i) => a * (i + 1)).join('、');
const _divisors = (a) => { const r = []; for (let i = 1; i <= a; i++) if (a % i === 0) r.push(i); return r.join('、'); };

// 学年に合わせた言い方（低学年はひらがな）
const _t = (grade, hira, kanji, from = 4) => (grade >= from ? kanji : hira);

// たし算・ひき算の「くらいごと」の説明（4年より下は「位」をひらがなに）
function _addLines(a, b, grade) {
  const P = _t(grade, 'くらい', '位');
  const ones = (a % 10) + (b % 10);
  return [
    `くらいを そろえて、一の${P}から じゅんに たそう`,
    `一の${P}：${a % 10} ＋ ${b % 10} = ${ones}${ones >= 10 ? `（10を こえたら となりの${P}へ くり上げ）` : ''}`,
    `十の${P}・百の${P}も おなじように たす（くり上がりを わすれずに）`,
    `${a} ＋ ${b} = ${a + b}`
  ];
}
function _subLines(a, b, grade) {
  const P = _t(grade, 'くらい', '位');
  return [
    `くらいを そろえて、一の${P}から じゅんに ひこう`,
    `一の${P}：${a % 10} － ${b % 10}${(a % 10) < (b % 10) ? `（ひけないときは となりの${P}から 10 かりる）` : ''}`,
    `十の${P}・百の${P}も おなじように ひく（くり下がりに 気をつけよう）`,
    `${a} － ${b} = ${a - b}`
  ];
}
function _arithLines(op, a, b, answer, grade) {
  const t = explainArith(op, a, b, answer, grade);
  return t ? t.split('\n') : [];
}

// ---- 1年・2年 ----
function _addGeneric(p, grade, word) {
  const n = _nums(p.question);
  const a = n[0], b = n[1];
  const sum = a + b;
  const lines = [word ? _t(grade, 'たしざんの もんだいだよ。あわせて いくつ？', 'たし算の もんだいだよ。あわせて いくつ？', 2) : _t(grade, 'たしざん：あわせた かずを もとめよう', 'たし算：あわせた かずを もとめよう', 2)];
  if (word) lines.push(`しき：${a} ＋ ${b}`);
  const body = _arithLines('+', a, b, sum, grade);
  if (body.length) lines.push(...body.slice(0, 2));
  else if (a >= 100 || b >= 100) lines.push(..._addLines(a, b, grade).slice(1, 3));
  lines.push(`${a} ＋ ${b} = ${sum}`);
  return { value: sum, lines };
}
function _subGeneric(p, grade, word) {
  const n = _nums(p.question);
  const a = n[0], b = n[1];
  const diff = a - b;
  const lines = [word ? _t(grade, 'ひきざんの もんだいだよ。のこりは いくつ？', 'ひき算の もんだいだよ。のこりは いくつ？', 2) : _t(grade, 'ひきざん：のこりの かずを もとめよう', 'ひき算：のこりの かずを もとめよう', 2)];
  if (word) lines.push(`しき：${a} － ${b}`);
  const body = _arithLines('-', a, b, diff, grade);
  if (body.length) lines.push(...body.slice(0, 2));
  else if (a >= 100) lines.push(..._subLines(a, b, grade).slice(1, 3));
  lines.push(`${a} － ${b} = ${diff}`);
  return { value: diff, lines };
}
MATH_STEPS.add = (p, g) => _addGeneric(p, g, false);
MATH_STEPS.bigAdd = (p, g) => _addGeneric(p, g, false);
MATH_STEPS.addWord = (p, g) => _addGeneric(p, g, true);
MATH_STEPS.bigAddWord = (p, g) => _addGeneric(p, g, true);
MATH_STEPS.add2 = (p, g) => _addGeneric(p, g, false);
MATH_STEPS.add3 = (p, g) => _addGeneric(p, g, false);
MATH_STEPS.addWord2 = (p, g) => _addGeneric(p, g, true);
MATH_STEPS.sub = (p, g) => _subGeneric(p, g, false);
MATH_STEPS.sub2 = (p, g) => _subGeneric(p, g, false);
MATH_STEPS.sub3 = (p, g) => _subGeneric(p, g, false);
MATH_STEPS.subWord = (p, g) => _subGeneric(p, g, true);
MATH_STEPS.subWord2 = (p, g) => _subGeneric(p, g, true);

MATH_STEPS.tens = (p) => {
  const a = _nums(p.question)[0];
  return { value: 10 - a, lines: ['10に なる かずを さがすよ', `${a} ＋ □ = 10`, `${a} の ほかに あと いくつで 10？`, `${a} ＋ ${10 - a} = 10`] };
};
MATH_STEPS.compare = (p) => {
  const m = p.question.match(/(\d+) と (\d+) では/);
  const a = Number(m[1]), b = Number(m[2]);
  const ans = a > b ? 'おおきい' : 'ちいさい';
  return { value: ans, lines: ['かずの おおきさを くらべよう', `${a} と ${b} を かずの ならびで みてみよう`, `${a}は ${b}より ${ans}`, `こたえは「${ans}」`] };
};

function _mulLines(a, b, grade) {
  return [
    _t(grade, 'かけ算：1つぶんの かず × いくつぶん', 'かけ算：1つ分の数 × いくつ分', 3),
    `${a}の だん（九九）で かんがえよう`,
    `${a}が ${b}こぶん → ${a}を ${b}かい たす`,
    `${a} × ${b} = ${a * b}`
  ];
}
MATH_STEPS.mul9 = (p, g) => { const [a, b] = _nums(p.question); return { value: a * b, lines: _mulLines(a, b, g) }; };
MATH_STEPS.mul = MATH_STEPS.mul9;
MATH_STEPS.mulWord2 = (p, g) => {
  const m = p.question.replace(/\n/g, ' ').match(/(\d+)(?:こ|まい|本)ずつ.*?(\d+)ふくろ/);
  const a = Number(m[1]), b = Number(m[2]);
  return { value: a * b, lines: ['1つの ふくろの かず × ふくろの かず で もとめよう', `しき：${a} × ${b}`, `${a}の だん（九九）で かんがえよう`, `${a} × ${b} = ${a * b}`] };
};
MATH_STEPS.lengthUnit = (p) => {
  const n = _nums(p.question);
  if (/mm/.test(p.question)) return { value: n[0] * 10, lines: ['1cm = 10mm だよ', `${n[0]}cm は 1cm が ${n[0]}こ分`, `${n[0]} × 10`, `${n[0]}cm = ${n[0] * 10}mm`] };
  return { value: n[0] * 100 + n[1], lines: ['1m = 100cm だよ', `${n[0]}m = ${n[0] * 100}cm`, `${n[0] * 100} ＋ ${n[1]}`, `${n[0]}m ${n[1]}cm = ${n[0] * 100 + n[1]}cm`] };
};
MATH_STEPS.minUnit = (p) => {
  const [h, m] = _nums(p.question);
  return { value: h * 60 + m, lines: ['1じかん = 60ふん だよ', `${h}じかん = ${h * 60}ふん`, `${h * 60} ＋ ${m}`, `${h}じかん ${m}ふん = ${h * 60 + m}ふん`] };
};
MATH_STEPS.volumeUnit = (p) => {
  const a = _nums(p.question)[0];
  if (/dL/.test(p.question)) return { value: a * 10, lines: ['1L = 10dL だよ', `${a}L は 1L が ${a}こ分`, `${a} × 10`, `${a}L = ${a * 10}dL`] };
  return { value: a * 1000, lines: ['1L = 1000mL だよ', `${a}L は 1L が ${a}こ分`, `${a} × 1000`, `${a}L = ${a * 1000}mL`] };
};
MATH_STEPS.fraction2 = (p) => {
  const n = Number(p.question.match(/(\d)つに/)[1]);
  return { value: `${n}分の1`, lines: ['まるを おなじ おおきさに わけた 1つぶんを 分数で いうよ', `${n}つに わけたから 「${n}分の」`, 'その 1つぶん だから 「1」をつけて', `${n}分の1`] };
};

// ---- 3年 ----
MATH_STEPS.div = (p) => {
  const [a, b] = _nums(p.question);
  const q = a / b;
  const third = (b <= 9 && q <= 9)
    ? `${b}の だん（九九）で さがす：${b} × ${q} = ${a}`
    : `ひっさんで、大きい くらいから じゅんに わろう（${b} × 10 や ${b} × 2 などを ためしてもよい）：${b} × ${q} = ${a}`;
  return { value: q, lines: ['わり算は かけ算で かんがえよう', `${b} × □ = ${a}`, third, `${a} ÷ ${b} = ${q}`] };
};
MATH_STEPS.div4 = MATH_STEPS.div;
MATH_STEPS.div2digit = MATH_STEPS.div;
MATH_STEPS.addsub = (p, g) => {
  const [a, b] = _nums(p.question);
  return /＋/.test(p.question) ? { value: a + b, lines: _addLines(a, b, g) } : { value: a - b, lines: _subLines(a, b, g) };
};
MATH_STEPS.visitWord = (p, g) => {
  const [a, b] = _nums(p.question);
  return { value: a + b, lines: ['あわせた ひとの かずは たし算で もとめよう', `しき：${a} ＋ ${b}`, ..._addLines(a, b, g).slice(1, 3), `${a} ＋ ${b} = ${a + b}`] };
};
MATH_STEPS.moneyWord = (p, g) => {
  const [a, b] = _nums(p.question);
  return { value: a - b, lines: ['のこりの お金 ＝ もっている お金 － つかった お金', `しき：${a} － ${b}`, ..._subLines(a, b, g).slice(1, 3), `${a} － ${b} = ${a - b}`] };
};
MATH_STEPS.priceWord = (p) => {
  const [, price, n] = _nums(p.question);
  return { value: price * n, lines: ['ねだん × こすう で もとめよう', `しき：${price} × ${n}`, `${price} は 10が ${price / 10}こ。${price / 10} × ${n} = ${(price / 10) * n}、10ばいして…`, `${price} × ${n} = ${price * n}`] };
};
MATH_STEPS.divWord = (p) => {
  const [a, b] = _nums(p.question);
  return { value: a / b, lines: ['おなじ かずずつ 分けるから わり算', `しき：${a} ÷ ${b}`, `${b} × □ = ${a} の □を さがす`, `${a} ÷ ${b} = ${a / b}`] };
};
MATH_STEPS.timesWord = (p) => {
  const [a, k] = _nums(p.question);
  return { value: a * k, lines: ['○ばいは、かけ算で もとめよう', `しき：${a} × ${k}`, `${a}cm が ${k}こ分`, `${a} × ${k} = ${a * k}`] };
};
MATH_STEPS.mulWord = (p) => {
  const m = p.question.replace(/\n/g, ' ').match(/に (\d+)こずつ.*?(\d+)箱/);
  const a = Number(m[1]), b = Number(m[2]);
  return { value: a * b, lines: ['1箱の こすう × 箱の かず で もとめよう', `しき：${a} × ${b}`, `${a} が ${b}こ分`, `${a} × ${b} = ${a * b}`] };
};
MATH_STEPS.unknown = (p) => {
  const q = p.question;
  const [b, c] = _nums(q);
  if (/＋/.test(q)) return { value: c - b, lines: ['たし算の □は、ひき算で もとめよう', `□ = ${c} － ${b}`, `${c} － ${b} を けいさん`, `□ = ${c - b}`] };
  return { value: c / b, lines: ['かけ算の □は、わり算で もとめよう', `□ = ${c} ÷ ${b}`, `${b}の だん（九九）で さがす`, `□ = ${c / b}`] };
};
MATH_STEPS.divRemainder = (p) => {
  const [a, b] = _nums(p.question);
  const c = Math.floor(a / b), r = a % b;
  return { value: `${c}あまり${r}`, lines: ['あまりのある わり算：かけ算で ちかい数を さがそう', `${b} × ${c} = ${b * c}（${a}を こえない いちばん 大きい数）`, `${a} － ${b * c} = ${r}（これが あまり）`, `${c}あまり${r}`] };
};
MATH_STEPS.divRem4 = MATH_STEPS.divRemainder;
MATH_STEPS.unit = (p) => {
  const q = p.question;
  const F = { m: 100, L: 1000, kg: 1000 };
  let m = q.match(/(\d+)(m|L|kg) は 何(cm|mL|g)/);
  if (m) { const v = Number(m[1]); return { value: v * F[m[2]], lines: ['たんいの かんけいを おもいだそう', `1${m[2]} = ${F[m[2]]}${m[3]}`, `${v} × ${F[m[2]]}`, `${v}${m[2]} = ${v * F[m[2]]}${m[3]}`] }; }
  m = q.match(/(\d+)(cm|mL|g) は 何(m|L|kg)/);
  const big = m[3], v = Number(m[1]);
  return { value: v / F[big], lines: ['たんいの かんけいを おもいだそう', `1${big} = ${F[big]}${m[2]}`, `${v} ÷ ${F[big]}`, `${v}${m[2]} = ${v / F[big]}${big}`] };
};
MATH_STEPS.time = (p) => {
  const m = p.question.match(/今、(\d+)時(\d+)分です。\s*(\d+)分後/);
  const h = Number(m[1]), mi = Number(m[2]), add = Number(m[3]);
  const total = h * 60 + mi + add;
  const nh = Math.floor(total / 60) % 24, nm = total % 60;
  return { value: `${nh}時${nm}分`, lines: ['60ふんで 1じかん。ふんが 60を こえたら じかんに くり上げよう', `${mi} ＋ ${add} = ${mi + add}ふん`, mi + add >= 60 ? `${mi + add}ふん = ${Math.floor((mi + add) / 60)}じかん ${(mi + add) % 60}ふん → ${h}時に ${Math.floor((mi + add) / 60)}じかん たして ${h + Math.floor((mi + add) / 60)}時` : '60ふん みまんだから、じかんは そのまま', `${nh}時${nm}分`] };
};
MATH_STEPS.decimal = (p, g) => {
  const [a, b] = _nums(p.question);
  const add = /＋/.test(p.question);
  const x = Math.round(a * 10), y = Math.round(b * 10);
  const val = add ? (x + y) / 10 : (x - y) / 10;
  return { value: _dec(val), lines: ['0.1が いくつ分か で かんがえよう', `${a} は 0.1が ${x}こ、${b} は 0.1が ${y}こ`, `${x} ${add ? '＋' : '－'} ${y} = ${add ? x + y : x - y}（0.1が ${add ? x + y : x - y}こ分）`, `${a} ${add ? '＋' : '－'} ${b} = ${_dec(val)}`] };
};

// ---- 4年 ----
MATH_STEPS.bigNumber = (p) => {
  const m = p.question.match(/(\d+)億(\d+)万/);
  const a = Number(m[1]), b = Number(m[2]);
  const total = a * 100000000 + b * 10000;
  return { value: total, lines: ['億は 1万の 10000ばい。くらいごとに 分けて 書こう', `${a}億 = ${a * 100000000}`, `${b}万 = ${b * 10000}`, `${a * 100000000} ＋ ${b * 10000} = ${total}`] };
};
MATH_STEPS.mul4 = (p) => {
  const [a, b] = _nums(p.question);
  const ones = b % 10, tens = Math.floor(b / 10) * 10;
  return { value: a * b, lines: ['ひっさん：下の数を 一の位と 十の位に 分けて かけよう', `${a} × ${ones} = ${a * ones}`, `${a} × ${tens} = ${a * tens}`, `${a * ones} ＋ ${a * tens} = ${a * b}`] };
};
MATH_STEPS.decAdd4 = (p) => {
  const [a, b] = _nums(p.question);
  const add = /＋/.test(p.question);
  const x = Math.round(a * 100), y = Math.round(b * 100);
  const val = add ? (x + y) / 100 : (x - y) / 100;
  return { value: _dec(val), lines: ['小数点の 位置を そろえて、100ばいした 整数で かんがえよう', `${a} → ${x}、${b} → ${y}`, `${x} ${add ? '＋' : '－'} ${y} = ${add ? x + y : x - y}`, `100でわって もとにもどす → ${_dec(val)}`] };
};
MATH_STEPS.decMul4 = (p) => {
  const [a, b] = _nums(p.question);
  const x = Math.round(a * 10);
  return { value: _dec(a * b), lines: ['0.1が いくつ分か で かんがえよう', `${a} は 0.1が ${x}こ`, `${x} × ${b} = ${x * b}（0.1が ${x * b}こ分）`, `${a} × ${b} = ${_dec(a * b)}`] };
};
MATH_STEPS.decDiv4 = (p) => {
  const [a, b] = _nums(p.question);
  const x = Math.round(a * 10);
  return { value: _dec(a / b), lines: ['0.1が いくつ分か で かんがえよう', `${a} は 0.1が ${x}こ`, `${x} ÷ ${b} = ${x / b}（0.1が ${x / b}こ分）`, `${a} ÷ ${b} = ${_dec(a / b)}`] };
};
MATH_STEPS.frac4 = (p) => {
  const m = p.question.match(/(\d+)\/(\d+) ([＋－]) (\d+)\/(\d+)/);
  const n1 = Number(m[1]), d = Number(m[2]), n2 = Number(m[4]);
  const add = m[3] === '＋';
  const num = add ? n1 + n2 : n1 - n2;
  return { value: `${num}/${d}`, lines: ['分母が おなじときは、分子だけを 計算しよう', `分母 ${d} は そのまま`, `分子：${n1} ${add ? '＋' : '－'} ${n2} = ${num}`, `${num}/${d}`] };
};
MATH_STEPS.order4 = (p) => {
  const q = p.question;
  const [a, b, c] = _nums(q);
  if (/^\(/.test(q)) return { value: (a + b) * c, lines: ['かっこの 中を さきに 計算しよう', `${a} ＋ ${b} = ${a + b}`, `${a + b} × ${c}`, `(${a} ＋ ${b}) × ${c} = ${(a + b) * c}`] };
  if (/＋/.test(q)) return { value: a + b * c, lines: ['かけ算を さきに 計算しよう', `${b} × ${c} = ${b * c}`, `${a} ＋ ${b * c}`, `${a} ＋ ${b} × ${c} = ${a + b * c}`] };
  return { value: a - b * c, lines: ['かけ算を さきに 計算しよう', `${b} × ${c} = ${b * c}`, `${a} － ${b * c}`, `${a} － ${b} × ${c} = ${a - b * c}`] };
};
MATH_STEPS.areaUnit4 = (p) => {
  const k = _nums(p.question)[0];
  return { value: k * 10000, lines: ['1m = 100cm だから、1m² は 100cm × 100cm', '1m² = 10000cm²', `${k} × 10000`, `${k}m² = ${k * 10000}cm²`] };
};
MATH_STEPS.area4 = (p) => {
  const m = p.question.match(/(\d+)cm/g).map(x => parseInt(x));
  if (/正方形/.test(p.question)) return { value: m[0] * m[0], lines: ['正方形の 面積 ＝ 1辺 × 1辺', `${m[0]} × ${m[0]}`, '1辺の 長さを 2回 かけるよ', `${m[0]} × ${m[0]} = ${m[0] * m[0]}`] };
  return { value: m[0] * m[1], lines: ['長方形の 面積 ＝ たて × よこ', `${m[0]} × ${m[1]}`, 'たての 長さと よこの 長さを かけるよ', `${m[0]} × ${m[1]} = ${m[0] * m[1]}`] };
};
MATH_STEPS.angle4 = (p) => {
  const a = Number(p.question.match(/(\d+)°/)[1]);
  return { value: 180 - a, lines: ['一直線に ならんだ 角を あわせると 180度', `もう一方の角は、180度から ${a}度を ひけば いいよ`, `180 － ${a}`, `180 － ${a} = ${180 - a}`] };
};
MATH_STEPS.round4 = (p) => {
  const n = _nums(p.question)[0];
  const hundred = /百の位/.test(p.question);
  const unit = hundred ? 100 : 1000;
  const lower = hundred ? Math.floor((n % 100) / 10) : Math.floor((n % 1000) / 100);
  return { value: Math.floor((n + unit / 2) / unit) * unit, lines: ['ししゃごにゅう：ひとつ 下の 位の 数字を 見て きめるよ', `${n} の ${hundred ? '十' : '百'}の位の 数字は ${lower}`, `${lower} が 5以上 → きりあげ、4以下 → きりすて`, `${n} → ${Math.floor((n + unit / 2) / unit) * unit}`] };
};
MATH_STEPS.divWord4 = MATH_STEPS.divWord;
MATH_STEPS.mulWord4 = (p) => {
  const [, price, n] = _nums(p.question);
  const ones = n % 10, tens = Math.floor(n / 10) * 10;
  return { value: price * n, lines: ['ねだん × こすう で もとめよう', `しき：${price} × ${n}`, `${price} × ${ones} = ${price * ones}、${price} × ${tens} = ${price * tens}`, `${price * ones} ＋ ${price * tens} = ${price * n}`] };
};

// ---- 5年 ----
MATH_STEPS.fraction = (p, g) => {
  const m = p.question.match(/(\d+)\/(\d+) ([＋－]) (\d+)\/(\d+)/);
  const n1 = Number(m[1]), d1 = Number(m[2]), n2 = Number(m[4]), d2 = Number(m[5]);
  const add = m[3] === '＋';
  const lcd = (d1 * d2) / _gcd(d1, d2);
  const a = (n1 * lcd) / d1, b = (n2 * lcd) / d2;
  const num = add ? a + b : a - b;
  return { value: _red(num, lcd), lines: ['分母が ちがうときは、通分（つうぶん）しよう', `${d1} と ${d2} の 最小公倍数 ＝ ${lcd}`, `${n1}/${d1} = ${a}/${lcd}、${n2}/${d2} = ${b}/${lcd}`, `分子を ${add ? 'たす' : 'ひく'}：${a} ${add ? '＋' : '－'} ${b} = ${num} → ${num}/${lcd} を 約分 → ${_red(num, lcd)}`] };
};
MATH_STEPS.decimalMul = MATH_STEPS.decMul4;
MATH_STEPS.decimalDiv = MATH_STEPS.decDiv4;
MATH_STEPS.percent = (p) => {
  const [total, pc] = _nums(p.question);
  return { value: (total * pc) / 100, lines: ['％は 100を もとにした わりあい', `${pc}％ ＝ ${pc}/100`, `${total} × ${pc} ÷ 100`, `${total} × ${pc} ÷ 100 = ${(total * pc) / 100}`] };
};
MATH_STEPS.area = (p) => {
  const q = p.question;
  const [a, b] = _nums(q);
  if (/三角形/.test(q)) return { value: (a * b) / 2, lines: ['三角形の 面積 ＝ 底辺 × 高さ ÷ 2', `${a} × ${b} = ${a * b}`, `${a * b} ÷ 2`, `${a} × ${b} ÷ 2 = ${(a * b) / 2}`] };
  return { value: a * b, lines: ['長方形の 面積 ＝ たて × よこ', `${a} × ${b}`, 'たての 長さと よこの 長さを かけるよ', `${a} × ${b} = ${a * b}`] };
};
MATH_STEPS.average = (p) => {
  const list = p.question.split(' の')[0].split('、').map(Number);
  const sum = list.reduce((x, y) => x + y, 0);
  return { value: sum / list.length, lines: ['平均 ＝ 合計 ÷ 個数', `合計：${list.join(' ＋ ')} = ${sum}`, `${sum} ÷ ${list.length}`, `${sum} ÷ ${list.length} = ${sum / list.length}`] };
};
MATH_STEPS.circle = (p) => {
  const r = _nums(p.question)[0];
  return { value: _dec(2 * r * 3.14), lines: ['円周 ＝ 直径 × 3.14（円周率）', `直径 ＝ 半径 × 2 ＝ ${2 * r}`, `${2 * r} × 3.14`, `${2 * r} × 3.14 = ${_dec(2 * r * 3.14)}`] };
};
MATH_STEPS.volume = (p) => {
  const [a, b, c] = _nums(p.question);
  return { value: a * b * c, lines: ['体積 ＝ たて × よこ × 高さ', `${a} × ${b} = ${a * b}`, `${a * b} × ${c}`, `${a} × ${b} × ${c} = ${a * b * c}`] };
};
MATH_STEPS.oddEven = (p) => {
  const n = _nums(p.question)[0];
  const ans = n % 2 === 0 ? '偶数（ぐうすう）' : '奇数（きすう）';
  return { value: ans, lines: ['2で わりきれる数が 偶数、あまる数が 奇数', `一の位の 数字に 注目：${n % 10}`, '一の位が 0・2・4・6・8 なら 偶数', `${n} は ${ans}`] };
};
MATH_STEPS.lcm = (p) => {
  const [a, b] = _nums(p.question);
  return { value: (a * b) / _gcd(a, b), lines: ['2つの数の 倍数を ならべて、はじめて おなじに なる数を さがそう', `${a}の倍数：${_firstMultiples(a, 6)}…`, `${b}の倍数：${_firstMultiples(b, 6)}…`, `最小公倍数 ＝ ${(a * b) / _gcd(a, b)}`] };
};
MATH_STEPS.gcd5 = (p) => {
  const [a, b] = _nums(p.question);
  return { value: _gcd(a, b), lines: ['2つの数を わりきれる数（公約数）の いちばん 大きいものを さがそう', `${a}の約数：${_divisors(a)}`, `${b}の約数：${_divisors(b)}`, `最大公約数 ＝ ${_gcd(a, b)}`] };
};
MATH_STEPS.speedWord = (p) => {
  const [v, h] = _nums(p.question);
  return { value: v * h, lines: ['道のり ＝ 速さ × 時間', `しき：${v} × ${h}`, `時速 ${v}km は 1時間に ${v}km 進む。${h}時間ぶん`, `${v} × ${h} = ${v * h}`] };
};
MATH_STEPS.discount = (p) => {
  const [price, pc] = _nums(p.question);
  const pay = (price * (100 - pc)) / 100;
  return { value: pay, lines: [`${pc}％引き ＝ 定価の ${100 - pc}％ を はらう`, `${100 - pc}％ ＝ ${100 - pc}/100`, `${price} × ${100 - pc} ÷ 100`, `${price} × ${100 - pc} ÷ 100 = ${pay}`] };
};
MATH_STEPS.density = (p) => {
  const [area, total] = _nums(p.question);
  return { value: total / area, lines: ['人口みつど ＝ 人口 ÷ 面積', `しき：${total} ÷ ${area}`, `${area} × □ = ${total} の □を さがす`, `${total} ÷ ${area} = ${total / area}`] };
};

// ---- 6年 ----
MATH_STEPS.fracMul6 = (p) => {
  const m = p.question.match(/(\d+)\/(\d+) × (\d+)\/(\d+)/);
  const [n1, d1, n2, d2] = m.slice(1).map(Number);
  return { value: _red(n1 * n2, d1 * d2), lines: ['分数 × 分数：分母どうし、分子どうしを かける', `分子：${n1} × ${n2} = ${n1 * n2}`, `分母：${d1} × ${d2} = ${d1 * d2}`, `${n1 * n2}/${d1 * d2} を 約分 → ${_red(n1 * n2, d1 * d2)}`] };
};
MATH_STEPS.fracDiv6 = (p) => {
  const m = p.question.match(/(\d+)\/(\d+) ÷ (\d+)\/(\d+)/);
  const [n1, d1, n2, d2] = m.slice(1).map(Number);
  return { value: _red(n1 * d2, d1 * n2), lines: ['わる分数を ひっくりかえして かけよう', `${n1}/${d1} ÷ ${n2}/${d2} ＝ ${n1}/${d1} × ${d2}/${n2}（わる数の 分母と分子を いれかえた数を かける）`, `分子：${n1} × ${d2} = ${n1 * d2}、分母：${d1} × ${n2} = ${d1 * n2}`, `${n1 * d2}/${d1 * n2} を 約分 → ${_red(n1 * d2, d1 * n2)}`] };
};
MATH_STEPS.literal6 = (p) => {
  const m = p.question.replace(/\n/g, ' ').match(/x = (\d+) のとき、\s*(\d+)x ＋ (\d+)/);
  const x = Number(m[1]), a = Number(m[2]), b = Number(m[3]);
  return { value: a * x + b, lines: ['文字 x に 数を 入れて 計算しよう', `${a}x ＋ ${b} の x に ${x} を 入れる → ${a} × ${x} ＋ ${b}`, `${a} × ${x} = ${a * x}`, `${a * x} ＋ ${b} = ${a * x + b}`] };
};
MATH_STEPS.prop6 = (p) => {
  const [x1, y1, x2] = _nums(p.question.replace('y は x に', ''));
  const a = y1 / x1;
  return { value: a * x2, lines: ['比例：y ＝ きまった数 × x', `きまった数 ＝ ${y1} ÷ ${x1} ＝ ${a}`, `y ＝ ${a} × ${x2}`, `y = ${a * x2}`] };
};
MATH_STEPS.inverse6 = (p) => {
  const [x1, y1, x2] = _nums(p.question);
  const k = x1 * y1;
  return { value: k / x2, lines: ['反比例：x × y ＝ きまった数', `きまった数 ＝ ${x1} × ${y1} ＝ ${k}`, `y ＝ ${k} ÷ ${x2}`, `y = ${k / x2}`] };
};
MATH_STEPS.ratio6 = (p) => {
  const m = p.question.match(/(\d+):(\d+)/);
  const a = Number(m[1]), b = Number(m[2]);
  const g = _gcd(a, b);
  return { value: `${a / g}:${b / g}`, lines: ['比を かんたんにするには、両方を おなじ数で わろう', `${a} と ${b} の 最大公約数 ＝ ${g}`, `${a} ÷ ${g} ＝ ${a / g}、${b} ÷ ${g} ＝ ${b / g}`, `${a / g}:${b / g}`] };
};
MATH_STEPS.ratioVal6 = (p) => {
  const m = p.question.match(/(\d+):(\d+)/);
  const a = Number(m[1]), b = Number(m[2]);
  return { value: _red(a, b), lines: ['比の値 ＝ 前の数 ÷ 後の数', `${a}:${b} ＝ ${a} ÷ ${b}`, `分数で ${a}/${b}`, `約分して ${_red(a, b)}`] };
};
MATH_STEPS.circleArea6 = (p) => {
  const r = _nums(p.question)[0];
  return { value: _dec(r * r * 3.14), lines: ['円の面積 ＝ 半径 × 半径 × 3.14', `${r} × ${r} = ${r * r}`, `${r * r} × 3.14`, `${r * r} × 3.14 = ${_dec(r * r * 3.14)}`] };
};
MATH_STEPS.prism6 = (p) => {
  const [s, h] = _nums(p.question);
  return { value: s * h, lines: ['角柱の体積 ＝ 底面積 × 高さ', `しき：${s} × ${h}`, `底面積 ${s}cm² が 高さ ${h}cm ぶん つみかさなる`, `${s} × ${h} = ${s * h}`] };
};
MATH_STEPS.speed6 = (p) => {
  const [d, t] = _nums(p.question);
  return { value: d / t, lines: ['速さ ＝ 道のり ÷ 時間', `しき：${d} ÷ ${t}`, `${t} × □ = ${d} の □を さがす`, `${d} ÷ ${t} = ${d / t}`] };
};
MATH_STEPS.time6 = (p) => {
  const [v, d] = _nums(p.question);
  return { value: d / v, lines: ['時間 ＝ 道のり ÷ 速さ', `しき：${d} ÷ ${v}`, `${v} × □ = ${d} の □を さがす`, `${d} ÷ ${v} = ${d / v}`] };
};
MATH_STEPS.median6 = (p) => {
  const list = p.question.split(' の')[0].split('、').map(Number);
  const sorted = list.slice().sort((x, y) => x - y);
  const mid = sorted[(list.length - 1) / 2];
  return { value: mid, lines: ['中央値 ＝ 小さい順に ならべた ときの まん中の数', `ならべかえる：${sorted.join('、')}`, `${list.length}こ だから、${(list.length + 1) / 2}ばんめが まん中`, `中央値 ＝ ${mid}`] };
};
MATH_STEPS.mode6 = (p) => {
  const list = p.question.split(' の')[0].split('、').map(Number);
  const cnt = {};
  list.forEach(x => { cnt[x] = (cnt[x] || 0) + 1; });
  const max = Math.max(...Object.values(cnt));
  const mode = Number(Object.keys(cnt).find(k => cnt[k] === max));
  return { value: mode, lines: ['最頻値（さいひんち）＝ いちばん 多く 出てくる数', `それぞれ 何こ あるか 数えよう：${Object.keys(cnt).map(k => `${k}が ${cnt[k]}こ`).join('、')}`, `いちばん 多いのは ${mode}（${max}こ）`, `最頻値 ＝ ${mode}`] };
};
MATH_STEPS.perm6 = (p) => {
  const n = /4人/.test(p.question) ? 4 : 3;
  const val = n === 4 ? 24 : 6;
  return { value: val, lines: ['ならび方は、1ばんめ・2ばんめ…と じゅんに 考えよう', `1ばんめは ${n}とおり`, `2ばんめは ${n - 1}とおり${n === 4 ? '、3ばんめは 2とおり' : ''}`, `${n === 4 ? '4 × 3 × 2 × 1' : '3 × 2 × 1'} = ${val}`] };
};
MATH_STEPS.comb6 = (p) => {
  const n = _nums(p.question)[0];
  const val = (n * (n - 1)) / 2;
  return { value: val, lines: ['しあいの 組み合わせを 数えよう', `1チームが しあいする あいては ${n - 1}チーム`, `${n}チーム × ${n - 1}しあい ＝ ${n * (n - 1)}（おなじ しあいを 2回 数えている）`, `${n * (n - 1)} ÷ 2 = ${val}`] };
};

// ---- 中1 ----
MATH_STEPS.negAddSub = (p) => {
  const m = p.question.match(/\((-?\d+)\) ([＋－]) \((-?\d+)\)/);
  const a = Number(m[1]), b = Number(m[3]);
  const add = m[2] === '＋';
  const val = add ? a + b : a - b;
  const lines = ['かっこを はずして、ふごうに 気をつけて 計算しよう'];
  if (add) {
    lines.push(`(${a}) ＋ (${b}) ＝ ${a} ＋ (${b})`);
    lines.push(a >= 0 === b >= 0 ? 'ふごうが おなじ → 絶対値を たして、おなじ ふごう' : 'ふごうが ちがう → 絶対値の 大きい方から 小さい方を ひいて、大きい方の ふごう');
  } else {
    lines.push(`ひき算は、ひく数の ふごうを かえて たし算に する：(${a}) － (${b}) ＝ (${a}) ＋ (${-b})`);
    lines.push('たし算の ルールで 計算する');
  }
  lines.push(`答え：${val}`);
  return { value: val, lines };
};
MATH_STEPS.negMulDiv = (p) => {
  const m = p.question.match(/\((-?\d+)\) ([×÷]) \((-?\d+)\)/);
  const a = Number(m[1]), b = Number(m[3]);
  const mul = m[2] === '×';
  const val = mul ? a * b : a / b;
  return { value: val, lines: ['まず ふごうを きめる：おなじ ふごうなら ＋、ちがう ふごうなら －', `${a} と ${b} は ${(a >= 0) === (b >= 0) ? 'おなじ ふごう → ＋' : 'ちがう ふごう → －'}`, `絶対値で 計算：${Math.abs(a)} ${m[2]} ${Math.abs(b)} = ${Math.abs(val)}`, `答え：${val}`] };
};
MATH_STEPS.literalSimplify = (p) => {
  const m = p.question.match(/(\d+)x ([＋－]) (\d+)x/);
  const a = Number(m[1]), b = Number(m[3]);
  const add = m[2] === '＋';
  return { value: p.answer, lines: ['x の 部分が おなじなら、係数（x の まえの数）だけを 計算しよう', `係数：${a} ${add ? '＋' : '－'} ${b} = ${add ? a + b : a - b}`, 'x は そのまま つける', `答え：${p.answer}`] };
};
MATH_STEPS.literalSubstitute = (p) => {
  const m = p.question.replace(/\n/g, ' ').match(/x = (-?\d+) のとき、\s*(\d+)x ([＋－]) (\d+)/);
  const x = Number(m[1]), a = Number(m[2]), b = Number(m[4]);
  const val = a * x + (m[3] === '＋' ? b : -b);
  return { value: val, lines: ['文字に 数を 入れて 計算しよう（マイナスは かっこを つける）', `${a}x に x = ${x} を 入れる：${a} × (${x}) = ${a * x}`, `${a * x} ${m[3]} ${b}`, `答え：${val}`] };
};
MATH_STEPS.equation = (p) => {
  const m = p.question.replace(/\n/g, ' ').match(/(\d+)x ([＋－]) (\d+) = (-?\d+)/);
  const a = Number(m[1]), b = m[2] === '＋' ? Number(m[3]) : -Number(m[3]), c = Number(m[4]);
  const x = (c - b) / a;
  return { value: x, lines: ['x の 項を 左に、数を 右に うつして（移項して）かんがえよう', `${a}x ＝ ${c} － (${b}) ＝ ${c - b}`, `x ＝ ${c - b} ÷ ${a}`, `x = ${x}`] };
};
MATH_STEPS.proportion = (p) => {
  const q = p.question.replace(/\n/g, ' ');
  const n = _nums(q);
  if (/反比例/.test(q)) {
    const [x1, y1, x2] = n;
    const k = x1 * y1;
    return { value: k / x2, lines: ['反比例：x × y ＝ きまった数（比例定数）', `きまった数 ＝ ${x1} × ${y1} ＝ ${k}`, `y ＝ ${k} ÷ ${x2}`, `y = ${k / x2}`] };
  }
  const [x1, y1, x2] = n;
  const a = y1 / x1;
  return { value: a * x2, lines: ['比例：y ＝ a x（a は 比例定数）', `a ＝ ${y1} ÷ ${x1} ＝ ${a}`, `y ＝ ${a} × ${x2}`, `y = ${a * x2}`] };
};
MATH_STEPS.absValue = (p) => {
  const a = Number(p.question.match(/\| (-?\d+) \|/)[1]);
  return { value: Math.abs(a), lines: ['絶対値 ＝ 0から その数までの きょり（ふごうを とった 数）', `${a} は 0 から ${Math.abs(a)} はなれている`, 'きょりだから、いつも 0 か 正の数', `| ${a} | = ${Math.abs(a)}`] };
};
MATH_STEPS.expand = (p) => {
  const m = p.question.match(/(\d+)\(x ＋ (\d+)\)/);
  const a = Number(m[1]), b = Number(m[2]);
  return { value: p.answer, lines: ['分配法則：かっこの 中の ぜんぶに かけよう', `${a} × x ＝ ${a}x`, `${a} × ${b} ＝ ${a * b}`, `答え：${a}x＋${a * b}`] };
};
MATH_STEPS.tempWord = (p) => {
  const q = p.question.replace(/\n/g, ' ');
  const m = q.match(/気温は (－?)(\d+)℃/);
  const a = (m[1] ? -1 : 1) * Number(m[2]);
  const up = /上がり/.test(q);
  const b = Number(q.match(/(\d+)℃(上|下)/)[1]) * (up ? 1 : -1);
  return { value: a + b, lines: ['気温が 上がったら ＋、下がったら － を たそう', `${a} ${up ? '＋' : '－'} ${Math.abs(b)}`, `数直線で ${a} から ${up ? '右' : '左'}へ ${Math.abs(b)} すすむ`, `答え：${a + b}`] };
};
MATH_STEPS.eqWord = (p) => {
  const [a, b, c] = _nums(p.question);
  return { value: (c - b) / a, lines: ['ある数を x として、式を つくろう', `${a}x ＋ ${b} ＝ ${c}`, `${a}x ＝ ${c} － ${b} ＝ ${c - b}`, `x ＝ ${c - b} ÷ ${a} ＝ ${(c - b) / a}`] };
};
MATH_STEPS.expressWord = (p) => {
  const m = p.question.replace(/\n/g, ' ').match(/1個 (\d+)円.*?(\d+)円の箱/);
  const a = Number(m[1]), b = Number(m[2]);
  return { value: `${a}x+${b}`, lines: ['代金 ＝ りんごの 代金 ＋ 箱の 代金', `りんごの 代金：${a}円 × x個 ＝ ${a}x`, `箱の 代金：${b}円`, `答え：${a}x+${b}`] };
};

// ---- ヒントの上限（答えが「ことばを かえて」出てしまう種類は、手前で止める）----
// 小数は「0.1が ○こ分」、分数・比・式・あまり・時刻は 途中の計算で、答えが分かってしまうため
const MATH_HINT_MAX = {
  decimal: 2, decMul4: 2, decDiv4: 2, decAdd4: 2, decimalMul: 2, decimalDiv: 2,
  divRemainder: 2, divRem4: 2, frac4: 2, ratio6: 2, fracMul6: 2, fracDiv6: 2, negMulDiv: 2, time: 2,
  literalSimplify: 1, expand: 1, expressWord: 1, oddEven: 1, ratioVal6: 1
};

// ---- 外から使う入口 ----
// 問題の「解き方」の行（なければ null）。答えが一致しないときは null。
function mathSteps(problem, grade) {
  if (!problem || problem.key === undefined || !MATH_STEPS[problem.key]) return null;
  try {
    const r = MATH_STEPS[problem.key](problem, grade);
    if (!r || !Array.isArray(r.lines) || r.lines.length < 2) return null;
    if (String(r.value) !== String(problem.answer)) return null;
    if (MATH_HINT_MAX[problem.key] !== undefined) r.lines.hintMax = MATH_HINT_MAX[problem.key];
    // 時こく：くり上がりが ないときは、ふんの計算で 答えが ほぼ決まるので ヒントは 1回だけ
    if (problem.key === 'time' && !/→/.test(r.lines[2] || '')) r.lines.hintMax = 1;
    return r.lines;
  } catch (e) {
    return null;
  }
}

// 文の中に 答えが そのまま出てくるか（数字は、前後が数字のときは ちがうものとして あつかう）
function _containsAnswer(text, answer) {
  const a = String(answer).trim();
  if (!a) return false;
  const esc = a.replace(/[.*+?^${}()|[\]\\/-]/g, '\\$&');
  if (/^-?\d+(\.\d+)?$/.test(a)) return new RegExp('(^|[^0-9.])' + esc + '($|[^0-9.])').test(text);
  if (/^-?\d+\/\d+$/.test(a)) return new RegExp('(^|[^0-9/])' + esc + '($|[^0-9/])').test(text);
  return text.indexOf(a) >= 0;
}

// 答えが出てしまう手前まで、ヒントを何回 出せるか（0〜3）
function hintPlan(lines, answer) {
  const most = Math.min(3, lines.length - 1, lines.hintMax === undefined ? 3 : lines.hintMax);
  for (let k = 1; k <= most; k++) {
    if (_containsAnswer(lines.slice(0, k).join('\n'), answer)) return k - 1;
  }
  return most;
}

// ヒントの段階（1〜3）で見せる行：1回目＝考え方だけ／2回目＝考え方＋途中1／3回目＝考え方＋途中2
function hintLines(lines, stage) {
  return lines.slice(0, Math.max(1, stage));
}
