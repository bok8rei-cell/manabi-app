// ===== さんすう もんだい せいせい =====

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
  const types = ['add', 'sub', 'compare'];
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
  const types = ['mul', 'div', 'addsub', 'decimal'];
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
  const types = ['fraction', 'decimalMul', 'decimalDiv', 'percent', 'area'];
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

// ===== 1年生：1週間プログラム用（テーマ別） =====
function genGrade1Topic(topic) {
  if (topic === 'compose10') {
    // 7は、3と なんこ？（10までの数の合成・分解）
    const n = randInt(5, 10);
    const a = randInt(1, n - 1);
    return {
      question: `${n}は、${a}と なんこ？`,
      type: 'input',
      inputType: 'number',
      answer: `${n - a}`
    };
  }

  if (topic === 'add_no_carry') {
    // くりあがりのない たしざん（こたえが10いか）
    const a = randInt(1, 9);
    const b = randInt(1, 10 - a);
    return {
      question: `${a} ＋ ${b} = ？`,
      type: 'input',
      inputType: 'number',
      answer: `${a + b}`
    };
  }

  if (topic === 'sub_no_borrow') {
    // くりさがりのない ひきざん（10いかの数から ひく）
    const a = randInt(2, 10);
    const b = randInt(1, a - 1);
    return {
      question: `${a} － ${b} = ？`,
      type: 'input',
      inputType: 'number',
      answer: `${a - b}`
    };
  }

  if (topic === 'numbers20') {
    // 11〜20の かず（10と いくつ／大小）
    if (Math.random() < 0.5) {
      const n = randInt(11, 19);
      return {
        question: `${n}は、10と なんこ？`,
        type: 'input',
        inputType: 'number',
        answer: `${n - 10}`
      };
    } else {
      let a = randInt(11, 20);
      let b = randInt(11, 20);
      while (a === b) b = randInt(11, 20);
      return {
        question: `${a} と ${b} では、\n${a} のほうが どっち？`,
        type: 'choice',
        choices: ['おおきい', 'ちいさい'],
        answer: a > b ? 'おおきい' : 'ちいさい'
      };
    }
  }

  if (topic === 'add_carry') {
    // くりあがりの ある たしざん（こたえが11〜18）
    const sum = randInt(11, 18);
    const a = randInt(Math.max(2, sum - 9), Math.min(9, sum - 2));
    const b = sum - a;
    return {
      question: `${a} ＋ ${b} = ？`,
      type: 'input',
      inputType: 'number',
      answer: `${sum}`
    };
  }

  if (topic === 'sub_borrow') {
    // くりさがりの ある ひきざん（11〜18から ひく）
    const a = randInt(11, 18);
    const onesDigit = a - 10;
    const b = randInt(onesDigit + 1, 9);
    return {
      question: `${a} － ${b} = ？`,
      type: 'input',
      inputType: 'number',
      answer: `${a - b}`
    };
  }

  // review：これまでの トピックから ランダム
  const topics = ['compose10', 'add_no_carry', 'sub_no_borrow', 'numbers20', 'add_carry', 'sub_borrow'];
  return genGrade1Topic(topics[randInt(0, topics.length - 1)]);
}

function generateMathProblemByTopic(topic) {
  return genGrade1Topic(topic);
}

function generateMathProblem(grade) {
  if (grade === 1) return genGrade1();
  if (grade === 3) return genGrade3();
  return genGrade5();
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
  // 数値比較（小数誤差対策）
  const u = Number(String(userInput).trim());
  const a = Number(problem.answer);
  if (!Number.isFinite(u)) return false;
  return Math.abs(u - a) < 0.0001;
}
