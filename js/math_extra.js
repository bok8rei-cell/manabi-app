// ===== 算数：1年・5年の はんぷく練習用 追加もんだい（v43.0）=====
// 1年：くりあがり・くりさがりの たしざん・ひきざんを、いろいろな かたちで くりかえし 練習できるように
// 5年：小数×小数・小数÷小数・平均・体積・分数の たし算ひき算 を、文章題や 逆むきの もんだいも ふくめて ふやす
// 問題を作る genExtra1 / genExtra5 は math.js の genGrade1 / genGrade5 から呼ばれる。
// 「解き方」（ヒント・解説）は MATH_STEPS に 登録（答えが 一致したときだけ 使われる）。

Object.assign(MATH_UNIT_LABELS, {
  add3term: '3つの たしざん', bigSub: 'くりさがりの ひきざん', bigSubWord: 'くりさがりの もんだい',
  bigAddBlank: 'くりあがりの たしざん', bigAddWord2: 'くりあがりの もんだい',
  decimalMul2: '小数のかけ算', decimalDiv2: '小数のわり算', decimalMulWord: '小数のかけ算',
  averageWord: '平均', averageSum: '平均', volumeCube: '体積', volumeL: '体積', volumeH: '体積',
  fractionWord: '分数のたし算ひき算', fracReduce: '約分'
});
Object.assign(MATH_HINT_MAX, { decimalMul2: 1, decimalDiv2: 2, decimalMulWord: 2, fractionWord: 2, fracReduce: 2 });

const _xPick = (arr) => arr[randInt(0, arr.length - 1)];
const _xDec = (x) => String(Math.round(x * 100) / 100);

// ---------------- 1年 ----------------
function genExtra1(type, diff) {
  if (type === 'bigAddBlank') {          // 5 ＋ □ ＝ 12（くりあがり・ぎゃくむき）
    const a = diff === 2 ? randInt(6, 9) : randInt(4, 9);
    const b = randInt(Math.max(1, 10 - a + 1), 9);
    return { question: `${a} ＋ □ ＝ ${a + b}\n□に はいる かずは？`, type: 'input', inputType: 'number', answer: `${b}` };
  }
  if (type === 'add3term') {             // 3つの たしざん
    let a, b, c;
    do { a = randInt(2, 9); b = randInt(2, 9); c = randInt(1, 9); } while (a + b + c > 20 || a + b + c < 11);
    return { question: `${a} ＋ ${b} ＋ ${c} = ？`, type: 'input', inputType: 'number', answer: `${a + b + c}` };
  }
  if (type === 'bigSub') {               // くりさがり：13 － 8 など
    const a = randInt(11, 18);
    const b = randInt(a - 10 + 1, 9);
    return { question: `${a} － ${b} = ？`, type: 'input', inputType: 'number', answer: `${a - b}` };
  }
  if (type === 'bigAddWord2') {          // 2つの なかまを あわせる ぶんしょうだい
    const items = [
      ['あかい はな', 'しろい はな', '本', 'あります'], ['おとこのこ', 'おんなのこ', 'にん', 'います'], ['みかん', 'りんご', 'こ', 'あります'],
      ['あおい シール', 'きいろい シール', 'まい', 'あります'], ['いぬ', 'ねこ', 'ひき', 'います']
    ];
    const [x, y, unit, verb] = _xPick(items);
    const a = randInt(5, 9), b = randInt(Math.max(2, 11 - a), 9);
    const q = _xPick([
      `${x}が ${a}${unit}、\n${y}が ${b}${unit} ${verb}。\nあわせて なん${unit}？`,
      `${x}が ${a}${unit}、\n${y}が ${b}${unit} ${verb}。\nぜんぶで なん${unit}？`
    ]);
    return { question: q, type: 'input', inputType: 'number', answer: `${a + b}` };
  }
  if (type === 'bigSubWord') {           // 10を こえる かずから ひく ぶんしょうだい
    const items = [['あめ', 'こ', 'たべました'], ['シール', 'まい', 'つかいました'], ['どんぐり', 'こ', 'あげました'], ['いろがみ', 'まい', 'つかいました']];
    const [name, unit, verb] = _xPick(items);
    const a = randInt(11, 17), b = randInt(a - 10 + 1, 9);
    return { question: `${name}が ${a}${unit}ありました。\n${b}${unit} ${verb}。\nのこりは なん${unit}？`, type: 'input', inputType: 'number', answer: `${a - b}` };
  }
  return null;
}

MATH_STEPS.bigAddBlank = (p) => {
  const [a, sum] = _nums(p.question);
  const b = sum - a;
  const need = 10 - a;
  return { value: b, lines: [
    `□は、たして ${sum}に なる かずを さがすよ`,
    `${a}に あと いくつで 10に なる？ → ${need}`,
    `${sum}は 10と ${sum - 10}。${b}を ${need}と ${b - need}に わけて かんがえよう`,
    `${a} ＋ ${b} = ${sum}`
  ] };
};
MATH_STEPS.add3term = (p) => {
  const [a, b, c] = _nums(p.question);
  return { value: a + b + c, lines: [
    '3つの かずを じゅんに たそう。まえの 2つを さきに たすよ',
    `${a} ＋ ${b} = ${a + b}`,
    `つぎに ${a + b} ＋ ${c} を たそう`,
    `${a} ＋ ${b} ＋ ${c} = ${a + b + c}`
  ] };
};
MATH_STEPS.bigSub = (p) => {
  const [a, b] = _nums(p.question);
  const t = a - 10;
  return { value: a - b, lines: [
    'くりさがり：10から ひく かんがえかたを つかうよ',
    `${a}を 10と ${t}に わける`,
    `10 － ${b} = ${10 - b}`,
    `${10 - b} ＋ ${t} = ${a - b}。${a} － ${b} = ${a - b}`
  ] };
};
MATH_STEPS.bigAddWord2 = (p, g) => {
  const [a, b] = _nums(p.question);
  const lines = ['ふたつの なかまを あわせるから、たしざんだよ', `しき：${a} ＋ ${b}`];
  const body = explainArith('+', a, b, a + b, g);
  if (body) lines.push(...body.split('\n').slice(0, 2));
  lines.push(`${a} ＋ ${b} = ${a + b}`);
  return { value: a + b, lines };
};
MATH_STEPS.bigSubWord = (p) => {
  const [a, b] = _nums(p.question);
  const t = a - 10;
  return { value: a - b, lines: [
    'のこりを もとめるから、ひきざんだよ',
    `しき：${a} － ${b}`,
    `${a}を 10と ${t}に わけて、10 － ${b} = ${10 - b}、${10 - b} ＋ ${t}`,
    `${a} － ${b} = ${a - b}`
  ] };
};

// ---------------- 5年 ----------------
function genExtra5(type, diff) {
  if (type === 'decimalMul2') {          // 小数 × 小数
    const A = randInt(12, 99), B = randInt(2, 99);
    if (A % 10 === 0 || B % 10 === 0) return genExtra5(type, diff);
    const a = A / 10, b = B / 10;
    return { question: `${a} × ${b} = ？`, type: 'input', inputType: 'text', answer: _xDec((A * B) / 100) };
  }
  if (type === 'decimalDiv2') {          // 小数 ÷ 小数（わりきれる）
    const bTen = diff === 2 ? _xPick([12, 15, 16, 18, 24, 25]) : randInt(2, 9);   // わる数 ＝ bTen / 10（ふつうは 0.2〜0.9）
    const q = randInt(2, 15);
    const a = (bTen * q) / 10;
    const b = bTen / 10;
    return { question: `${_xDec(a)} ÷ ${b} = ？`, type: 'input', inputType: 'text', answer: `${q}` };
  }
  if (type === 'decimalMulWord') {       // 1mの ねだん × 長さ
    const price = _xPick([80, 120, 150, 160, 240, 250, 350]);
    const len = _xPick([1.5, 2.5, 0.5, 3.5, 1.2, 2.2, 4.5]);
    return {
      question: `ひもを 1m 買うと ${price}円です。\n${len}m 買うと、代金は 何円？`,
      type: 'input', inputType: 'text', answer: _xDec(price * len)
    };
  }
  if (type === 'averageWord') {          // テストの 点の 平均
    const n = _xPick([3, 4, 5]);
    const nums = [];
    for (let i = 0; i < n - 1; i++) nums.push(randInt(60, 100));
    const part = nums.reduce((s, x) => s + x, 0);
    const lasts = [];
    for (let x = 60; x <= 100; x++) if ((part + x) % n === 0) lasts.push(x);
    nums.push(_xPick(lasts));
    const sum = nums.reduce((s, x) => s + x, 0);
    return { question: `${n}回の テストの 点は、${nums.join('点、')}点でした。\n平均は 何点？`, type: 'input', inputType: 'number', answer: `${sum / n}` };
  }
  if (type === 'averageSum') {           // 平均 → 合計
    const n = _xPick([3, 4, 5]);
    const m = randInt(60, 95);
    return { question: `${n}回の テストの 平均が ${m}点でした。\n${n}回の 合計は 何点？`, type: 'input', inputType: 'number', answer: `${n * m}` };
  }
  if (type === 'volumeCube') {           // 立方体の 体積
    const a = randInt(2, 9);
    return { question: `1辺が ${a}cmの 立方体の 体積は 何cm³？`, type: 'input', inputType: 'number', answer: `${a * a * a}` };
  }
  if (type === 'volumeL') {              // cm³ → L
    const a = _xPick([10, 20]), b = _xPick([10, 20, 50]), c = _xPick([10, 15, 20, 25, 30, 40, 50]);
    return {
      question: `たて ${a}cm、よこ ${b}cm、高さ ${c}cmの 水そうに 入る 水は 何L？\n（1L ＝ 1000cm³）`,
      type: 'input', inputType: 'text', answer: _xDec((a * b * c) / 1000)
    };
  }
  if (type === 'volumeH') {              // 体積から 高さ
    const a = randInt(2, 9), b = randInt(2, 9), c = randInt(2, 9);
    return { question: `体積が ${a * b * c}cm³で、たてが ${a}cm、よこが ${b}cmの 直方体が あります。\n高さは 何cm？`, type: 'input', inputType: 'number', answer: `${c}` };
  }
  if (type === 'fractionWord') {         // 分数の 文章題（たす・ひく）
    const ds = [2, 3, 4, 5, 6, 8];
    const d1 = _xPick(ds);
    const d2 = _xPick(ds.filter(d => d !== d1));
    const n1 = randInt(1, d1 - 1), n2 = randInt(1, d2 - 1);
    const lcd = (d1 * d2) / gcd(d1, d2);
    if (Math.random() < 0.5) {
      const num = n1 * (lcd / d1) + n2 * (lcd / d2);
      if (num > lcd) return genExtra5(type, diff);    // 1より 大きく なる 組は 出さない（帯分数・仮分数の まよいを さける）
      return {
        question: `牛乳が ${n1}/${d1}L と ${n2}/${d2}L あります。\nあわせて 何L？\n（やくぶんした ぶんすうで こたえてね）`,
        type: 'input', inputType: 'text', answer: fractionToString(reduceFraction(num, lcd)), isFraction: true, answerType: 'reducedFraction'
      };
    }
    let [bn, bd, sn, sd] = [n1, d1, n2, d2];
    if (n1 / d1 < n2 / d2) [bn, bd, sn, sd] = [n2, d2, n1, d1];
    if (bn / bd === sn / sd) return genExtra5(type, diff);
    const num = bn * (lcd / bd) - sn * (lcd / sd);
    return {
      question: `ジュースが ${bn}/${bd}L ありました。${sn}/${sd}L のむと、のこりは 何L？\n（やくぶんした ぶんすうで こたえてね）`,
      type: 'input', inputType: 'text', answer: fractionToString(reduceFraction(num, lcd)), isFraction: true, answerType: 'reducedFraction'
    };
  }
  if (type === 'fracReduce') {           // 約分
    const q = randInt(3, 9), pn = randInt(1, q - 1);
    if (gcd(pn, q) !== 1) return genExtra5(type, diff);
    const k = randInt(2, 6);
    return {
      question: `${pn * k}/${q * k} を 約分（やくぶん）すると？`,
      type: 'input', inputType: 'text', answer: fractionToString([pn, q]), isFraction: true, answerType: 'reducedFraction'
    };
  }
  return null;
}

MATH_STEPS.decimalMul2 = (p) => {
  const [a, b] = _nums(p.question);
  const A = Math.round(a * 10), B = Math.round(b * 10);
  return { value: _xDec(a * b), lines: [
    '小数×小数：まず 小数点を ないものと して かけるよ',
    `${a} → ${A}、${b} → ${B} として ${A} × ${B} = ${A * B}`,
    `小数点の けた数：${a}と ${b}で あわせて 2けた（右から 2けた）`,
    A * B < 100
      ? `${A * B} の 右から 2けたの ところに 小数点を うつと、一の位が からに なるので 0を おくよ → ${a} × ${b} = ${_xDec(a * b)}`
      : `${A * B} の 右から 2けたの ところに 小数点 → ${a} × ${b} = ${_xDec(a * b)}`
  ] };
};
MATH_STEPS.decimalDiv2 = (p) => {
  const [a, b] = _nums(p.question);
  const A = Math.round(a * 10), B = Math.round(b * 10);
  return { value: _xDec(a / b), lines: [
    '小数÷小数：わる数が 整数に なるように、どちらにも 同じ 数を かけて かんがえるよ',
    `わる数 ${b} を 10倍 → ${B}。わられる数 ${a} も 10倍 → ${A}`,
    `${A} ÷ ${B}`,
    `${a} ÷ ${b} = ${A} ÷ ${B} = ${_xDec(a / b)}`
  ] };
};
MATH_STEPS.decimalMulWord = (p) => {
  const price = Number(p.question.match(/1m 買うと (\d+)円/)[1]);
  const len = Number(p.question.match(/\n([\d.]+)m 買うと/)[1]);
  const B = Math.round(len * 10);
  return { value: _xDec(price * len), lines: [
    '代金 ＝ 1mの ねだん × 買う 長さ',
    `しき：${price} × ${len}`,
    `小数点を ないものと して ${price} × ${B} = ${price * B}`,
    `${len}は 小数点が 1けた → ${price * B} の 右から 1けたに 小数点。${price} × ${len} = ${_xDec(price * len)}`
  ] };
};
MATH_STEPS.averageWord = (p) => {
  const q = p.question.replace(/\n/g, ' ');
  const nums = (q.match(/\d+(?=点)/g) || []).map(Number);
  const sum = nums.reduce((s, x) => s + x, 0);
  return { value: sum / nums.length, lines: [
    '平均 ＝ 合計 ÷ 回数',
    `合計：${nums.join(' ＋ ')} = ${sum}`,
    `回数は ${nums.length}回 → ${sum} ÷ ${nums.length}`,
    `${sum} ÷ ${nums.length} = ${sum / nums.length}`
  ] };
};
MATH_STEPS.averageSum = (p) => {
  const [n, m] = _nums(p.question);
  return { value: n * m, lines: [
    '平均 ＝ 合計 ÷ 回数 だから、合計 ＝ 平均 × 回数',
    `平均 ${m}点が ${n}回ぶん`,
    `${m} × ${n}`,
    `${m} × ${n} = ${m * n}`
  ] };
};
MATH_STEPS.volumeCube = (p) => {
  const a = Number(p.question.match(/(\d+)cm/)[1]);
  return { value: a * a * a, lines: [
    '立方体は たて・よこ・高さが ぜんぶ 同じ 長さ',
    '体積 ＝ 1辺 × 1辺 × 1辺',
    `${a} × ${a} = ${a * a}`,
    `${a * a} × ${a} = ${a * a * a}`
  ] };
};
MATH_STEPS.volumeL = (p) => {
  const [a, b, c] = _nums(p.question);
  const v = a * b * c;
  return { value: _xDec(v / 1000), lines: [
    'まず 体積を cm³で もとめて、あとで L（リットル）に なおそう',
    `体積 ＝ ${a} × ${b} × ${c} = ${v}（cm³）`,
    `${v}cm³ を 1000で わる`,
    `${v} ÷ 1000 = ${_xDec(v / 1000)}（L）`
  ] };
};
MATH_STEPS.volumeH = (p) => {
  const [v, a, b] = _nums(p.question);
  return { value: v / (a * b), lines: [
    '体積 ＝ たて × よこ × 高さ だから、高さ ＝ 体積 ÷（たて × よこ）',
    `たて × よこ = ${a} × ${b} = ${a * b}`,
    `${v} ÷ ${a * b}`,
    `${v} ÷ ${a * b} = ${v / (a * b)}`
  ] };
};
MATH_STEPS.fractionWord = (p) => {
  const q = p.question.replace(/\n/g, ' ');
  const m = q.match(/(\d+)\/(\d+)L と (\d+)\/(\d+)L あります/);
  const isAdd = !!m;
  const mm = m || q.match(/(\d+)\/(\d+)L ありました。(\d+)\/(\d+)L のむ/);
  const n1 = Number(mm[1]), d1 = Number(mm[2]), n2 = Number(mm[3]), d2 = Number(mm[4]);
  const lcd = (d1 * d2) / _gcd(d1, d2);
  const a = (n1 * lcd) / d1, b = (n2 * lcd) / d2;
  const num = isAdd ? a + b : a - b;
  return { value: _red(num, lcd), lines: [
    `${isAdd ? 'あわせるから たし算' : 'のこりだから ひき算'}。分母が ちがうときは 通分しよう`,
    `${d1} と ${d2} の 最小公倍数 ＝ ${lcd}。${n1}/${d1} = ${a}/${lcd}、${n2}/${d2} = ${b}/${lcd}`,
    `分子を ${isAdd ? 'たす' : 'ひく'}：${a} ${isAdd ? '＋' : '－'} ${b} = ${num}`,
    `${num}/${lcd} を 約分 → ${_red(num, lcd)}`
  ] };
};
MATH_STEPS.fracReduce = (p) => {
  const [n, d] = _nums(p.question);
  const g = _gcd(n, d);
  return { value: _red(n, d), lines: [
    '約分は、分子と 分母を 同じ数で わること',
    `${n}と ${d}の 最大公約数 ＝ ${g}`,
    `${n} ÷ ${g} と ${d} ÷ ${g}`,
    `${n}/${d} = ${n / g}/${d / g}`
  ] };
};
