// ===== 英語（中2・中3）=====
// 中2 = grade 8、中3 = grade 9。絵ではなく、文法・単語・英文えらびの 選択問題。
//  G：文法の 穴うめ（正解が 1つだけに なるように えらびを つくる）
//  W：単語 英語 → 日本語    J：単語 日本語 → 英語    O：日本語に あう 英文を えらぶ
// 各問題に ひとこと 解説（ex）を つけて、答えあわせの あとに 見せる。h:true は むずかしめ。

const _eG = (q, a, d, ex, h) => ({ k: 'g', q, a, d, ex, h: !!h });
const _eW = (en, ja, d) => ({ k: 'w', en, ja, d });
const _eJ = (ja, en, d) => ({ k: 'j', ja, en, d });
const _eO = (ja, a, d, ex) => ({ k: 'o', ja, a, d, ex });

const EIGO_JH = {
  // ---------------- 中2 ----------------
  8: [
    // 現在・過去・未来
    _eG('She ( ) to school by bike every day.', 'goes', ['go', 'going', 'went'], '主語が she（3人称単数）の 現在の文では、動詞に s / es を つける'),
    _eG('I ( ) a movie with my friends yesterday.', 'watched', ['watch', 'watches', 'watching'], 'yesterday（昨日）は 過去の ことなので 動詞を 過去形に する'),
    _eG('We ( ) in Kyoto last summer.', 'were', ['was', 'are', 'is'], '主語が we の 過去の文は be動詞が were'),
    _eG('He ( ) very tired yesterday.', 'was', ['were', 'is', 'be'], '主語が he の 過去の文は was'),
    _eG('I ( ) visit my grandmother tomorrow.', 'will', ['did', 'was', 'am'], 'tomorrow（あした）の ことは will ＋ 動詞の原形'),
    _eG('It is going ( ) rain tomorrow.', 'to', ['will', 'be', 'for'], 'be going to ＋ 動詞の原形 で「〜しそう／〜するつもり」'),
    _eG('Tom ( ) not play soccer last Sunday.', 'did', ['does', 'do', 'was'], '過去の 否定文は did not ＋ 動詞の原形'),
    _eG('( ) you eat breakfast yesterday morning?', 'Did', ['Do', 'Are', 'Were'], '過去の ことを たずねる 文は Did ～?'),
    _eG('What ( ) you do last night?', 'did', ['do', 'does', 'were'], '過去の 疑問文は 疑問詞 ＋ did ＋ 主語 ＋ 動詞の原形'),
    _eG('My brother ( ) up at six every morning.', 'gets', ['get', 'got', 'getting'], '主語が 3人称単数の 現在の文は 動詞に s / es（get → gets）'),
    _eG('Ken ( ) a cat. It is very cute.', 'has', ['have', 'having', 'haves'], '主語が 3人称単数の 現在の文で have は has になる'),
    _eG('My sister ( ) not like natto.', 'does', ['do', 'is', 'are'], '3人称単数の 現在の 否定文は does not ＋ 動詞の原形'),
    // 進行形・命令・さそい
    _eG('I was ( ) TV when you called me.', 'watching', ['watch', 'watched', 'watches'], 'was ＋ 〜ing（過去進行形）で「〜していた」'),
    _eG('They ( ) playing soccer now.', 'are', ['is', 'was', 'be'], '主語が they の 現在進行形は are ＋ 〜ing'),
    _eG('Please ( ) quiet.', 'be', ['are', 'is', 'being'], '命令文は 動詞の原形 から はじめる。be動詞の 原形は be'),
    _eG("Let's ( ) to the zoo.", 'go', ['goes', 'going', 'went'], "Let's ＋ 動詞の原形「〜しましょう」"),
    _eG("( ) don't we play tennis?", 'Why', ['What', 'Who', 'Which'], "Why don't we ～?「〜しませんか」（さそう言い方）"),
    _eG("I can't ( ) my key. Do you see it?", 'find', ['finds', 'found', 'finding'], "can't の あとは 動詞の原形"),
    // 不定詞・動名詞
    _eG('I want ( ) a doctor in the future.', 'to be', ['be', 'being', 'am'], 'want to ＋ 動詞の原形「〜したい」'),
    _eG('She enjoys ( ) pictures.', 'taking', ['to take', 'take', 'took'], 'enjoy は 動名詞（〜ing）を ともなう（不定詞は つかえない）'),
    _eG('I went to the library ( ) some books.', 'to borrow', ['borrow', 'borrowing', 'borrowed'], '「〜するために」は to ＋ 動詞の原形（不定詞の 副詞的用法）'),
    _eG('I have something ( ) you.', 'to tell', ['tell', 'telling', 'told'], 'something ＋ to ＋ 動詞「〜するための何か」（不定詞の 形容詞的用法）'),
    _eG('I\'ll ( ) you a present.', 'give', ['gives', 'giving', 'gave'], 'will の あとは 動詞の原形'),
    // 助動詞
    _eG('( ) I open the window? — Sure.', 'May', ['Are', 'Does', 'Were'], 'May I ～?「〜してもいいですか」'),
    _eG('You ( ) be quiet in the library.', 'must', ['are', 'does', 'were'], 'must ＋ 動詞の原形「〜しなければならない」'),
    _eG('I ( ) to wash the dishes after dinner.', 'have', ['must', 'can', 'may'], 'have to ＋ 動詞の原形「〜しなければならない」。must の あとには to は つかない'),
    // 比較
    _eG('Tom is taller ( ) Ken.', 'than', ['then', 'as', 'that'], '比較級の あとは than「〜より」'),
    _eG('This bag is ( ) than that one.', 'cheaper', ['cheap', 'cheapest', 'more cheap'], '短い形容詞は 語尾に er を つけて 比較級に する'),
    _eG('Mt. Fuji is the ( ) mountain in Japan.', 'highest', ['higher', 'high', 'more high'], 'the ＋ 最上級（est）「いちばん〜」'),
    _eG('This book is ( ) interesting than that one.', 'more', ['most', 'much', 'many'], '長い形容詞は more ＋ 原級で 比較級を つくる'),
    _eG('Ken is as ( ) as Tom.', 'tall', ['taller', 'tallest', 'more tall'], 'as ＋ 原級 ＋ as「…と同じくらい〜」'),
    _eG('Of all the singers, Mika sings the ( ).', 'best', ['better', 'good', 'well'], 'the ＋ 最上級。well の 最上級は best（Of all ～ は「〜の中で」）'),
    _eG('I like soccer ( ) than baseball.', 'better', ['good', 'best', 'well'], 'like A better than B「BよりAが 好き」'),
    // 接続詞
    _eG('If it ( ) tomorrow, I will stay home.', 'rains', ['will rain', 'rained', 'rain'], 'if の 中では 未来の ことでも 現在形を つかう'),
    _eG('I think ( ) he is kind.', 'that', ['what', 'which', 'whose'], 'think that ～「〜だと思う」'),
    _eG('I was late ( ) I missed the bus.', 'because', ['but', 'or', 'if'], 'because「〜なので」で 理由を 表す'),
    _eG('( ) I was a child, I lived in Osaka.', 'When', ['If', 'Because', 'But'], 'when「〜のとき」'),
    _eG("I didn't go out ( ) it was raining.", 'because', ['but', 'or', 'than'], 'because「〜なので」'),
    // There is / are・数量
    _eG('There ( ) two cats in the garden.', 'are', ['is', 'am', 'be'], 'There are ＋ 複数の名詞'),
    _eG('There ( ) a book on the desk.', 'is', ['are', 'were', 'be'], 'There is ＋ 単数の名詞'),
    _eG('( ) there any milk in the fridge?', 'Is', ['Are', 'Do', 'Does'], 'milk は 数えられない名詞なので Is there ～?'),
    _eG("I don't have ( ) money.", 'any', ['some', 'a', 'an'], 'ふつう 否定文では some ではなく any を つかう'),
    _eG('There is ( ) water in the glass.', 'a little', ['a few', 'many', 'few'], '数えられない名詞（water）には a little「少し」'),
    _eG('I have ( ) friends in Japan.', 'many', ['much', 'little', 'a little'], '数えられる名詞（friends）には many「たくさんの」'),
    // 疑問詞
    _eG('How ( ) does it take to the station?', 'long', ['many', 'tall', 'old'], 'How long ～?「どのくらいの 時間が かかりますか」'),
    _eG('What time ( ) you usually get up?', 'do', ['does', 'are', 'is'], '主語が you の 疑問文は do you ～?'),
    _eG("( ) is your birthday? — It's May 5th.", 'When', ['Where', 'Who', 'Whose'], 'いつかを たずねるのは When'),
    _eG("( ) bag is this? — It's mine.", 'Whose', ['Who', 'When', 'Where'], '「だれの」は Whose'),
    // 受け身
    _eG('The window ( ) by Ken yesterday.', 'was broken', ['broke', 'breaks', 'is break'], '受け身は be動詞 ＋ 過去分詞（「〜された」）。yesterday だから was', true),
    _eG('English ( ) in many countries.', 'is spoken', ['speaks', 'spoke', 'is speak'], '「話されている」は is ＋ 過去分詞（spoken）', true),
    _eG('This temple ( ) built 500 years ago.', 'was', ['is', 'were', 'has'], '500年前に「建てられた」なので was built', true),
    _eG('The room is ( ) by Ken every day.', 'cleaned', ['clean', 'cleaning', 'cleans'], 'by（〜によって）が あるので 受け身。be動詞 ＋ 過去分詞で「〜される」', true),
    // 動詞の形
    _eG('He is ( ) than his brother.', 'younger', ['young', 'youngest', 'more young'], 'than が あるので 比較級（younger）', true),
    // 単語（英→日）
    _eW('important', '重要な', ['危険な', '簡単な', '有名な']),
    _eW('difficult', '難しい', ['簡単な', '安全な', '重い']),
    _eW('popular', '人気のある', ['静かな', '古い', '空腹の']),
    _eW('beautiful', '美しい', ['忙しい', '危険な', '短い']),
    _eW('famous', '有名な', ['有名でない', '新しい', '親切な']),
    _eW('dangerous', '危険な', ['安全な', '有名な', '特別な']),
    _eW('useful', '役に立つ', ['無駄な', '危険な', '眠い']),
    _eW('library', '図書館', ['病院', '駅', '博物館']),
    _eW('hospital', '病院', ['図書館', '郵便局', '学校']),
    _eW('museum', '博物館', ['動物園', '図書館', '公園']),
    _eW('breakfast', '朝食', ['夕食', '昼食', '夜食']),
    _eW('vacation', '休暇', ['授業', '宿題', '試験']),
    _eW('invite', '招待する', ['忘れる', '運ぶ', '決める']),
    _eW('decide', '決める', ['借りる', '招待する', '到着する']),
    _eW('borrow', '借りる', ['貸す', '返す', '運ぶ']),
    _eW('arrive', '到着する', ['出発する', '忘れる', '信じる']),
    _eW('forget', '忘れる', ['覚えている', '信じる', '教える']),
    _eW('remember', '覚えている', ['忘れる', '学ぶ', '運ぶ']),
    _eW('believe', '信じる', ['疑う', '決める', '招待する']),
    _eW('tired', '疲れた', ['空腹の', '眠い', '忙しい']),
    _eW('hungry', '空腹の', ['疲れた', '眠い', 'のどがかわいた']),
    _eW('busy', '忙しい', ['ひまな', '疲れた', '眠い']),
    _eW('usually', 'たいてい', ['ぜったいに', 'めったに〜ない', '決して〜ない']),
    _eW('sometimes', 'ときどき', ['いつも', 'めったに〜ない', '決して〜ない']),
    _eW('never', '決して〜ない', ['いつも', 'ときどき', 'よく']),
    _eW('together', 'いっしょに', ['ひとりで', 'すぐに', 'あとで']),
    _eW('airport', '空港', ['駅', '港', '病院']),
    _eW('different', 'ちがった', ['同じ', '大きい', '新しい']),
    // 単語（日→英）
    _eJ('図書館', 'library', ['hospital', 'station', 'museum']),
    _eJ('病院', 'hospital', ['library', 'station', 'airport']),
    _eJ('駅', 'station', ['airport', 'library', 'museum']),
    _eJ('朝食', 'breakfast', ['dinner', 'lunch', 'supper']),
    _eJ('夕食', 'dinner', ['breakfast', 'lunch', 'snack']),
    _eJ('休暇', 'vacation', ['homework', 'lesson', 'test']),
    _eJ('危険な', 'dangerous', ['famous', 'beautiful', 'useful']),
    _eJ('有名な', 'famous', ['dangerous', 'beautiful', 'useful']),
    _eJ('決める', 'decide', ['borrow', 'forget', 'invite']),
    _eJ('忘れる', 'forget', ['remember', 'believe', 'arrive']),
    _eJ('忙しい', 'busy', ['tired', 'hungry', 'sleepy']),
    _eJ('いっしょに', 'together', ['different', 'usually', 'sometimes']),
    // 英文えらび
    _eO('私は 昨日 図書館で 本を 借りました。', 'I borrowed a book at the library yesterday.', ['I borrow a book at the library yesterday.', 'I borrowed the library at a book yesterday.', 'Yesterday I borrows a book at the library.'], '昨日の ことなので borrowed（過去形）'),
    _eO('あなたは 明日 何を する 予定ですか。', 'What are you going to do tomorrow?', ['What you are going to do tomorrow?', 'What are going you to do tomorrow?', 'What do you going to do tomorrow?'], 'be going to の 疑問文は be動詞を 主語の まえに'),
    _eO('この かばんは あの かばんより 高いです。', 'This bag is more expensive than that one.', ['This bag is expensive than that one.', 'This bag is most expensive than that one.', 'This bag more expensive is than that one.'], 'expensive は 長い形容詞なので more ＋ 原級'),
    _eO('ケンは 私の クラスで いちばん 速く 走ります。', 'Ken runs the fastest in my class.', ['Ken runs the faster in my class.', 'Ken run the fastest in my class.', 'Ken runs fastest of my class in.'], 'the ＋ 最上級。Ken は 3人称単数なので runs'),
    _eO('私は 犬を 2匹 飼っています。', 'I have two dogs.', ['I am have two dogs.', 'I has two dogs.', 'I have two dog.'], '2匹 → dogs（複数形）。I には have'),
    _eO('窓を 開けてもいいですか。', 'May I open the window?', ['I may open the window?', 'May open I the window?', 'Do I may open the window?'], 'May I ～? の 語順'),
    _eO('雨が ふったら、家に います。', 'If it rains, I will stay home.', ['If it will rain, I stay home.', 'If it rains, I stayed home.', 'If rains it, I will stay home.'], 'if の 中は 現在形、主な 文は will'),
    _eO('この 本は 英語で 書かれています。', 'This book is written in English.', ['This book writes in English.', 'This book is write in English.', 'This book written is in English.'], '受け身：is ＋ 過去分詞（written）'),
    _eO('私は 友達と 公園で サッカーを しました。', 'I played soccer with my friends in the park.', ['I play soccer with my friends in the park.', 'I played soccer my friends with in the park.', 'I playing soccer with my friends in the park.'], '過去の ことなので played'),
    _eO('あなたは どこで その かばんを 買いましたか。', 'Where did you buy that bag?', ['Where you bought that bag?', 'Where did you bought that bag?', 'Where do you bought that bag?'], '過去の 疑問文は did ＋ 主語 ＋ 動詞の原形（buy）')
  ],

  // ---------------- 中3 ----------------
  9: [
    // 現在完了
    _eG('I have ( ) in Japan for ten years.', 'lived', ['live', 'lives', 'living'], '現在完了 have ＋ 過去分詞（lived）で「ずっと〜している」'),
    _eG('I have ( ) seen such a beautiful sunset.', 'never', ['ago', 'yesterday', 'last'], 'have never ＋ 過去分詞「一度も〜したことがない」'),
    _eG('How long have you ( ) here?', 'been', ['be', 'were', 'being'], 'have ＋ 過去分詞（be の 過去分詞は been）'),
    _eG("I haven't finished my homework ( ).", 'yet', ['ago', 'last', 'before'], '否定文の yet「まだ（〜ない）」'),
    _eG('He has ( ) lost his key.', 'just', ['ago', 'yesterday', 'tomorrow'], 'have just ＋ 過去分詞「ちょうど〜したところ」'),
    _eG('We have known each other ( ) 2010.', 'since', ['for', 'from', 'in'], 'since ＋ 始まりの時「〜から（ずっと）」'),
    _eG('She has been sick ( ) three days.', 'for', ['since', 'from', 'during'], 'for ＋ 期間「〜のあいだ」'),
    _eG('I have ( ) to Kyoto twice.', 'been', ['gone', 'went', 'go'], '「（行って 帰ってきて）行ったことがある」と 経験を 言うときは have been to。have gone to は「行ってしまって、ここには いない」の 意味', true),
    _eG('( ) you ever eaten sushi?', 'Have', ['Did', 'Do', 'Are'], '経験を たずねる 現在完了の 疑問文は Have you ever ～?'),
    _eG('My brother has ( ) his homework yet.', 'not finished', ['finish', 'not finish', 'finishing'], '現在完了の 否定文は has not ＋ 過去分詞', true),
    // 受け身
    _eG('This song is loved ( ) many people.', 'by', ['with', 'to', 'from'], '受け身で「〜によって」は by'),
    _eG('The letter was ( ) by Mike.', 'written', ['wrote', 'writing', 'write'], 'be動詞 ＋ 過去分詞（write - wrote - written）'),
    _eG('The room ( ) cleaned by the students every day.', 'is', ['does', 'are', 'has'], '現在の 受け身。主語が 単数なので is ＋ 過去分詞'),
    _eG('These pictures ( ) taken by my father.', 'were', ['was', 'is', 'be'], '複数の 主語の 過去の 受け身は were ＋ 過去分詞'),
    _eG('English ( ) used in many countries.', 'is', ['are', 'does', 'has'], '主語 English は 単数あつかいで is ＋ 過去分詞'),
    // 分詞の後置修飾
    _eG('The girl ( ) tennis over there is my sister.', 'playing', ['plays', 'played', 'play'], '名詞のあとに 〜ing を おいて「〜している」と 説明する（現在分詞の 後置修飾）'),
    _eG('This is a book ( ) by a famous writer.', 'written', ['writing', 'wrote', 'write'], '名詞のあとに 過去分詞を おいて「〜された」と 説明する'),
    _eG('Look at the dog ( ) under the tree.', 'sleeping', ['sleeps', 'slept', 'sleep'], '「木の下で ねている 犬」→ sleeping（現在分詞）'),
    _eG('The language ( ) in Brazil is Portuguese.', 'spoken', ['speaking', 'speaks', 'speak'], '「話されている 言語」→ spoken（過去分詞）'),
    // 関係代名詞
    _eG('The man ( ) lives next door is a doctor.', 'who', ['which', 'whose', 'what'], '人を 説明する 主格の 関係代名詞は who'),
    _eG('This is the book ( ) I bought yesterday.', 'that', ['who', 'what', 'where'], 'ものを 説明する 関係代名詞は that（または which）'),
    _eG('I have a friend ( ) can speak French.', 'who', ['whose', 'what', 'where'], '人を 説明する 主格の関係代名詞 who'),
    _eG('The movie ( ) we saw yesterday was exciting.', 'which', ['who', 'whose', 'where'], 'ものを 説明する 関係代名詞 which'),
    _eG('A doctor is a person ( ) helps sick people.', 'who', ['which', 'where', 'what'], 'person（人）を 説明する who'),
    // 間接疑問・不定詞
    _eG("I don't know ( ) he lives.", 'where', ['where does', 'where is', 'where lives'], '間接疑問は 疑問詞 ＋ 主語 ＋ 動詞（does は いらない）'),
    _eG('Do you know ( ) that boy is?', 'who', ['who is', 'that who', 'whom is'], '間接疑問は 疑問詞 ＋ 主語 ＋ be動詞 の 語順'),
    _eG('It is important ( ) us to learn English.', 'for', ['of', 'to', 'with'], 'It is ＋ 形容詞 ＋ for 人 ＋ to ～「人が〜するのは…だ」'),
    _eG('My mother told me ( ) my room.', 'to clean', ['clean', 'cleaning', 'cleaned'], 'tell 人 to ＋ 動詞の原形「人に〜するように言う」'),
    _eG('I want you ( ) me.', 'to help', ['help', 'helping', 'helped'], 'want 人 to ＋ 動詞の原形「人に〜してほしい」'),
    _eG('He was ( ) tired to walk.', 'too', ['so', 'very', 'much'], 'too ＋ 形容詞 ＋ to ～「〜すぎて…できない」'),
    _eG("I don't know what ( ) do.", 'to', ['do', 'doing', 'for'], 'what to ＋ 動詞の原形「何を〜したらよいか」'),
    _eG("I am ( ) tired that I can't walk.", 'so', ['too', 'very', 'such'], "so ＋ 形容詞 ＋ that ～「とても…なので〜」", true),
    // 仮定法
    _eG('I wish I ( ) a bird.', 'were', ['am', 'be', 'being'], '実現しにくい 願いは I wish ＋ 過去形（be動詞は were）', true),
    _eG('If I ( ) you, I would study harder.', 'were', ['am', 'be', 'being'], '仮定法過去：if ＋ 過去形（be動詞は were）', true),
    _eG('If I had more money, I ( ) buy a new bike.', 'would', ['will', 'can', 'must'], '仮定法過去の 結論は would ＋ 動詞の原形', true),
    _eG('I wish I ( ) fly.', 'could', ['can', 'will', 'must'], 'I wish ＋ 過去形「〜できたらいいのに」', true),
    // 接続詞・熟語
    _eG('Both Tom ( ) Ken are my friends.', 'and', ['or', 'but', 'so'], 'both A and B「AもBも両方」', true),
    _eG('I am looking forward ( ) the summer vacation.', 'to', ['for', 'at', 'in'], 'look forward to ～「〜を 楽しみに 待つ」'),
    _eG('I am looking forward to ( ) you again.', 'seeing', ['see', 'saw', 'seen'], 'look forward to の to は 前置詞なので あとに 〜ing'),
    _eG('She is good ( ) singing.', 'at', ['in', 'on', 'to'], 'be good at ～「〜が 得意だ」'),
    _eG('I am interested ( ) music.', 'in', ['at', 'on', 'with'], 'be interested in ～「〜に 興味がある」'),
    _eG('I was surprised ( ) the news.', 'at', ['for', 'to', 'with'], 'be surprised at ～「〜に おどろく」'),
    // 会話
    _eG('A: Thank you very much. B: ( ).', "You're welcome", ['Excuse me', 'See you', "I'm sorry"], 'お礼への 返事は You\'re welcome'),
    _eG('A: What\'s wrong? B: I ( ) a headache.', 'have', ['am', 'do', 'make'], '「頭が いたい」は have a headache'),
    _eG('A: Would you like some tea? B: ( ), please.', 'Yes', ['No', 'Never', 'Sorry'], 'Would you like ～? に ほしいときは Yes, please'),
    // 単語（英→日）
    _eW('environment', '環境', ['文化', '社会', '経験']),
    _eW('culture', '文化', ['環境', '意見', '技術']),
    _eW('society', '社会', ['文化', '環境', '国際']),
    _eW('international', '国際的な', ['国内の', '有名な', '特別な']),
    _eW('foreign', '外国の', ['国内の', '特別な', '共通の']),
    _eW('successful', '成功した', ['失敗した', '親切な', '有名な']),
    _eW('necessary', '必要な', ['不要な', '特別な', '危険な']),
    _eW('opinion', '意見', ['経験', '習慣', '問題']),
    _eW('custom', '習慣', ['意見', '経験', '技術']),
    _eW('tradition', '伝統', ['意見', '環境', '技術']),
    _eW('experience', '経験', ['意見', '練習', '冒険']),
    _eW('volunteer', 'ボランティア', ['先生', '旅行者', '学生']),
    _eW('recycle', 'リサイクルする', ['捨てる', '作る', '守る']),
    _eW('protect', '守る', ['こわす', '発見する', '改善する']),
    _eW('improve', '改善する', ['こわす', '守る', '発明する']),
    _eW('develop', '発展させる', ['こわす', '決める', '守る']),
    _eW('communicate', '意思を伝え合う', ['発明する', '運ぶ', '決める']),
    _eW('invent', '発明する', ['発見する', '守る', '運ぶ']),
    _eW('discover', '発見する', ['発明する', '守る', '改善する']),
    _eW('support', '支える', ['こわす', '決める', '招待する']),
    _eW('destroy', 'こわす', ['守る', '作る', '支える']),
    _eW('although', 'けれども', ['なぜなら', 'もし〜なら', 'そして']),
    _eW('however', 'しかしながら', ['だから', 'そして', 'たとえば']),
    _eW('especially', '特に', ['たまに', 'ほとんど', 'すでに']),
    _eW('forever', '永遠に', ['すぐに', '一度', 'ときどき']),
    _eW('similar', '似ている', ['ちがう', '特別な', '重要な']),
    _eW('prepare', '準備する', ['運ぶ', '決める', '到着する']),
    _eW('increase', '増える', ['減る', '作る', '守る']),
    _eW('national', '国の', ['国際的な', '外国の', '地域の']),
    _eW('safe', '安全な', ['危険な', '重要な', '特別な']),
    // 単語（日→英）
    _eJ('環境', 'environment', ['culture', 'society', 'experience']),
    _eJ('文化', 'culture', ['environment', 'opinion', 'technology']),
    _eJ('社会', 'society', ['culture', 'environment', 'opinion']),
    _eJ('意見', 'opinion', ['experience', 'custom', 'society']),
    _eJ('経験', 'experience', ['opinion', 'tradition', 'volunteer']),
    _eJ('伝統', 'tradition', ['opinion', 'technology', 'environment']),
    _eJ('必要な', 'necessary', ['successful', 'foreign', 'international']),
    _eJ('外国の', 'foreign', ['international', 'necessary', 'similar']),
    _eJ('守る', 'protect', ['destroy', 'develop', 'improve']),
    _eJ('発明する', 'invent', ['discover', 'protect', 'support']),
    _eJ('発見する', 'discover', ['invent', 'support', 'destroy']),
    _eJ('特に', 'especially', ['forever', 'however', 'although']),
    // 英文えらび
    _eO('私は 10年間 東京に 住んでいます。', 'I have lived in Tokyo for ten years.', ['I live in Tokyo for ten years.', 'I have live in Tokyo for ten years.', 'I lived in Tokyo since ten years.'], '「ずっと住んでいる」は 現在完了 have lived。期間は for'),
    _eO('あそこで 走っている 少年は 私の 弟です。', 'The boy running over there is my brother.', ['The boy runs over there is my brother.', 'The boy is running over there is my brother.', 'The running boy over there my brother is.'], '名詞のあとに 〜ing で「〜している」と 説明（後置修飾）'),
    _eO('私が 昨日 買った 本は おもしろいです。', 'The book that I bought yesterday is interesting.', ['The book that I buy yesterday is interesting.', 'The book what I bought yesterday is interesting.', 'The book I bought yesterday interesting is.'], '関係代名詞 that。「昨日」の ことなので bought'),
    _eO('彼が どこに 住んでいるか 知っていますか。', 'Do you know where he lives?', ['Do you know where does he live?', 'Do you know where he does live?', 'You know do where he lives?'], '間接疑問は 疑問詞 ＋ 主語 ＋ 動詞'),
    _eO('私は 鳥に なれたらいいのにと 思います。', 'I wish I were a bird.', ['I wish I am a bird.', 'I wish I can be a bird.', 'I hope I were a bird.'], '仮定法：I wish ＋ 過去形（be は were）'),
    _eO('日本語は 多くの 人に 話されています。', 'Japanese is spoken by many people.', ['Japanese speaks by many people.', 'Japanese is speak by many people.', 'Japanese is spoke by many people.'], '受け身：be動詞 ＋ 過去分詞（spoken）＋ by'),
    _eO('私は あなたに もう一度 会えるのを 楽しみにしています。', 'I am looking forward to seeing you again.', ['I am looking forward to see you again.', 'I look forward seeing you again.', 'I am looking forward for seeing you again.'], 'look forward to の to は 前置詞なので あとに 〜ing'),
    _eO('私は その ニュースに 驚きました。', 'I was surprised at the news.', ['I surprised at the news.', 'I was surprising at the news.', 'I was surprised to the news.'], 'be surprised at ～「〜に おどろく」'),
    _eO('英語を 勉強することは 大切です。', 'It is important to study English.', ['It is important study English.', 'It important is to study English.', 'That is important to study English.'], 'It is ＋ 形容詞 ＋ to ～ の 形'),
    _eO('母は 私に 部屋を そうじするように 言いました。', 'My mother told me to clean my room.', ['My mother told me clean my room.', 'My mother told to me clean my room.', 'My mother said me to clean my room.'], 'tell 人 to ＋ 動詞の原形')
  ]
};

let _eigoJhLast = '';

function generateEigoJHProblem(grade, diff = 1) {
  const all = EIGO_JH[grade] || EIGO_JH[8];
  // やさしい：むずかしめ(h)と 英文えらびを のぞく／ふつう：ぜんぶ／むずかしい：むずかしめ ＋ 英文えらび ＋ 文法
  let pool = all.filter(it => diff === 0 ? (!it.h && it.k !== 'o') : (diff === 2 ? (it.h || it.k === 'o' || it.k === 'g') : true));
  if (pool.length < 10) pool = all;
  let it;
  for (let i = 0; i < 6; i++) {
    it = pool[randInt(0, pool.length - 1)];
    if (JSON.stringify(it) !== _eigoJhLast) break;
  }
  _eigoJhLast = JSON.stringify(it);
  const id = `${grade}:${it.k}:${it.q || it.en || it.ja}`;
  const build = (q, a, d, extra) => Object.assign({ question: q, type: 'choice', choices: shuffleArray([a, ...d]), answer: a, noRead: true, key: id.slice(0, 40) }, extra || {});
  if (it.k === 'g') {
    return build(`つぎの 英文の（　）に 入る ことばは？\n${it.q.replace(/\( \)/, '（　）')}`, it.a, it.d, { explain: it.ex, unitLabel: 'えいご（文法）' });
  }
  if (it.k === 'w') {
    return build(`「${it.en}」の 意味は？`, it.ja, it.d, { noRead: false, speakEn: it.en, explain: `${it.en} ＝ ${it.ja}`, unitLabel: 'えいご（単語）' });
  }
  if (it.k === 'j') {
    return build(`「${it.ja}」を 英語で いうと？`, it.en, it.d, { explain: `${it.ja} ＝ ${it.en}`, unitLabel: 'えいご（単語）' });
  }
  return build(`つぎの 日本語に あう 英文は？\n「${it.ja}」`, it.a, it.d, { explain: it.ex, unitLabel: 'えいご（英文）' });
}
