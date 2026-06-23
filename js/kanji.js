// ===== こくご：かんじクイズ =====
// kanji: 漢字, reading: 出題する読み方(ひらがな), word: その読み方を含む熟語・例

const KANJI_DATA = {
  1: [
    // やさしい前半 1〜25（数・自然・元素・天気・植物・動物）
    { kanji: '一', reading: 'いち',   word: '一日',   wordKana: '□にち' },
    { kanji: '二', reading: 'に',     word: '二月',   wordKana: '□がつ' },
    { kanji: '三', reading: 'さん',   word: '三つ' },
    { kanji: '四', reading: 'し',     word: '四月',   wordKana: '□がつ' },
    { kanji: '五', reading: 'ご',     word: '五人',   wordKana: '□にん' },
    { kanji: '六', reading: 'ろく',   word: '六日',   wordKana: '□にち' },
    { kanji: '七', reading: 'しち',   word: '七月',   wordKana: '□がつ' },
    { kanji: '八', reading: 'はち',   word: '八月',   wordKana: '□がつ' },
    { kanji: '九', reading: 'きゅう', word: '九日',   wordKana: '□にち' },
    { kanji: '十', reading: 'じゅう', word: '十月',   wordKana: '□がつ' },
    { kanji: '日', reading: 'ひ',     word: '日本',   wordKana: '□もと' },
    { kanji: '月', reading: 'つき',   word: '三日月', wordKana: 'みか□' },
    { kanji: '山', reading: 'やま',   word: '火山',   wordKana: 'か□' },
    { kanji: '川', reading: 'かわ',   word: '小川',   wordKana: 'お□' },
    { kanji: '田', reading: 'た',     word: '田んぼ' },
    { kanji: '木', reading: 'き',     word: '木の葉', wordKana: '□のは' },
    { kanji: '水', reading: 'みず',   word: '水色',   wordKana: '□いろ' },
    { kanji: '火', reading: 'ひ',     word: '火あそび' },
    { kanji: '土', reading: 'つち',   word: '土いじり' },
    { kanji: '花', reading: 'はな',   word: '花火',   wordKana: '□び' },
    { kanji: '草', reading: 'くさ',   word: '草むら' },
    { kanji: '天', reading: 'てん',   word: '天気',   wordKana: '□き' },
    { kanji: '雨', reading: 'あめ',   word: '大雨',   wordKana: 'おお□' },
    { kanji: '空', reading: 'そら',   word: '青空',   wordKana: 'あお□' },
    { kanji: '犬', reading: 'いぬ',   word: '子犬',   wordKana: 'こ□' },
    // むずかしい後半 26〜50（からだ・方向・もの・学校・大きい数）
    { kanji: '人', reading: 'ひと',   word: '三人',   wordKana: 'さん□' },
    { kanji: '口', reading: 'くち',   word: '入り口', wordKana: 'いり□' },
    { kanji: '手', reading: 'て',     word: '手足',   wordKana: '□あし' },
    { kanji: '目', reading: 'め',     word: '目玉',   wordKana: '□たま' },
    { kanji: '耳', reading: 'みみ',   word: '右耳',   wordKana: 'みぎ□' },
    { kanji: '足', reading: 'あし',   word: '足音',   wordKana: '□おと' },
    { kanji: '上', reading: 'うえ',   word: '山の上', wordKana: 'やまの□' },
    { kanji: '下', reading: 'した',   word: '木の下', wordKana: 'きの□' },
    { kanji: '左', reading: 'ひだり', word: '左手',   wordKana: '□て' },
    { kanji: '右', reading: 'みぎ',   word: '右手',   wordKana: '□て' },
    { kanji: '中', reading: 'なか',   word: '川の中', wordKana: 'かわの□' },
    { kanji: '大', reading: 'おお',   word: '大きい' },
    { kanji: '小', reading: 'ちい',   word: '小さい' },
    { kanji: '石', reading: 'いし',   word: '石ころ' },
    { kanji: '車', reading: 'くるま', word: '車いす' },
    { kanji: '赤', reading: 'あか',   word: '赤ちゃん' },
    { kanji: '白', reading: 'しろ',   word: '白い' },
    { kanji: '虫', reading: 'むし',   word: '虫歯',   wordKana: '□ば' },
    { kanji: '年', reading: 'ねん',   word: '一年生', wordKana: 'いち□せい' },
    { kanji: '先', reading: 'さき',   word: '先っぽ' },
    { kanji: '学', reading: 'がく',   word: '学校',   wordKana: '□こう' },
    { kanji: '校', reading: 'こう',   word: '学校',   wordKana: 'がっ□' },
    { kanji: '生', reading: 'せい',   word: '先生',   wordKana: 'せん□' },
    { kanji: '百', reading: 'ひゃく', word: '百円',   wordKana: '□えん' },
    { kanji: '千', reading: 'せん',   word: '千円',   wordKana: '□えん' }
  ],
  3: [
    { kanji: '運', reading: 'うん', word: '運動会' },
    { kanji: '泳', reading: 'えい', word: '水泳' },
    { kanji: '駅', reading: 'えき', word: '駅前' },
    { kanji: '安', reading: 'やす', word: '安い' },
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
    { kanji: '苦', reading: 'く', word: '苦しい' },
    { kanji: '具', reading: 'ぐ', word: '道具' },
    { kanji: '君', reading: 'くん', word: '君たち' },
    { kanji: '係', reading: 'かかり', word: '係員' },
    { kanji: '軽', reading: 'けい', word: '軽い' },
    { kanji: '血', reading: 'ち', word: '血液' },
    { kanji: '決', reading: 'き', word: '決める' }
  ],
  5: [
    { kanji: '圧', reading: 'あつ', word: '圧力' },
    { kanji: '易', reading: 'い', word: '簡易' },
    { kanji: '移', reading: 'うつ', word: '移る' },
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
    { kanji: '奮', reading: 'ふん', word: '興奮' },
    { kanji: '域', reading: 'いき', word: '地域' },
    { kanji: '継', reading: 'けい', word: '継続' },
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
    { kanji: '慎', reading: 'しん', word: '慎重' },
    { kanji: '層', reading: 'そう', word: '地層' }
  ]
};

function generateKanjiProblem(grade, diff = 1) {
  const list = KANJI_DATA[grade] || KANJI_DATA[1];
  const half = Math.ceil(list.length / 2);
  const pool = diff === 0 ? list.slice(0, half) :
               diff === 2 ? list.slice(list.length - half) :
               list;
  const correct = pool[randInt(0, pool.length - 1)];

  // ===== 1年生：選択肢を「漢字＋ひらがな」形式にする =====
  if (grade === 1) {
    const correctChoice = `${correct.kanji} ${correct.reading}`;
    const maskedWord = correct.wordKana || correct.word.replace(correct.kanji, '□');

    const distractorPool = shuffleArray(list.filter(item => item.kanji !== correct.kanji));
    const distractors = [];
    const usedKanji = new Set([correct.kanji]);
    for (const item of distractorPool) {
      if (distractors.length >= 3) break;
      if (usedKanji.has(item.kanji)) continue;
      usedKanji.add(item.kanji);
      distractors.push(`${item.kanji} ${item.reading}`);
    }
    const choices = shuffleArray([correctChoice, ...distractors]);

    return {
      question: `「${maskedWord}」の\n□に はいる かんじは どれ？`,
      type: 'choice',
      choices,
      answer: correctChoice,
      choiceFormat: 'kanji-kana'
    };
  }

  // ===== 3年生以上：従来の形式 =====
  const askReading = Math.random() < 0.5;

  if (askReading) {
    const distractorPool = shuffleArray(list.filter(item => item.reading !== correct.reading));
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

  const distractorPool = shuffleArray(list.filter(item => item.kanji !== correct.kanji));
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

// ===== こくご：ことわざ・慣用句・四字熟語クイズ =====

const KOTOWAZA_DATA = {
  3: [
    // やさしい前半（有名なことわざ・穴埋め）
    { q: '「花より（　）」の（　）に入る言葉は？', choices: ['まんじゅう', 'だんご', 'みかん', 'おかし'], a: 'だんご' },
    { q: '「七転び（　）起き」の（　）に入る数字は？', choices: ['六', '七', '八', '九'], a: '八' },
    { q: '「石の上にも（　）年」の（　）は？', choices: ['一', '三', '五', '十'], a: '三' },
    { q: '「早起きは三文の（　）」の（　）は？', choices: ['そん', 'とく', 'いみ', 'かね'], a: 'とく' },
    { q: '「（　）も木から落ちる」の（　）に入る動物は？', choices: ['ねこ', 'とり', 'さる', 'いぬ'], a: 'さる' },
    { q: '「ちりも積もれば（　）となる」の（　）は？', choices: ['かわ', 'やま', 'うみ', 'そら'], a: 'やま' },
    { q: '「時は（　）なり」の（　）は？', choices: ['いし', 'かね', 'やま', 'かわ'], a: 'かね' },
    { q: '「笑う門には（　）来たる」の（　）は？', choices: ['ゆき', 'かぜ', 'ふく', 'おに'], a: 'ふく' },
    { q: '「急がば（　）れ」の（　）は？', choices: ['はし', 'まわ', 'すす', 'とば'], a: 'まわ' },
    { q: '「二（　）を追う者は一（　）をも得ず」の（　）に入る動物は？', choices: ['うさぎ', 'とり', 'ねこ', 'いぬ'], a: 'うさぎ' },
    // むずかしい後半（意味を問う）
    { q: '「犬も（　）けば棒にあたる」の（　）は？', choices: ['は', 'ね', 'ある', 'お'], a: 'ある' },
    { q: '「百聞は一（　）にしかず」の（　）は？', choices: ['もん', 'けん', 'ねん', 'さつ'], a: 'けん' },
    { q: '「蛙の子は蛙」の意味は？', choices: ['子どもは親に似る', '蛙は水が好き', '子どもは元気だ', '蛙は小さい'], a: '子どもは親に似る' },
    { q: '「石橋をたたいて渡る」の意味は？', choices: ['石の橋を壊す', '慎重にものごとを行う', '橋を何度も渡る', '急いで渡る'], a: '慎重にものごとを行う' },
    { q: '「のど元過ぎれば（　）を忘れる」の（　）は？', choices: ['あつさ', 'さむさ', 'いたさ', 'つらさ'], a: 'あつさ' },
  ],
  5: [
    // やさしい前半（有名な慣用句・意味を問う）
    { q: '「猫の手も借りたい」の意味は？', choices: ['猫が好き', 'とても忙しくて誰の助けでも借りたい', '猫に頼む', '手が足りない'], a: 'とても忙しくて誰の助けでも借りたい' },
    { q: '「足をあらう」の意味は？', choices: ['足を洗う', '悪いことをやめる', '旅を終える', '疲れる'], a: '悪いことをやめる' },
    { q: '「口が軽い」の意味は？', choices: ['食べるのが速い', 'しゃべりすぎる', '口が小さい', '話すのが上手'], a: 'しゃべりすぎる' },
    { q: '「手を貸す」の意味は？', choices: ['手をさわる', '物を渡す', '助ける', '手が届く'], a: '助ける' },
    { q: '「鼻が高い」の意味は？', choices: ['鼻が大きい', 'においがわかる', '得意になる・自慢に思う', '顔が高い'], a: '得意になる・自慢に思う' },
    { q: '「耳が痛い」の意味は？', choices: ['耳が聞こえにくい', '耳をさわれない', '自分の弱点を指摘されてつらい', '耳が大きい'], a: '自分の弱点を指摘されてつらい' },
    { q: '「目をつぶる」の意味は？', choices: ['眠る', 'わざと見なかったことにする', '目が悪い', '目が疲れる'], a: 'わざと見なかったことにする' },
    { q: '「馬が合う」の意味は？', choices: ['馬に乗るのが上手', '気が合う・相性がよい', '馬と仲良し', '足が速い'], a: '気が合う・相性がよい' },
    // むずかしい後半（紛らわしい慣用句・ことわざ）
    { q: '「頭が上がらない」の意味は？', choices: ['背が低い', '頭が重い', '相手に引け目があって対等に接することができない', '頭が痛い'], a: '相手に引け目があって対等に接することができない' },
    { q: '「腹を割って話す」の意味は？', choices: ['お腹が痛い', '本音で話し合う', '大きな声で話す', 'たくさん食べる'], a: '本音で話し合う' },
    { q: '「お茶を濁す」の意味は？', choices: ['お茶を作る', 'その場をごまかす', 'お茶が好き', '汚い水を飲む'], a: 'その場をごまかす' },
    { q: '「気が置けない」の意味は？', choices: ['気をつけなければならない', '気をつかわなくてよい', '気が強い', 'やる気がない'], a: '気をつかわなくてよい' },
    { q: '「雨降って地固まる」の意味は？', choices: ['雨が降ると地面が固くなる', 'もめごとの後はかえって関係が良くなる', '梅雨が好き', '雨の後は晴れる'], a: 'もめごとの後はかえって関係が良くなる' },
    { q: '「焼きもちを焼く」の意味は？', choices: ['もちを焼く料理', 'ねたむ', '怒る', 'やきもちを食べる'], a: 'ねたむ' },
    { q: '「情けは人のためならず」の本当の意味は？', choices: ['人に親切にしても意味がない', '人に親切にすると回り回って自分のためになる', '情けをかけてはいけない', '人には優しくしなくてよい'], a: '人に親切にすると回り回って自分のためになる' },
  ],
  7: [
    // やさしい前半（有名な四字熟語）
    { q: '「一石二鳥」の意味は？', choices: ['石を二つ投げる', '一つの行動で二つの利益を得る', '二羽の鳥を捕まえる', '一回で全部終わらせる'], a: '一つの行動で二つの利益を得る' },
    { q: '「以心伝心」の意味は？', choices: ['手紙で気持ちを伝える', '言葉を使わなくても心が通じ合う', 'テレパシーを使う', '心から心へ伝言する'], a: '言葉を使わなくても心が通じ合う' },
    { q: '「温故知新」の意味は？', choices: ['古いものは知らない', '昔のことを大切にしながら新しいことを学ぶ', '新しいことだけを学ぶ', '過去は変えられない'], a: '昔のことを大切にしながら新しいことを学ぶ' },
    { q: '「転ばぬ先の杖」の意味は？', choices: ['転んでから立つ', '事前に準備をしておく', '杖は歩くのに必要', '先に進むには勇気が必要'], a: '事前に準備をしておく' },
    { q: '「棚からぼたもち」の意味は？', choices: ['棚の上にもちがある', '思いがけない幸運が転がり込む', 'ぼたもちは棚に置くもの', '努力せずに得をする方法'], a: '思いがけない幸運が転がり込む' },
    { q: '「灯台下暗し」の意味は？', choices: ['灯台は明るい', '身近なことほど気がつきにくい', '暗い場所は危ない', '電気をつけ忘れる'], a: '身近なことほど気がつきにくい' },
    { q: '「五十歩百歩」の意味は？', choices: ['百歩の方が五十歩より二倍多い', '少しの差はあっても本質的には同じ', '歩く速さのちがい', '距離の比較'], a: '少しの差はあっても本質的には同じ' },
    { q: '「知らぬが仏」の意味は？', choices: ['仏は何でも知っている', '知らないことが幸せなこともある', '無知は罪だ', '仏様だけが真実を知っている'], a: '知らないことが幸せなこともある' },
    // むずかしい後半（やや難しい四字熟語・故事成語）
    { q: '「七転八倒」の意味は？', choices: ['七回転んで八回起き上がる', 'ひどい苦しみにもがく', '七つの困難と八つの成功', '転がり続ける'], a: 'ひどい苦しみにもがく' },
    { q: '「虎の威を借る狐」の意味は？', choices: ['狐は虎より強い', '権力ある者の力を借りて威張る人', '虎と狐は仲良し', '動物同士の協力'], a: '権力ある者の力を借りて威張る人' },
    { q: '「付和雷同」の意味は？', choices: ['雷が鳴ると雨が降る', '自分の意見を持たずに他人に同調する', '友達と一緒に行動する', '大勢で協力する'], a: '自分の意見を持たずに他人に同調する' },
    { q: '「画竜点睛」の意味は？', choices: ['竜の絵を描く', '最後の仕上げで全体が生きてくる', '竜に目を描く', '完成直前で失敗する'], a: '最後の仕上げで全体が生きてくる' },
    { q: '「臥薪嘗胆」の意味は？', choices: ['薪の上で寝て胆を舐める', '目的のために苦労に耐えて力を蓄える', '病気のときの薬', 'たいへん苦い経験'], a: '目的のために苦労に耐えて力を蓄える' },
    { q: '「羊頭狗肉」の意味は？', choices: ['羊と犬の料理', '見せかけと実態が異なる', '動物の肉の違い', '外見通りの内容である'], a: '見せかけと実態が異なる' },
    { q: '「杞憂」の意味は？', choices: ['杞の国の心配', '取り越し苦労・必要のない心配', '心配することは大切', '心配しすぎると疲れる'], a: '取り越し苦労・必要のない心配' },
  ]
};

function generateKotowazaProblem(grade, diff = 1) {
  const list = KOTOWAZA_DATA[grade] || KOTOWAZA_DATA[3];
  const half = Math.ceil(list.length / 2);
  const pool = diff === 0 ? list.slice(0, half) :
               diff === 2 ? list.slice(list.length - half) :
               list;
  const item = pool[randInt(0, pool.length - 1)];
  return {
    question: item.q,
    type: 'choice',
    choices: shuffleArray([...item.choices]),
    answer: item.a
  };
}
