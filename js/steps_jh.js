// ===== 数学（中2・中3）の「解き方」（なぜ）とヒント =====
// steps.js と おなじ きまり：考え方 → 途中 → 答え。問題の params（math_jh.js が つけた数）から つくる。
// 答えが 出てしまう 手前までを ヒントに するので、途中の 行に 答えを 先に 書かない。

const _sg = (n) => (n < 0 ? `(${n})` : `${n}`);   // マイナスは かっこを つける
const _fx = (a) => (a < 0 ? `x － ${-a}` : `x ＋ ${a}`);   // (x ＋ 3)・(x － 3) の 中身

// ---- 中2 ----
MATH_STEPS.linValue = (p) => {
  const { a, b, x } = p.params;
  return { value: p.answer, lines: ['式の x に 数を 入れて 計算しよう（マイナスは かっこを つける）', `y = ${a} × ${_sg(x)} ＋ ${_sg(b)}`, `y = ${a * x} ＋ ${_sg(b)}`, `答え：${p.answer}`] };
};
MATH_STEPS.polyAdd = (p) => {
  const { p1, p2, sub, ans } = p.params;
  return {
    value: p.answer,
    lines: [
      sub ? 'ひき算は、ひく式の かっこの 中の 符号を ぜんぶ かえて たそう' : 'かっこを はずして、同じ文字の 項（同類項）どうしを まとめよう',
      `x の項：${p1[0]}x ${sub ? '－' : '＋'} (${p2[0]}x) の 係数を 計算する`,
      `y の項：${p1[1]}y ${sub ? '－' : '＋'} (${p2[1]}y) の 係数を 計算する`,
      `答え：${p.answer}（x の係数 ${ans[0]}、y の係数 ${ans[1]}）`
    ]
  };
};
MATH_STEPS.monoMul = (p) => {
  const { mode, a, b } = p.params;
  if (mode === 0) return { value: p.answer, lines: ['係数どうし、文字どうしを それぞれ かけよう', `係数：${_sg(a)} × ${_sg(b)} ＝ ${a * b}`, '文字：x × y ＝ xy', `答え：${p.answer}`] };
  if (mode === 1) return { value: p.answer, lines: ['係数どうしを かけて、同じ文字は 指数を たそう', `係数：${a} × ${b} ＝ ${a * b}`, '文字：x² × x ＝ x^(2+1) ＝ x³', `答え：${p.answer}`] };
  return { value: p.answer, lines: ['係数どうしを わって、同じ文字は 指数を ひこう', `係数：${a * b} ÷ ${a} ＝ ${b}`, '文字：x²y ÷ x ＝ x^(2-1)・y ＝ xy', `答え：${p.answer}`] };
};
MATH_STEPS.angleTri = (p) => {
  const { a, b } = p.params;
  return { value: p.answer, lines: ['三角形の 内角の和は 180° を つかおう', `${a} ＋ ${b} ＝ ${a + b}`, `180 － ${a + b}`, `答え：${p.answer}°`] };
};
MATH_STEPS.polyAngle = (p) => {
  const { mode, n, ext } = p.params;
  if (mode === 0) return { value: p.answer, lines: ['n角形の 内角の和 ＝ 180° × (n － 2)', `180 × (${n} － 2) ＝ 180 × ${n - 2}`, `答え：${p.answer}°`] };
  if (mode === 1) return { value: p.answer, lines: ['多角形の 外角の和は いつも 360°。正多角形は 外角が ぜんぶ 同じ', `360 ÷ ${n}`, `答え：${p.answer}°`] };
  if (mode === 2) return { value: p.answer, lines: ['内角 ＋ 外角 ＝ 180°。外角の和は 360°', `外角 ＝ 360 ÷ ${n} ＝ ${360 / n}°`, `内角 ＝ 180 － ${360 / n}`, `答え：${p.answer}°`] };
  return { value: p.answer, lines: ['外角の和は 360° だから、角の数 ＝ 360 ÷ 1つの外角', `360 ÷ ${ext}`, `答え：${p.answer}（正${p.answer}角形）`] };
};
MATH_STEPS.litValue = (p) => {
  const { a, b, x, y } = p.params;
  return { value: p.answer, lines: ['文字に 数を 入れて 計算しよう（マイナスは かっこを つける）', `${_sg(a)} × ${_sg(x)} ＋ ${_sg(b)} × ${_sg(y)}`, `${_sg(a * x)} ＋ ${_sg(b * y)}`, `答え：${p.answer}`] };
};
MATH_STEPS.rangeData = (p) => {
  const l = p.params.list, mx = Math.max(...l), mn = Math.min(...l);
  return { value: p.answer, lines: ['範囲 ＝ 最大値 － 最小値', `最大値は ${mx}、最小値は ${mn}`, `${mx} － ${mn}`, `答え：${p.answer}`] };
};
MATH_STEPS.quartile = (p) => {
  const { sorted, which, q1, q2, q3 } = p.params;
  const lower = sorted.slice(0, 4).join('、'), upper = sorted.slice(4).join('、');
  const lines = ['まず 小さい順に ならべて、中央値で 前半と 後半に わけよう', `小さい順：${sorted.join('、')}`, `前半：${lower}　後半：${upper}`];
  if (which === 0) lines.push(`第1四分位数は 前半の 中央値 ＝ ${q1}`);
  else if (which === 1) lines.push(`第2四分位数は 全体の 中央値 ＝ ${q2}`);
  else if (which === 2) lines.push(`第3四分位数は 後半の 中央値 ＝ ${q3}`);
  else lines.push(`四分位範囲 ＝ ${q3} － ${q1}`);
  lines.push(`答え：${p.answer}`);
  return { value: p.answer, lines };
};
MATH_STEPS.simul = (p) => {
  const { a1, b1, c1, a2, b2, c2, x, y } = p.params;
  const eq = (a, b, c) => `${jhPolyDisp([{ c: a, v: 'x' }, { c: b, v: 'y' }])} ＝ ${c}`;
  return {
    value: p.answer,
    lines: [
      '1つの文字の 係数を そろえて、たすか ひくかして その文字を 消そう（加減法）',
      `①${eq(a1, b1, c1)}　②${eq(a2, b2, c2)}`,
      `y の 係数を そろえるために ①×${_sg(b2)}、②×${_sg(b1)} を つくって ひくと、${a1 * b2 - a2 * b1}x ＝ ${c1 * b2 - c2 * b1}`,
      `これを 解いて x ＝ ${x}`,
      `x ＝ ${x} を ①に 入れて y を 求めると、y ＝ ${y}`,
      `答え：${p.answer}`
    ]
  };
};
MATH_STEPS.simulWord = (p) => {
  const { m1, n1, t1, m2, n2, t2, askPen, price1, price2 } = p.params;
  return {
    value: p.answer,
    lines: [
      'えんぴつ 1本を x円、ノート 1冊を y円 として 式を 2つ つくろう',
      `${m1}x ＋ ${n1}y ＝ ${t1}　…①　　${m2}x ＋ ${n2}y ＝ ${t2}　…②`,
      '加減法で 1つの文字を 消して、もう1つの 文字を 求める',
      `えんぴつ ${price1}円、ノート ${price2}円`,
      `答え：${p.answer}円（${askPen ? 'えんぴつ' : 'ノート'}）`
    ]
  };
};
MATH_STEPS.slope = (p) => {
  const { x1, y1, x2, y2 } = p.params;
  return { value: p.answer, lines: ['傾き ＝ y の増加量 ÷ x の増加量', `y の増加量：${y2} － ${_sg(y1)} ＝ ${y2 - y1}　x の増加量：${x2} － ${_sg(x1)} ＝ ${x2 - x1}`, `${y2 - y1} ÷ ${_sg(x2 - x1)}`, `答え：${p.answer}`] };
};
MATH_STEPS.lineEq = (p) => {
  const { m, b, viaPoint, x0, y0 } = p.params;
  if (!viaPoint) return { value: p.answer, lines: ['直線の式は y ＝ (傾き)x ＋ (切片)', `傾き ${m}、切片 ${b} を 入れる`, `答え：${p.answer}`] };
  return { value: p.answer, lines: ['傾きが わかっているので y ＝ ${m}x ＋ b と おいて、通る点を 入れて b を 求めよう'.replace('${m}', m), `${y0} ＝ ${m} × ${_sg(x0)} ＋ b`, `b ＝ ${y0} － ${_sg(m * x0)} ＝ ${b}`, `答え：${p.answer}`] };
};
MATH_STEPS.probBag = (p) => {
  const { r, w } = p.params;
  return { value: p.answer, lines: ['確率 ＝ 求める場合の数 ÷ すべての場合の数', `すべて：${r} ＋ ${w} ＝ ${r + w}通り　赤玉：${r}通り`, `${r}/${r + w}（約分できるときは 約分する）`, `答え：${p.answer}`] };
};
MATH_STEPS.probBag2 = (p) => {
  const { r, w } = p.params;
  const t = r + w;
  return { value: p.answer, lines: ['同時に 2個 取り出す 場合の数を 数えよう（順番は 区別しない）', `すべて：${t}個から 2個を えらぶ ＝ ${t} × ${t - 1} ÷ 2 ＝ ${t * (t - 1) / 2}通り`, `2個とも 赤：${r}個から 2個を えらぶ ＝ ${r} × ${r - 1} ÷ 2 ＝ ${r * (r - 1) / 2}通り`, `${r * (r - 1) / 2}/${t * (t - 1) / 2}（約分できるときは 約分する）`, `答え：${p.answer}`] };
};
MATH_STEPS.probCoin = (p) => {
  const { mode, n } = p.params;
  if (mode === 0) return { value: p.answer, lines: ['表裏の 出方は、1回ごとに 2通りずつ ふえていく', `全部：${Array(n).fill(2).join(' × ')} ＝ ${2 ** n}通り`, '「すべて 表」は 1通り', `答え：${p.answer}`] };
  if (mode === 1) return { value: p.answer, lines: ['3回の 表裏の 出方は 全部で 8通り', '表が ちょうど 1回：（表裏裏）（裏表裏）（裏裏表）の 3通り', `答え：${p.answer}`] };
  return { value: p.answer, lines: ['2回の 表裏の 出方は 全部で 4通り', '表と 裏が 1回ずつ：（表裏）（裏表）の 2通り', '2/4 を 約分する', `答え：${p.answer}`] };
};
MATH_STEPS.probDice = (p) => {
  const { mode, s, ways } = p.params;
  if (mode === 0) return { value: p.answer, lines: ['大小2つの さいころの 目の 出方は 6 × 6 ＝ 36通り', `目の和が ${s} に なるのは ${ways}通り`, `${ways}/36 を 約分する`, `答え：${p.answer}`] };
  if (mode === 1) return { value: p.answer, lines: ['全部で 36通り', '2つとも 同じ目：(1,1)(2,2)…(6,6) の 6通り', '6/36 を 約分する', `答え：${p.answer}`] };
  return { value: p.answer, lines: ['さいころの 目は 6通り', '3の倍数の目は 3 と 6 の 2通り', '2/6 を 約分する', `答え：${p.answer}`] };
};

MATH_STEPS.parAngle = (p) => {
  const { mode, a } = p.params;
  if (mode === 0) return { value: p.answer, lines: ['平行な 2直線に 1つの 直線が 交わるとき、同位角は 等しい', `同位角 ＝ ${a}°`, `答え：${p.answer}°`] };
  if (mode === 1) return { value: p.answer, lines: ['平行な 2直線に 1つの 直線が 交わるとき、錯角は 等しい', `錯角 ＝ ${a}°`, `答え：${p.answer}°`] };
  if (mode === 2) return { value: p.answer, lines: ['2つの直線が 交わってできる 向かい合った 角（対頂角）は 等しい', `対頂角 ＝ ${a}°`, `答え：${p.answer}°`] };
  return { value: p.answer, lines: ['平行な 2直線では、同側内角の 和は 180°', `180 － ${a}`, `答え：${p.answer}°`] };
};

// ---- 中3 ----
MATH_STEPS.expandMono = (p) => {
  const { a, b, c, withY } = p.params;
  return { value: p.answer, lines: ['分配法則：かっこの 中の ぜんぶの 項に かけよう', `${a}x × ${b === 1 ? '' : b}x ＝ ${a * b}x²`, withY ? `${a}x × (${c}y) ＝ ${a * c}xy` : `${a}x × (${c}) ＝ ${a * c}x`, `答え：${p.answer}`] };
};
MATH_STEPS.expandFormula = (p) => {
  const q = p.params;
  if (q.form === 0) return { value: p.answer, lines: ['乗法公式：(x＋a)(x＋b) ＝ x² ＋ (a＋b)x ＋ ab', `a ＝ ${q.a}、b ＝ ${q.b}`, `和：${q.a} ＋ (${q.b}) ＝ ${q.a + q.b}　積：${q.a} × (${q.b}) ＝ ${q.a * q.b}`, `答え：${p.answer}`] };
  if (q.form === 1) return { value: p.answer, lines: ['乗法公式：(x＋a)² ＝ x² ＋ 2ax ＋ a²', `a ＝ ${q.a}`, `2a ＝ ${2 * q.a}　a² ＝ ${q.a * q.a}`, `答え：${p.answer}`] };
  if (q.form === 2) return { value: p.answer, lines: ['乗法公式：(x＋a)(x－a) ＝ x² － a²', `a ＝ ${q.a}、a² ＝ ${q.a * q.a}`, `答え：${p.answer}`] };
  return { value: p.answer, lines: ['分配法則で 1つずつ かけて、同類項を まとめよう', `${q.p}x × ${q.r}x ＝ ${q.p * q.r}x²　${q.p}x × (${q.s}) ＝ ${q.p * q.s}x`, `(${q.q}) × ${q.r}x ＝ ${q.q * q.r}x　(${q.q}) × (${q.s}) ＝ ${q.q * q.s}`, `x の項を まとめる：${q.p * q.s} ＋ (${q.q * q.r}) ＝ ${q.p * q.s + q.q * q.r}`, `答え：${p.answer}`] };
};
MATH_STEPS.factorCommon = (p) => {
  const { g, p: pp, q } = p.params;
  return { value: p.answer, lines: ['まず ぜんぶの 項に 共通する 因数を さがして、かっこの 外に くくり出そう', `共通因数：${g === 1 ? '' : g}x`, `それぞれの 項を ${g === 1 ? '' : g}x で わると、かっこの 中の 式に なる`, `答え：${p.answer}`] };
};
MATH_STEPS.factorFormula = (p) => {
  const q = p.params;
  if (q.form === 0) return { value: p.answer, lines: ['x² ＋ (a＋b)x ＋ ab ＝ (x＋a)(x＋b)。「たして ${q1}、かけて ${q2}」に なる 2つの数を さがす'.replace('${q1}', q.a + q.b).replace('${q2}', q.a * q.b), `かけて ${q.a * q.b} に なる 数の 組を ならべる`, `たして ${q.a + q.b} に なる 組は ${q.a} と ${q.b}`, `答え：${p.answer}`] };
  if (q.form === 1) return { value: p.answer, lines: ['x² ＋ 2ax ＋ a² ＝ (x＋a)²（平方の形）', `定数項 ${q.a * q.a} ＝ ${Math.abs(q.a)}²、x の係数 ${2 * q.a} ＝ 2 × ${q.a}`, `答え：${p.answer}`] };
  if (q.form === 2) return { value: p.answer, lines: ['x² － a² ＝ (x＋a)(x－a)（平方の差）', `${q.a * q.a} ＝ ${q.a}²`, `答え：${p.answer}`] };
  return { value: p.answer, lines: ['まず 共通因数を くくり出し、かっこの 中を 公式で 因数分解しよう', `共通因数：${q.g}`, `かっこの 中：x² ＋ ${q.a + q.b}x ＋ ${q.a * q.b} を 因数分解する`, `答え：${p.answer}`] };
};
MATH_STEPS.sqrtInt = (p) => {
  const n = p.params.n;
  return { value: p.answer, lines: ['√a は 2乗すると a に なる 正の数', `${n} × ${n} ＝ ${n * n}`, `答え：${p.answer}`] };
};
MATH_STEPS.sqrtRange = (p) => {
  const { n, a } = p.params;
  return { value: p.answer, lines: ['まわりの 平方数と くらべよう', `${a}² ＝ ${a * a}、${a + 1}² ＝ ${(a + 1) * (a + 1)}`, `${a * a} ＜ ${n} ＜ ${(a + 1) * (a + 1)} だから ${a} ＜ √${n} ＜ ${a + 1}`, `答え：${p.answer}`] };
};
MATH_STEPS.sqrtSimplify = (p) => {
  const { k, m } = p.params;
  return { value: p.answer, lines: ['根号の 中を「平方数 × 小さい数」の 形に わけよう', `${k * k * m} ＝ ${k * k} × ${m} ＝ ${k}² × ${m}`, `√(${k}² × ${m}) ＝ ${k}√${m}`, `答え：${p.answer}`] };
};
MATH_STEPS.sqrtAddSub = (p) => {
  const { a, b, m, add } = p.params;
  return { value: p.answer, lines: ['同じ √ の 項は 同類項と 同じように、係数どうしを 計算しよう', `${a}√${m} ${add ? '＋' : '－'} ${b}√${m} ＝ (${a} ${add ? '＋' : '－'} ${b})√${m}`, `係数：${add ? a + b : a - b}`, `答え：${p.answer}`] };
};
MATH_STEPS.sqrtMulDiv = (p) => {
  const { p: pp, k, mul } = p.params;
  if (mul) return { value: p.answer, lines: ['√a × √b ＝ √(a × b)', `√${pp} × √${pp * k * k} ＝ √${pp * pp * k * k}`, `√${pp * pp * k * k} ＝ ${pp * k}（${pp * k} × ${pp * k} ＝ ${pp * pp * k * k}）`, `答え：${p.answer}`] };
  return { value: p.answer, lines: ['√a ÷ √b ＝ √(a ÷ b)', `√${pp * k * k} ÷ √${pp} ＝ √${k * k}`, `√${k * k} ＝ ${k}`, `答え：${p.answer}`] };
};
MATH_STEPS.quadSolve = (p) => {
  const q = p.params;
  if (q.mode === 0 || q.mode === 1) return { value: p.answer, lines: ['左辺を 因数分解して、（かっこ）（かっこ）＝ 0 の 形に しよう', `かけて ${q.a * q.b}、たして ${q.a + q.b} に なる 2数は ${q.a} と ${q.b}`, `(${_fx(q.a)})(${_fx(q.b)}) ＝ 0 だから、かっこの どちらかが 0`, `答え：${p.answer}`] };
  if (q.mode === 2) return { value: p.answer, lines: ['左辺は 平方の 形 (x ＋ a)² に 因数分解できる', `(${_fx(q.a)})² ＝ 0`, `答え：${p.answer}`] };
  if (q.sq) return { value: p.answer, lines: ['x² ＝ k のとき、x ＝ ±√k', `x ＝ ±√${q.c * q.c}`, `答え：${p.answer}`] };
  return { value: p.answer, lines: ['共通因数 x を くくり出そう', `x(x － ${q.c}) ＝ 0`, `答え：${p.answer}`] };
};
MATH_STEPS.quadFunc = (p) => {
  const { a, x } = p.params;
  return { value: p.answer, lines: ['x に 数を 入れて 計算しよう。2乗が 先（マイナスの 2乗は 正の数）', `x² ＝ ${_sg(x)}² ＝ ${x * x}`, `y ＝ ${a} × ${x * x}`, `答え：${p.answer}`] };
};
MATH_STEPS.quadRate = (p) => {
  const { a, lo, hi } = p.params;
  const f = x => a * x * x;
  return { value: p.answer, lines: ['変化の割合 ＝ y の増加量 ÷ x の増加量', `x ＝ ${lo} のとき y ＝ ${f(lo)}、x ＝ ${hi} のとき y ＝ ${f(hi)}`, `(${f(hi)} － ${_sg(f(lo))}) ÷ (${hi} － ${_sg(lo)})`, `答え：${p.answer}`] };
};
MATH_STEPS.simRatio = (p) => {
  const { m, n, vol } = p.params;
  return { value: p.answer, lines: [vol ? '相似比が m:n なら、体積比は m³:n³' : '相似比が m:n なら、面積比は m²:n²', vol ? `${m}³ ＝ ${m ** 3}、${n}³ ＝ ${n ** 3}` : `${m}² ＝ ${m * m}、${n}² ＝ ${n * n}`, `答え：${p.answer}`] };
};
MATH_STEPS.simLen = (p) => {
  const { k, ab, bc } = p.params;
  return { value: p.answer, lines: ['相似な 図形では、対応する 辺の 比が 等しい', `AB : DE ＝ ${ab} : ${ab * k} ＝ 1 : ${k}（相似比）`, `EF ＝ BC × ${k} ＝ ${bc} × ${k}`, `答え：${p.answer}cm`] };
};
MATH_STEPS.circleAngle = (p) => {
  const { mode, t } = p.params;
  if (mode === 0) return { value: p.answer, lines: ['円周角は、同じ弧に対する 中心角の 半分', `${t * 2} ÷ 2`, `答え：${p.answer}°`] };
  if (mode === 1) return { value: p.answer, lines: ['中心角は、同じ弧に対する 円周角の 2倍', `${t} × 2`, `答え：${p.answer}°`] };
  return { value: p.answer, lines: ['直径に 対する 円周角は 90°（半円の 弧に 対する 円周角）', '中心角は 180° だから、その 半分', `答え：${p.answer}°`] };
};
MATH_STEPS.pythag = (p) => {
  const { a, b, c, hyp } = p.params;
  if (hyp) return { value: p.answer, lines: ['三平方の定理：直角三角形の 斜辺 c は a² ＋ b² ＝ c²', `${a}² ＋ ${b}² ＝ ${a * a} ＋ ${b * b} ＝ ${a * a + b * b}`, `c ＝ √${a * a + b * b}`, `答え：${p.answer}cm`] };
  return { value: p.answer, lines: ['三平方の定理：a² ＋ b² ＝ c²（c は 斜辺）。ほかの辺は b² ＝ c² － a²', `${c}² － ${a}² ＝ ${c * c} － ${a * a} ＝ ${c * c - a * a}`, `b ＝ √${c * c - a * a}`, `答え：${p.answer}cm`] };
};
MATH_STEPS.pythagCheck = (p) => {
  const s = p.params.sides;
  const [a, b, c] = s;
  return { value: p.answer, lines: ['いちばん 長い辺を c として、a² ＋ b² ＝ c² か たしかめよう（三平方の定理の逆）', `${a}² ＋ ${b}² ＝ ${a * a + b * b}、${c}² ＝ ${c * c}`, `答え：${p.answer}`] };
};
MATH_STEPS.transpose = (p) => {
  const { a, b, c } = p.params;
  return { value: p.answer, lines: ['y を ふくむ 項だけを 左辺に のこし、ほかは 移項しよう', `${b}y ＝ ${c} － ${a}x（移項すると 符号が かわる）`, `両辺を ${b} で わる`, `答え：${p.answer}`] };
};

// ヒントの 上限（答えが 先に 見えてしまう 種類を 手前で 止める）
Object.assign(MATH_HINT_MAX, {
  polyAdd: 2, monoMul: 1, expandMono: 1, expandFormula: 2, factorCommon: 1, factorFormula: 2, simul: 2, simulWord: 2,
  lineEq: 2, quadSolve: 1, quadFunc: 1, sqrtSimplify: 1, sqrtAddSub: 1, sqrtMulDiv: 2, probBag: 2, probBag2: 2,
  simRatio: 1, sqrtRange: 1, transpose: 1, pythagCheck: 1, probDice: 2, probCoin: 2, quadFormula: 2, sampleEstimate: 2
});

MATH_STEPS.quadFormula = (p) => {
  const { b, c, D } = p.params;
  return { value: p.answer, lines: ['解の公式：ax² ＋ bx ＋ c ＝ 0 のとき、x ＝ (－b ± √(b²－4ac)) ÷ 2a', `a ＝ 1、b ＝ ${b}、c ＝ ${c}`, `b² － 4ac ＝ ${b * b} － 4 × 1 × (${c}) ＝ ${D}`, `答え：${p.answer}`] };
};
MATH_STEPS.sampleEstimate = (p) => {
  const { B, n, k, N } = p.params;
  return { value: p.answer, lines: ['取り出した 標本の 黒の 割合は、袋全体の 黒の 割合に ほぼ 等しいと 考える', `標本の 黒の 割合 ＝ ${k}/${n}`, `全体の 個数 ＝ ${B} ÷ (${k}/${n}) ＝ ${N}`, `白い碁石 ＝ ${N} － ${B}`, `答え：${p.answer}`] };
};
