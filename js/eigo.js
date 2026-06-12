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
    { emoji: '⭐', en: 'star', ja: 'ほし' },
    { emoji: '🐰', en: 'rabbit', ja: 'うさぎ' },
    { emoji: '🚗', en: 'car', ja: 'くるま' },
    { emoji: '🏠', en: 'house', ja: 'いえ' },
    { emoji: '🍞', en: 'bread', ja: 'パン' },
    { emoji: '4️⃣', en: 'four', ja: '4' },
    { emoji: '5️⃣', en: 'five', ja: '5' }
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
    { emoji: '🧮', en: 'math', ja: 'さんすう' },
    { emoji: '🐔', en: 'chicken', ja: 'にわとり' },
    { emoji: '🚲', en: 'bicycle', ja: 'じてんしゃ' },
    { emoji: '🏫', en: 'school', ja: 'がっこう' },
    { emoji: '🟢', en: 'green', ja: 'みどり' },
    { emoji: '🟡', en: 'yellow', ja: 'きいろ' }
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
    { emoji: '🎁', en: 'gift', ja: 'プレゼント' },
    { emoji: '🛒', en: 'shopping', ja: 'かいもの' },
    { emoji: '🎉', en: 'party', ja: 'パーティー' },
    { emoji: '📞', en: 'phone', ja: 'でんわ' },
    { emoji: '🚀', en: 'rocket', ja: 'ロケット' },
    { emoji: '🧪', en: 'science', ja: 'りか' }
  ],
  7: [
    { emoji: '📖', en: 'study', ja: 'べんきょうする' },
    { emoji: '📚', en: 'library', ja: 'としょかん' },
    { emoji: '📅', en: 'weekend', ja: 'しゅうまつ' },
    { emoji: '📝', en: 'homework', ja: 'しゅくだい' },
    { emoji: '🤝', en: 'friend', ja: 'ともだち' },
    { emoji: '🧑‍🏫', en: 'teacher', ja: 'せんせい' },
    { emoji: '🏛️', en: 'museum', ja: 'はくぶつかん' },
    { emoji: '🔬', en: 'science', ja: 'りか' },
    { emoji: '⚽', en: 'sport', ja: 'スポーツ' },
    { emoji: '🏖️', en: 'vacation', ja: 'きゅうか' },
    { emoji: '⭐', en: 'important', ja: 'じゅうような' },
    { emoji: '🧩', en: 'difficult', ja: 'むずかしい' },
    { emoji: '🎭', en: 'interesting', ja: 'おもしろい' },
    { emoji: '🔮', en: 'future', ja: 'みらい' },
    { emoji: '🌆', en: 'city', ja: 'まち' },
    { emoji: '🚉', en: 'station', ja: 'えき' },
    { emoji: '🍽️', en: 'restaurant', ja: 'レストラン' },
    { emoji: '🎬', en: 'movie', ja: 'えいが' },
    { emoji: '🛫', en: 'airport', ja: 'くうこう' },
    { emoji: '🌐', en: 'internet', ja: 'インターネット' }
  ]
};

function generateEigoProblem(grade) {
  const list = EIGO_DATA[grade] || EIGO_DATA[1];
  const correct = list[randInt(0, list.length - 1)];
  const askEnglish = Math.random() < 0.5;

  if (askEnglish) {
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

  // えいご -> 日本語
  const distractorPool = list.filter(item => item.ja !== correct.ja);
  shuffleArray(distractorPool);
  const distractors = distractorPool.slice(0, 3).map(item => item.ja);
  const choices = shuffleArray([correct.ja, ...distractors]);
  return {
    question: `「${correct.en}」の いみは？`,
    type: 'choice',
    choices,
    answer: correct.ja
  };
}
