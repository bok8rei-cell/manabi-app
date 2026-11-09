# まなびポコ（旧 BRAIN QUEST：零式）— CLAUDE.md

対象学年：1〜6年 と 中1・中2・中3（ALL_GRADES = [1..9]、7 = 中1、8 = 中2、9 = 中3）。中2・中3は現在「数学」「国語」「理科」「社会」「英語」。教科は SUBJECTS の grades で学年ごとに出し分ける。2・4・6年のことわざ・英語は、前後の学年の問題を組み合わせて作る（kanji.js / eigo.js の末尾）。

## Claude Code 起動オプション

```bash
claude --dangerously-skip-permissions
```

## 起動方法

ローカルで動作確認する場合は HTTP サーバーが必要（file:// では Firebase が動かない）。

```bash
cd "C:\Users\owner\OneDrive\デスクトップ\テスト\manabi-app"
npx http-server . -p 8787
```

ブラウザで `http://localhost:8787` を開く。

### スクリーンショット確認（Playwright）

```bash
cd /tmp
node -e "
const { chromium } = require('./node_modules/playwright');
(async () => {
  const br = await chromium.launch();
  const pg = await br.newPage();
  await pg.setViewportSize({width:390, height:844});
  await pg.goto('http://localhost:8787');
  await pg.waitForTimeout(2500);
  await pg.screenshot({path:'C:/Users/owner/AppData/Local/Temp/shot.png'});
  await br.close();
})();
"
```

playwright は `/tmp/node_modules/playwright` にインストール済み。

## デプロイ方法

```bash
cd "C:\Users\owner\OneDrive\デスクトップ\テスト\manabi-app"
# sw.js の CACHE_NAME バージョンを +1 する（必須）
git add <変更ファイル> sw.js
git commit -m "説明"
git push
```

GitHub Pages: `https://bok8rei-cell.github.io/manabi-app/`

**ファイルを変更するたびに `sw.js` の `CACHE_NAME` を上げないとキャッシュが更新されない。**

## 修正後の検証チェックリスト

コード修正後、必ず以下を確認してからコミット・デプロイする：

- [ ] **サーバーを起動して動作確認**
  ```bash
  cd "C:\Users\owner\OneDrive\デスクトップ\テスト\manabi-app"
  npx http-server . -p 8787
  ```

- [ ] **修正内容が画面に反映されているか確認**
  - 修正した機能を実際に使ってみる
  - 例：チャレンジテスト修正なら → 3年生選択 → 算数選択 → ドリル10問クリア → チャレンジ開始 → 問題文が表示されているか確認

- [ ] **ブラウザの開発者ツール（F12）でエラーがないか確認**
  - Console タブで赤いエラーメッセージが出ていないか
  - Network タブで 404 や 500 エラーがないか

- [ ] **他の機能に影響がないか確認（smoke test）**
  - ホーム画面が正常に表示されるか
  - 別の教科も選択できるか
  - 問題が次々と表示されるか

- [ ] **sw.js のバージョンを +1 している**（必須）
  ```bash
  # 修正前：const CACHE_NAME = 'manabi-app-vXX';
  # 修正後：const CACHE_NAME = 'manabi-app-vYY';  ← YY = XX + 1
  ```

## ファイル構成

| ファイル | 役割 |
|---|---|
| `index.html` | 全画面のHTML（SPA）。下タブ: ホーム/ずかん/おしゃれ/きろく/せってい |
| `css/style.css` | 全スタイル（v37〜 明るい「おもちゃ箱」テーマ。ダークテーマは廃止） |
| `js/store.js` | 日付(ローカル日付)・にがて復習・今日のミッション・毎日の連続日数・たんげんべつ成績（recordUnit／`manabi_unit_{名前}` = 学年|教科|たんげん → {t 答えた数, c 自力せいかい, d 最終日}。同期はたんげん×項目ごとの max。親の画面「よわい たんげん」に表示、書き出しにも入る） |
| `js/core.js` | なまえ：追加（せってい→「なまえを ついかする」）／けす（おうちの人の画面→各子のカードの「この なまえを けす」。deleteChildCompletely が 一覧と きろくを けし、`manabi_deleted_names` に のこして どうきで もどらないようにする）。バージョン・自動更新（ひらいたとき／もどったとき／5分ごとに確認。勉強中は待ち、ホームなど下のタブが見える画面で自動入れかえ）・教科/難易度・チャレンジ管理・なまえ・進捗・showScreen |
| `js/quiz.js` | 学習セッション共通（makeProblem：さいきん出した問題は出さない／出し切ったら一番むかしに出したものから。`manabi_seen_{名前}` に教科×学年ごと150こ。同期しない）（ドリル/ミッション/にがて復習/チャレンジ）と結果画面 |
| `js/samples.js` | 「もんだいを 見る」（おうちの人の画面から開く。学年・教科・レベルを選ぶと、そのレベルの問題5問と答え・とき方を見せる。学校の先生に見せる用。GENERATORS を直接呼ぶので成績・「さいきん出した問題」には残らない） |
| `js/home.js` | ホーム・ずかん・きろく・せってい画面、showTab |
| `js/steps.js` | 算数の全種類の「解き方」（なぜ）とヒントの材料。答えが一致したときだけ使う。ヒントは答えが出る手前まで（hintPlan / MATH_HINT_MAX） |
| `js/recommend.js` | 正解率が低い教科は、前の学年に もどって ふくしゅうをすすめる（最近20もん／12問以上／6割未満） |
| `js/pet.js` | ポコ（育成キャラ）・コイン・バッジ |
| `js/weekly.js` | ポコクエスト：土〜金の1週間で、3人で 1000もん（ヒントなしの せいかい）。1000もんで「きらきらポコ」、ウラボス（HP500・合計1500・ひみつ。初週は必ず、以後は約2週に1回）を倒すと「マント」、ラスボス（合計3000）を倒すと「つばさ」、週の1位は「おうかん」をプレゼント。**プレゼントはずっと残り、おしゃれの「きがえ」で付け外し**（id は `shine:N` `cape:N` `wing:N` `crown:N`、N=クエスト番号、色はクエストごとに8色ローテ）。称号：ウラボスキラー／ラスボスキラー。週ごとの数は `manabi_week_{名前}` に保存し同期 |
| `js/solo.js` | ダブルチャレンジ：ポコ10もん＋そろタッチ（スタート→30〜60ぷんの間に戻って「やった！」）の日にコイン100。30ぷん未満でやめる＝記録のみ、60ぷん超＝やっていない扱い（その日はもう不可）。設定の「そろタッチも やってる」をオンにした子だけ。親の画面にも表示 |
| `js/balance.js` | 教科のバランス：今週の教科別せいかい数を数え、英語・理科社会・ことわざが「算数と国語の平均＋100問」を超えたら制限中（コイン10分の1、ポコクエスト10問で1カウント）。算数・国語は制限なし。勉強中/ホーム/結果/親の画面に「制限中」を表示。数は `manabi_subj_{名前}`・`manabi_taper_{名前}` に保存し同期 |
| `js/shop.js` | おしゃれ（「きがえ」＝買った飾りで着替え・いつもの保存・ぜんぶはずす・ポコを大きく見る／「おみせ」＝未購入の飾り）。飾り54個（頭/目/ほっぺ/くち/首/色/背景/オーラ、約60,300コイン分。でんせつのオーラ20,000）＋ からだ用の ふく・くつ・もちもの25個（js/pokobody.js。ポコまる以上）。買った物・つけた物・いつもの は `manabi_shop_{名前}` に保存し同期。プレゼント（おうかん/マント/きらきらポコ/つばさ）はポコクエスト専用で売らない |
| `js/pokobody.js` | ポコの からだ（ポコまる・ポコキングから あたまの したに からだ・うで・あしが つく。petSVG が pokoBodySVG を呼ぶ）と、からだに つける「ふく／くつ／もちもの」（outfit・shoes・hand。13＋5＋7こ）。からだが ない ポコっち までは おみせで 🔒 |
| `js/fx.js` | 効果音・ふるえ・よみあげ・紙ふぶき |
| `js/explain.js` | 算数の「やさしい解説」を問題文から生成（答えが一致したときだけ表示） |
| `js/lock.js` | （おうちの人の画面の番号：おうち用スイッチがオンの端末は聞かない／入れたら5分は聞かない。home.js の parentAllowed）端末ロック（この iPad は ○○ せんよう＝manabi_lock）と おうちの人の 4けた番号（manabi_pinhash＝しお＋SHA-256。この端末だけ・同期しない。コードに番号は書かない）。ロック解除／おうちの人の画面／おうち用スイッチ／番号変更で番号が必要。更新で初めて入ったとき、おうち用端末以外は いまの名前で自動ロック |
| `js/sync.js` | ファイル/クラウド同期（ポコ・にがて・連続日数も同期） |
| `js/ranking.js` | この端末のランキング |
| `js/speed.js` | タイムアタック |
| `js/update.js` | 「あたらしくする」ボタン |
| `js/boot.js` | 起動時の配線 |
| `js/math.js` | 算数問題生成（中1まで）。弱いたんげん（8もん以上・自力せいかい90%未満）を約半分の確率で多めに出す（weakMathUnits）。判定 isMathAnswerCorrect（answerType: remainder/time/ratio/algebra/factor/lineEq/roots/xy） |
| `js/math_jh.js` | 数学（中2=genGrade8・中3=genGrade9）の問題生成。問題に `params` を持たせる |
| `js/algebra.js` | 文字式の答えあわせ（展開・因数分解・直線の式・解）。parsePoly などの多項式パーサー |
| `js/math_extra.js` | 算数の追加問題（1年：くりあがり・くりさがり・3つのたし算・文章題、5年：小数×小数・小数÷小数・平均・体積・分数の文章題・約分）と その解き方。genGrade1/genGrade5 から genExtra1/genExtra5 で呼ぶ。約分系は answerType reducedFraction（約分した形だけ正解） |
| `js/math_super.js` | 算数「ちょうむずかしい」（レベル3。3年。maxDiff／SUPER_LEVEL は core.js）。昇段チャレンジで むずかしい→ちょうむずかしい に上がる。他学年・教科は最大レベル2のまま |
| `js/math_super_more.js` | 算数「ちょうむずかしい」（1・2・4・5・6年、各6種類。問題に params を持たせ、解き方は params から作る） |
| `js/steps_jh.js` | 中2・中3数学の「解き方」とヒント（steps.js と同じ決まり） |
| `js/eigo_jh.js` | 英語（中2・中3）の問題データ EIGO_JH（文法・単語・英文えらび。各問に解説 ex） |
| `js/kanji.js` | 国語（漢字）問題生成・KANJI_DATA（中2・中3は kokugo_jh.js へ） |
| `js/kokugo_jh.js` | 国語（中2・中3）の問題データ（読み・同音異字・熟語・敬語・文法・古文・作品。各問に解説） |
| `js/rikashakai.js` | 理科・社会問題生成（小3〜中1）。ことわざは学年に関係なく kanji.js の kotowazaAll（133問）から出す |
| `js/rikashakai_more.js` | 理科・社会の追加問題（3年・5年・中1。各問に解説 ex）。rikashakai.js の RIKASHAKAI_DATA に push |
| `js/rika_jh.js` | 理科（中2・中3）の問題データ＋計算問題 rikaCalc（key `rika`） |
| `js/shakai_jh.js` | 社会（中2・中3）の問題データ（地理・歴史・公民、key `shakai`） |
| `js/eigo.js` | 英語問題生成 |
| `js/firebase-config.js` | Firebase 初期化（cloudDb をグローバル公開） |
| `sw.js` | Service Worker（PWAオフライン対応） |
| `manifest.json` | PWAマニフェスト |

## クラウド同期の仕組み

- Firebase Firestore を使用
- 同期キー：`getActiveSyncCode()` = おうち共通の「あいことば」だけ（なまえは鍵にしない。v37.3〜）
- タイミング：あいことばが入っていれば、起動時・アプリにもどったとき・学習のおわり・**開いている間は1分ごと**に自動で同期（`autoSync()`）。ほかの子の記録が変わったときだけ画面を描き直す。手動ボタンも残してある
- Firestore コレクション：`syncCodes/{あいことば}`

## 先生エージェント（学習内容の審査ルール）

**math.js・kanji.js・rikashakai.js・eigo.js を変更したら必ず先生エージェントに審査を依頼すること。合格が出るまでプッシュしない。**

### 起動方法

先生エージェントは `.claude/agents/sensei-teacher.md` に定義済みです。以下のいずれかで起動：

**方法1: 専用エージェント起動（推奨）**
```bash
/teacher-review
```

**方法2: 汎用 Agent ツール**
Agent ツールで以下を実行：
```
対象ファイル：[修正したファイル名（math.js 等）]
```

エージェントが自動的に以下を審査します：
1. 各学年の問題が学習指導要領の範囲内か
2. 漢字の読み・用例に誤りはないか
3. デッドコードが残っていないか
4. 問題生成ロジックの健全性

判定結果は「✅ 合格」「⚠️ 要修正」「❌ 不合格」で返却。

## 注意事項

- iOS でPWAをホーム画面から削除すると localStorage が消えるが、プレイヤー名を再入力すれば Firestore から復元できる
- Service Worker のキャッシュバージョンを上げないと端末に古いバージョンが残る
- バージョンは `js/core.js` の APP_VERSION・`version.json`・`sw.js` の CACHE_NAME・`index.html` の `?v=` を同じ番号にそろえて上げる（現在 v43.9）
- 日付は `localDateStr()`（js/store.js）を使う。`toISOString()` は UTC なので日本時間の朝に1日ずれる
- `explain.js` を変更したら、先生エージェントに審査を依頼する（問題データと同じ扱い）
