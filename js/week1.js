// ===== 1年生：1週間プログラム =====
// 1日10問（さんすう4問・こくご3問・えいご3問）

const WEEK1_PLAN = [
  {
    day: 1,
    title: '10までの かずの ぶんかい',
    mathTopic: 'compose10',
    kanji: KANJI_DATA[1].slice(0, 5),   // 一二三四五
    eigo: EIGO_DATA[1].slice(0, 2)      // cat dog
  },
  {
    day: 2,
    title: 'くりあがりのない たしざん',
    mathTopic: 'add_no_carry',
    kanji: KANJI_DATA[1].slice(5, 10),  // 六七八九十
    eigo: EIGO_DATA[1].slice(2, 4)      // apple banana
  },
  {
    day: 3,
    title: 'くりさがりのない ひきざん',
    mathTopic: 'sub_no_borrow',
    kanji: KANJI_DATA[1].slice(10, 14), // 百千上下
    eigo: EIGO_DATA[1].slice(4, 6)      // red blue
  },
  {
    day: 4,
    title: '11〜20の かず',
    mathTopic: 'numbers20',
    kanji: KANJI_DATA[1].slice(14, 19), // 左右中大小
    eigo: EIGO_DATA[1].slice(6, 9)      // one two three
  },
  {
    day: 5,
    title: 'くりあがりの ある たしざん',
    mathTopic: 'add_carry',
    kanji: KANJI_DATA[1].slice(19, 24), // 山川田人口
    eigo: EIGO_DATA[1].slice(9, 11)     // sun moon
  },
  {
    day: 6,
    title: 'くりさがりの ある ひきざん',
    mathTopic: 'sub_borrow',
    kanji: KANJI_DATA[1].slice(24, 28), // 目耳手足
    eigo: EIGO_DATA[1].slice(11, 14)    // water fish bird
  },
  {
    day: 7,
    title: '1しゅうかんの まとめ',
    mathTopic: 'review',
    kanji: KANJI_DATA[1],                // ぜんぶ ふくしゅう
    eigo: EIGO_DATA[1]                   // ぜんぶ ふくしゅう
  }
];

// その日の10問をつくる（さんすう4・こくご3・えいご3）をシャッフルして返す
function buildWeek1Problems(day) {
  const plan = WEEK1_PLAN[day - 1];
  const problems = [];

  for (let i = 0; i < 4; i++) {
    problems.push(generateMathProblemByTopic(plan.mathTopic));
  }
  for (let i = 0; i < 3; i++) {
    problems.push(generateKanjiProblemFromList(plan.kanji, KANJI_DATA[1]));
  }
  for (let i = 0; i < 3; i++) {
    problems.push(generateEigoProblemFromList(plan.eigo, EIGO_DATA[1]));
  }

  return shuffleArray(problems);
}
