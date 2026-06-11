// ===== えいご クイズ =====
// emoji を見て、英語で何というか答える

const EIGO_DATA = {
  1: [
    { emoji: '🐱', en: 'cat', ja: 'ねこ' },
    { emoji: '🐶', en: 'dog', ja: 'いぬ' },
    { emoji: '🍎', en: 'apple', ja: 'りんご' },
    { emoji: '🍌', en: 'banana', ja: 'バナナ' },
    { emoji: '🔴', en: 'red', ja: 'あか' },
    { emoji: '🔵', en: 'blue', ja: 'あお' },
    { emoji: '1️⃣', en: 'one', ja: '1' },
    { emoji: '2️⃣', en: 'two', ja: '2' },
    { emoji: '3️⃣', en: 'three', ja: '3' },
    { emoji: '☀️', en: 'sun', ja: 'たいよう' },
    { emoji: '🌙', en: 'moon', ja: 'つき' },
    { emoji: '💧', en: 'water', ja: 'みず' },
    { emoji: '🐟', en: 'fish', ja: 'さかな' },
    { emoji: '🐦', en: 'bird', ja: 'とり' },
    { emoji: '⭐', en: 'star', ja: 'ほし' }
  ],
  3: [
    { emoji: '📚', en: 'book', ja: 'ほん' },
    { emoji: '✏️', en: 'pencil', ja: 'えんぴつ' },
    { emoji: '🎒', en: 'bag', ja: 'かばん' },
    { emoji: '👨‍👩‍👧', en: 'family', ja: 'かぞく' },
    { emoji: '🐻', en: 'bear', ja: 'くま' },
    { emoji: '🌧️', en: 'rain', ja: 'あめ' },
    { emoji: '☁️', en: 'cloud', ja: 'くも' },
    { emoji: '❄️', en: 'snow', ja: 'ゆき' },
    { emoji: '🍕', en: 'pizza', ja: 'ピザ' },
    { emoji: '🍔', en: 'hamburger', ja: 'ハンバーガー' },
    { emoji: '⚽', en: 'soccer', ja: 'サッカー' },
    { emoji: '🏀', en: 'basketball', ja: 'バスケットボール' },
    { emoji: '🎵', en: 'music', ja: 'おんがく' },
    { emoji: '🎨', en: 'art', ja: 'びじゅつ' },
    { emoji: '🧮', en: 'math', ja: 'さんすう' }
  ],
  5: [
    { emoji: '😊', en: 'happy', ja: 'うれしい' },
    { emoji: '😢', en: 'sad', ja: 'かなしい' },
    { emoji: '😡', en: 'angry', ja: 'おこっている' },
    { emoji: '🏃', en: 'run', ja: 'はしる' },
    { emoji: '🍳', en: 'cook', ja: 'りょうりする' },
    { emoji: '📖', en: 'read', ja: 'よむ' },
    { emoji: '✍️', en: 'write', ja: 'かく' },
    { emoji: '🎤', en: 'sing', ja: 'うたう' },
    { emoji: '⏰', en: 'time', ja: 'じかん' },
    { emoji: '📅', en: 'calendar', ja: 'カレンダー' },
    { emoji: '🌍', en: 'world', ja: 'せかい' },
    { emoji: '✈️', en: 'travel', ja: 'りょこう' },
    { emoji: '🏞️', en: 'mountain', ja: 'やま' },
    { emoji: '🏖️', en: 'beach', ja: 'うみべ' },
    { emoji: '🎁', en: 'gift', ja: 'プレゼント' }
  ]
};

// 指定したリストから出題し、選択肢は distractorPool（無ければ同リスト）から作る
function generateEigoProblemFromList(correctList, distractorPool) {
  distractorPool = distractorPool || correctList;
  const correct = correctList[randInt(0, correctList.length - 1)];

  const pool = distractorPool.filter(item => item.en !== correct.en);
  const distractors = shuffleArray(pool).slice(0, 3).map(item => item.en);

  const choices = shuffleArray([correct.en, ...distractors]);

  return {
    question: `${correct.emoji}\nこれを えいごで いうと？`,
    type: 'choice',
    choices,
    answer: correct.en
  };
}

function generateEigoProblem(grade) {
  const list = EIGO_DATA[grade] || EIGO_DATA[1];
  const correct = list[randInt(0, list.length - 1)];

  const distractorPool = list.filter(item => item.en !== correct.en);
  shuffleArray(distractorPool);
  const distractors = distractorPool.slice(0, 3).map(item => item.en);

  const choices = shuffleArray([correct.en, ...distractors]);

  return {
    question: `${correct.emoji}\nこれを えいごで いうと？`,
    type: 'choice',
    choices,
    answer: correct.en
  };
}
