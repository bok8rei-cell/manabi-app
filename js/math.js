// ===== さんすう・すうがく もんだい せいせい =====

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 算数の問題の種類（「まだ ならってない」で けすときの名前）
let lastMathType = '';
const MATH_UNIT_LABELS = {
  add: 'たしざん', sub: 'ひきざん', compare: 'おおきさくらべ', tens: '10に なる かず', addWord: 'たしざんの もんだい', subWord: 'ひきざんの もんだい',
  bigAdd: 'くりあがりの たしざん', bigAddWord: 'くりあがりの もんだい',
  mul: 'かけ算', div: 'わり算', addsub: '3けた・4けたのたし算ひき算', decimal: '小数のたし算ひき算', mulWord: 'かけ算の文章題',
  divRemainder: 'あまりのあるわり算', unit: '長さ・かさ・重さの たんい', time: '時こくと時間', divWord: 'わり算の文章題', priceWord: '代金の問題',
  moneyWord: 'おつりの問題', visitWord: '人数のたし算', timesWord: '○倍の問題', unknown: '□を使った式',
  fraction: '分数のたし算ひき算', decimalMul: '小数のかけ算', decimalDiv: '小数のわり算', percent: 'わりあい（％）', area: '面積',
  average: '平均', circle: '円周', volume: '体積', oddEven: 'ぐう数・き数', lcm: '最小公倍数', gcd5: '最大公約数', speedWord: '速さ',
  discount: '○％引き', density: '人口みつど',
  add2: 'たし算（2けた）', sub2: 'ひき算（2けた）', add3: 'たし算（3けた）', sub3: 'ひき算（3けた）', mul9: 'かけ算（九九）', mulWord2: 'かけ算の もんだい',
  addWord2: 'たし算の もんだい', subWord2: 'ひき算の もんだい', lengthUnit: '長さの たんい', minUnit: '時間と分', volumeUnit: 'かさの たんい', fraction2: '分数（2分の1など）',
  bigNumber: '大きな数（億・万）', div4: 'わり算（筆算）', divRem4: 'あまりのある わり算', div2digit: '2けたでわるわり算', mul4: 'かけ算（筆算）',
  decAdd4: '小数のたし算ひき算', decMul4: '小数×整数', decDiv4: '小数÷整数', frac4: '分数のたし算ひき算', order4: '計算のじゅんじょ', areaUnit4: '面積の たんい',
  area4: '面積', angle4: '角の大きさ', round4: 'がい数', divWord4: 'わり算の もんだい', mulWord4: 'かけ算の もんだい',
  fracMul6: '分数のかけ算', fracDiv6: '分数のわり算', literal6: '文字を使った式', prop6: '比例', inverse6: '反比例', ratio6: '比', ratioVal6: '比の値',
  circleArea6: '円の面積', prism6: '角柱の体積', speed6: '速さ', time6: '速さと時間', median6: '中央値', mode6: '最頻値（さいひんち）', perm6: '並べ方', comb6: '組み合わせ',
  negAddSub: '正負の数のたし算ひき算', negMulDiv: '正負の数のかけ算わり算', literalSimplify: '文字式の計算', literalSubstitute: '文字式に数を入れる',
  equation: '方程式', proportion: '比例・反比例', absValue: '絶対値', expand: '式の展開', tempWord: '気温の変化', eqWord: '方程式の文章題', expressWord: '文字式で表す'
};

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
function genGrade1(diff = 1) {
  const typePools = [
    ['add', 'sub', 'compare', 'tens'],
    ['add', 'sub', 'compare', 'addWord', 'subWord', 'tens', 'bigAdd', 'bigAddWord'],
    ['bigAdd', 'bigAddWord', 'subWord', 'addWord', 'sub', 'tens']
  ];
  const types = typePools[diff];
  const type = types[randInt(0, types.length - 1)];
  lastMathType = type;
  const maxN = [4, 9, 9][diff];

  if (type === 'add') {
    const a = randInt(1, maxN);
    const b = randInt(1, maxN);
    return {
      question: `${a} ＋ ${b} = ？`,
      type: 'input',
      inputType: 'number',
      answer: `${a + b}`
    };
  }

  if (type === 'bigAdd') {
    const a = diff === 2 ? randInt(5, 9) : randInt(3, 9);
    const b = randInt(Math.max(1, 10 - a), 9);
    return {
      question: `${a} ＋ ${b} = ？`,
      type: 'input',
      inputType: 'number',
      answer: `${a + b}`
    };
  }

  if (type === 'sub') {
    const maxSub = [8, 20, 18][diff];
    const a = randInt(2, maxSub);
    const b = randInt(1, Math.min(a, 10)); // 1年生は 10 までの数をひく
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
    const a = randInt(1, maxN);
    const b = randInt(1, maxN);
    return {
      question: `${name}が ${a}${unit}${(unit === 'びき' || unit === 'わ') ? 'います' : 'あります'}。\n${b}${unit}もらうと、あわせてなん${unit}になる？`,
      type: 'input',
      inputType: 'number',
      answer: `${a + b}`
    };
  }

  if (type === 'bigAddWord') {
    // 答えが2けたになる文章題
    const items = [
      ['シール', 'まい'], ['どんぐり', 'こ'], ['おはじき', 'こ'],
      ['みかん', 'こ'], ['本', 'さつ'], ['カード', 'まい']
    ];
    const [name, unit] = items[randInt(0, items.length - 1)];
    const a = diff === 2 ? randInt(6, 9) : randInt(5, 9);
    const b = randInt(Math.max(1, 10 - a), 9);
    return {
      question: `${name}が ${a}${unit}あります。\nともだちから ${b}${unit}もらうと、\nぜんぶで なん${unit}？`,
      type: 'input',
      inputType: 'number',
      answer: `${a + b}`
    };
  }

  if (type === 'subWord') {
    // [名前, 単位, 減るときの言い方, 「ある」か「いる」か]
    const items = [
      ['あめ', 'こ', 'たべると', 'あります'],
      ['いろえんぴつ', '本', 'つかうと', 'あります'],
      ['とり', 'わ', 'とんでいくと', 'います'],
      ['カード', 'まい', 'つかうと', 'あります']
    ];
    const [name, unit, verb, exist] = items[randInt(0, items.length - 1)];
    const a = randInt(5, 18);
    const b = randInt(1, Math.min(a - 1, 9));
    return {
      question: `${name}が ${a}${unit}${exist}。\n${b}${unit}${verb}、なん${unit}のこる？`,
      type: 'input',
      inputType: 'number',
      answer: `${a - b}`
    };
  }

  if (type === 'tens') {
    const a = randInt(1, 9);
    return {
      question: `${a} と あわせて 10に なる かずは？`,
      type: 'input',
      inputType: 'number',
      answer: `${10 - a}`
    };
  }

  // compare
  const cmpMax = [10, 20, 20][diff];
  let a = randInt(1, cmpMax);
  let b = randInt(1, cmpMax);
  while (a === b) b = randInt(1, cmpMax);
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
function genGrade3(diff = 1) {
  const typePools = [
    ['mul', 'div', 'addsub', 'mulWord', 'divWord', 'priceWord', 'unknown'],
    ['mul', 'div', 'addsub', 'decimal', 'mulWord', 'divRemainder', 'unit', 'time', 'divWord', 'priceWord', 'moneyWord', 'visitWord', 'timesWord', 'unknown'],
    ['mul', 'div', 'addsub', 'decimal', 'mulWord', 'divRemainder', 'unit', 'time', 'divWord', 'priceWord', 'moneyWord', 'visitWord', 'timesWord', 'unknown']
  ];
  const types = typePools[diff];
  const type = types[randInt(0, types.length - 1)];
  lastMathType = type;
  const maxMul = [5, 9, 9][diff];

  if (type === 'divWord') {
    const b = randInt(2, 9);
    const c = randInt(2, 9);
    const items = [['あめ', 'こ'], ['色紙', 'まい'], ['シール', 'まい'], ['クッキー', 'こ']];
    const [name, unit] = items[randInt(0, items.length - 1)];
    return {
      question: `${name}が ${b * c}${unit}あります。\n${b}人で同じ数ずつ分けると、1人分は何${unit}？`,
      type: 'input',
      inputType: 'number',
      answer: `${c}`
    };
  }

  if (type === 'priceWord') {
    const hi = diff === 0 ? 5 : 9; // やさしいときは、小さい数だけ
    const p = randInt(2, hi) * 10;
    const n = randInt(2, hi);
    return {
      question: `1こ ${p}円のあめを ${n}こ買うと、代金は何円？`,
      type: 'input',
      inputType: 'number',
      answer: `${p * n}`
    };
  }

  if (type === 'moneyWord') {
    const have = randInt(3, 10) * 100;
    const cost = randInt(1, have / 10 - 1) * 10;
    return {
      question: `${have}円持っています。${cost}円のおかしを買うと、のこりは何円？`,
      type: 'input',
      inputType: 'number',
      answer: `${have - cost}`
    };
  }

  if (type === 'visitWord') {
    const a = randInt(120, 480);
    const b = randInt(110, 390);
    return {
      question: `朝は ${a}人、午後は ${b}人が図書館に来ました。\n1日で何人来ましたか？`,
      type: 'input',
      inputType: 'number',
      answer: `${a + b}`
    };
  }

  if (type === 'timesWord') {
    const a = randInt(2, 9) * 5;
    const k = randInt(2, 6);
    return {
      question: `赤いテープの長さは ${a}cm です。\n青いテープの長さは、赤いテープの ${k}倍です。\n青いテープは何cm？`,
      type: 'input',
      inputType: 'number',
      answer: `${a * k}`
    };
  }

  if (type === 'unknown') {
    if (Math.random() < 0.5) {
      const a = randInt(5, 60);
      const b = randInt(5, 40);
      return {
        question: `□ ＋ ${b} = ${a + b}\n□に入る数は？`,
        type: 'input',
        inputType: 'number',
        answer: `${a}`
      };
    }
    const a = randInt(2, 9);
    const b = randInt(2, 9);
    return {
      question: `□ × ${b} = ${a * b}\n□に入る数は？`,
      type: 'input',
      inputType: 'number',
      answer: `${a}`
    };
  }

  if (type === 'mul') {
    const a = randInt(1, maxMul);
    const b = randInt(1, maxMul);
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
    const lo = [10, 100, 1000][diff];
    const hi = [99, 999, 9999][diff];
    const isAdd = Math.random() < 0.5;
    if (isAdd) {
      const a = randInt(lo, hi);
      const b = randInt(lo, hi);
      return {
        question: `${a} ＋ ${b} = ？`,
        type: 'input',
        inputType: 'number',
        answer: `${a + b}`
      };
    } else {
      const a = randInt(lo, hi);
      const b = randInt(Math.floor(lo / 10), a);
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
function genGrade5(diff = 1) {
  const typePools = [
    ['fraction', 'decimalMul', 'decimalDiv', 'oddEven', 'lcm'],
    ['fraction', 'decimalMul', 'decimalDiv', 'percent', 'area', 'average', 'circle', 'volume', 'oddEven', 'lcm', 'gcd5', 'speedWord', 'discount', 'density'],
    ['fraction', 'decimalMul', 'decimalDiv', 'percent', 'area', 'average', 'circle', 'volume', 'oddEven', 'lcm', 'gcd5', 'speedWord', 'discount', 'density']
  ];
  const types = typePools[diff];
  const type = types[randInt(0, types.length - 1)];
  lastMathType = type;

  if (type === 'oddEven') {
    const n = randInt(10, 99);
    return {
      question: `${n}は 偶数（ぐうすう）？ 奇数（きすう）？`,
      type: 'choice',
      choices: ['偶数（ぐうすう）', '奇数（きすう）'],
      answer: n % 2 === 0 ? '偶数（ぐうすう）' : '奇数（きすう）'
    };
  }

  if (type === 'lcm') {
    const a = randInt(2, 9);
    let b = randInt(2, 9);
    while (b === a) b = randInt(2, 9);
    return {
      question: `${a}と ${b}の最小公倍数は？`,
      type: 'input',
      inputType: 'number',
      answer: `${(a * b) / gcd(a, b)}`
    };
  }

  if (type === 'gcd5') {
    const g = randInt(2, 6);
    const x = randInt(1, 5);
    let y = randInt(1, 5);
    while (y === x) y = randInt(1, 5);
    return {
      question: `${g * x}と ${g * y}の最大公約数は？`,
      type: 'input',
      inputType: 'number',
      answer: `${gcd(g * x, g * y)}`
    };
  }

  if (type === 'speedWord') {
    const v = randInt(3, 12) * 10;
    const h = randInt(2, 6);
    return {
      question: `時速 ${v}kmの電車が ${h}時間走ると、何km進む？`,
      type: 'input',
      inputType: 'number',
      answer: `${v * h}`
    };
  }

  if (type === 'discount') {
    const price = randInt(2, 20) * 100;
    const p = [10, 20, 25, 50][randInt(0, 3)];
    return {
      question: `定価 ${price}円の品物を ${p}％引きで買うと、代金は何円？`,
      type: 'input',
      inputType: 'number',
      answer: `${(price * (100 - p)) / 100}`
    };
  }

  if (type === 'density') {
    const area = randInt(2, 9) * 10;
    const per = randInt(2, 9) * 10;
    return {
      question: `面積 ${area}km²の町に、${area * per}人が住んでいます。\n1km²あたり何人？`,
      type: 'input',
      inputType: 'number',
      answer: `${per}`
    };
  }

  if (type === 'fraction') {
    const denoms = diff === 0 ? [2, 3, 4, 5, 6] : [2, 3, 4, 5, 6, 8, 9, 10, 12];
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
        question: `${bigN}/${bigD} ${opSymbol} ${smallN}/${smallD} = ？\n（やくぶんした ぶんすうで こたえてね）`,
        type: 'input',
        inputType: 'text',
        answer: fractionToString(reduced),
        isFraction: true
      };
    }
    const reduced = reduceFraction(resultNum, lcd);
    return {
      question: `${n1}/${d1} ${opSymbol} ${n2}/${d2} = ？\n（やくぶんした ぶんすうで こたえてね）`,
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
    const total = randInt(1, 10) * 20; // 20〜200の20刻み（25％・75％でも答えがかならず整数になる）
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

  if (type === 'circle') {
    // 円の面積は6年生で習うので、5年生は円周だけ
    const r = randInt(1, 10);
    const c = Math.round(2 * r * 3.14 * 100) / 100;
    return {
      question: `半径 ${r}cmの円の円周は何cm？\n（円周率は3.14とする）`,
      type: 'input',
      inputType: 'text',
      answer: `${c}`
    };
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

function genGrade7(diff = 1) {
  const typePools = [
    ['negAddSub', 'literalSimplify', 'equation', 'absValue', 'tempWord', 'eqWord'],
    ['negAddSub', 'negMulDiv', 'literalSimplify', 'literalSubstitute', 'equation', 'proportion', 'absValue', 'tempWord', 'eqWord', 'expressWord'],
    ['negAddSub', 'negMulDiv', 'literalSimplify', 'literalSubstitute', 'equation', 'proportion', 'absValue', 'expand', 'tempWord', 'eqWord', 'expressWord']
  ];
  const types = typePools[diff];
  const type = types[randInt(0, types.length - 1)];
  lastMathType = type;

  if (type === 'tempWord') {
    const a = randInt(-8, 5);
    let b = randInt(-9, 9);
    if (b === 0) b = 3;
    const move = b > 0 ? `${b}℃上がりました` : `${-b}℃下がりました`;
    return {
      question: `ある日の気温は ${a < 0 ? '－' + (-a) : a}℃でした。\n夜になって、${move}。\n夜の気温は何℃？（マイナスのときは「-」をつけてね）`,
      type: 'input',
      inputType: 'text',
      answer: `${a + b}`
    };
  }

  if (type === 'eqWord') {
    const x = randInt(2, 12);
    const a = randInt(2, 6);
    const b = randInt(1, 15);
    return {
      question: `ある数の ${a}倍に ${b}をたすと ${a * x + b}になります。\nある数は？`,
      type: 'input',
      inputType: 'number',
      answer: `${x}`
    };
  }

  if (type === 'expressWord') {
    const a = randInt(2, 9);
    let b = randInt(2, 9);
    while (b === a) b = randInt(2, 9);
    const correct = `${a}x+${b}`;
    const choices = shuffleArray([correct, `${b}x+${a}`, `${a + b}x`, `${a}x-${b}`]);
    return {
      question: `1個 ${a}円のりんごを x個と、${b}円の箱を1つ買いました。\n代金を x を使った式で表すと？`,
      type: 'choice',
      choices,
      answer: correct
    };
  }

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
      let x2 = randInt(1, 10);
      while (x2 === x1) x2 = randInt(1, 10);
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
      for (let d = 1; d <= k; d++) if (k % d === 0 && d !== x1) divisors.push(d);
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

// ===== 2年生 =====
function genGrade2(diff = 1) {
  const typePools = [
    ['add2', 'sub2', 'mul9', 'mulWord2', 'lengthUnit', 'minUnit'],
    ['add2', 'sub2', 'mul9', 'mulWord2', 'lengthUnit', 'minUnit', 'addWord2', 'subWord2', 'volumeUnit', 'fraction2', 'add3'],
    ['add2', 'sub2', 'mul9', 'mulWord2', 'lengthUnit', 'minUnit', 'addWord2', 'subWord2', 'volumeUnit', 'fraction2', 'add3', 'sub3']
  ];
  const types = typePools[diff];
  const type = types[randInt(0, types.length - 1)];
  lastMathType = type;
  const items = [['りんご', 'こ'], ['あめ', 'こ'], ['シール', 'まい'], ['えんぴつ', '本'], ['ビーだま', 'こ'], ['いろがみ', 'まい']];
  const input = (question, answer) => ({ question, type: 'input', inputType: 'number', answer: String(answer) });

  if (type === 'add2') {
    let a, b;
    do {
      a = randInt(11, diff === 0 ? 60 : 90);
      b = randInt(2, Math.min(diff === 0 ? 39 : 70, 99 - a));
    } while (a + b >= 100 || (diff === 0 && (a % 10) + (b % 10) >= 10));
    return input(`${a} ＋ ${b} = ？`, a + b);
  }
  if (type === 'sub2') {
    let a, b;
    do {
      a = randInt(20, 99);
      b = randInt(2, a - 1);
    } while (diff === 0 && (b % 10) > (a % 10));
    return input(`${a} － ${b} = ？`, a - b);
  }
  if (type === 'add3') {
    const a = randInt(100, 499);
    const b = randInt(100, 499);
    return input(`${a} ＋ ${b} = ？`, a + b);
  }
  if (type === 'sub3') {
    const a = randInt(300, 999);
    const b = randInt(100, a - 100);
    return input(`${a} － ${b} = ？`, a - b);
  }
  if (type === 'mul9') {
    const a = randInt(2, diff === 0 ? 5 : 9);
    const b = randInt(1, 9);
    return input(`${a} × ${b} = ？`, a * b);
  }
  if (type === 'mulWord2') {
    const [name, unit] = items[randInt(0, items.length - 1)];
    const a = randInt(2, 9);
    const b = randInt(2, 9);
    return input(`1つの ふくろに ${name}が ${a}${unit}ずつ 入っています。\n${b}ふくろ では、ぜんぶで なん${unit}？`, a * b);
  }
  if (type === 'addWord2') {
    const [name, unit] = items[randInt(0, items.length - 1)];
    const a = randInt(11, 60);
    const b = randInt(11, Math.min(39, 99 - a));
    return input(`${name}が ${a}${unit} あります。\n${b}${unit} もらうと、ぜんぶで なん${unit}？`, a + b);
  }
  if (type === 'subWord2') {
    const [name, unit] = [['えんぴつ', '本'], ['シール', 'まい'], ['いろがみ', 'まい']][randInt(0, 2)];
    const a = randInt(31, 99);
    const b = randInt(11, a - 1);
    return input(`${name}が ${a}${unit} あります。\n${b}${unit} つかうと、のこりは なん${unit}？`, a - b);
  }
  if (type === 'lengthUnit') {
    if (Math.random() < 0.5) {
      const m = randInt(1, 5);
      const c = randInt(1, 19) * 5;
      return input(`${m}m ${c}cm は、なんcm？`, m * 100 + c);
    }
    const n = randInt(2, 20);
    return input(`${n}cm は、なんmm？`, n * 10);
  }
  if (type === 'minUnit') {
    const h = randInt(1, 3);
    const m = randInt(1, 11) * 5;
    return input(`${h}時間 ${m}分 は、なん分？`, h * 60 + m);
  }
  if (type === 'volumeUnit') {
    const a = randInt(1, 9);
    return Math.random() < 0.5 ? input(`${a}L は、なんdL？`, a * 10) : input(`${a}L は、なんmL？`, a * 1000);
  }
  // fraction2
  const n = [2, 3, 4][randInt(0, 2)];
  return {
    question: `まるい ケーキを おなじ 大きさに ${n}つに わけました。\n1つぶんを 分数で いうと？`,
    type: 'choice',
    choices: ['2分の1', '3分の1', '4分の1', '8分の1'],
    answer: `${n}分の1`
  };
}

// ===== 4年生 =====
function fmtDec(x) { return String(Math.round(x * 100) / 100); }

function genGrade4(diff = 1) {
  const base = ['bigNumber', 'div4', 'mul4', 'area4', 'angle4', 'round4'];
  const mid = ['decAdd4', 'decMul4', 'decDiv4', 'frac4', 'order4', 'areaUnit4', 'divRem4', 'divWord4', 'mulWord4'];
  const typePools = [base, [...base, ...mid], [...base, ...mid, 'div2digit']];
  const types = typePools[diff];
  const type = types[randInt(0, types.length - 1)];
  lastMathType = type;
  const input = (question, answer, extra) => Object.assign({ question, type: 'input', inputType: 'number', answer: String(answer) }, extra || {});

  if (type === 'bigNumber') {
    const a = randInt(1, 9);
    const b = randInt(1, 9999);
    return input(`${a}億${b}万を、数字で 書くと？`, a * 100000000 + b * 10000);
  }
  if (type === 'div4') {
    const b = randInt(2, 9);
    const c = diff === 0 ? randInt(5, Math.floor(99 / b)) : randInt(Math.ceil(100 / b), Math.floor(999 / b));
    return input(`${b * c} ÷ ${b} = ？`, c);
  }
  if (type === 'divRem4') {
    const b = randInt(3, 9);
    const c = randInt(Math.ceil(30 / b), Math.floor(150 / b));
    const r = randInt(1, b - 1);
    return {
      question: `${b * c + r} ÷ ${b} = ？\nあまりも こたえてね。\n（れい：3あまり2 → 「3あまり2」と入力）`,
      type: 'input', inputType: 'text', answerType: 'remainder', answer: `${c}あまり${r}`
    };
  }
  if (type === 'div2digit') {
    const b = randInt(11, 25);
    const c = randInt(2, 9);
    return input(`${b * c} ÷ ${b} = ？`, c);
  }
  if (type === 'mul4') {
    let a, b;
    if (diff === 0) { a = randInt(11, 39); b = randInt(11, 29); }
    else if (diff === 1) { a = randInt(101, 399); b = randInt(11, 49); }
    else { a = randInt(101, 999); b = randInt(11, 99); }
    return input(`${a} × ${b} = ？`, a * b);
  }
  if (type === 'decAdd4') {
    const a = randInt(100, 999) / 100;
    const b = randInt(10, 499) / 100;
    if (Math.random() < 0.5) return input(`${a} ＋ ${b} = ？`, fmtDec(a + b), { inputType: 'text' });
    return input(`${Math.max(a, b)} － ${Math.min(a, b)} = ？`, fmtDec(Math.max(a, b) - Math.min(a, b)), { inputType: 'text' });
  }
  if (type === 'decMul4') {
    const a = randInt(11, 99) / 10;
    const b = randInt(2, 9);
    return input(`${a} × ${b} = ？`, fmtDec(a * b), { inputType: 'text' });
  }
  if (type === 'decDiv4') {
    const q = randInt(11, 99) / 10;
    const b = randInt(2, 9);
    return input(`${fmtDec(q * b)} ÷ ${b} = ？`, fmtDec(q), { inputType: 'text' });
  }
  if (type === 'frac4') {
    const d = randInt(4, 12);
    const proper = diff < 2;
    const isAdd = Math.random() < 0.5;
    let n1, n2;
    if (isAdd) {
      n1 = randInt(1, d - 1);
      n2 = proper ? randInt(1, d - 1 - n1 < 1 ? 1 : d - 1 - n1) : randInt(1, d - 1);
      if (proper && n1 + n2 >= d) { n1 = 1; n2 = 1; }
      return {
        question: `${n1}/${d} ＋ ${n2}/${d} = ？\n（分数で こたえてね）`,
        type: 'input', inputType: 'text', isFraction: true, answer: `${n1 + n2}/${d}`
      };
    }
    n1 = randInt(2, d - 1);
    n2 = randInt(1, n1 - 1);
    return {
      question: `${n1}/${d} － ${n2}/${d} = ？\n（分数で こたえてね）`,
      type: 'input', inputType: 'text', isFraction: true, answer: `${n1 - n2}/${d}`
    };
  }
  if (type === 'order4') {
    const f = randInt(1, 3);
    const a = randInt(2, 12), b = randInt(2, 9), c = randInt(2, 9);
    if (f === 1) return input(`${a} ＋ ${b} × ${c} = ？`, a + b * c);
    if (f === 2) return input(`(${a} ＋ ${b}) × ${c} = ？`, (a + b) * c);
    return input(`${a + b * c} － ${b} × ${c} = ？`, a);
  }
  if (type === 'areaUnit4') {
    const k = randInt(1, 9);
    return input(`${k}m² は、なんcm²？`, k * 10000);
  }
  if (type === 'area4') {
    if (Math.random() < 0.5) {
      const a = randInt(3, 15), b = randInt(3, 15);
      return input(`たて ${a}cm、よこ ${b}cm の 長方形の 面積は、なんcm²？`, a * b);
    }
    const a = randInt(3, 15);
    return input(`1辺が ${a}cm の 正方形の 面積は、なんcm²？`, a * a);
  }
  if (type === 'angle4') {
    const a = randInt(2, 17) * 10;
    return input(`一直線に ならんだ 2つの 角の うち、一方が ${a}° です。\nもう一方の 角は、何度？`, 180 - a);
  }
  if (type === 'round4') {
    if (Math.random() < 0.6) {
      const n = randInt(1000, 9999);
      return input(`${n} を ししゃごにゅうして、百の位までの がい数に すると？`, Math.floor((n + 50) / 100) * 100);
    }
    const n = randInt(10000, 99999);
    return input(`${n} を ししゃごにゅうして、千の位までの がい数に すると？`, Math.floor((n + 500) / 1000) * 1000);
  }
  if (type === 'divWord4') {
    const items = [['あめ', 'こ'], ['色紙', 'まい'], ['シール', 'まい']];
    const [name, unit] = items[randInt(0, items.length - 1)];
    const b = randInt(11, 25), c = randInt(3, 9);
    return input(`${name}が ${b * c}${unit} あります。\n${b}人で 同じ数ずつ 分けると、1人分は なん${unit}？`, c);
  }
  // mulWord4
  const p = randInt(12, 98), n = randInt(12, 48);
  return input(`1こ ${p}円の 品物を ${n}こ 買うと、代金は 何円？`, p * n);
}

// ===== 6年生 =====
function genGrade6(diff = 1) {
  const base = ['fracMul6', 'literal6', 'prop6', 'ratio6'];
  const mid = ['fracDiv6', 'circleArea6', 'speed6', 'median6', 'mode6', 'prism6'];
  const high = ['perm6', 'comb6', 'inverse6', 'ratioVal6', 'time6'];
  const typePools = [base, [...base, ...mid], [...base, ...mid, ...high]];
  const types = typePools[diff];
  const type = types[randInt(0, types.length - 1)];
  lastMathType = type;
  const input = (question, answer, extra) => Object.assign({ question, type: 'input', inputType: 'number', answer: String(answer) }, extra || {});
  const frac = (question, num, den) => {
    const r = reduceFraction(num, den);
    return { question, type: 'input', inputType: 'text', isFraction: true, answer: fractionToString(r) };
  };

  if (type === 'fracMul6') {
    const d1 = randInt(2, 9), d2 = randInt(2, 9);
    const n1 = randInt(1, d1 - 1), n2 = randInt(1, d2 - 1);
    return frac(`${n1}/${d1} × ${n2}/${d2} = ？\n（やくぶんした 分数で こたえてね）`, n1 * n2, d1 * d2);
  }
  if (type === 'fracDiv6') {
    const d1 = randInt(2, 9), d2 = randInt(2, 9);
    const n1 = randInt(1, d1 - 1), n2 = randInt(1, d2 - 1);
    return frac(`${n1}/${d1} ÷ ${n2}/${d2} = ？\n（やくぶんした 分数で こたえてね）`, n1 * d2, d1 * n2);
  }
  if (type === 'literal6') {
    const x = randInt(1, 9), a = randInt(2, 9), b = randInt(1, 9);
    return input(`x = ${x} のとき、${a}x ＋ ${b} の 値は？`, a * x + b);
  }
  if (type === 'prop6') {
    const a = randInt(2, 9), x1 = randInt(1, 8);
    let x2 = randInt(2, 12);
    while (x2 === x1) x2 = randInt(2, 12);
    return input(`y は x に 比例します。\nx = ${x1} のとき y = ${a * x1} です。\nx = ${x2} のとき、y は？`, a * x2);
  }
  if (type === 'inverse6') {
    const x1 = randInt(2, 6), y1 = randInt(2, 8);
    const k = x1 * y1;
    const divs = [];
    for (let d = 1; d <= k; d++) if (k % d === 0 && d !== x1) divs.push(d);
    const x2 = divs[randInt(0, divs.length - 1)];
    return input(`y は x に 反比例します。\nx = ${x1} のとき y = ${y1} です。\nx = ${x2} のとき、y は？`, k / x2);
  }
  if (type === 'ratio6') {
    let a = randInt(1, 9), b = randInt(1, 9);
    while (a === b || gcd(a, b) !== 1) { a = randInt(1, 9); b = randInt(1, 9); }
    const g = randInt(2, 6);
    return {
      question: `${a * g}:${b * g} を、いちばん かんたんな 整数の 比に すると？\n（れい：2:3）`,
      type: 'input', inputType: 'text', answerType: 'ratio', answer: `${a}:${b}`
    };
  }
  if (type === 'ratioVal6') {
    const a = randInt(1, 12), b = randInt(2, 12);
    return frac(`${a}:${b} の 比の値は？\n（分数で こたえてね）`, a, b);
  }
  if (type === 'circleArea6') {
    const r = randInt(1, 10);
    return input(`半径 ${r}cm の 円の 面積は、なんcm²？\n（円周率は 3.14）`, fmtDec(r * r * 3.14), { inputType: 'text' });
  }
  if (type === 'prism6') {
    const s = randInt(5, 40), h = randInt(2, 12);
    return input(`底面積が ${s}cm²、高さが ${h}cm の 角柱の 体積は、なんcm³？`, s * h);
  }
  if (type === 'speed6') {
    const v = randInt(3, 12) * 10, t = randInt(2, 8);
    return input(`${v * t}kmを ${t}時間で 走りました。\n時速は、なんkm？`, v);
  }
  if (type === 'time6') {
    const v = randInt(3, 12) * 10, t = randInt(2, 8);
    return input(`時速 ${v}kmで ${v * t}km 進むには、何時間 かかる？`, t);
  }
  if (type === 'median6') {
    const n = [5, 7][randInt(0, 1)];
    const set = new Set();
    while (set.size < n) set.add(randInt(2, 40));
    const list = shuffleArray([...set]);
    const sorted = [...set].sort((x, y) => x - y);
    return input(`${list.join('、')} の 中央値（まん中の 数）は？`, sorted[(n - 1) / 2]);
  }
  if (type === 'mode6') {
    const m = randInt(2, 30);
    const others = [];
    while (others.length < 2) { const v = randInt(2, 30); if (v !== m && !others.includes(v)) others.push(v); }
    const list = shuffleArray([m, m, m, others[0], others[0], others[1]]);
    return input(`${list.join('、')} の 最頻値（さいひんち：いちばん 多い数）は？`, m);
  }
  if (type === 'perm6') {
    const n = [3, 4][randInt(0, 1)];
    const names = ['A', 'B', 'C', 'D'].slice(0, n).join('、');
    return input(`${names}の ${n}人が 1れつに ならぶ ならび方は、ぜんぶで 何通り？`, n === 3 ? 6 : 24);
  }
  // comb6
  const n = randInt(4, 6);
  return input(`${n}チームで、どのチームとも 1回ずつ しあいを します。\nしあいは、ぜんぶで 何試合？`, (n * (n - 1)) / 2);
}

function generateMathProblem(grade, diff = 1) {
  const gens = { 1: genGrade1, 2: genGrade2, 3: genGrade3, 4: genGrade4, 5: genGrade5, 6: genGrade6, 7: genGrade7 };
  const p = (gens[grade] || genGrade7)(diff);
  p.key = lastMathType;
  p.unitLabel = MATH_UNIT_LABELS[lastMathType] || '';
  return p;
}

// ユーザー入力が正解かどうか判定
function isMathAnswerCorrect(problem, userInput) {
  // 全角の数字・記号（１２、３／４、－５、０．５）で入力されても同じに扱う
  userInput = String(userInput)
    .replace(/[０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
    .replace(/[．。]/g, '.').replace(/／/g, '/').replace(/[－ー−]/g, '-');
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
