// ===== 算数「ちょうむずかしい」（レベル3）=====
// いまは 3年だけ。3年生の 範囲の まま、2だんかいの 文章題・おつり・切り上げ・2けた×2けた など、
// 考える力が いる もんだい。ふつうの 難易度（0〜2）には 出ない。
// maxDiff（core.js）が 3 を 返す 学年・教科だけで 使われる。math.js の generateMathProblem から genSuper を呼ぶ。
// 「解き方」（ヒント・解説）は MATH_STEPS に 登録（答えが 一致したときだけ 使われる）。

Object.assign(MATH_UNIT_LABELS, {
  superShop2: '2つの 買いもの', superChange: 'おつり（おうよう）', superTimesRev: '○倍（もとを もとめる）', superCeil: 'わり算の 切り上げ',
  superMul2: '3けた×1けた', superBox: '2だんかいの もんだい', superFrac: '分数（3年）', superBlank: '□を使った式（2だんかい）', superDivRem: 'あまりの いみ'
});
Object.assign(MATH_HINT_MAX, { superFrac: 2 });

function genSuper(grade) {
  if (grade !== 3) return null;
  const types = ['superShop2', 'superChange', 'superTimesRev', 'superCeil', 'superMul2', 'superBox', 'superFrac', 'superBlank', 'superDivRem'];
  const type = _xPick(types);
  lastMathType = type;
  const base = { type: 'input', inputType: 'number' };
  if (type === 'superShop2') {
    const items = [['えんぴつ', '本'], ['ノート', 'さつ'], ['ガム', 'こ'], ['シール', 'まい'], ['けしゴム', 'こ'], ['あめ', 'こ']];
    const i1 = _xPick(items);
    const i2 = _xPick(items.filter(x => x[0] !== i1[0]));
    const p1 = randInt(2, 9) * 10, p2 = randInt(2, 9) * 10, n = randInt(2, 8), m = randInt(2, 6);
    return { ...base, question: `${i1[0]}は 1${i1[1]} ${p1}円、${i2[0]}は 1${i2[1]} ${p2}円です。\n${i1[0]}を ${n}${i1[1]}と ${i2[0]}を ${m}${i2[1]} 買うと、\nぜんぶで 何円？`, answer: `${n * p1 + m * p2}` };
  }
  if (type === 'superChange') {
    const [item, u] = _xPick([['ガム', 'こ'], ['ノート', 'さつ'], ['おかし', 'こ'], ['えんぴつ', '本'], ['シール', 'まい']]);
    const p = randInt(3, 9) * 10, n = randInt(3, 9);
    const total = p * n;
    const pay = total <= 500 ? 500 : 1000;
    return { ...base, question: `1${u} ${p}円の ${item}を ${n}${u} 買って、${pay}円 はらいました。\nおつりは 何円？`, answer: `${pay - total}` };
  }
  if (type === 'superTimesRev') {
    const k = randInt(2, 9), L = randInt(3, 30);
    return { ...base, question: `赤い ひもの 長さは、青い ひもの ${k}倍で ${k * L}cmです。\n青い ひもは 何cm？`, answer: `${L}` };
  }
  if (type === 'superCeil') {
    const k = randInt(3, 8);
    let n;
    do { n = randInt(2, 9) * k + randInt(1, k - 1); } while (n % k === 0 || n < 2 * k);
    return { ...base, question: `${n}人が ${k}人ずつ 長いすに すわります。\n長いすは ぜんぶで 何きゃく いる？`, answer: `${Math.ceil(n / k)}` };
  }
  if (type === 'superMul2') {
    const a = randInt(1, 4) * 100 + randInt(1, 9) * 10 + randInt(1, 9), b = randInt(3, 9);   // 3けた×1けた（0の ない 数）
    return { ...base, question: `${a} × ${b} = ？`, answer: `${a * b}` };
  }
  if (type === 'superBox') {
    const a = randInt(6, 12), b = randInt(3, 9);
    if (Math.random() < 0.5) {
      const c = randInt(2, 15);
      return { ...base, question: `1ふくろ ${a}こ入りの アメを ${b}ふくろ 買いました。\n${c}こ もらうと、ぜんぶで 何こ？`, answer: `${a * b + c}` };
    }
    const c = randInt(2, Math.min(15, a * b - 2));
    return { ...base, question: `1ふくろ ${a}こ入りの アメを ${b}ふくろ 買いました。\n${c}こ たべると、のこりは 何こ？`, answer: `${a * b - c}` };
  }
  if (type === 'superFrac') {
    const d = _xPick([5, 7]);
    if (Math.random() < 0.5) {            // 1 － n/d
      const n = randInt(1, d - 1);
      return { question: `1 － ${n}/${d} = ？\n（ぶんすうで こたえてね）`, type: 'input', inputType: 'text', isFraction: true, answer: `${d - n}/${d}` };
    }
    const n1 = randInt(3, d - 1);         // ジュースを 2かい のむ
    const n2 = randInt(1, n1 - 2);
    const n3 = randInt(1, n1 - n2 - 1);
    return {
      question: `ジュースが ${n1}/${d}L ありました。\n${n2}/${d}L のんで、また ${n3}/${d}L のみました。\nのこりは 何L？\n（ぶんすうで こたえてね）`,
      type: 'input', inputType: 'text', isFraction: true, answer: `${n1 - n2 - n3}/${d}`
    };
  }
  if (type === 'superBlank') {
    const a = randInt(2, 9), x = randInt(2, 9), b = randInt(1, 20);
    return { ...base, question: `${a} × □ ＋ ${b} ＝ ${a * x + b}\n□に はいる かずは？`, answer: `${x}` };
  }
  // superDivRem：あまりの 意味を かんがえる
  const k = randInt(4, 9), q = randInt(3, 9), r = randInt(1, k - 1);
  const total = k * q + r;
  return { ...base, question: `みかんが ${total}こ あります。${k}こ ずつ ふくろに 入れて います。\nあまった みかんを もう 1ふくろ いっぱいに するには、\nあと 何こ いる？`, answer: `${k - r}` };
}

MATH_STEPS.superShop2 = (p) => {
  const m = p.question.replace(/\n/g, ' ').match(/(\S+)は 1\S+ (\d+)円、(\S+)は 1\S+ (\d+)円です。.*?を (\d+)\S+と .*?を (\d+)\S+ 買うと/);
  const p1 = Number(m[2]), p2 = Number(m[4]), n = Number(m[5]), k = Number(m[6]);
  return { value: n * p1 + k * p2, lines: [
    '2つの 品物の 代金を べつべつに もとめてから、あわせよう',
    `${m[1]}：${p1} × ${n} = ${p1 * n}（円）`,
    `${m[3]}：${p2} × ${k} = ${p2 * k}（円）`,
    `${p1 * n} ＋ ${p2 * k} = ${n * p1 + k * p2}`
  ] };
};
MATH_STEPS.superChange = (p) => {
  const m = p.question.replace(/\n/g, ' ').match(/1\S+ (\d+)円の \S+を (\d+)\S+ 買って、(\d+)円/);
  const price = Number(m[1]), n = Number(m[2]), pay = Number(m[3]);
  return { value: pay - price * n, lines: [
    'まず ぜんぶの 代金を もとめて、はらった お金から ひこう',
    `代金：${price} × ${n} = ${price * n}（円）`,
    `おつり ＝ ${pay} － ${price * n}`,
    `${pay} － ${price * n} = ${pay - price * n}`
  ] };
};
MATH_STEPS.superTimesRev = (p) => {
  const m = p.question.replace(/\n/g, ' ').match(/ひもの (\d+)倍で (\d+)cm/);
  const k = Number(m[1]), total = Number(m[2]);
  return { value: total / k, lines: [
    '赤い ひもは 青い ひもの 何倍か を 図に かいて かんがえよう',
    `青い ひも × ${k} ＝ ${total}`,
    `青い ひも ＝ ${total} ÷ ${k}`,
    `${total} ÷ ${k} = ${total / k}`
  ] };
};
MATH_STEPS.superCeil = (p) => {
  const m = p.question.replace(/\n/g, ' ').match(/(\d+)人が (\d+)人ずつ/);
  const n = Number(m[1]), k = Number(m[2]);
  const q = Math.floor(n / k), r = n % k;
  return { value: q + 1, lines: [
    'わり算を して、あまりが でたら どうするか かんがえよう',
    `${n} ÷ ${k} ＝ ${q} あまり ${r}`,
    `あまりの ${r}人も すわるので、もう 1つ いるよ`,
    `${q} ＋ 1 = ${q + 1}`
  ] };
};
MATH_STEPS.superMul2 = (p) => {
  const [a, b] = _nums(p.question);
  const h = Math.floor(a / 100) * 100, t = Math.floor((a % 100) / 10) * 10, o = a % 10;
  return { value: a * b, lines: [
    '3けたの かけ算は、百・十・一の くらいに わけて かけよう',
    `${a} ＝ ${h} ＋ ${t} ＋ ${o}`,
    `${h} × ${b} = ${h * b}、${t} × ${b} = ${t * b}、${o} × ${b} = ${o * b}`,
    `${h * b} ＋ ${t * b} ＋ ${o * b} = ${a * b}`
  ] };
};
MATH_STEPS.superBox = (p) => {
  const m = p.question.replace(/\n/g, ' ').match(/1ふくろ (\d+)こ入りの アメを (\d+)ふくろ.*?(\d+)こ (たべると|もらうと)/);
  const a = Number(m[1]), b = Number(m[2]), c = Number(m[3]);
  const plus = m[4] === 'もらうと';
  const v = plus ? a * b + c : a * b - c;
  return { value: v, lines: [
    plus ? 'まず ふくろの ぶんの こ数を もとめて、もらった ぶんを たそう' : 'まず ぜんぶの こ数を もとめて、たべた ぶんを ひこう',
    `ふくろの ぶん：${a} × ${b} = ${a * b}（こ）`,
    plus ? `ぜんぶ ＝ ${a * b} ＋ ${c}` : `のこり ＝ ${a * b} － ${c}`,
    `${a * b} ${plus ? '＋' : '－'} ${c} = ${v}`
  ] };
};
MATH_STEPS.superFrac = (p) => {
  const q = p.question.replace(/\n/g, ' ');
  const one = q.match(/^1 － (\d+)\/(\d+)/);
  if (one) {
    const n = Number(one[1]), d = Number(one[2]);
    return { value: `${d - n}/${d}`, lines: [
      '1は、分母と 分子が 同じ 分数と 考えられるよ',
      `1 ＝ ${d}/${d}（1/${d} が ${d}こ）`,
      `分子：${d} － ${n} = ${d - n}`,
      `1 － ${n}/${d} = ${d}/${d} － ${n}/${d} = ${d - n}/${d}`
    ] };
  }
  const m = q.match(/(\d+)\/(\d+)L ありました。\s*(\d+)\/\d+L のんで、また (\d+)\/\d+L/);
  const n1 = Number(m[1]), d = Number(m[2]), n2 = Number(m[3]), n3 = Number(m[4]);
  return { value: `${n1 - n2 - n3}/${d}`, lines: [
    '分母が 同じ ときは、分子だけを たしたり ひいたり するよ。のんだ ぶんを まず あわせよう',
    `のんだ ぶん：${n2}/${d} ＋ ${n3}/${d} = ${n2 + n3}/${d}`,
    `のこり：${n1}/${d} － ${n2 + n3}/${d}（分子：${n1} － ${n2 + n3}）`,
    `${n1}/${d} － ${n2 + n3}/${d} = ${n1 - n2 - n3}/${d}`
  ] };
};
MATH_STEPS.superBlank = (p) => {
  const m = p.question.match(/(\d+) × □ ＋ (\d+) ＝ (\d+)/);
  const a = Number(m[1]), b = Number(m[2]), c = Number(m[3]);
  return { value: (c - b) / a, lines: [
    '先に「＋ ○」を とって、かけ算の ぶぶんだけに しよう',
    `${a} × □ ＝ ${c} － ${b} ＝ ${c - b}`,
    `□ ＝ ${c - b} ÷ ${a}`,
    `${c - b} ÷ ${a} = ${(c - b) / a}`
  ] };
};
MATH_STEPS.superDivRem = (p) => {
  const m = p.question.replace(/\n/g, ' ').match(/みかんが (\d+)こ あります。(\d+)こ ずつ/);
  const total = Number(m[1]), k = Number(m[2]);
  const q = Math.floor(total / k), r = total % k;
  return { value: k - r, lines: [
    'まず わり算で、いっぱいの ふくろと あまりを もとめよう',
    `${total} ÷ ${k} ＝ ${q} あまり ${r}`,
    `いっぱいの ふくろは ${k}こ。あまりは ${r}こ だよ`,
    `${k} － ${r} = ${k - r}`
  ] };
};
