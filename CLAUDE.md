# BRAIN QUEST：零式 — CLAUDE.md

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

## ファイル構成

| ファイル | 役割 |
|---|---|
| `index.html` | 全画面のHTML（SPA） |
| `css/style.css` | 全スタイル（末尾にダークテーマ追加済み） |
| `js/app.js` | メインロジック・画面遷移・クラウド同期 |
| `js/math.js` | 算数問題生成 |
| `js/kanji.js` | 国語（漢字）問題生成・KANJI_DATA |
| `js/rikashakai.js` | 理科・社会問題生成 |
| `js/eigo.js` | 英語問題生成 |
| `js/firebase-config.js` | Firebase 初期化（cloudDb をグローバル公開） |
| `sw.js` | Service Worker（PWAオフライン対応） |
| `manifest.json` | PWAマニフェスト |

## クラウド同期の仕組み

- Firebase Firestore を使用
- 同期キー：`getActiveSyncCode()` = 手動コード OR プレイヤー名
- タイミング：起動時・プレイヤー名入力時・クイズ終了時に自動実行
- Firestore コレクション：`syncCodes/{syncKey}`

## 先生エージェント（学習内容の審査ルール）

**math.js・kanji.js・rikashakai.js・eigo.js を変更したら必ず先生エージェントに審査を依頼すること。合格が出るまでプッシュしない。**

審査依頼の方法：Agent ツールで以下のプロンプトを使用する。

```
あなたは日本の小学校〜中学校の学習指導要領に精通した先生エージェントです。
変更したファイルを読んで以下を確認してください：
1. 各学年の問題が学習指導要領の範囲内か
2. 漢字の読み・用例に誤りはないか
3. デッドコードが残っていないか
総合評価：✅ 合格（プッシュOK）または ❌ 不合格（再修正）で判定してください。
```

## 注意事項

- iOS でPWAをホーム画面から削除すると localStorage が消えるが、プレイヤー名を再入力すれば Firestore から復元できる
- Service Worker のキャッシュバージョンを上げないと端末に古いバージョンが残る
- `sw.js` 現在のバージョン：v20
