// ===== こくご：かんじクイズ =====
// kanji: 漢字, reading: 出題する読み方(ひらがな), word: その読み方を含む熟語・例

const KANJI_DATA = {
  1: [
    { kanji: '一', reading: 'いち', word: '一年生' },
    { kanji: '二', reading: 'に', word: '二月' },
    { kanji: '三', reading: 'さん', word: '三角形' },
    { kanji: '四', reading: 'し', word: '四月' },
    { kanji: '五', reading: 'ご', word: '五人' },
    { kanji: '六', reading: 'ろく', word: '六時' },
    { kanji: '七', reading: 'しち', word: '七夕' },
    { kanji: '八', reading: 'はち', word: '八月' },
    { kanji: '九', reading: 'きゅう', word: '九州' },
    { kanji: '十', reading: 'じゅう', word: '十月' },
    { kanji: '百', reading: 'ひゃく', word: '百円' },
    { kanji: '千', reading: 'せん', word: '千円' },
    { kanji: '上', reading: 'うえ', word: '机の上' },
    { kanji: '下', reading: 'した', word: '木の下' },
    { kanji: '左', reading: 'ひだり', word: '左手' },
    { kanji: '右', reading: 'みぎ', word: '右手' },
    { kanji: '中', reading: 'なか', word: '箱の中' },
    { kanji: '大', reading: 'おお', word: '大きい' },
    { kanji: '小', reading: 'ちい', word: '小さい' },
    { kanji: '山', reading: 'やま', word: '富士山' },
    { kanji: '川', reading: 'かわ', word: '小川' },
    { kanji: '田', reading: 'た', word: '田んぼ' },
    { kanji: '人', reading: 'ひと', word: '三人' },
    { kanji: '口', reading: 'くち', word: '入り口' },
    { kanji: '目', reading: 'め', word: '目玉' },
    { kanji: '耳', reading: 'みみ', word: '耳鳴り' },
    { kanji: '手', reading: 'て', word: '手紙' },
    { kanji: '足', reading: 'あし', word: '足音' },
    { kanji: '月', reading: 'つき', word: '三日月' },
    { kanji: '日', reading: 'ひ', word: '日曜日' }
  ],
  3: [
    { kanji: '運', reading: 'うん', word: '運動会' },
    { kanji: '泳', reading: 'えい', word: '水泳' },
    { kanji: '駅', reading: 'えき', word: '駅前' },
    { kanji: '安', reading: 'やす', word: '安心' },
    { kanji: '荷', reading: 'に', word: '荷物' },
    { kanji: '階', reading: 'かい', word: '三階' },
    { kanji: '寒', reading: 'さむ', word: '寒い' },
    { kanji: '感', reading: 'かん', word: '感想' },
    { kanji: '漢', reading: 'かん', word: '漢字' },
    { kanji: '起', reading: 'お', word: '起きる' },
    { kanji: '期', reading: 'き', word: '一学期' },
    { kanji: '客', reading: 'きゃく', word: 'お客さん' },
    { kanji: '急', reading: 'きゅう', word: '急行' },
    { kanji: '球', reading: 'きゅう', word: '野球' },
    { kanji: '去', reading: 'きょ', word: '去年' },
    { kanji: '橋', reading: 'はし', word: '橋' },
    { kanji: '業', reading: 'ぎょう', word: '授業' },
    { kanji: '曲', reading: 'きょく', word: '曲がる' },
    { kanji: '局', reading: 'きょく', word: '郵便局' },
    { kanji: '銀', reading: 'ぎん', word: '銀行' },
    { kanji: '区', reading: 'く', word: '区役所' },
    { kanji: '苦', reading: 'くる', word: '苦しい' },
    { kanji: '具', reading: 'ぐ', word: '道具' },
    { kanji: '君', reading: 'くん', word: '君たち' },
    { kanji: '係', reading: 'かかり', word: '係員' },
    { kanji: '軽', reading: 'かる', word: '軽い' },
    { kanji: '血', reading: 'ち', word: '血液' },
    { kanji: '決', reading: 'き', word: '決める' }
  ],
  5: [
    { kanji: '圧', reading: 'あつ', word: '圧力' },
    { kanji: '易', reading: 'い', word: '簡易' },
    { kanji: '移', reading: 'うつ', word: '移動' },
    { kanji: '因', reading: 'いん', word: '原因' },
    { kanji: '永', reading: 'えい', word: '永遠' },
    { kanji: '営', reading: 'えい', word: '営業' },
    { kanji: '衛', reading: 'えい', word: '衛星' },
    { kanji: '益', reading: 'えき', word: '利益' },
    { kanji: '液', reading: 'えき', word: '液体' },
    { kanji: '演', reading: 'えん', word: '演奏' },
    { kanji: '往', reading: 'おう', word: '往復' },
    { kanji: '桜', reading: 'さくら', word: '桜の花' },
    { kanji: '恩', reading: 'おん', word: '恩人' },
    { kanji: '可', reading: 'か', word: '可能' },
    { kanji: '仮', reading: 'かり', word: '仮の話' },
    { kanji: '価', reading: 'か', word: '価格' },
    { kanji: '河', reading: 'かわ', word: '河口' },
    { kanji: '過', reading: 'す', word: '過ごす' },
    { kanji: '快', reading: 'かい', word: '快晴' },
    { kanji: '解', reading: 'かい', word: '理解' },
    { kanji: '格', reading: 'かく', word: '合格' },
    { kanji: '確', reading: 'かく', word: '確認' },
    { kanji: '額', reading: 'がく', word: '金額' },
    { kanji: '刊', reading: 'かん', word: '夕刊' },
    { kanji: '幹', reading: 'みき', word: '幹' },
    { kanji: '基', reading: 'き', word: '基本' },
    { kanji: '寄', reading: 'き', word: '寄付' },
    { kanji: '規', reading: 'き', word: '規則' }
  ],
  7: [
    { kanji: '詩', reading: 'し', word: '詩集' },
    { kanji: '訪', reading: 'ほう', word: '訪問' },
    { kanji: '脈', reading: 'みゃく', word: '山脈' },
    { kanji: '普', reading: 'ふ', word: '普通' },
    { kanji: '互', reading: 'ご', word: '相互' },
    { kanji: '包', reading: 'ほう', word: '包囲' },
    { kanji: '域', reading: 'いき', word: '地域' },
    { kanji: '委', reading: 'い', word: '委員' },
    { kanji: '縮', reading: 'しゅく', word: '縮小' },
    { kanji: '担', reading: 'たん', word: '担当' },
    { kanji: '伏', reading: 'ふく', word: '起伏' },
    { kanji: '程', reading: 'てい', word: '過程' },
    { kanji: '沿', reading: 'えん', word: '沿岸' },
    { kanji: '革', reading: 'かく', word: '改革' },
    { kanji: '鋭', reading: 'えい', word: '鋭利' },
    { kanji: '純', reading: 'じゅん', word: '純粋' },
    { kanji: '貨', reading: 'か', word: '貨物' },
    { kanji: '鮮', reading: 'せん', word: '新鮮' },
    { kanji: '詳', reading: 'しょう', word: '詳細' },
    { kanji: '婚', reading: 'こん', word: '結婚' },
    { kanji: '訳', reading: 'やく', word: '翻訳' },
    { kanji: '載', reading: 'さい', word: '記載' },
    { kanji: '較', reading: 'かく', word: '比較' },
    { kanji: '券', reading: 'けん', word: '入場券' },
    { kanji: '層', reading: 'そう', word: '地層' }
  ]
};

function generateKanjiProblem(grade) {
  const list = KANJI_DATA[grade] || KANJI_DATA[1];
  const correct = list[randInt(0, list.length - 1)];
  const askReading = Math.random() < 0.5;

  if (askReading) {
    // 不正解の選択肢を集める（読み方が重複しないように）
    const distractorPool = list.filter(item => item.reading !== correct.reading);
    shuffleArray(distractorPool);
    const distractors = [];
    const usedReadings = new Set([correct.reading]);
    for (const item of distractorPool) {
      if (distractors.length >= 3) break;
      if (usedReadings.has(item.reading)) continue;
      usedReadings.add(item.reading);
      distractors.push(item.reading);
    }
    while (distractors.length < 3) {
      distractors.push(correct.reading + 'ー');
    }

    const choices = shuffleArray([correct.reading, ...distractors]);

    return {
      question: `「${correct.word}」の\n「${correct.kanji}」の よみかたは？`,
      type: 'choice',
      choices,
      answer: correct.reading
    };
  }

  // 読みから漢字を選ぶ（単語中の漢字を□でかくす）
  const distractorPool = list.filter(item => item.kanji !== correct.kanji);
  shuffleArray(distractorPool);
  const distractors = [];
  const usedKanji = new Set([correct.kanji]);
  for (const item of distractorPool) {
    if (distractors.length >= 3) break;
    if (usedKanji.has(item.kanji)) continue;
    usedKanji.add(item.kanji);
    distractors.push(item.kanji);
  }
  while (distractors.length < 3) {
    distractors.push(correct.kanji);
  }

  const choices = shuffleArray([correct.kanji, ...distractors]);
  const maskedWord = correct.word.replace(correct.kanji, '□');

  return {
    question: `「${maskedWord}」の「${correct.reading}」に\nあてはまる漢字は？`,
    type: 'choice',
    choices,
    answer: correct.kanji
  };
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
