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
    { emoji: '5️⃣', en: 'five', ja: '5' },
    { emoji: '🐘', en: 'elephant', ja: 'ぞう' },
    { emoji: '🦁', en: 'lion', ja: 'ライオン' },
    { emoji: '🐵', en: 'monkey', ja: 'さる' },
    { emoji: '🐷', en: 'pig', ja: 'ぶた' },
    { emoji: '🍓', en: 'strawberry', ja: 'いちご' },
    { emoji: '🥕', en: 'carrot', ja: 'にんじん' },
    { emoji: '🥛', en: 'milk', ja: 'ぎゅうにゅう' },
    { emoji: '🚌', en: 'bus', ja: 'バス' },
    { emoji: '✈️', en: 'plane', ja: 'ひこうき' },
    { emoji: '🌸', en: 'flower', ja: 'はな' },
    { emoji: '🌳', en: 'tree', ja: 'き' },
    { emoji: '6️⃣', en: 'six', ja: '6' },
    { emoji: '7️⃣', en: 'seven', ja: '7' },
    { emoji: '8️⃣', en: 'eight', ja: '8' },
    { emoji: '9️⃣', en: 'nine', ja: '9' },
    { emoji: '🔟', en: 'ten', ja: '10' }
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
    { emoji: '🟡', en: 'yellow', ja: 'きいろ' },
    { emoji: '🍇', en: 'grape', ja: 'ぶどう' },
    { emoji: '🍉', en: 'watermelon', ja: 'すいか' },
    { emoji: '🍊', en: 'orange', ja: 'オレンジ' },
    { emoji: '🍋', en: 'lemon', ja: 'レモン' },
    { emoji: '🍑', en: 'peach', ja: 'もも' },
    { emoji: '🎂', en: 'cake', ja: 'ケーキ' },
    { emoji: '🍪', en: 'cookie', ja: 'クッキー' },
    { emoji: '🦋', en: 'butterfly', ja: 'ちょう' },
    { emoji: '🐝', en: 'bee', ja: 'はち' },
    { emoji: '🐢', en: 'turtle', ja: 'かめ' },
    { emoji: '🐸', en: 'frog', ja: 'かえる' },
    { emoji: '🐴', en: 'horse', ja: 'うま' },
    { emoji: '🐮', en: 'cow', ja: 'うし' },
    { emoji: '🐑', en: 'sheep', ja: 'ひつじ' },
    { emoji: '🚆', en: 'train', ja: 'でんしゃ' },
    { emoji: '🚢', en: 'ship', ja: 'ふね' },
    { emoji: '🌈', en: 'rainbow', ja: 'にじ' },
    { emoji: '🎹', en: 'piano', ja: 'ピアノ' }
  ],
  5: [
    { emoji: '😊', en: 'happy', ja: 'うれしい' },
    { emoji: '😢', en: 'sad', ja: 'かなしい' },
    { emoji: '😡', en: 'angry', ja: 'おこっている' },
    { emoji: '🏃', en: 'run', ja: 'はしる' },
    { emoji: '🍲', en: 'cook', ja: 'りょうりする' },
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
    { emoji: '🧪', en: 'science', ja: 'りか' },
    { emoji: '🚶', en: 'walk', ja: 'あるく' },
    { emoji: '🏊', en: 'swim', ja: 'およぐ' },
    { emoji: '😴', en: 'sleep', ja: 'ねる' },
    { emoji: '🍴', en: 'eat', ja: 'たべる' },
    { emoji: '🥤', en: 'drink', ja: 'のむ' },
    { emoji: '🤔', en: 'think', ja: 'かんがえる' },
    { emoji: '👀', en: 'look', ja: 'みる' },
    { emoji: '👂', en: 'listen', ja: 'きく' },
    { emoji: '🗣️', en: 'speak', ja: 'はなす' },
    { emoji: '🐘', en: 'big', ja: 'おおきい' },
    { emoji: '🐜', en: 'small', ja: 'ちいさい' },
    { emoji: '🐆', en: 'fast', ja: 'はやい' },
    { emoji: '🐌', en: 'slow', ja: 'おそい' },
    { emoji: '🔥', en: 'hot', ja: 'あつい' }
  ],
  7: [
    { emoji: '📖', en: 'study', ja: 'べんきょうする' },
    { emoji: '📚', en: 'library', ja: 'としょかん' },
    { emoji: '📅', en: 'weekend', ja: 'しゅうまつ' },
    { emoji: '📝', en: 'homework', ja: 'しゅくだい' },
    { emoji: '🤝', en: 'friend', ja: 'ともだち' },
    { emoji: '👩‍🏫', en: 'teacher', ja: 'せんせい' },
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
    { emoji: '🌐', en: 'internet', ja: 'インターネット' },
    { emoji: '🍳', en: 'breakfast', ja: 'あさごはん' },
    { emoji: '🍱', en: 'lunch', ja: 'ひるごはん' },
    { emoji: '🍛', en: 'dinner', ja: 'ばんごはん' },
    { emoji: '🌅', en: 'morning', ja: 'あさ' },
    { emoji: '🌃', en: 'night', ja: 'よる' },
    { emoji: '⛅', en: 'weather', ja: 'てんき' },
    { emoji: '🍂', en: 'season', ja: 'きせつ' },
    { emoji: '🏥', en: 'hospital', ja: 'びょういん' },
    { emoji: '🏦', en: 'bank', ja: 'ぎんこう' },
    { emoji: '🌉', en: 'bridge', ja: 'はし' },
    { emoji: '🗼', en: 'tower', ja: 'とう' },
    { emoji: '🏯', en: 'castle', ja: 'しろ' },
    { emoji: '⛩️', en: 'shrine', ja: 'じんじゃ' },
    { emoji: '🏨', en: 'hotel', ja: 'ホテル' }
  ]
};

// 1・3・5年生は、英語のつづりが読めない子が多いので、カタカナの読みを横にそえる（中1は付けない）。
const EIGO_KANA_GRADES = [1, 3, 5];
const EIGO_KANA = {
  cat: 'キャット',
  dog: 'ドッグ',
  apple: 'アップル',
  banana: 'バナナ',
  red: 'レッド',
  blue: 'ブルー',
  one: 'ワン',
  two: 'トゥー',
  three: 'スリー',
  sun: 'サン',
  moon: 'ムーン',
  water: 'ウォーター',
  fish: 'フィッシュ',
  bird: 'バード',
  star: 'スター',
  rabbit: 'ラビット',
  car: 'カー',
  house: 'ハウス',
  bread: 'ブレッド',
  four: 'フォー',
  five: 'ファイブ',
  elephant: 'エレファント',
  lion: 'ライオン',
  monkey: 'モンキー',
  pig: 'ピッグ',
  strawberry: 'ストロベリー',
  carrot: 'キャロット',
  milk: 'ミルク',
  bus: 'バス',
  plane: 'プレーン',
  flower: 'フラワー',
  tree: 'ツリー',
  six: 'シックス',
  seven: 'セブン',
  eight: 'エイト',
  nine: 'ナイン',
  ten: 'テン',
  book: 'ブック',
  pencil: 'ペンシル',
  bag: 'バッグ',
  family: 'ファミリー',
  bear: 'ベア',
  rain: 'レイン',
  cloud: 'クラウド',
  snow: 'スノー',
  pizza: 'ピザ',
  hamburger: 'ハンバーガー',
  soccer: 'サッカー',
  basketball: 'バスケットボール',
  music: 'ミュージック',
  art: 'アート',
  math: 'マス',
  chicken: 'チキン',
  bicycle: 'バイシクル',
  school: 'スクール',
  green: 'グリーン',
  yellow: 'イエロー',
  grape: 'グレープ',
  watermelon: 'ウォーターメロン',
  orange: 'オレンジ',
  lemon: 'レモン',
  peach: 'ピーチ',
  cake: 'ケーキ',
  cookie: 'クッキー',
  butterfly: 'バタフライ',
  bee: 'ビー',
  turtle: 'タートル',
  frog: 'フロッグ',
  horse: 'ホース',
  cow: 'カウ',
  sheep: 'シープ',
  train: 'トレイン',
  ship: 'シップ',
  rainbow: 'レインボー',
  piano: 'ピアノ',
  happy: 'ハッピー',
  sad: 'サッド',
  angry: 'アングリー',
  run: 'ラン',
  cook: 'クック',
  read: 'リード',
  write: 'ライト',
  sing: 'シング',
  time: 'タイム',
  calendar: 'カレンダー',
  world: 'ワールド',
  travel: 'トラベル',
  mountain: 'マウンテン',
  beach: 'ビーチ',
  gift: 'ギフト',
  shopping: 'ショッピング',
  party: 'パーティー',
  phone: 'フォン',
  rocket: 'ロケット',
  science: 'サイエンス',
  walk: 'ウォーク',
  swim: 'スイム',
  sleep: 'スリープ',
  eat: 'イート',
  drink: 'ドリンク',
  think: 'シンク',
  look: 'ルック',
  listen: 'リッスン',
  speak: 'スピーク',
  big: 'ビッグ',
  small: 'スモール',
  fast: 'ファスト',
  slow: 'スロー',
  hot: 'ホット'
};

function eigoLabel(grade, en) {
  const k = EIGO_KANA_GRADES.includes(grade) ? EIGO_KANA[en] : '';
  return k ? `${en} ${k}` : en;
}

// 1年生向け：アルファベットの大文字・小文字
function generateAlphabetProblem() {
  // l（エル）と I（アイ）は、教科書体では見分けにくいので出さない
  const letters = 'abcdefghjkmnopqrstuvwxyz'.split('');
  const l = letters[randInt(0, letters.length - 1)];
  const others = shuffleArray(letters.filter(x => x !== l)).slice(0, 3);
  if (Math.random() < 0.5) {
    return {
      question: `「${l.toUpperCase()}」の 小文字は どれ？`,
      type: 'choice',
      choices: shuffleArray([l, ...others]),
      answer: l,
      key: 'alphabet',
      unitLabel: 'アルファベット'
    };
  }
  return {
    question: `「${l}」の 大文字は どれ？`,
    type: 'choice',
    choices: shuffleArray([l, ...others].map(x => x.toUpperCase())),
    answer: l.toUpperCase(),
    key: 'alphabet',
    unitLabel: 'アルファベット'
  };
}

function generateEigoProblem(grade) {
  const list = EIGO_DATA[grade] || EIGO_DATA[1];
  if (grade === 1 && Math.random() < 0.2) return generateAlphabetProblem();
  const correct = list[randInt(0, list.length - 1)];
  const useKana = EIGO_KANA_GRADES.includes(grade);
  // 日本語もカタカナの言葉（バナナ・ピザ など）は、「banana（バナナ）の意味は？→バナナ」だと答えが見えてしまうので、
  // 絵を見て英語を選ぶ形だけにする。
  const loanword = /^[ァ-ヶー]+$/.test(correct.ja) && (!useKana || EIGO_KANA[correct.en] === correct.ja);
  const askEnglish = loanword || Math.random() < 0.5;

  if (askEnglish) {
    const distractorPool = list.filter(item => item.en !== correct.en);
    shuffleArray(distractorPool);
    const distractors = distractorPool.slice(0, 3).map(item => eigoLabel(grade, item.en));
    const correctLabel = eigoLabel(grade, correct.en);
    const choices = shuffleArray([correctLabel, ...distractors]);
    // 1年生は絵だけ。3年生からは絵だと意味が決まりにくい言葉（cook・important など）が多いので、日本語のヒントを付ける。
    const hint = grade === 1 ? '' : `「${correct.ja}」\n`;
    const result = {
      question: `${hint}これを えいごで いうと？`,
      emoji: correct.emoji,
      type: 'choice',
      choices,
      answer: correctLabel,
      noRead: true,
      key: correct.en,
      unitLabel: `えいご「${correct.en}」`
    };
    if (useKana) result.choiceFormat = 'kanji-kana'; // 「apple アップル」を、つづり＋小さい読みで表示
    return result;
  }

  // えいご -> 日本語
  const distractorPool = list.filter(item => item.ja !== correct.ja);
  shuffleArray(distractorPool);
  const distractors = distractorPool.slice(0, 3).map(item => item.ja);
  const choices = shuffleArray([correct.ja, ...distractors]);
  const k = useKana ? EIGO_KANA[correct.en] : '';
  return {
    question: `「${correct.en}」${k ? `（${k}）` : ''}の いみは？`,
    type: 'choice',
    choices,
    answer: correct.ja,
    speakEn: correct.en,
    key: correct.en,
    unitLabel: `えいご「${correct.en}」`
  };
}
