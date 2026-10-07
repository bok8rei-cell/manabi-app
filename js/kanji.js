// ===== こくご：かんじクイズ =====
// kanji: 漢字, reading: 出題する読み方(ひらがな), word: その読み方を含む熟語・例（3年以上は穴埋めで□に置き換えて表示する。用例は、その学年までに習う漢字だけで作る）

const KANJI_DATA = {
  1: [
    // やさしい前半 1〜25（数・自然・元素・天気・植物・動物）
    // 1年生：yomi = 語の全体の読み。「yomi の reading を かんじで かくと？」と聞く（reading は必ず yomi の一部）。wordKana/word は参考データ。
    { kanji: '一', reading: 'いち',   word: '一日',   wordKana: '□にち',   yomi: 'いちにち' },
    { kanji: '二', reading: 'に',     word: '二月',   wordKana: '□がつ',   yomi: 'にがつ' },
    { kanji: '三', reading: 'さん',   word: '三角',   wordKana: '□かく',   yomi: 'さんかく' },
    { kanji: '四', reading: 'し',     word: '四角',   wordKana: '□かく',   yomi: 'しかく' },
    { kanji: '五', reading: 'ご',     word: '五人',   wordKana: '□にん',   yomi: 'ごにん' },
    { kanji: '六', reading: 'ろく',   word: '六年',   wordKana: '□ねん',   yomi: 'ろくねん' },
    { kanji: '七', reading: 'しち',   word: '七五三', wordKana: '□ごさん', yomi: 'しちごさん' },
    { kanji: '八', reading: 'はち',   word: '八月',   wordKana: '□がつ',   yomi: 'はちがつ' },
    { kanji: '九', reading: 'きゅう', word: '九本',   wordKana: '□ほん',   yomi: 'きゅうほん' },
    { kanji: '十', reading: 'じゅう', word: '十月',   wordKana: '□がつ',   yomi: 'じゅうがつ' },
    { kanji: '日', reading: 'ひ',     word: '日の出', wordKana: '□ので',   yomi: 'ひので' },
    { kanji: '月', reading: 'つき',   word: 'お月さま', wordKana: 'お□さま', yomi: 'おつきさま' },
    { kanji: '山', reading: 'やま',   word: '山道',   wordKana: '□みち',   yomi: 'やまみち' },
    { kanji: '川', reading: 'かわ',   word: '川岸',   wordKana: '□ぎし',   yomi: 'かわぎし' },
    { kanji: '田', reading: 'た',     word: '田んぼ', wordKana: '□んぼ',   yomi: 'たんぼ' },
    { kanji: '木', reading: 'き',     word: '木の枝', wordKana: '□のえだ', yomi: 'きのえだ' },
    { kanji: '水', reading: 'みず',   word: '水色',   wordKana: '□いろ',   yomi: 'みずいろ' },
    { kanji: '火', reading: 'ひ',     word: '火あそび', wordKana: '□あそび', yomi: 'ひあそび' },
    { kanji: '土', reading: 'つち',   word: '土いじり', wordKana: '□いじり', yomi: 'つちいじり' },
    { kanji: '花', reading: 'はな',   word: '花火',   wordKana: '□び',     yomi: 'はなび' },
    { kanji: '草', reading: 'くさ',   word: '草むら', wordKana: '□むら',   yomi: 'くさむら' },
    { kanji: '天', reading: 'てん',   word: '天気',   wordKana: '□き',     yomi: 'てんき' },
    { kanji: '雨', reading: 'あめ',   word: '大雨',   wordKana: 'おお□',   yomi: 'おおあめ' },
    { kanji: '空', reading: 'そら',   word: '空色',   wordKana: '□いろ',   yomi: 'そらいろ' },
    { kanji: '犬', reading: 'いぬ',   word: '子犬',   wordKana: 'こ□',     yomi: 'こいぬ' },
    // むずかしい後半 26〜50（からだ・方向・もの・学校・大きい数）
    { kanji: '人', reading: 'ひと',   word: '人ごみ', wordKana: '□ごみ',   yomi: 'ひとごみ' },
    { kanji: '口', reading: 'くち',   word: '口笛',   wordKana: '□ぶえ',   yomi: 'くちぶえ' },
    { kanji: '手', reading: 'て',     word: '手足',   wordKana: '□あし',   yomi: 'てあし' },
    { kanji: '目', reading: 'め',     word: '目玉',   wordKana: '□だま',   yomi: 'めだま' },
    { kanji: '耳', reading: 'みみ',   word: '右耳',   wordKana: 'みぎ□',   yomi: 'みぎみみ' },
    { kanji: '足', reading: 'あし',   word: '足音',   wordKana: '□おと',   yomi: 'あしおと' },
    { kanji: '上', reading: 'うえ',   word: '山の上', wordKana: 'やまの□', yomi: 'やまのうえ' },
    { kanji: '下', reading: 'した',   word: '木の下', wordKana: 'きの□',   yomi: 'きのした' },
    { kanji: '左', reading: 'ひだり', word: '左手',   wordKana: '□て',     yomi: 'ひだりて' },
    { kanji: '右', reading: 'みぎ',   word: '右手',   wordKana: '□て',     yomi: 'みぎて' },
    { kanji: '中', reading: 'なか',   word: '川の中', wordKana: 'かわの□', yomi: 'かわのなか' },
    { kanji: '大', reading: 'おお',   word: '大きい', wordKana: '□きい',   yomi: 'おおきい' },
    { kanji: '小', reading: 'ちい',   word: '小さい', wordKana: '□さい',   yomi: 'ちいさい' },
    { kanji: '石', reading: 'いし',   word: '石ころ', wordKana: '□ころ',   yomi: 'いしころ' },
    { kanji: '車', reading: 'くるま', word: '車いす', wordKana: '□いす',   yomi: 'くるまいす' },
    { kanji: '赤', reading: 'あか',   word: '赤ちゃん', wordKana: '□ちゃん', yomi: 'あかちゃん' },
    { kanji: '白', reading: 'しろ',   word: '白い',   wordKana: '□い',     yomi: 'しろい' },
    { kanji: '虫', reading: 'むし',   word: '虫歯',   wordKana: '□ば',     yomi: 'むしば' },
    { kanji: '年', reading: 'ねん',   word: '一年生', wordKana: 'いち□せい', yomi: 'いちねんせい' },
    { kanji: '先', reading: 'さき',   word: '先っぽ', wordKana: '□っぽ',   yomi: 'さきっぽ' },
    { kanji: '学', reading: 'がく',   word: '学年',   wordKana: '□ねん',   yomi: 'がくねん' },
    { kanji: '校', reading: 'こう',   word: '学校',   wordKana: 'がっ□',   yomi: 'がっこう' },
    { kanji: '生', reading: 'せい',   word: '先生',   wordKana: 'せん□',   yomi: 'せんせい' },
    { kanji: '百', reading: 'ひゃく', word: '百円',   wordKana: '□えん',   yomi: 'ひゃくえん' },
    { kanji: '千', reading: 'せん',   word: '千円',   wordKana: '□えん',   yomi: 'せんえん' },
    // 追加分（1年生で習う漢字）
    { kanji: '青', reading: 'あお', word: '青空', yomi: 'あおぞら' },
    { kanji: '森', reading: 'もり', word: '森の中', yomi: 'もりのなか' },
    { kanji: '竹', reading: 'たけ', word: '竹馬', yomi: 'たけうま' },
    { kanji: '糸', reading: 'いと', word: '糸巻き', yomi: 'いとまき' },
    { kanji: '玉', reading: 'たま', word: '玉ねぎ', yomi: 'たまねぎ' },
    { kanji: '貝', reading: 'かい', word: '貝がら', yomi: 'かいがら' },
    { kanji: '王', reading: 'おう', word: '王さま', yomi: 'おうさま' },
    { kanji: '子', reading: 'こ', word: '子ねこ', yomi: 'こねこ' },
    { kanji: '男', reading: 'おとこ', word: '男の子', yomi: 'おとこのこ' },
    { kanji: '女', reading: 'おんな', word: '女の子', yomi: 'おんなのこ' },
    { kanji: '力', reading: 'ちから', word: '力持ち', yomi: 'ちからもち' },
    { kanji: '立', reading: 'た', word: '立つ', yomi: 'たつ' },
    { kanji: '出', reading: 'で', word: '出口', yomi: 'でぐち' },
    { kanji: '入', reading: 'はい', word: '入る', yomi: 'はいる' },
    { kanji: '見', reading: 'み', word: '見る', yomi: 'みる' },
    { kanji: '音', reading: 'おと', word: '物音', yomi: 'ものおと' },
    { kanji: '町', reading: 'まち', word: '町角', yomi: 'まちかど' },
    { kanji: '村', reading: 'むら', word: '村祭り', yomi: 'むらまつり' },
    { kanji: '正', reading: 'ただ', word: '正しい', yomi: 'ただしい' },
    { kanji: '夕', reading: 'ゆう', word: '夕方', yomi: 'ゆうがた' },
    { kanji: '気', reading: 'き', word: '元気', yomi: 'げんき' },
    { kanji: '休', reading: 'やす', word: '休む', yomi: 'やすむ' },
    { kanji: '金', reading: 'きん', word: '金魚', yomi: 'きんぎょ' },
    { kanji: '円', reading: 'えん', word: '百円', yomi: 'ひゃくえん' },
    { kanji: '本', reading: 'ほん', word: '本屋', yomi: 'ほんや' },
    { kanji: '文', reading: 'ぶん', word: '作文', yomi: 'さくぶん' },
    { kanji: '字', reading: 'じ', word: '文字', yomi: 'もじ' },
    { kanji: '名', reading: 'な', word: '名前', yomi: 'なまえ' },
    { kanji: '早', reading: 'はや', word: '早い', yomi: 'はやい' }
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
    { kanji: '橋', reading: 'はし', word: '橋の上' },
    { kanji: '業', reading: 'ぎょう', word: '工業' },
    { kanji: '曲', reading: 'ま', word: '曲がる' },
    { kanji: '局', reading: 'きょく', word: 'ゆうびん局' },
    { kanji: '銀', reading: 'ぎん', word: '銀行' },
    { kanji: '区', reading: 'く', word: '区役所' },
    { kanji: '苦', reading: 'く', word: '苦心' },
    { kanji: '具', reading: 'ぐ', word: '道具' },
    { kanji: '君', reading: 'くん', word: '山田君' },
    { kanji: '係', reading: 'かかり', word: '係員' },
    { kanji: '軽', reading: 'けい', word: '軽音楽' },
    { kanji: '血', reading: 'けつ', word: '出血' },
    { kanji: '決', reading: 'き', word: '決める' },
    // 追加分（3年生で習う漢字。用例は3年までに習う漢字だけ）
    { kanji: '悪', reading: 'あく', word: '悪人' },
    { kanji: '暗', reading: 'あん', word: '暗号' },
    { kanji: '医', reading: 'い', word: '医者' },
    { kanji: '育', reading: 'そだ', word: '育てる' },
    { kanji: '員', reading: 'いん', word: '会員' },
    { kanji: '院', reading: 'いん', word: '病院' },
    { kanji: '飲', reading: 'の', word: '飲む' },
    { kanji: '央', reading: 'おう', word: '中央' },
    { kanji: '横', reading: 'よこ', word: '横顔' },
    { kanji: '屋', reading: 'や', word: '本屋' },
    { kanji: '温', reading: 'おん', word: '温度' },
    { kanji: '活', reading: 'かつ', word: '生活' },
    { kanji: '研', reading: 'けん', word: '研究' },
    { kanji: '向', reading: 'む', word: '向かう' },
    { kanji: '幸', reading: 'こう', word: '幸福' },
    { kanji: '港', reading: 'みなと', word: '港町' },
    { kanji: '号', reading: 'ごう', word: '番号' },
    { kanji: '祭', reading: 'まつ', word: '祭り' },
    { kanji: '仕', reading: 'し', word: '仕事' },
    { kanji: '使', reading: 'つか', word: '使う' },
    { kanji: '始', reading: 'はじ', word: '始める' },
    { kanji: '指', reading: 'ゆび', word: '指先' },
    { kanji: '歯', reading: 'は', word: '歯みがき' },
    { kanji: '次', reading: 'つぎ', word: '次の日' },
    { kanji: '持', reading: 'も', word: '持つ' },
    { kanji: '式', reading: 'しき', word: '入学式' },
    { kanji: '実', reading: 'じつ', word: '実力' },
    { kanji: '写', reading: 'しゃ', word: '写真' },
    { kanji: '主', reading: 'しゅ', word: '主人' },
    { kanji: '守', reading: 'まも', word: '守る' },
    { kanji: '取', reading: 'と', word: '取る' },
    { kanji: '受', reading: 'う', word: '受ける' },
    { kanji: '州', reading: 'しゅう', word: '九州' },
    { kanji: '拾', reading: 'ひろ', word: '拾う' },
    { kanji: '終', reading: 'お', word: '終わる' },
    { kanji: '習', reading: 'なら', word: '習う' },
    { kanji: '集', reading: 'あつ', word: '集める' },
    { kanji: '住', reading: 'す', word: '住む' },
    { kanji: '重', reading: 'おも', word: '重い' },
    { kanji: '宿', reading: 'しゅく', word: '宿題' },
    { kanji: '所', reading: 'しょ', word: '場所' },
    { kanji: '暑', reading: 'あつ', word: '暑い' },
    { kanji: '助', reading: 'たす', word: '助ける' },
    { kanji: '昭', reading: 'しょう', word: '昭和' },
    { kanji: '消', reading: 'け', word: '消す' },
    { kanji: '商', reading: 'しょう', word: '商店' },
    { kanji: '勝', reading: 'か', word: '勝つ' },
    { kanji: '乗', reading: 'の', word: '乗る' },
    { kanji: '植', reading: 'う', word: '植える' },
    { kanji: '身', reading: 'しん', word: '全身' },
    { kanji: '神', reading: 'かみ', word: '神様' },
    { kanji: '深', reading: 'ふか', word: '深い' },
    { kanji: '進', reading: 'すす', word: '進む' },
    { kanji: '世', reading: 'せ', word: '世界' },
    { kanji: '相', reading: 'そう', word: '相談' },
    { kanji: '速', reading: 'はや', word: '速い' },
    { kanji: '族', reading: 'ぞく', word: '家族' },
    { kanji: '対', reading: 'たい', word: '対話' },
    { kanji: '反', reading: 'はん', word: '反対' },
    { kanji: '代', reading: 'だい', word: '時代' },
    { kanji: '題', reading: 'だい', word: '話題' },
    { kanji: '炭', reading: 'たん', word: '石炭' },
    { kanji: '短', reading: 'みじか', word: '短い' },
    { kanji: '着', reading: 'き', word: '着る' },
    { kanji: '注', reading: 'ちゅう', word: '注意' },
    { kanji: '帳', reading: 'ちょう', word: '手帳' },
    { kanji: '調', reading: 'しら', word: '調べる' },
    { kanji: '庭', reading: 'にわ', word: '庭先' },
    { kanji: '鉄', reading: 'てつ', word: '鉄道' },
    { kanji: '転', reading: 'てん', word: '回転' },
    { kanji: '度', reading: 'ど', word: '角度' },
    { kanji: '投', reading: 'な', word: '投げる' },
    { kanji: '豆', reading: 'まめ', word: '豆まき' },
    { kanji: '湯', reading: 'ゆ', word: '湯気' },
    { kanji: '登', reading: 'のぼ', word: '登る' },
    { kanji: '動', reading: 'うご', word: '動く' },
    { kanji: '農', reading: 'のう', word: '農家' },
    { kanji: '波', reading: 'なみ', word: '大波' },
    { kanji: '配', reading: 'くば', word: '配る' },
    { kanji: '倍', reading: 'ばい', word: '二倍' },
    { kanji: '坂', reading: 'さか', word: '坂道' },
    { kanji: '悲', reading: 'かな', word: '悲しい' },
    { kanji: '美', reading: 'うつく', word: '美しい' },
    { kanji: '鼻', reading: 'はな', word: '鼻水' },
    { kanji: '氷', reading: 'こおり', word: '氷水' },
    { kanji: '秒', reading: 'びょう', word: '一秒' },
    { kanji: '病', reading: 'びょう', word: '病気' },
    { kanji: '品', reading: 'しな', word: '品物' },
    { kanji: '部', reading: 'ぶ', word: '全部' },
    { kanji: '服', reading: 'ふく', word: '和服' },
    { kanji: '洋', reading: 'よう', word: '洋食' },
    { kanji: '物', reading: 'もの', word: '買い物' },
    { kanji: '返', reading: 'かえ', word: '返す' },
    { kanji: '勉', reading: 'べん', word: '勉強' },
    { kanji: '味', reading: 'あじ', word: '味見' },
    { kanji: '面', reading: 'めん', word: '地面' },
    { kanji: '役', reading: 'やく', word: '役所' },
    { kanji: '薬', reading: 'くすり', word: '薬屋' },
    { kanji: '油', reading: 'あぶら', word: '油絵' },
    { kanji: '有', reading: 'ゆう', word: '有名' },
    { kanji: '遊', reading: 'あそ', word: '遊ぶ' },
    { kanji: '予', reading: 'よ', word: '予定' },
    { kanji: '葉', reading: 'は', word: '葉っぱ' },
    { kanji: '陽', reading: 'よう', word: '太陽' },
    { kanji: '落', reading: 'お', word: '落ちる' },
    { kanji: '流', reading: 'なが', word: '流れる' },
    { kanji: '旅', reading: 'たび', word: '旅人' },
    { kanji: '両', reading: 'りょう', word: '両手' },
    { kanji: '緑', reading: 'みどり', word: '緑色' },
    { kanji: '礼', reading: 'れい', word: 'お礼' },
    { kanji: '列', reading: 'れつ', word: '行列' },
    { kanji: '練', reading: 'れん', word: '練習' },
    { kanji: '路', reading: 'ろ', word: '道路' },
    { kanji: '和', reading: 'わ', word: '平和' }
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
    { kanji: '河', reading: 'か', word: '河口' },
    { kanji: '過', reading: 'す', word: '過ごす' },
    { kanji: '快', reading: 'かい', word: '快晴' },
    { kanji: '解', reading: 'かい', word: '理解' },
    { kanji: '格', reading: 'かく', word: '合格' },
    { kanji: '確', reading: 'かく', word: '確認' },
    { kanji: '額', reading: 'がく', word: '金額' },
    { kanji: '刊', reading: 'かん', word: '夕刊' },
    { kanji: '幹', reading: 'みき', word: '木の幹' },
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

  // ===== 1年生：選択肢を漢字で答える形式 =====
  if (grade === 1) {
    // diff 0（やさしい）だけ選択肢にふりがなを付ける。ふつう以上は漢字だけにして、
    // 「かな照合で当てる（答えの露出）」のを防ぐ。問題文の読みは全難易度で表示する。
    const showKana = diff === 0;
    const fmt = (item) => showKana ? `${item.kanji} ${item.reading}` : item.kanji;
    const correctChoice = fmt(correct);

    // 読みが同じ・読みの出だしが同じ漢字は選択肢に混ぜない（日と火、日と人（ひ／ひと）、手と天（て／てん）など）。
    const distractorPool = shuffleArray(
      list.filter(item => item.kanji !== correct.kanji &&
        !item.reading.startsWith(correct.reading) && !correct.reading.startsWith(item.reading))
    );
    const distractors = [];
    const usedKanji = new Set([correct.kanji]);
    for (const item of distractorPool) {
      if (distractors.length >= 3) break;
      if (usedKanji.has(item.kanji)) continue;
      usedKanji.add(item.kanji);
      distractors.push(fmt(item));
    }
    const choices = shuffleArray([correctChoice, ...distractors]);

    // 「ひだりて」の「ひだり」を かんじで かくと？ （□＋ひらがなの形はやめて、読みで聞く）
    const question = `「${correct.yomi}」の「${correct.reading}」を
かんじで かくと どれ？`;

    const result = {
      question,
      type: 'choice',
      choices,
      answer: correctChoice
    };
    if (showKana) result.choiceFormat = 'kanji-kana'; // ふりがな付きのときだけ漢字＋かな表示
    return result;
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

  const distractorPool = shuffleArray(list.filter(item => item.kanji !== correct.kanji && item.reading !== correct.reading));
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

// read = 読み問題用。full:完全なことわざ, t:読みを問う漢字, y:正しい読み, d:まぎらわしい読み3つ。
// d には t の別の読みを絶対に入れない（答えが2つにならないように）。
const KOTOWAZA_DATA = {
  3: [
    // やさしい前半（有名なことわざ・穴埋め）
    { q: '「花より（　）」の（　）に入る言葉は？', choices: ['まんじゅう', 'だんご', 'みかん', 'おかし'], a: 'だんご', read: { full: '花よりだんご', t: '花', y: 'はな', d: ['つき', 'ゆき', 'くさ'] } },
    { q: '「七転び（　）起き」の（　）に入る数字は？', choices: ['六', '七', '八', '九'], a: '八', read: { full: '七転び八起き', t: '七', y: 'なな', d: ['ここの', 'やっ', 'むい'] } },
    { q: '「石の上にも（　）年」の（　）は？', choices: ['一', '三', '五', '十'], a: '三', read: { full: '石の上にも三年', t: '石', y: 'いし', d: ['つち', 'すな', 'みず'] } },
    { q: '「早起きは三文の（　）」の（　）は？', choices: ['そん', 'とく', 'いみ', 'かね'], a: 'とく', read: { full: '早起きは三文のとく', t: '早', y: 'はや', d: ['おそ', 'あさ', 'よる'] } },
    { q: '「（　）も木から落ちる」の（　）に入る動物は？', choices: ['ねこ', 'とり', 'さる', 'いぬ'], a: 'さる', read: { full: 'さるも木から落ちる', t: '木', y: 'き', d: ['は', 'ね', 'えだ'] } },
    { q: '「ちりもつもれば（　）となる」の（　）は？', choices: ['かわ', 'やま', 'うみ', 'そら'], a: 'やま', read: { full: 'ちりもつもれば山となる', t: '山', y: 'やま', d: ['かわ', 'たに', 'うみ'] } },
    { q: '「時は（　）なり」の（　）は？', choices: ['いし', 'かね', 'やま', 'かわ'], a: 'かね', read: { full: '時は金なり', t: '金', y: 'かね', d: ['いし', 'つち', 'みず'] } },
    { q: '「わらう門には（　）来たる」の（　）は？', choices: ['ゆき', 'かぜ', 'ふく', 'おに'], a: 'ふく', read: { full: 'わらう門には福来たる', t: '福', y: 'ふく', d: ['とみ', 'さいわ', 'めぐみ'] } },
    { q: '「急がば（　）れ」の（　）は？', choices: ['はし', 'まわ', 'すす', 'とば'], a: 'まわ', read: { full: '急がば回れ', t: '急', y: 'いそ', d: ['はや', 'おそ', 'すす'] } },
    { q: '「二（　）を おう者は 一（　）を も えず」の（　）に入る動物は？', choices: ['うさぎ', 'とり', 'ねこ', 'いぬ'], a: 'うさぎ' },
    // むずかしい後半（意味を問う）
    { q: '「犬も（　）けばぼうにあたる」の（　）は？', choices: ['は', 'ね', 'ある', 'お'], a: 'ある', read: { full: '犬も歩けばぼうに当たる', t: '犬', y: 'いぬ', d: ['ねこ', 'うし', 'とり'] } },
    { q: '「百聞は一（　）にしかず」の（　）は？', choices: ['もん', 'けん', 'ねん', 'さつ'], a: 'けん', read: { full: '百聞は一見にしかず', t: '百', y: 'ひゃく', d: ['せん', 'まん', 'じゅう'] } },
    { q: '「かえるの子はかえる」の意味は？', choices: ['子どもは親に似る', 'かえるは水が好き', '子どもは元気だ', 'かえるは小さい'], a: '子どもは親に似る', read: { full: 'かえるの子はかえる', t: '子', y: 'こ', d: ['て', 'め', 'き'] } },
    { q: '「いし橋をたたいてわたる」の意味は？', choices: ['いしの橋をこわす', 'しんちょうにものごとを行う', '橋をなんどもわたる', 'いそいでわたる'], a: 'しんちょうにものごとを行う', read: { full: 'いし橋をたたいてわたる', t: '橋', y: 'はし', d: ['みち', 'いし', 'かわ'] } },
    { q: '「のどもとすぎれば（　）をわすれる」の（　）は？', choices: ['あつさ', 'さむさ', 'いたさ', 'つらさ'], a: 'あつさ' },
  ],
  5: [
    // やさしい前半（有名な慣用句・意味を問う）
    { q: '「ねこの手も借りたい」の意味は？', choices: ['ねこが好き', 'とても忙しくて誰の助けでも借りたい', 'ねこにたのむ', '手が足りない'], a: 'とても忙しくて誰の助けでも借りたい', read: { full: 'ねこの手も借りたい', t: '借', y: 'か', d: ['と', 'ぬ', 'さ'] } },
    { q: '「足をあらう」の意味は？', choices: ['足をきれいにする', '悪いことをやめる', '旅を終える', '疲れる'], a: '悪いことをやめる', read: { full: '足をあらう', t: '足', y: 'あし', d: ['て', 'あたま', 'ゆび'] } },
    { q: '「口が軽い」の意味は？', choices: ['食べるのが速い', 'しゃべりすぎる', '口が小さい', '話すのが上手'], a: 'しゃべりすぎる', read: { full: '口が軽い', t: '軽', y: 'かる', d: ['おも', 'ふと', 'かた'] } },
    { q: '「手を貸す」の意味は？', choices: ['手をさわる', '物を渡す', '助ける', '手が届く'], a: '助ける', read: { full: '手を貸す', t: '貸', y: 'か', d: ['かえ', 'と', 'う'] } },
    { q: '「鼻が高い」の意味は？', choices: ['鼻が大きい', 'においがわかる', '得意になる・自慢に思う', '顔が高い'], a: '得意になる・自慢に思う', read: { full: '鼻が高い', t: '鼻', y: 'はな', d: ['みみ', 'め', 'くち'] } },
    { q: '「耳が痛い」の意味は？', choices: ['耳が聞こえにくい', '耳をさわれない', '自分の弱点を指摘されてつらい', '耳が大きい'], a: '自分の弱点を指摘されてつらい', read: { full: '耳が痛い', t: '痛', y: 'いた', d: ['かゆ', 'さむ', 'くる'] } },
    { q: '「目をつぶる」の意味は？', choices: ['眠る', 'わざと見なかったことにする', '目が悪い', '目が疲れる'], a: 'わざと見なかったことにする', read: { full: '目をつぶる', t: '目', y: 'め', d: ['みみ', 'はな', 'て'] } },
    { q: '「馬が合う」の意味は？', choices: ['馬に乗るのが上手', '気が合う・相性がよい', '馬と仲良し', '足が速い'], a: '気が合う・相性がよい', read: { full: '馬が合う', t: '馬', y: 'うま', d: ['うし', 'とり', 'いぬ'] } },
    // むずかしい後半（紛らわしい慣用句・ことわざ）
    { q: '「頭が上がらない」の意味は？', choices: ['背が低い', '頭が重い', '相手に引け目があって対等に接することができない', '頭が痛い'], a: '相手に引け目があって対等に接することができない', read: { full: '頭が上がらない', t: '頭', y: 'あたま', d: ['あし', 'かた', 'こし'] } },
    { q: '「腹を割って話す」の意味は？', choices: ['お腹が痛い', '本音で話し合う', '大きな声で話す', 'たくさん食べる'], a: '本音で話し合う', read: { full: '腹を割って話す', t: '腹', y: 'はら', d: ['むね', 'せなか', 'あたま'] } },
    { q: '「お茶を濁す」の意味は？', choices: ['お茶を作る', 'その場をごまかす', 'お茶が好き', '汚い水を飲む'], a: 'その場をごまかす', read: { full: 'お茶を濁す', t: '茶', y: 'ちゃ', d: ['みず', 'ゆ', 'は'] } },
    { q: '「気が置けない」の意味は？', choices: ['気をつけなければならない', '気をつかわなくてよい', '気が強い', 'やる気がない'], a: '気をつかわなくてよい', read: { full: '気が置けない', t: '置', y: 'お', d: ['と', 'き', 'さ'] } },
    { q: '「雨降って地固まる」の意味は？', choices: ['雨が降ると地面が固くなる', 'もめごとの後はかえって関係が良くなる', '梅雨が好き', '雨の後は晴れる'], a: 'もめごとの後はかえって関係が良くなる', read: { full: '雨降って地固まる', t: '固', y: 'かた', d: ['やわ', 'まる', 'ま'] } },
    { q: '「焼きもちを焼く」の意味は？', choices: ['もちを焼く料理', 'ねたむ', '怒る', 'やきもちを食べる'], a: 'ねたむ', read: { full: '焼きもちを焼く', t: '焼', y: 'や', d: ['に', 'む', 'た'] } },
    { q: '「情けは人のためならず」の本当の意味は？', choices: ['人に親切にしても意味がない', '人に親切にすると回り回って自分のためになる', '情けをかけてはいけない', '人には優しくしなくてよい'], a: '人に親切にすると回り回って自分のためになる', read: { full: '情けは人のためならず', t: '情', y: 'なさ', d: ['こころ', 'なみだ', 'おも'] } },
  ],
  7: [
    // やさしい前半（有名な四字熟語）
    { q: '「一石二鳥」の意味は？', choices: ['石を二つ投げる', '一つの行動で二つの利益を得る', '二羽の鳥を捕まえる', '一回で全部終わらせる'], a: '一つの行動で二つの利益を得る', read: { full: '一石二鳥', t: '鳥', y: 'ちょう', d: ['ぎょ', 'けい', 'じゅう'] } },
    { q: '「以心伝心」の意味は？', choices: ['手紙で気持ちを伝える', '言葉を使わなくても心が通じ合う', 'テレパシーを使う', '心から心へ伝言する'], a: '言葉を使わなくても心が通じ合う', read: { full: '以心伝心', t: '伝', y: 'でん', d: ['しん', 'い', 'き'] } },
    { q: '「温故知新」の意味は？', choices: ['古いものは知らない', '昔のことを大切にしながら新しいことを学ぶ', '新しいことだけを学ぶ', '過去は変えられない'], a: '昔のことを大切にしながら新しいことを学ぶ', read: { full: '温故知新', t: '温', y: 'おん', d: ['こ', 'ち', 'しん'] } },
    { q: '「転ばぬ先の杖」の意味は？', choices: ['転んでから立つ', '事前に準備をしておく', '杖は歩くのに必要', '先に進むには勇気が必要'], a: '事前に準備をしておく', read: { full: '転ばぬ先の杖', t: '先', y: 'さき', d: ['まえ', 'あと', 'うし'] } },
    { q: '「棚からぼたもち」の意味は？', choices: ['棚の上にもちがある', '思いがけない幸運が転がり込む', 'ぼたもちは棚に置くもの', '努力せずに得をする方法'], a: '思いがけない幸運が転がり込む', read: { full: '棚からぼたもち', t: '棚', y: 'たな', d: ['はこ', 'つくえ', 'ほん'] } },
    { q: '「灯台下暗し」の意味は？', choices: ['灯台は明るい', '身近なことほど気がつきにくい', '暗い場所は危ない', '電気をつけ忘れる'], a: '身近なことほど気がつきにくい', read: { full: '灯台下暗し', t: '暗', y: 'くら', d: ['あか', 'しろ', 'くろ'] } },
    { q: '「五十歩百歩」の意味は？', choices: ['百歩の方が五十歩より二倍多い', '少しの差はあっても本質的には同じ', '歩く速さのちがい', '距離の比較'], a: '少しの差はあっても本質的には同じ', read: { full: '五十歩百歩', t: '百', y: 'ひゃく', d: ['せん', 'まん', 'じゅう'] } },
    { q: '「知らぬが仏」の意味は？', choices: ['仏は何でも知っている', '知らないことが幸せなこともある', '無知は罪だ', '仏様だけが真実を知っている'], a: '知らないことが幸せなこともある', read: { full: '知らぬが仏', t: '仏', y: 'ほとけ', d: ['かみ', 'おに', 'さま'] } },
    // むずかしい後半（やや難しい四字熟語・故事成語）
    { q: '「七転八倒」の意味は？', choices: ['七回転んで八回起き上がる', 'ひどい苦しみにもがく', '七つの困難と八つの成功', '転がり続ける'], a: 'ひどい苦しみにもがく', read: { full: '七転八倒', t: '倒', y: 'とう', d: ['てん', 'はち', 'しち'] } },
    { q: '「虎の威を借る狐」の意味は？', choices: ['狐は虎より強い', '権力ある者の力を借りて威張る人', '虎と狐は仲良し', '動物同士の協力'], a: '権力ある者の力を借りて威張る人', read: { full: '虎の威を借る狐', t: '虎', y: 'とら', d: ['りゅう', 'ねこ', 'うま'] } },
    { q: '「付和雷同」の意味は？', choices: ['雷が鳴ると雨が降る', '自分の意見を持たずに他人に同調する', '友達と一緒に行動する', '大勢で協力する'], a: '自分の意見を持たずに他人に同調する', read: { full: '付和雷同', t: '雷', y: 'らい', d: ['でん', 'う', 'ふう'] } },
    { q: '「画竜点睛」の意味は？', choices: ['竜の絵を描く', '最後の仕上げで全体が生きてくる', '竜に目を描く', '完成直前で失敗する'], a: '最後の仕上げで全体が生きてくる', read: { full: '画竜点睛', t: '点', y: 'てん', d: ['が', 'りゅう', 'せい'] } },
    { q: '「臥薪嘗胆」の意味は？', choices: ['薪の上で寝て胆を舐める', '目的のために苦労に耐えて力を蓄える', '病気のときの薬', 'たいへん苦い経験'], a: '目的のために苦労に耐えて力を蓄える', read: { full: '臥薪嘗胆', t: '胆', y: 'たん', d: ['しん', 'しょう', 'が'] } },
    { q: '「羊頭狗肉」の意味は？', choices: ['羊と犬の料理', '見せかけと実態が異なる', '動物の肉の違い', '外見通りの内容である'], a: '見せかけと実態が異なる', read: { full: '羊頭狗肉', t: '羊', y: 'よう', d: ['とう', 'く', 'にく'] } },
    { q: '「杞憂」の意味は？', choices: ['杞の国の心配', '取り越し苦労・必要のない心配', '心配することは大切', '心配しすぎると疲れる'], a: '取り越し苦労・必要のない心配', read: { full: '杞憂', t: '憂', y: 'ゆう', d: ['き', 'しん', 'あん'] } },
  ]
};

function generateKotowazaProblem(grade, diff = 1) {
  const list = KOTOWAZA_DATA[grade] || KOTOWAZA_DATA[3];
  const half = Math.ceil(list.length / 2);
  const pool = diff === 0 ? list.slice(0, half) :
               diff === 2 ? list.slice(list.length - half) :
               list;
  const item = pool[randInt(0, pool.length - 1)];

  // 約半分の確率で「読み」問題を出す（形だけ覚えて読めないのを防ぐ反復練習）。
  // 例：「腹を割って話す」の「腹」は なんと よむ？ → はら
  if (item.read && Math.random() < 0.5) {
    const r = item.read;
    return {
      question: `「${r.full}」の\n「${r.t}」は なんと よむ？`,
      type: 'choice',
      choices: shuffleArray([r.y, ...r.d]),
      answer: r.y
    };
  }

  return {
    question: item.q,
    type: 'choice',
    choices: shuffleArray([...item.choices]),
    answer: item.a
  };
}
