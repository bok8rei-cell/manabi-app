// ===== さんすう・すうがく もんだい せいせい =====

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
}

// 分数を約分する -> [分子, 分母]
function reduceFraction(num, den) {
  if (den < 0) { num = -num; den = -den; }
  const g = gcd(num, den);
  return [num / g, den / g];
}

// 分数文字列 "a/b" や 整数文字列 を [num, den] に変換。失敗時は null
function parseFractionInput(str) {
  if (str === null || str === undefined) return null;
  str = String(str).trim();
  if (str === '') return null;
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length !== 2) return null;
    const n = Number(parts[0]);
    const d = Number(parts[1]);
    if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null;
    return reduceFraction(n, d);
  }
  const n = Number(str);
  if (!Number.isFinite(n)) return null;
  return [n, 1];
}

function fractionToString([num, den]) {
  return den === 1 ? `${num}` : `${num}/${den}`;
}

// ===== 1年生 =====
function genGrade1() {
  const types = ['add', 'sub', 'compare', 'addWord', 'subWord', 'tens', 'threeAdd'];
  const type = types[randInt(0, types.length - 1)];

  if (type === 'add') {
    const a = randInt(1, 12);
    const b = randInt(1, 12);
    return {
      question: `${a} ＋ ${b} = ？`,
      type: 'input',
      inputType: 'number',
      answer: `${a + b}`
    };
  }

  if (type === 'sub') {
    const a = randInt(2, 18);
    const b = randInt(1, a);
    return {
      question: `${a} － ${b} = ？`,
      type: 'input',
      inputType: 'number',
      answer: `${a - b}`
    };
  }

  if (type === 'addWord') {
    const items = [
      ['りんご', 'こ'], ['えんぴつ', '本'], ['ねこ', 'びき'],
      ['花', '本'], ['アメ', 'こ'], ['とり', 'わ']
    ];
    const [name, unit] = items[randInt(0, items.length - 1)];
    const a = randInt(1, 9);
    const b = randInt(1, 9);
    return {
      question: `${name}が ${a}${unit}あります。\n${b}${unit}もらうと、あわせて何${unit}になる？`,
      type: 'input',
      inputType: 'number',
      answer: `${a + b}`
    };
  }

  if (type === 'subWord') {
    const items = [
      ['あめ', 'こ'], ['いろえんぴつ', '本'], ['とり', 'わ'], ['カード', 'まい']
    ];
    const [name, unit] = items[randInt(0, items.length - 1)];
    const a = randInt(5, 15);
    const b = randInt(1, a - 1);
    return {
      question: `${name}が ${a}${unit}あります。\n${b}${unit}つかうと、何${unit}のこる？`,
      type: 'input',
      inputType: 'number',
      answer: `${a - b}`
    };
  }

  if (type === 'tens') {
    const a = randInt(1, 9);
    return {
      question: `${a} と あわせて 10に なる数は？`,
      type: 'input',
      inputType: 'number',
      answer: `${10 - a}`
    };
  }

  if (type === 'threeAdd') {
    const a = randInt(1, 8);
    const b = randInt(1, 8);
    const c = randInt(1, 8);
    return {
      question: `${a} ＋ ${b} ＋ ${c} = ？`,
      type: 'input',
      inputType: 'number',
      answer: `${a + b + c}`
    };
  }

  // compare
  let a = randInt(1, 20);
  let b = randInt(1, 20);
  while (a === b) b = randInt(1, 20);
  const choices = ['おおきい', 'ちいさい'];
  const isABigger = a > b;
  return {
    question: `${a} と ${b} では、\n${a} のほうが どっち？`,
    type: 'choice',
    choices,
    answer: isABigger ? 'おおきい' : 'ちいさい'
  };
}

// ===== 3年生 =====
function genGrade3() {
  const types = ['mul', 'div', 'addsub', 'decimal', 'mulWord', 'divRemainder', 'unit', 'time'];
  const type = types[randInt(0, types.length - 1)];

  if (type === 'mul') {
    const a = randInt(1, 9);
    const b = randInt(1, 9);
    return {
      question: `${a} × ${b} = ？`,
      type: 'input',
      inputType: 'number',
      answer: `${a * b}`
    };
  }

  if (type === 'div') {
    const b = randInt(1, 9);
    const c = randInt(1, 9);
    const a = b * c; // わりきれる
    return {
      question: `${a} ÷ ${b} = ？`,
      type: 'input',
      inputType: 'number',
      answer: `${c}`
    };
  }

  if (type === 'mulWord') {
    const a = randInt(2, 9);
    const b = randInt(2, 12);
    return {
      question: `1つの箱に ${a}こずつ お菓子が入っています。\n${b}箱では 何こ？`,
      type: 'input',
      inputType: 'number',
      answer: `${a * b}`
    };
  }

  if (type === 'divRemainder') {
    const b = randInt(2, 9);
    const c = randInt(1, 9);
    const r = randInt(1, b - 1);
    const a = b * c + r;
    return {
      question: `${a} ÷ ${b} = ？\nあまりも こたえてね。\n（れい：3あまり2 → 「3あまり2」と入力）`,
      type: 'input',
      inputType: 'text',
      answerType: 'remainder',
      answer: `${c}あまり${r}`
    };
  }

  if (type === 'unit') {
    const units = [
      { big: 'm', small: 'cm', rate: 100 },
      { big: 'L', small: 'mL', rate: 1000 },
      { big: 'kg', small: 'g', rate: 1000 }
    ];
    const u = units[randInt(0, units.length - 1)];
    const toSmall = Math.random() < 0.5;
    if (toSmall) {
      const v = randInt(1, 9);
      return {
        question: `${v}${u.big} は 何${u.small}？`,
        type: 'input',
        inputType: 'number',
        answer: `${v * u.rate}`
      };
    } else {
      const v = randInt(1, 9) * u.rate;
      return {
        question: `${v}${u.small} は 何${u.big}？`,
        type: 'input',
        inputType: 'number',
        answer: `${v / u.rate}`
      };
    }
  }

  if (type === 'time') {
    const h = randInt(1, 11);
    const m = randInt(0, 50);
    const addMin = randInt(5, 50);
    const totalMin = h * 60 + m + addMin;
    const nh = Math.floor(totalMin / 60) % 24;
    const nm = totalMin % 60;
    return {
      question: `今、${h}時${m}分です。\n${addMin}分後は何時何分？\n（れい：3時5分 → 「3時5分」と入力）`,
      type: 'input',
      inputType: 'text',
      answerType: 'time',
      answer: `${nh}時${nm}分`
    };
  }

  if (type === 'addsub') {
    const isAdd = Math.random() < 0.5;
    if (isAdd) {
      const a = randInt(100, 999);
      const b = randInt(100, 999);
      return {
        question: `${a} ＋ ${b} = ？`,
        type: 'input',
        inputType: 'number',
        answer: `${a + b}`
      };
    } else {
      const a = randInt(100, 999);
      const b = randInt(10, a);
      return {
        question: `${a} － ${b} = ？`,
        type: 'input',
        inputType: 'number',
        answer: `${a - b}`
      };
    }
  }

  // decimal (小数の たし算・ひき算、小数第一位まで)
  const isAdd = Math.random() < 0.5;
  const a = randInt(10, 99) / 10;
  const b = randInt(10, 99) / 10;
  if (isAdd) {
    const sum = Math.round((a + b) * 10) / 10;
    return {
      question: `${a} ＋ ${b} = ？`,
      type: 'input',
      inputType: 'text',
      answer: `${sum}`
    };
  } else {
    const big = Math.max(a, b);
    const small = Math.min(a, b);
    const diff = Math.round((big - small) * 10) / 10;
    return {
      question: `${big} － ${small} = ？`,
      type: 'input',
      inputType: 'text',
      answer: `${diff}`
    };
  }
}

// ===== 5年生 =====
function genGrade5() {
  const types = ['fraction', 'decimalMul', 'decimalDiv', 'percent', 'area', 'average', 'speed', 'ratio', 'circle', 'volume'];
  const type = types[randInt(0, types.length - 1)];

  if (type === 'fraction') {
    const denoms = [2, 3, 4, 5, 6, 8, 9, 10, 12];
    const d1 = denoms[randInt(0, denoms.length - 1)];
    let d2 = denoms[randInt(0, denoms.length - 1)];
    const n1 = randInt(1, d1 - 1);
    const n2 = randInt(1, d2 - 1);
    const isAdd = Math.random() < 0.5;
    const lcd = (d1 * d2) / gcd(d1, d2);
    let resultNum;
    let opSymbol;
    if (isAdd) {
      resultNum = n1 * (lcd / d1) + n2 * (lcd / d2);
      opSymbol = '＋';
    } else {
      // 大きい方から引く
      let frac1 = n1 / d1, frac2 = n2 / d2;
      let bigN = n1, bigD = d1, smallN = n2, smallD = d2;
      if (frac1 < frac2) { [bigN, bigD, smallN, smallD] = [n2, d2, n1, d1]; }
      const lcd2 = (bigD * smallD) / gcd(bigD, smallD);
      resultNum = bigN * (lcd2 / bigD) - smallN * (lcd2 / smallD);
      opSymbol = '－';
      const reduced = reduceFraction(resultNum, lcd2);
      return {
        question: `${bigN}/${bigD} ${opSymbol} ${smallN}/${smallD} = ？\n（やくぶんした　ぶんすうで こたえてね）`,
        type: 'input',
        inputType: 'text',
        answer: fractionToString(reduced),
        isFraction: true
      };
    }
    const reduced = reduceFraction(resultNum, lcd);
    return {
      question: `${n1}/${d1} ${opSymbol} ${n2}/${d2} = ？\n（やくぶんした　ぶんすうで こたえてね）`,
      type: 'input',
      inputType: 'text',
      answer: fractionToString(reduced),
      isFraction: true
    };
  }

  if (type === 'decimalMul') {
    const a = randInt(10, 99) / 10;
    const b = randInt(2, 9);
    const result = Math.round(a * b * 10) / 10;
    return {
      question: `${a} × ${b} = ？`,
      type: 'input',
      inputType: 'text',
      answer: `${result}`
    };
  }

  if (type === 'decimalDiv') {
    const b = randInt(2, 9);
    const result = randInt(1, 20) / 10; // 0.1刻み
    const a = Math.round(result * b * 10) / 10;
    return {
      question: `${a} ÷ ${b} = ？`,
      type: 'input',
      inputType: 'text',
      answer: `${result}`
    };
  }

  if (type === 'percent') {
    const total = randInt(2, 20) * 10; // 20〜200の10刻み
    const percentages = [10, 20, 25, 50, 75];
    const p = percentages[randInt(0, percentages.length - 1)];
    const result = Math.round(total * p / 100);
    return {
      question: `${total}人の ${p}％は 何人？`,
      type: 'input',
      inputType: 'number',
      answer: `${result}`
    };
  }

  if (type === 'average') {
    const n = 4;
    const nums = [];
    for (let i = 0; i < n; i++) nums.push(randInt(2, 20));
    let sum = nums.reduce((a, b) => a + b, 0);
    const rem = sum % n;
    if (rem !== 0) {
      nums[n - 1] += (n - rem);
      sum += (n - rem);
    }
    return {
      question: `${nums.join('、')} の平均は？`,
      type: 'input',
      inputType: 'number',
      answer: `${sum / n}`
    };
  }

  if (type === 'speed') {
    const sub = randInt(0, 2);
    const time = randInt(2, 8);
    const speed = randInt(2, 12);
    if (sub === 0) {
      const dist = time * speed;
      return {
        question: `${dist}kmの道を ${time}時間で走ると、\n速さは時速何km？`,
        type: 'input',
        inputType: 'number',
        answer: `${speed}`
      };
    } else if (sub === 1) {
      return {
        question: `時速${speed}kmで ${time}時間走ると、\n何km進む？`,
        type: 'input',
        inputType: 'number',
        answer: `${speed * time}`
      };
    } else {
      const dist = speed * time;
      return {
        question: `${dist}kmの道を 時速${speed}kmで走ると、\n何時間かかる？`,
        type: 'input',
        inputType: 'number',
        answer: `${time}`
      };
    }
  }

  if (type === 'ratio') {
    let a = randInt(1, 6);
    let b = randInt(1, 6);
    while (gcd(a, b) !== 1) { a = randInt(1, 6); b = randInt(1, 6); }
    const g = randInt(2, 5);
    const qa = a * g, qb = b * g;
    return {
      question: `${qa} : ${qb} を 簡単な比にすると？\n（れい：2:3 → 「2:3」と入力）`,
      type: 'input',
      inputType: 'text',
      answerType: 'ratio',
      answer: `${a}:${b}`
    };
  }

  if (type === 'circle') {
    const r = randInt(1, 10);
    const isCircumference = Math.random() < 0.5;
    if (isCircumference) {
      const c = Math.round(2 * r * 3.14 * 100) / 100;
      return {
        question: `半径 ${r}cmの円の円周は何cm？\n（円周率は3.14とする）`,
        type: 'input',
        inputType: 'text',
        answer: `${c}`
      };
    } else {
      const area = Math.round(r * r * 3.14 * 100) / 100;
      return {
        question: `半径 ${r}cmの円の面積は何cm²？\n（円周率は3.14とする）`,
        type: 'input',
        inputType: 'text',
        answer: `${area}`
      };
    }
  }

  if (type === 'volume') {
    const a = randInt(2, 10);
    const b = randInt(2, 10);
    const c = randInt(2, 10);
    return {
      question: `たて${a}cm、よこ${b}cm、高さ${c}cmの\n直方体の体積は何cm³？`,
      type: 'input',
      inputType: 'number',
      answer: `${a * b * c}`
    };
  }

  // area
  const isTriangle = Math.random() < 0.5;
  if (isTriangle) {
    const base = randInt(2, 12);
    const height = randInt(2, 12);
    const area = (base * height) / 2;
    return {
      question: `底辺 ${base}cm、高さ ${height}cm の\n三角形の面積は 何cm²？`,
      type: 'input',
      inputType: 'text',
      answer: `${area}`
    };
  } else {
    const w = randInt(2, 20);
    const h = randInt(2, 20);
    return {
      question: `たて ${h}cm、よこ ${w}cm の\n長方形の面積は 何cm²？`,
      type: 'input',
      inputType: 'number',
      answer: `${w * h}`
    };
  }
}

// ===== 中学1年生 =====
function formatLinear(coef) {
  if (coef === 0) return '0';
  if (coef === 1) return 'x';
  if (coef === -1) return '-x';
  return `${coef}x`;
}

function genGrade7() {
  const types = ['negAddSub', 'negMulDiv', 'literalSimplify', 'literalSubstitute', 'equation', 'proportion', 'absValue', 'expand'];
  const type = types[randInt(0, types.length - 1)];

  if (type === 'negAddSub') {
    const a = randInt(-9, 9);
    const b = randInt(-9, 9);
    const isAdd = Math.random() < 0.5;
    if (isAdd) {
      return {
        question: `(${a}) ＋ (${b}) = ？`,
        type: 'input',
        inputType: 'text',
        answer: `${a + b}`
      };
    } else {
      return {
        question: `(${a}) － (${b}) = ？`,
        type: 'input',
        inputType: 'text',
        answer: `${a - b}`
      };
    }
  }

  if (type === 'negMulDiv') {
    const isMul = Math.random() < 0.5;
    if (isMul) {
      const a = randInt(-6, 6) || 1;
      const b = randInt(-6, 6) || 1;
      return {
        question: `(${a}) × (${b}) = ？`,
        type: 'input',
        inputType: 'text',
        answer: `${a * b}`
      };
    } else {
      const b = randInt(-6, 6) || 1;
      const c = randInt(-6, 6) || 1;
      const a = b * c;
      return {
        question: `(${a}) ÷ (${b}) = ？`,
        type: 'input',
        inputType: 'text',
        answer: `${c}`
      };
    }
  }

  if (type === 'literalSimplify') {
    const a = randInt(1, 6);
    const b = randInt(1, 6);
    const isAdd = Math.random() < 0.5;
    const result = isAdd ? a + b : a - b;
    const op = isAdd ? '＋' : '－';
    const correct = formatLinear(result);
    const distractors = new Set();
    let guard = 0;
    while (distractors.size < 3 && guard < 50) {
      guard++;
      const offset = [-2, -1, 1, 2][randInt(0, 3)];
      const s = formatLinear(result + offset);
      if (s !== correct) distractors.add(s);
    }
    const choices = shuffleArray([correct, ...distractors]);
    return {
      question: `${a}x ${op} ${b}x を計算すると？`,
      type: 'choice',
      choices,
      answer: correct
    };
  }

  if (type === 'literalSubstitute') {
    const x = randInt(-3, 3) || 1;
    const a = randInt(2, 5);
    const b = randInt(-5, 5);
    const result = a * x + b;
    const bStr = b >= 0 ? `＋ ${b}` : `－ ${Math.abs(b)}`;
    return {
      question: `x = ${x} のとき、\n${a}x ${bStr} の値は？`,
      type: 'input',
      inputType: 'text',
      answer: `${result}`
    };
  }

  if (type === 'equation') {
    const a = randInt(2, 5);
    const x = randInt(-5, 5) || 1;
    const b = randInt(-5, 5);
    const c = a * x + b;
    const bStr = b >= 0 ? `＋ ${b}` : `－ ${Math.abs(b)}`;
    return {
      question: `${a}x ${bStr} = ${c}\nx の値は？`,
      type: 'input',
      inputType: 'text',
      answer: `${x}`
    };
  }

  if (type === 'proportion') {
    const isDirect = Math.random() < 0.5;
    if (isDirect) {
      const a = randInt(2, 9);
      const x1 = randInt(1, 10);
      const x2 = randInt(1, 10);
      return {
        question: `yはxに比例し、x = ${x1} のとき y = ${a * x1} です。\nx = ${x2} のときの y の値は？`,
        type: 'input',
        inputType: 'number',
        answer: `${a * x2}`
      };
    } else {
      const x1 = randInt(1, 6);
      const y1 = randInt(1, 6);
      const k = x1 * y1;
      const divisors = [];
      for (let d = 1; d <= k; d++) if (k % d === 0) divisors.push(d);
      const x2 = divisors[randInt(0, divisors.length - 1)];
      return {
        question: `yはxに反比例し、x = ${x1} のとき y = ${y1} です。\nx = ${x2} のときの y の値は？`,
        type: 'input',
        inputType: 'number',
        answer: `${k / x2}`
      };
    }
  }

  if (type === 'absValue') {
    const a = randInt(-10, 10) || 1;
    return {
      question: `| ${a} | の値は？\n（絶対値）`,
      type: 'input',
      inputType: 'number',
      answer: `${Math.abs(a)}`
    };
  }

  // expand: a(x + b) の展開
  const a = randInt(2, 5);
  const b = randInt(1, 5);
  const correct = `${a}x+${a * b}`;
  const distractors = new Set([`${a}x+${b}`, `x+${a * b}`, `${a}x-${a * b}`]);
  distractors.delete(correct);
  let guard = 0;
  while (distractors.size < 3 && guard < 50) {
    guard++;
    distractors.add(`${a}x+${a * b + randInt(1, 5)}`);
  }
  const choices = shuffleArray([correct, ...[...distractors].slice(0, 3)]);
  return {
    question: `${a}(x ＋ ${b}) を展開すると？`,
    type: 'choice',
    choices,
    answer: correct
  };
}

function generateMathProblem(grade) {
  if (grade === 1) return genGrade1();
  if (grade === 3) return genGrade3();
  if (grade === 5) return genGrade5();
  return genGrade7();
}

// ユーザー入力が正解かどうか判定
function isMathAnswerCorrect(problem, userInput) {
  if (problem.type === 'choice') {
    return userInput === problem.answer;
  }
  if (problem.isFraction) {
    const userFrac = parseFractionInput(userInput);
    const ansFrac = parseFractionInput(problem.answer);
    if (!userFrac || !ansFrac) return false;
    const ur = reduceFraction(userFrac[0], userFrac[1]);
    const ar = reduceFraction(ansFrac[0], ansFrac[1]);
    return ur[0] === ar[0] && ur[1] === ar[1];
  }
  if (problem.answerType === 'remainder') {
    const norm = s => String(s).trim().replace(/\s+/g, '').replace(/余り/g, 'あまり');
    return norm(userInput) === norm(problem.answer);
  }
  if (problem.answerType === 'time') {
    const parse = s => {
      const m = String(s).match(/(\d+)\s*時\s*(\d+)\s*分/);
      if (!m) return null;
      return [Number(m[1]), Number(m[2])];
    };
    const u = parse(userInput);
    const a = parse(problem.answer);
    if (!u || !a) return false;
    return u[0] === a[0] && u[1] === a[1];
  }
  if (problem.answerType === 'ratio') {
    const norm = s => String(s).trim().replace(/\s+/g, '').replace(/：/g, ':');
    return norm(userInput) === norm(problem.answer);
  }
  // 数値比較（小数誤差対策）
  const u = Number(String(userInput).trim());
  const a = Number(problem.answer);
  if (!Number.isFinite(u)) return false;
  return Math.abs(u - a) < 0.0001;
}
