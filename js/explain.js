// ===== 答え合わせのあとの「やさしい解説」 =====
// 問題データ（math.js など）は変えず、問題文から式を読み取って解説を作る。
// 作った式の答えが問題の答えと一致したときだけ表示する（まちがった解説は出さない）。
// 学年に合わない言葉（1年生に「くらい」「かけ算」など）は使わない。説明できないときは空文字を返す。

function explainArith(op, a, b, answer, grade) {
  const lower = grade === 1; // 1年生は「10といくつ」で説明する（くらい・かけ算・わり算は使わない）

  if (op === '+') {
    const sum = a + b;
    if (String(sum) !== String(answer)) return '';
    if (a < 10 && b < 10 && sum > 10) {
      const big = Math.max(a, b);
      const small = Math.min(a, b);
      const need = 10 - big;
      return `${big}に ${need}を たして 10。\nのこりの ${small - need}を たすと ${sum}。`;
    }
    if (sum <= 10) return `${a}の つぎから ${b}こ かぞえると ${sum}。`;
    if (lower) {
      if (a >= 10 && a < 20 && b < 10 && a % 10 + b < 10) {
        return `${a}は 10と ${a - 10}。\n${a - 10} ＋ ${b} = ${a - 10 + b}\n10と ${a - 10 + b}で ${sum}。`;
      }
      return '';
    }
    if (a < 100 && b < 100) {
      const ta = Math.floor(a / 10) * 10, tb = Math.floor(b / 10) * 10;
      const oa = a % 10, ob = b % 10;
      if (oa === 0 && ob === 0) return '';
      if (oa === 0 || ob === 0) {
        // どちらかがちょうど10のまとまり：もう一方を「10のまとまり」と「ばら」に分ける
        const [round, other, to, oo] = oa === 0 ? [a, b, tb, ob] : [b, a, ta, oa];
        return `${other}は ${to}と ${oo}。
${to} ＋ ${round} = ${to + round}
${to + round}と ${oo}で ${sum}。`;
      }
      return `${ta} ＋ ${tb} = ${ta + tb}\n${oa} ＋ ${ob} = ${oa + ob}\n${ta + tb} ＋ ${oa + ob} = ${sum}`;
    }
    return '';
  }

  if (op === '-') {
    const diff = a - b;
    if (String(diff) !== String(answer)) return '';
    if (a <= 10) return `${a}から ${b}こ とると、のこりは ${diff}。`;
    // 20までの数から1けたをひく：全学年で「10といくつ」の考え方
    if (a < 20 && b < 10 && b <= a - 10) {
      return `${a}は 10と ${a - 10}。\n${a - 10} － ${b} = ${a - 10 - b}\n10と ${a - 10 - b}で ${diff}。`;
    }
    if (a < 20 && b < 10) {
      return `${a}を 10と ${a - 10}に わけるよ。\n10 － ${b} = ${10 - b}\n${10 - b} ＋ ${a - 10} = ${diff}`;
    }
    if (a === 20 && b < 10) {
      return `20は 10と 10。\n10 － ${b} = ${10 - b}\n10と ${10 - b}で ${diff}。`;
    }
    if (lower) return '';
    // 2けた － 1けた
    if (a < 100 && b < 10) {
      const ta = Math.floor(a / 10) * 10, oa = a % 10;
      if (oa === 0) return `${a}は ${a - 10}と 10。
10 － ${b} = ${10 - b}
${a - 10}と ${10 - b}で ${diff}。`;
      if (b <= oa) return `${a}は ${ta}と ${oa}。\n${oa} － ${b} = ${oa - b}\n${ta}と ${oa - b}で ${diff}。`;
      return `${a} － ${oa} = ${ta}\n${ta} － ${b - oa} = ${diff}`;
    }
    // 2けた以上 － 2けた：ひく数を10のまとまりと1に分けて、2回に分けてひく
    if (a < 1000 && b < 100) {
      const tb = Math.floor(b / 10) * 10, ob = b % 10;
      if (ob === 0 || tb === 0) return '';
      return `${a} － ${tb} = ${a - tb}\n${a - tb} － ${ob} = ${diff}`;
    }
    return '';
  }

  if (lower) return '';

  if (op === '*') {
    const prod = a * b;
    if (String(prod) !== String(answer)) return '';
    if (b === 1) return `${a}が 1つぶんだから、${a}。`;
    if (a <= 9 && b <= 9) return `${a}を ${b}かい たした かずだよ。\n${a} × ${b} = ${prod}（くくで おぼえよう）`;
    if (a < 100 && b <= 9) {
      const ta = Math.floor(a / 10) * 10, oa = a % 10;
      return `${ta} × ${b} = ${ta * b}\n${oa} × ${b} = ${oa * b}\n${ta * b} ＋ ${oa * b} = ${prod}`;
    }
    return '';
  }

  if (op === '/') {
    if (b === 0 || a % b !== 0) return '';
    const q = a / b;
    if (String(q) !== String(answer)) return '';
    return `${b} × □ = ${a} の □を さがそう。\n${b} × ${q} = ${a} だから、こたえは ${q}。`;
  }

  return '';
}

function explainProblem(problem, subject, grade) {
  if (!problem || !problem.question || subject !== 'math') return '';
  // 種類ごとの「解き方」があれば それを使う（js/steps.js）。なければ、下の問題文から読みとる方式。
  if (typeof mathSteps === 'function') {
    const steps = mathSteps(problem, grade);
    if (steps) return steps.join('\n');
  }
  try {
    const q = problem.question;
    const answer = problem.answer;

    let m = q.match(/^(\d+) ([＋－×÷]) (\d+) = ？$/);
    if (m) {
      const op = { '＋': '+', '－': '-', '×': '*', '÷': '/' }[m[2]];
      return explainArith(op, Number(m[1]), Number(m[3]), answer, grade);
    }

    // あまりのあるわり算（3年生〜）
    m = q.match(/^(\d+) ÷ (\d+) = ？\nあまりも/);
    if (m && problem.answerType === 'remainder' && grade >= 3) {
      const a = Number(m[1]), b = Number(m[2]);
      if (b === 0) return '';
      const qt = Math.floor(a / b), r = a % b;
      if (String(answer).replace(/\s+/g, '') !== `${qt}あまり${r}`) return '';
      return `${b} × ${qt} = ${b * qt}\n${a} － ${b * qt} = ${r} あまるよ。\nだから ${qt}あまり${r}。`;
    }

    // 10になる数
    m = q.match(/^(\d+) と あわせて 10に なる/);
    if (m) {
      const a = Number(m[1]);
      if (String(answer) !== String(10 - a)) return '';
      return `${a} ＋ ${10 - a} = 10 だね。`;
    }

    // 大きさくらべ
    m = q.match(/^(\d+) と (\d+) では/);
    if (m && problem.type === 'choice') {
      const a = Number(m[1]), b = Number(m[2]);
      if ((a > b) !== (answer === 'おおきい')) return '';
      return a > b ? `${a}は ${b}より おおきいよ。` : `${a}は ${b}より ちいさいよ。`;
    }

    // 1年生の文章題（たし算・ひき算）：まず式、説明できるときだけ続けて説明
    if (grade === 1 && q.indexOf('\n') >= 0) {
      const nums = q.match(/\d+/g);
      if (nums && nums.length === 2) {
        const a = Number(nums[0]), b = Number(nums[1]);
        if (/もらう|あわせて|ぜんぶで/.test(q)) {
          if (String(a + b) !== String(answer)) return '';
          const body = explainArith('+', a, b, answer, grade);
          return `しき：${a} ＋ ${b} = ${a + b}` + (body ? `\n${body}` : '');
        }
        if (/つかう|のこる/.test(q)) {
          if (String(a - b) !== String(answer)) return '';
          const body = explainArith('-', a, b, answer, grade);
          return `しき：${a} － ${b} = ${a - b}` + (body ? `\n${body}` : '');
        }
      }
    }
  } catch (e) {
    return '';
  }
  return '';
}
