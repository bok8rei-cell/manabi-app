// ===== 数学（中2・中3）の問題づくり =====
// 中2 = grade 8、中3 = grade 9。算数（math.js）の generateMathProblem から よばれる。
// 文字式の答えあわせは algebra.js（answerType: 'algebra' 展開・計算 / 'factor' 因数分解 / 'lineEq' 直線の式 / 'roots' 方程式の解 / 'xy' 連立方程式）
// 問題には params（作ったときの数）を つけておき、steps_jh.js の「解き方」で 使う。

Object.assign(MATH_UNIT_LABELS, {
  // 中2
  linValue: '一次関数の値', polyAdd: '式の加法・減法', monoMul: '単項式の乗法・除法', angleTri: '三角形の角', polyAngle: '多角形の角',
  litValue: '式の値', rangeData: 'データの範囲', quartile: '四分位数', simul: '連立方程式', simulWord: '連立方程式の文章題',
  slope: '一次関数の傾き', lineEq: '直線の式', probDice: '確率（さいころ）', probCoin: '確率（コイン）', probBag: '確率（袋と玉）', probBag2: '確率（2個取り出す）',
  congruent: '合同条件', parallelogram: '平行四辺形の性質', transpose: '等式の変形',
  // 中3
  expandMono: '単項式×多項式', expandFormula: '式の展開（乗法公式）', factorCommon: '因数分解（共通因数）', factorFormula: '因数分解（公式）',
  sqrtInt: '平方根の値', sqrtRange: '平方根の大きさ', sqrtSimplify: '根号の簡単な形', sqrtAddSub: '平方根の加法・減法', sqrtMulDiv: '平方根の乗法・除法',
  quadSolve: '二次方程式', quadFunc: '関数 y=ax²', quadRate: '変化の割合', simRatio: '相似比と面積比・体積比', simLen: '相似な図形の辺', circleAngle: '円周角と中心角',
  pythag: '三平方の定理', pythagCheck: '三平方の定理の逆', sampling: '標本調査',
  parAngle: '平行線と角', quadFormula: '二次方程式（解の公式）', sampleEstimate: '標本調査（全体の数の推定）'
});

// ---- 式を 文字に するための 小さな 道具 ----
// terms: [{ c: 係数, v: '文字の部分（x² / x / xy / ''）' }] を、答え用の せまい形（5x-3y）に
function jhPolyStr(terms) {
  let s = '';
  terms.forEach(t => {
    if (!t.c) return;
    const a = Math.abs(t.c);
    const body = (a === 1 && t.v) ? t.v : `${a}${t.v}`;
    s += (t.c < 0 ? '-' : (s ? '+' : '')) + body;
  });
  return s || '0';
}
// 問題文用（＋ － の まえあとに すき間）
function jhPolyDisp(terms) {
  let s = '';
  terms.forEach(t => {
    if (!t.c) return;
    const a = Math.abs(t.c);
    const body = (a === 1 && t.v) ? t.v : `${a}${t.v}`;
    if (!s) s = (t.c < 0 ? '－' : '') + body;
    else s += (t.c < 0 ? ' － ' : ' ＋ ') + body;
  });
  return s || '0';
}
// かっこの 中の「x ＋ 3」「x － 4」「2x ＋ 5」
function jhLin(c, v, k) {
  return jhPolyDisp([{ c, v }, { c: k, v: '' }]);
}
function jhLinAns(c, v, k) {
  return jhPolyStr([{ c, v }, { c: k, v: '' }]);
}
function jhPick(arr) { return arr[randInt(0, arr.length - 1)]; }
function jhNonZero(min, max) { let n = 0; while (n === 0) n = randInt(min, max); return n; }
const JH_NOTE_SQ = '（2乗は x^2 か x² と入力してね）';
const JH_NOTE_FACTOR = '（かっこを使った 積の形で 答えてね。例：(x+7)(x-9)）';

function jhChoices(correct, others) {
  const set = [correct];
  others.forEach(o => { if (!set.includes(o)) set.push(o); });
  return shuffleArray(set.slice(0, 4));
}


// 選択式の 暗記もん（合同条件・平行四辺形・標本調査）の ひとこと 解説
const JH_EX = {
  // 合同条件
  '2つの三角形が 合同であるための 条件として まちがっているものは どれ？': '三角形の 合同条件は「3組の辺」「2組の辺と その間の角」「1組の辺と その両端の角」の 3つ。3組の角が 等しいだけでは、形は 同じでも 大きさが ちがうことが ある（相似）',
  '△ABC と △DEF で、AB=DE、BC=EF、CA=FD のとき、合同といえる 理由は？': '3つの辺の 長さが それぞれ 等しいので「3組の辺が それぞれ等しい」',
  '△ABC と △DEF で、AB=DE、∠B=∠E、BC=EF のとき、合同といえる 理由は？': 'AB と BC の 間の角が ∠B。2つの辺と その間の角が 等しいので「2組の辺と その間の角」',
  '△ABC と △DEF で、BC=EF、∠B=∠E、∠C=∠F のとき、合同といえる 理由は？': 'BC の 両はしの 角が ∠B と ∠C。1つの辺と その両はしの角が 等しいので「1組の辺と その両端の角」',
  '合同な 図形について、正しいものは どれ？': '合同な 図形は ぴったり 重なるので、対応する 辺の長さや 角の大きさは それぞれ 等しい',
  '合同な 図形を 表す 記号は どれ？': '合同は ≡、相似は ∽ で 表す',
  '「仮定」と「結論」について、「△ABC≡△DEF ならば AB=DE」の 結論は どれ？': '「ならば」の あとが 結論（証明したいこと）、まえが 仮定',
  '証明で「仮定」と 呼ぶのは どれ？': '仮定は、問題で 前提として 与えられている こと。結論は、証明したい こと',
  // 平行四辺形
  '平行四辺形について 正しいものは どれ？': '平行四辺形は 2組の 対辺が それぞれ 平行で、対辺の 長さも 等しい',
  '平行四辺形の 対角線について 正しいものは どれ？': '平行四辺形の 対角線は、それぞれの 中点で 交わる（長さや 直角とは かぎらない）',
  '平行四辺形の 対角について 正しいものは どれ？': '平行四辺形の 2組の 対角は それぞれ 等しい。となりあう角の 和は 180°',
  '四角形が 平行四辺形に なる 条件として 正しいものは どれ？': '平行四辺形になる 条件の ひとつ：対角線が それぞれの 中点で 交わる',
  '長方形の 性質として 正しいものは どれ？': '長方形は 4つの角が 直角で、対角線の 長さが 等しい',
  'ひし形の 性質として 正しいものは どれ？': 'ひし形は 4つの辺が 等しく、対角線が 垂直に 交わる',
  // 標本調査
  '次のうち、標本調査で 行うのが ふさわしいものは どれ？': '電球の 寿命を 調べると 使えなくなる ので、一部を 取り出して 調べる（標本調査）',
  '次のうち、全数調査で 行うのが ふさわしいものは どれ？': '視力検査のように 全員を 調べる 必要が あるものは 全数調査',
  '調べたい 集団全体を 何という？': '調べたい 集団全体を 母集団という',
  '母集団から 取り出して 調べた 一部を 何という？': '母集団から 取り出して 調べた 一部を 標本という',
  '標本調査で、標本を 取り出すとき 大切なことは どれ？': '標本は、かたよりが ないように 無作為に（くじ引きのように）取り出す',
  '袋の 中の 白玉と 赤玉の 割合を 調べるとき、標本調査では どうする？': '一部を 取り出して、その 割合から 全体の 割合を 推定する',
  '標本の 大きさ（取り出す数）を 大きくすると、推定は どうなる？': '標本を 大きくするほど、母集団の 性質に 近づきやすい',
  '次のうち、標本調査 ではないものは どれ？': '国勢調査は 全員を 調べる 全数調査'
};

// =====================================================================
// 中2
// =====================================================================
function genGrade8(diff = 1) {
  const typePools = [
    ['linValue', 'polyAdd', 'monoMul', 'angleTri', 'polyAngle', 'parAngle', 'litValue', 'rangeData', 'probBag', 'probCoin'],
    ['linValue', 'polyAdd', 'monoMul', 'angleTri', 'polyAngle', 'parAngle', 'litValue', 'rangeData', 'probBag', 'probCoin', 'simul', 'slope', 'probDice', 'congruent', 'parallelogram', 'transpose'],
    ['polyAdd', 'monoMul', 'litValue', 'polyAngle', 'parAngle', 'simul', 'slope', 'lineEq', 'probDice', 'probBag2', 'congruent', 'parallelogram', 'transpose', 'simulWord', 'quartile']
  ];
  const types = typePools[diff];
  const type = jhPick(types);
  lastMathType = type;

  if (type === 'linValue') {
    const a = jhNonZero(-4, 5), b = randInt(-6, 9), x = randInt(-3, 5);
    return {
      question: `一次関数 y = ${jhPolyDisp([{ c: a, v: 'x' }, { c: b, v: '' }])} で、x = ${x} のとき y は？`,
      type: 'input', inputType: 'text', answer: `${a * x + b}`, params: { a, b, x }
    };
  }

  if (type === 'polyAdd') {
    const sub = diff >= 1 && Math.random() < 0.5;
    let p1, p2, ans;
    do {
      p1 = [jhNonZero(-6, 6), jhNonZero(-6, 6)];
      p2 = [jhNonZero(-6, 6), jhNonZero(-6, 6)];
      ans = [p1[0] + (sub ? -p2[0] : p2[0]), p1[1] + (sub ? -p2[1] : p2[1])];
    } while ((ans[0] === 0 && ans[1] === 0) || (ans[0] === 0 || ans[1] === 0) && Math.random() < 0.7);
    const f = (q) => jhPolyDisp([{ c: q[0], v: 'x' }, { c: q[1], v: 'y' }]);
    return {
      question: `(${f(p1)}) ${sub ? '－' : '＋'} (${f(p2)}) を 計算しよう`,
      type: 'input', inputType: 'text', answerType: 'algebra',
      answer: jhPolyStr([{ c: ans[0], v: 'x' }, { c: ans[1], v: 'y' }]),
      params: { p1, p2, sub, ans }
    };
  }

  if (type === 'monoMul') {
    const mode = diff === 0 ? 0 : randInt(0, 2);
    if (mode === 0) {          // 単項式 × 単項式
      const a = jhNonZero(-5, 6), b = jhNonZero(-5, 6);
      const A = a < 0 ? `(${a}x)` : `${a}x`, B = b < 0 ? `(${b}y)` : `${b}y`;
      return {
        question: `${A} × ${B} を 計算しよう`,
        type: 'input', inputType: 'text', answerType: 'algebra', answer: jhPolyStr([{ c: a * b, v: 'xy' }]),
        params: { mode, a, b }
      };
    }
    if (mode === 1) {          // x² × x など
      const a = randInt(2, 6), b = randInt(2, 5);
      return {
        question: `${a}x² × ${b}x を 計算しよう\n${JH_NOTE_SQ}`,
        type: 'input', inputType: 'text', answerType: 'algebra', answer: `${a * b}x³`,
        params: { mode, a, b }
      };
    }
    const a = randInt(2, 6), b = randInt(2, 6);   // 単項式 ÷ 単項式
    return {
      question: `${a * b}x²y ÷ ${a}x を 計算しよう\n${JH_NOTE_SQ}`,
      type: 'input', inputType: 'text', answerType: 'algebra', answer: jhPolyStr([{ c: b, v: 'xy' }]),
      params: { mode, a, b }
    };
  }

  if (type === 'angleTri') {
    const a = randInt(25, 90), b = randInt(20, 170 - a - 15);
    return {
      question: `三角形の 2つの角が ${a}° と ${b}° のとき、のこりの角は 何度？`,
      type: 'input', inputType: 'number', answer: `${180 - a - b}`, params: { a, b }
    };
  }

  if (type === 'polyAngle') {
    const mode = randInt(0, diff === 0 ? 1 : 3);
    if (mode === 0) {
      const n = randInt(5, 10);
      return { question: `${n}角形の 内角の和は 何度？`, type: 'input', inputType: 'number', answer: `${(n - 2) * 180}`, params: { mode, n } };
    }
    if (mode === 1) {
      const n = jhPick([3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20]);
      return { question: `正${n}角形の 1つの 外角は 何度？`, type: 'input', inputType: 'number', answer: `${360 / n}`, params: { mode, n } };
    }
    if (mode === 2) {
      const n = jhPick([3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20]);
      return { question: `正${n}角形の 1つの 内角は 何度？`, type: 'input', inputType: 'number', answer: `${180 - 360 / n}`, params: { mode, n } };
    }
    const ext = jhPick([30, 36, 40, 45, 60, 72]);   // 外角から 何角形か
    return { question: `1つの 外角が ${ext}° の 正多角形は 正何角形？`, type: 'input', inputType: 'number', answer: `${360 / ext}`, params: { mode, ext } };
  }

  if (type === 'parAngle') {
    const a = randInt(4, 16) * 5;
    const mode = randInt(0, 3);
    if (mode === 0) return { question: `平行な 2直線に 1つの 直線が 交わっています。\n1つの角が ${a}° のとき、その 同位角は 何度？`, type: 'input', inputType: 'number', answer: `${a}`, params: { mode, a } };
    if (mode === 1) return { question: `平行な 2直線に 1つの 直線が 交わっています。\n1つの角が ${a}° のとき、その 錯角は 何度？`, type: 'input', inputType: 'number', answer: `${a}`, params: { mode, a } };
    if (mode === 2) return { question: `2つの直線が 交わっています。\n1つの角が ${a}° のとき、その 対頂角は 何度？`, type: 'input', inputType: 'number', answer: `${a}`, params: { mode, a } };
    return { question: `平行な 2直線に 1つの 直線が 交わっています。\n一方の 同側内角が ${a}° のとき、もう一方の 同側内角は 何度？`, type: 'input', inputType: 'number', answer: `${180 - a}`, params: { mode, a } };
  }

  if (type === 'litValue') {
    const x = randInt(-4, 5), y = randInt(-4, 5);
    const a = jhNonZero(-4, 5), b = jhNonZero(-4, 5);
    return {
      question: `x = ${x}、y = ${y} のとき、${jhPolyDisp([{ c: a, v: 'x' }, { c: b, v: 'y' }])} の 値は？`,
      type: 'input', inputType: 'text', answer: `${a * x + b * y}`, params: { a, b, x, y }
    };
  }

  if (type === 'rangeData') {
    const n = randInt(6, 8);
    const list = [];
    while (list.length < n) { const v = randInt(2, 40); if (!list.includes(v)) list.push(v); }
    return {
      question: `データ：${list.join('、')}\nこの データの 範囲（最大値 － 最小値）は？`,
      type: 'input', inputType: 'number', answer: `${Math.max(...list) - Math.min(...list)}`, params: { list }
    };
  }

  if (type === 'quartile') {
    const sorted = [];
    while (sorted.length < 8) { const v = randInt(2, 40); if (!sorted.includes(v)) sorted.push(v); }
    sorted.sort((p, q) => p - q);
    const med = (arr) => { const m = arr.length; return m % 2 ? arr[(m - 1) / 2] : (arr[m / 2 - 1] + arr[m / 2]) / 2; };
    const q1 = med(sorted.slice(0, 4)), q3 = med(sorted.slice(4)), q2 = med(sorted);
    const which = randInt(0, 3);
    const names = ['第1四分位数', '第2四分位数（中央値）', '第3四分位数', '四分位範囲（第3四分位数 － 第1四分位数）'];
    const vals = [q1, q2, q3, q3 - q1];
    const shuffled = shuffleArray(sorted);
    return {
      question: `データ：${shuffled.join('、')}\n${names[which]}は？\n（小数のときは 0.5 のように 入力）`,
      type: 'input', inputType: 'text', answer: `${vals[which]}`, params: { sorted, which, q1, q2, q3 }
    };
  }

  if (type === 'simul') {
    const x = randInt(-4, 6), y = randInt(-4, 6);
    const simple = diff < 2 || Math.random() < 0.3;
    let a1, b1, a2, b2;
    if (simple) {            // 加減法が すぐ 使える形
      a1 = 1; b1 = 1; a2 = 1; b2 = -1;
      if (Math.random() < 0.5) { a2 = 2; b2 = 1; a1 = 1; b1 = -1; }
    } else {
      do { a1 = jhNonZero(-3, 4); b1 = jhNonZero(-3, 4); a2 = jhNonZero(-3, 4); b2 = jhNonZero(-3, 4); } while (a1 * b2 - a2 * b1 === 0 || Math.abs(a1) === Math.abs(a2) && Math.abs(b1) === Math.abs(b2));
    }
    const c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y;
    const eq = (a, b, c) => `${jhPolyDisp([{ c: a, v: 'x' }, { c: b, v: 'y' }])} ＝ ${c}`;
    return {
      question: `連立方程式を 解こう\n${eq(a1, b1, c1)}\n${eq(a2, b2, c2)}\n（答えは x=9, y=-8 のように 入力）`,
      type: 'input', inputType: 'text', answerType: 'xy', answer: `x=${x}, y=${y}`, params: { a1, b1, c1, a2, b2, c2, x, y }
    };
  }

  if (type === 'simulWord') {
    const price1 = jhPick([40, 50, 60, 80, 100, 120]), price2 = jhPick([100, 120, 150, 180, 200]);
    const m1 = randInt(1, 3), n1 = randInt(1, 3), m2 = randInt(1, 3), n2 = randInt(1, 3);
    if (m1 * n2 - m2 * n1 === 0) return genGrade8(diff);
    const t1 = m1 * price1 + n1 * price2, t2 = m2 * price1 + n2 * price2;
    const askPen = Math.random() < 0.5;
    return {
      question: `えんぴつ ${m1}本と ノート ${n1}冊で ${t1}円、\nえんぴつ ${m2}本と ノート ${n2}冊で ${t2}円 です。\n${askPen ? 'えんぴつ 1本' : 'ノート 1冊'}の ねだんは 何円？`,
      type: 'input', inputType: 'number', answer: `${askPen ? price1 : price2}`, params: { m1, n1, t1, m2, n2, t2, askPen, price1, price2 }
    };
  }

  if (type === 'slope') {
    const m = jhNonZero(-4, 5);
    const x1 = randInt(-3, 3);
    let dx = jhNonZero(-3, 3);
    const y1 = randInt(-5, 5);
    const x2 = x1 + dx, y2 = y1 + m * dx;
    return {
      question: `2点 (${x1}, ${y1})、(${x2}, ${y2}) を通る 直線の 傾きは？`,
      type: 'input', inputType: 'text', answer: `${m}`, params: { x1, y1, x2, y2, m }
    };
  }

  if (type === 'lineEq') {
    const m = jhNonZero(-4, 5), b = randInt(-6, 6);
    const viaPoint = Math.random() < 0.5;
    const ans = `y=${jhPolyStr([{ c: m, v: 'x' }, { c: b, v: '' }])}`;
    if (!viaPoint) {
      return {
        question: `傾きが ${m}、切片が ${b} の 直線の 式を、y = ○x ＋ △ の形で 答えてね\n（例：y=7x+9）`,
        type: 'input', inputType: 'text', answerType: 'lineEq', answer: ans, params: { m, b, viaPoint }
      };
    }
    const x0 = randInt(-3, 4);
    const y0 = m * x0 + b;
    return {
      question: `点 (${x0}, ${y0}) を通り、傾きが ${m} の 直線の 式を、y = ○x ＋ △ の形で 答えてね\n（例：y=7x+9）`,
      type: 'input', inputType: 'text', answerType: 'lineEq', answer: ans, params: { m, b, x0, y0, viaPoint }
    };
  }

  if (type === 'probBag') {
    const r = randInt(1, 6), w = randInt(1, 6);
    const [n, d] = reduceFraction(r, r + w);
    return {
      question: `赤玉が ${r}個、白玉が ${w}個 入った 袋から、1個 取り出します。\n赤玉が 出る 確率は？（分数で 答えてね）`,
      type: 'input', inputType: 'text', isFraction: true, answer: `${n}/${d}`, params: { r, w }
    };
  }

  if (type === 'probBag2') {
    const r = randInt(2, 5), w = randInt(1, 4);
    const total = r + w;
    const [n, d] = reduceFraction(r * (r - 1), total * (total - 1));
    return {
      question: `赤玉が ${r}個、白玉が ${w}個 入った 袋から、同時に 2個 取り出します。\n2個とも 赤玉である 確率は？（分数で 答えてね）`,
      type: 'input', inputType: 'text', isFraction: true, answer: `${n}/${d}`, params: { r, w }
    };
  }

  if (type === 'probCoin') {
    const mode = randInt(0, 2);
    if (mode === 0) {
      const n = randInt(2, 3);
      return { question: `10円玉を ${n}回 投げるとき、すべて 表になる 確率は？（分数で 答えてね）`, type: 'input', inputType: 'text', isFraction: true, answer: `1/${2 ** n}`, params: { mode, n } };
    }
    if (mode === 1) {
      return { question: '10円玉を 3回 投げるとき、表が ちょうど 1回 出る 確率は？（分数で 答えてね）', type: 'input', inputType: 'text', isFraction: true, answer: '3/8', params: { mode } };
    }
    return { question: '10円玉を 2回 投げるとき、表と 裏が 1回ずつ 出る 確率は？（分数で 答えてね）', type: 'input', inputType: 'text', isFraction: true, answer: '1/2', params: { mode } };
  }

  if (type === 'probDice') {
    const mode = randInt(0, 2);
    if (mode === 0) {
      const s = randInt(2, 12);
      let ways = 0;
      for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (i + j === s) ways++;
      const [n, d] = reduceFraction(ways, 36);
      return { question: `大小 2つの さいころを 同時に 投げるとき、目の和が ${s} になる 確率は？（分数で 答えてね）`, type: 'input', inputType: 'text', isFraction: true, answer: `${n}/${d}`, params: { mode, s, ways } };
    }
    if (mode === 1) {
      return { question: '大小 2つの さいころを 同時に 投げるとき、2つとも 同じ目が 出る 確率は？（分数で 答えてね）', type: 'input', inputType: 'text', isFraction: true, answer: '1/6', params: { mode } };
    }
    return { question: 'さいころを 1回 投げるとき、3の倍数の目が 出る 確率は？（分数で 答えてね）', type: 'input', inputType: 'text', isFraction: true, answer: '1/3', params: { mode } };
  }

  if (type === 'congruent') {
    const items = [
      { q: '2つの三角形が 合同であるための 条件として まちがっているものは どれ？', a: '3組の角が それぞれ等しい', d: ['3組の辺が それぞれ等しい', '2組の辺と その間の角が それぞれ等しい', '1組の辺と その両端の角が それぞれ等しい'] },
      { q: '△ABC と △DEF で、AB=DE、BC=EF、CA=FD のとき、合同といえる 理由は？', a: '3組の辺が それぞれ等しい', d: ['2組の辺と その間の角が それぞれ等しい', '1組の辺と その両端の角が それぞれ等しい', '3組の角が それぞれ等しい'] },
      { q: '△ABC と △DEF で、AB=DE、∠B=∠E、BC=EF のとき、合同といえる 理由は？', a: '2組の辺と その間の角が それぞれ等しい', d: ['3組の辺が それぞれ等しい', '1組の辺と その両端の角が それぞれ等しい', '3組の角が それぞれ等しい'] },
      { q: '△ABC と △DEF で、BC=EF、∠B=∠E、∠C=∠F のとき、合同といえる 理由は？', a: '1組の辺と その両端の角が それぞれ等しい', d: ['3組の辺が それぞれ等しい', '2組の辺と その間の角が それぞれ等しい', '3組の角が それぞれ等しい'] },
      { q: '合同な 図形について、正しいものは どれ？', a: '対応する 辺や 角は それぞれ等しい', d: ['対応する 辺は 2倍に なっている', '面積だけが 等しい', '形は 同じで 大きさは ちがう'] },
      { q: '合同な 図形を 表す 記号は どれ？', a: '≡', d: ['∽', '＝', '≠'] },
      { q: '「仮定」と「結論」について、「△ABC≡△DEF ならば AB=DE」の 結論は どれ？', a: 'AB=DE', d: ['△ABC≡△DEF', '△ABC と △DEF', 'ならば'] },
      { q: '証明で「仮定」と 呼ぶのは どれ？', a: '問題で 前提として 与えられていること', d: ['証明したいこと', '図形の名前', '計算の答え'] }
    ];
    const it = jhPick(items);
    return { question: it.q, type: 'choice', choices: jhChoices(it.a, it.d), answer: it.a, explain: JH_EX[it.q] || '', params: { q: it.q } };
  }

  if (type === 'parallelogram') {
    const items = [
      { q: '平行四辺形について 正しいものは どれ？', a: '2組の 対辺は それぞれ 等しい', d: ['4つの角が すべて 等しい', '対角線が 直角に 交わる', '4つの辺が すべて 等しい'] },
      { q: '平行四辺形の 対角線について 正しいものは どれ？', a: 'それぞれの 中点で 交わる', d: ['かならず 等しい長さ', 'かならず 直角に 交わる', 'かならず 平行'] },
      { q: '平行四辺形の 対角について 正しいものは どれ？', a: '2組の 対角は それぞれ 等しい', d: ['となりあう角は 等しい', 'すべて 90° になる', '内角の和は 360°より 小さい'] },
      { q: '四角形が 平行四辺形に なる 条件として 正しいものは どれ？', a: '対角線が それぞれの 中点で 交わる', d: ['1組の 対辺が 等しい', '1組の 対角が 等しい', '対角線が 垂直に 交わる'] },
      { q: '長方形の 性質として 正しいものは どれ？', a: '対角線の 長さが 等しい', d: ['4つの辺が すべて 等しい', '対角線が 垂直に 交わる', 'となりあう辺が 等しい'] },
      { q: 'ひし形の 性質として 正しいものは どれ？', a: '対角線が 垂直に 交わる', d: ['4つの角が すべて 等しい', '対角線の 長さが 等しい', '対辺が 平行でない'] }
    ];
    const it = jhPick(items);
    return { question: it.q, type: 'choice', choices: jhChoices(it.a, it.d), answer: it.a, explain: JH_EX[it.q] || '', params: { q: it.q } };
  }

  // transpose：等式の変形
  const a = randInt(2, 5), b = randInt(2, 5), c = a * randInt(2, 4) + b * randInt(1, 3);
  const correct = `y = (${c} － ${a}x) ÷ ${b}`;
  return {
    question: `${a}x ＋ ${b}y ＝ ${c} を y について 解くと？`,
    type: 'choice',
    choices: jhChoices(correct, [`y = (${c} ＋ ${a}x) ÷ ${b}`, `y = (${a}x － ${c}) ÷ ${b}`, `y = (${c} － ${a}x) × ${b}`]),
    answer: correct, params: { a, b, c }
  };
}

// =====================================================================
// 中3
// =====================================================================
function jhSqrtStr(k, m) { return k === 1 ? `√${m}` : `${k}√${m}`; }

function genGrade9(diff = 1) {
  const typePools = [
    ['expandMono', 'expandFormula', 'factorCommon', 'sqrtInt', 'sqrtSimplify', 'quadSolve', 'quadFunc', 'pythag', 'circleAngle', 'simLen', 'sampling'],
    ['expandMono', 'expandFormula', 'factorCommon', 'factorFormula', 'sqrtInt', 'sqrtRange', 'sqrtSimplify', 'sqrtAddSub', 'sqrtMulDiv', 'quadSolve', 'quadFormula', 'quadFunc', 'quadRate', 'simRatio', 'simLen', 'circleAngle', 'pythag', 'pythagCheck', 'sampling', 'sampleEstimate'],
    ['expandFormula', 'factorCommon', 'factorFormula', 'sqrtRange', 'sqrtSimplify', 'sqrtAddSub', 'sqrtMulDiv', 'quadSolve', 'quadFormula', 'quadRate', 'simRatio', 'simLen', 'circleAngle', 'pythag', 'pythagCheck', 'sampleEstimate']
  ];
  const types = typePools[diff];
  const type = jhPick(types);
  lastMathType = type;

  if (type === 'expandMono') {
    const a = randInt(2, 5), b = randInt(1, 4), c = jhNonZero(-6, 6);
    const withY = diff >= 1 && Math.random() < 0.4;
    if (withY) {
      return {
        question: `${a}x(${b === 1 ? '' : b}x ${c < 0 ? '－' : '＋'} ${Math.abs(c)}y) を 展開しよう\n${JH_NOTE_SQ}`,
        type: 'input', inputType: 'text', answerType: 'algebra',
        answer: jhPolyStr([{ c: a * b, v: 'x²' }, { c: a * c, v: 'xy' }]), params: { a, b, c, withY }
      };
    }
    return {
      question: `${a}x(${jhLin(b, 'x', c)}) を 展開しよう\n${JH_NOTE_SQ}`,
      type: 'input', inputType: 'text', answerType: 'algebra',
      answer: jhPolyStr([{ c: a * b, v: 'x²' }, { c: a * c, v: 'x' }]), params: { a, b, c, withY }
    };
  }

  if (type === 'expandFormula') {
    const form = diff === 0 ? randInt(0, 1) : randInt(0, 3);
    if (form === 0) {          // (x+a)(x+b)
      const a = jhNonZero(-7, 8), b = jhNonZero(-7, 8);
      return {
        question: `(x ${a < 0 ? '－' : '＋'} ${Math.abs(a)})(x ${b < 0 ? '－' : '＋'} ${Math.abs(b)}) を 展開しよう\n${JH_NOTE_SQ}`,
        type: 'input', inputType: 'text', answerType: 'algebra',
        answer: jhPolyStr([{ c: 1, v: 'x²' }, { c: a + b, v: 'x' }, { c: a * b, v: '' }]), params: { form, a, b }
      };
    }
    if (form === 1) {          // (x±a)²
      const a = jhNonZero(-8, 8);
      return {
        question: `(x ${a < 0 ? '－' : '＋'} ${Math.abs(a)})² を 展開しよう\n${JH_NOTE_SQ}`,
        type: 'input', inputType: 'text', answerType: 'algebra',
        answer: jhPolyStr([{ c: 1, v: 'x²' }, { c: 2 * a, v: 'x' }, { c: a * a, v: '' }]), params: { form, a }
      };
    }
    if (form === 2) {          // (x+a)(x-a)
      const a = randInt(2, 9);
      return {
        question: `(x ＋ ${a})(x － ${a}) を 展開しよう\n${JH_NOTE_SQ}`,
        type: 'input', inputType: 'text', answerType: 'algebra',
        answer: jhPolyStr([{ c: 1, v: 'x²' }, { c: -a * a, v: '' }]), params: { form, a }
      };
    }
    const p = randInt(1, 3), r = randInt(1, 3), q = jhNonZero(-5, 5), s = jhNonZero(-5, 5);   // (px+q)(rx+s)
    return {
      question: `(${jhLin(p, 'x', q)})(${jhLin(r, 'x', s)}) を 展開しよう\n${JH_NOTE_SQ}`,
      type: 'input', inputType: 'text', answerType: 'algebra',
      answer: jhPolyStr([{ c: p * r, v: 'x²' }, { c: p * s + q * r, v: 'x' }, { c: q * s, v: '' }]), params: { form, p, q, r, s }
    };
  }

  if (type === 'factorCommon') {
    const g = diff === 0 ? randInt(1, 3) : randInt(1, 5);
    let p, q;
    do { p = randInt(1, 5); q = jhNonZero(-6, 6); } while (_jhGcd(p, Math.abs(q)) !== 1);
    const inner = jhLinAns(p, 'x', q);
    return {
      question: `${jhPolyDisp([{ c: g * p, v: 'x²' }, { c: g * q, v: 'x' }])} を 因数分解しよう\n${JH_NOTE_SQ}\n${JH_NOTE_FACTOR}`,
      type: 'input', inputType: 'text', answerType: 'factor',
      answer: `${g === 1 ? '' : g}x(${inner})`, params: { g, p, q }
    };
  }

  if (type === 'factorFormula') {
    const form = randInt(0, diff === 2 ? 3 : 2);
    if (form === 0) {          // x² + (a+b)x + ab
      let a, b;
      do { a = jhNonZero(-8, 8); b = jhNonZero(-8, 8); } while (a === b);
      const lo = Math.min(a, b), hi = Math.max(a, b);
      return {
        question: `${jhPolyDisp([{ c: 1, v: 'x²' }, { c: a + b, v: 'x' }, { c: a * b, v: '' }])} を 因数分解しよう\n${JH_NOTE_SQ}\n${JH_NOTE_FACTOR}`,
        type: 'input', inputType: 'text', answerType: 'factor',
        answer: `(x${lo < 0 ? '-' : '+'}${Math.abs(lo)})(x${hi < 0 ? '-' : '+'}${Math.abs(hi)})`, params: { form, a, b }
      };
    }
    if (form === 1) {          // (x±a)²
      const a = jhNonZero(-8, 8);
      return {
        question: `${jhPolyDisp([{ c: 1, v: 'x²' }, { c: 2 * a, v: 'x' }, { c: a * a, v: '' }])} を 因数分解しよう\n${JH_NOTE_SQ}\n${JH_NOTE_FACTOR}`,
        type: 'input', inputType: 'text', answerType: 'factor', answer: `(x${a < 0 ? '-' : '+'}${Math.abs(a)})²`, params: { form, a }
      };
    }
    if (form === 2) {          // x² - a²
      const a = randInt(2, 9);
      return {
        question: `${jhPolyDisp([{ c: 1, v: 'x²' }, { c: -a * a, v: '' }])} を 因数分解しよう\n${JH_NOTE_SQ}\n${JH_NOTE_FACTOR}`,
        type: 'input', inputType: 'text', answerType: 'factor', answer: `(x+${a})(x-${a})`, params: { form, a }
      };
    }
    // 共通因数 ＋ 公式：g(x² + (a+b)x + ab)
    const g = randInt(2, 4);
    let a, b;
    do { a = jhNonZero(-5, 5); b = jhNonZero(-5, 5); } while (a === b);
    const lo = Math.min(a, b), hi = Math.max(a, b);
    return {
      question: `${jhPolyDisp([{ c: g, v: 'x²' }, { c: g * (a + b), v: 'x' }, { c: g * a * b, v: '' }])} を 因数分解しよう\n${JH_NOTE_SQ}\n${JH_NOTE_FACTOR}`,
      type: 'input', inputType: 'text', answerType: 'factor',
      answer: `${g}(x${lo < 0 ? '-' : '+'}${Math.abs(lo)})(x${hi < 0 ? '-' : '+'}${Math.abs(hi)})`, params: { form, g, a, b }
    };
  }

  if (type === 'sqrtInt') {
    const n = randInt(2, 15);
    return { question: `√${n * n} ＝ ？`, type: 'input', inputType: 'number', answer: `${n}`, params: { n } };
  }

  if (type === 'sqrtRange') {
    let n;
    do { n = randInt(2, 99); } while (Number.isInteger(Math.sqrt(n)));
    const a = Math.floor(Math.sqrt(n));
    const correct = `${a} と ${a + 1} の間`;
    return {
      question: `√${n} は、どの 連続する 2つの 整数の 間に ある？`,
      type: 'choice', choices: jhChoices(correct, [`${a - 1} と ${a} の間`, `${a + 1} と ${a + 2} の間`, `${a + 2} と ${a + 3} の間`]),
      answer: correct, params: { n, a }
    };
  }

  if (type === 'sqrtSimplify') {
    const k = randInt(2, diff === 0 ? 4 : 6), m = jhPick(diff === 0 ? [2, 3, 5] : [2, 3, 5, 6, 7, 10]);
    const correct = jhSqrtStr(k, m);
    return {
      question: `√${k * k * m} を、a√b の 形に 直すと？（b は できるだけ 小さい 整数）`,
      type: 'choice', choices: jhChoices(correct, [jhSqrtStr(m, k), jhSqrtStr(k + 1, m), jhSqrtStr(k, m + 1), jhSqrtStr(k * 2, m)]),
      answer: correct, params: { k, m }
    };
  }

  if (type === 'sqrtAddSub') {
    const m = jhPick([2, 3, 5, 6, 7]);
    const add = Math.random() < 0.6;
    let a = randInt(2, 7), b = randInt(1, 6);
    if (!add && a <= b) a = b + randInt(1, 3);
    const res = add ? a + b : a - b;
    const correct = jhSqrtStr(res, m);
    return {
      question: `${jhSqrtStr(a, m)} ${add ? '＋' : '－'} ${jhSqrtStr(b, m)} ＝ ？`,
      type: 'choice', choices: jhChoices(correct, [jhSqrtStr(res, m * 2), jhSqrtStr(a * b, m), jhSqrtStr(res + 1, m), `√${(a + (add ? b : -b)) * m}`]),
      answer: correct, params: { a, b, m, add }
    };
  }

  if (type === 'sqrtMulDiv') {
    const p = jhPick([2, 3, 5]), k = randInt(2, 4);
    if (Math.random() < 0.5) {
      return { question: `√${p} × √${p * k * k} ＝ ？`, type: 'input', inputType: 'number', answer: `${p * k}`, params: { p, k, mul: true } };
    }
    return { question: `√${p * k * k} ÷ √${p} ＝ ？`, type: 'input', inputType: 'number', answer: `${k}`, params: { p, k, mul: false } };
  }

  if (type === 'quadSolve') {
    const mode = diff === 0 ? 0 : randInt(0, diff === 2 ? 3 : 2);
    if (mode === 0) {          // x² + (a+b)x + ab = 0（a,b > 0）
      let a = randInt(1, 6), b = randInt(1, 6);
      if (a === b) b += 1;
      return {
        question: `二次方程式 ${jhPolyDisp([{ c: 1, v: 'x²' }, { c: a + b, v: 'x' }, { c: a * b, v: '' }])} ＝ 0 を 解こう\n（答えは x=11, x=-12 のように 入力）`,
        type: 'input', inputType: 'text', answerType: 'roots', answer: `x=${-Math.max(a, b)}, x=${-Math.min(a, b)}`, params: { mode, a, b }
      };
    }
    if (mode === 1) {          // 符号が まざる
      let a, b;
      do { a = jhNonZero(-7, 7); b = jhNonZero(-7, 7); } while (a === b);
      const lo = Math.min(-a, -b), hi = Math.max(-a, -b);
      return {
        question: `二次方程式 ${jhPolyDisp([{ c: 1, v: 'x²' }, { c: a + b, v: 'x' }, { c: a * b, v: '' }])} ＝ 0 を 解こう\n（答えは x=11, x=-12 のように 入力）`,
        type: 'input', inputType: 'text', answerType: 'roots', answer: `x=${lo}, x=${hi}`, params: { mode, a, b }
      };
    }
    if (mode === 2) {          // 平方の形 (重解)
      const a = jhNonZero(-7, 7);
      return {
        question: `二次方程式 ${jhPolyDisp([{ c: 1, v: 'x²' }, { c: 2 * a, v: 'x' }, { c: a * a, v: '' }])} ＝ 0 を 解こう\n（答えは x=11 のように 入力）`,
        type: 'input', inputType: 'text', answerType: 'roots', answer: `x=${-a}`, params: { mode, a }
      };
    }
    const c = randInt(2, 9);   // x² − c x = 0  または x² = k²
    if (Math.random() < 0.5) {
      return {
        question: `二次方程式 x² ＝ ${c * c} を 解こう\n（答えは x=11, x=-12 のように 入力）`,
        type: 'input', inputType: 'text', answerType: 'roots', answer: `x=${-c}, x=${c}`, params: { mode: 3, c, sq: true }
      };
    }
    return {
      question: `二次方程式 x² － ${c}x ＝ 0 を 解こう\n（答えは x=11, x=-12 のように 入力）`,
      type: 'input', inputType: 'text', answerType: 'roots', answer: `x=0, x=${c}`, params: { mode: 3, c, sq: false }
    };
  }

  if (type === 'quadFormula') {
    const fm = (n) => (n < 0 ? `－${-n}` : `${n}`);
    let b, c, D;
    do { b = jhNonZero(-7, 7); c = jhNonZero(-5, 5); D = b * b - 4 * c; } while (D <= 0 || Number.isInteger(Math.sqrt(D)) || !_jhSquareFree(D));
    const correct = `x ＝ (${fm(-b)} ± √${D}) ÷ 2`;
    const wrongD = b * b + 4 * c > 0 && b * b + 4 * c !== D ? b * b + 4 * c : D + 2;
    return {
      question: `二次方程式 ${jhPolyDisp([{ c: 1, v: 'x²' }, { c: b, v: 'x' }, { c, v: '' }])} ＝ 0 を 解の公式で 解くと？`,
      type: 'choice',
      choices: jhChoices(correct, [`x ＝ (${fm(b)} ± √${D}) ÷ 2`, `x ＝ (${fm(-b)} ± √${wrongD}) ÷ 2`, `x ＝ (${fm(-b)} ± √${D}) ÷ 4`]),
      answer: correct, params: { b, c, D }
    };
  }

  if (type === 'sampleEstimate') {
    let n, k, B;
    do {
      [n, k] = jhPick([[20, 2], [30, 3], [40, 5], [50, 5], [60, 4], [20, 4], [40, 4]]);
      B = jhPick([20, 30, 40, 50, 60]);
    } while ((B * n) % k !== 0);
    const N = (B * n) / k;
    return {
      question: `袋の中に 白い碁石が たくさん 入っています。同じ 大きさの 黒い碁石を ${B}個 入れて よくまぜ、そこから ${n}個 取り出すと、黒い碁石が ${k}個 ふくまれていました。\n袋の中の 白い碁石は、およそ 何個と 考えられる？`,
      type: 'input', inputType: 'number', answer: `${N - B}`, params: { B, n, k, N }
    };
  }

  if (type === 'quadFunc') {
    const a = jhNonZero(-3, 4), x = randInt(-4, 4);
    return {
      question: `関数 y = ${a === 1 ? '' : a === -1 ? '－' : a}x² で、x = ${x} のとき y は？`,
      type: 'input', inputType: 'text', answer: `${a * x * x}`, params: { a, x }
    };
  }

  if (type === 'quadRate') {
    const a = jhNonZero(-3, 4);
    let p = randInt(-3, 4), q = randInt(-3, 5);
    if (p === q) q += 1;
    const lo = Math.min(p, q), hi = Math.max(p, q);
    return {
      question: `関数 y = ${a === 1 ? '' : a === -1 ? '－' : a}x² で、x が ${lo} から ${hi} まで 増加するときの 変化の割合は？`,
      type: 'input', inputType: 'text', answer: `${a * (lo + hi)}`, params: { a, lo, hi }
    };
  }

  if (type === 'simRatio') {
    let m, n;
    do { m = randInt(1, 5); n = randInt(2, 6); } while (m === n || _jhGcd(m, n) !== 1);
    const vol = diff >= 1 && Math.random() < 0.4;
    return {
      question: `相似比が ${m}:${n} の 2つの ${vol ? '立体' : '図形'}の ${vol ? '体積比' : '面積比'}は？\n（例：2:7 のように 入力）`,
      type: 'input', inputType: 'text', answerType: 'ratio', answer: vol ? `${m ** 3}:${n ** 3}` : `${m * m}:${n * n}`, params: { m, n, vol }
    };
  }

  if (type === 'simLen') {
    const k = randInt(2, 4), ab = randInt(2, 6), bc = randInt(3, 8);
    return {
      question: `△ABC ∽ △DEF で、AB=${ab}cm、BC=${bc}cm、DE=${ab * k}cm のとき、EF は 何cm？`,
      type: 'input', inputType: 'number', answer: `${bc * k}`, params: { k, ab, bc }
    };
  }

  if (type === 'circleAngle') {
    const t = randInt(4, 17) * 5;   // 20〜85
    const mode = randInt(0, 2);
    if (mode === 0) {
      return { question: `円で、弧ABに対する 中心角が ${t * 2}° のとき、同じ弧に対する 円周角は 何度？`, type: 'input', inputType: 'number', answer: `${t}`, params: { mode, t } };
    }
    if (mode === 1) {
      return { question: `円で、弧ABに対する 円周角が ${t}° のとき、同じ弧に対する 中心角は 何度？`, type: 'input', inputType: 'number', answer: `${t * 2}`, params: { mode, t } };
    }
    return { question: `線分ABが 円の 直径のとき、円周上の 点Pに対する ∠APB は 何度？`, type: 'input', inputType: 'number', answer: '90', params: { mode } };
  }

  if (type === 'pythag') {
    const base = diff === 0 ? [[3, 4, 5], [5, 12, 13]] : [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29]];
    const t = jhPick(base), k = diff === 0 ? jhPick([1, 2]) : randInt(1, 3);
    const [a, b, c] = t.map(v => v * k);
    if (Math.random() < 0.5) {
      return { question: `直角三角形で、直角を はさむ 2辺が ${a}cm と ${b}cm のとき、斜辺は 何cm？`, type: 'input', inputType: 'number', answer: `${c}`, params: { a, b, c, hyp: true } };
    }
    return { question: `直角三角形で、斜辺が ${c}cm、他の1辺が ${a}cm のとき、のこりの辺は 何cm？`, type: 'input', inputType: 'number', answer: `${b}`, params: { a, b, c, hyp: false } };
  }

  if (type === 'pythagCheck') {
    const t = jhPick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [9, 12, 15]]);
    const right = Math.random() < 0.5;
    const sides = t.slice();
    if (!right) sides[2] += jhPick([-1, 1]);
    const yes = '直角三角形になる', no = '直角三角形にならない';
    return {
      question: `3辺の 長さが ${sides.join('cm、')}cm の 三角形は、直角三角形に なる？`,
      type: 'choice', choices: [yes, no], answer: right ? yes : no, params: { sides, right }
    };
  }

  // sampling：標本調査
  const items = [
    { q: '次のうち、標本調査で 行うのが ふさわしいものは どれ？', a: '工場で 作った 電球の 寿命の 調査', d: ['学校で 行う 健康診断', '国が 行う 国勢調査', 'クラスの 出席番号の 確認'] },
    { q: '次のうち、全数調査で 行うのが ふさわしいものは どれ？', a: '学校で 行う 視力検査', d: ['ある工場で 作った 缶詰の 品質検査', '海でとれた 魚の 全体の数の 推定', '電池の 寿命の 調査'] },
    { q: '調べたい 集団全体を 何という？', a: '母集団', d: ['標本', '階級', '度数'] },
    { q: '母集団から 取り出して 調べた 一部を 何という？', a: '標本', d: ['母集団', '全数', '平均'] },
    { q: '標本調査で、標本を 取り出すとき 大切なことは どれ？', a: 'かたよりが ないように 無作為に 取り出す', d: ['わかりやすい ものだけを 選ぶ', '最初の 数人だけを 調べる', '好きな人だけを 選ぶ'] },
    { q: '袋の 中の 白玉と 赤玉の 割合を 調べるとき、標本調査では どうする？', a: '一部を 取り出して 割合から 全体を 推定する', d: ['全部 取り出して 数える', '1個だけ 調べて 決める', '見た目で 適当に 決める'] },
    { q: '標本の 大きさ（取り出す数）を 大きくすると、推定は どうなる？', a: '母集団の 性質に 近づきやすい', d: ['まったく 変わらない', 'かならず 外れる', '調査が 不要になる'] },
    { q: '次のうち、標本調査 ではないものは どれ？', a: '国勢調査', d: ['テレビの 視聴率調査', '世論調査', '食品の 品質検査'] }
  ];
  const it = jhPick(items);
  return { question: it.q, type: 'choice', choices: jhChoices(it.a, it.d), answer: it.a, explain: JH_EX[it.q] || '', params: { q: it.q } };
}

function _jhSquareFree(n) { for (let k = 2; k * k <= n; k++) if (n % (k * k) === 0) return false; return true; }
function _jhGcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; }
