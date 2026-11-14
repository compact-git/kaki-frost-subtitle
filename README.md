# Kaki Frost 表示(補助exe) v1.0.2

Kaki Frost Web の表示(同時視聴タイマー・フォロワー数・コメント数・早押し・ホワイトボードなど)を、**自分の画面に「枠なし・背景透明・最前面」**で重ねて表示する Windows 用の補助アプリです。
クリックは後ろの窓に通り抜けるので、ゲームや作業のじゃまになりません。Yomi Frost 字幕(補助exe)とは別アプリ・別ポートなので、同時に使えます。

## 使い方
1. `KakiFrostSubtitle_v1.0.2.exe` をダブルクリックで起動(インストール不要)
   - 初回は Windows の「PC を保護しました」が出ることがあります(署名なしのため)。「詳細情報」→「実行」で起動できます
   - 起動するとタスクトレイ(画面右下)に Kaki Frost のアイコンが出ます
2. Kaki Frost Web の「🪟 表示」タブ →「🧩 補助exe」で **🔌 接続する** を押す(一度つながれば、次からはアプリを開くだけで自動で接続します)
   - 初回は Chrome が「このデバイス上のアプリへのアクセス」の許可を求めるので「許可」
   - 「🧩 補助exeと接続中(v1.0.2)」と出ればOK
3. 出したい表示の「出し先」で **🧩 補助exe** にチェック(初期値でオン)

## 位置と大きさ
- 初期は**メインのモニター全体**に、アプリの配置と同じ配置で表示します(縦横比を保って拡大)
- **位置とサイズを調整する**:トレイのアイコン → 「位置とサイズを調整する」、または **Ctrl+Alt+K**
  - 窓に枠と半透明の背景が出るので、ドラッグで移動・端をつかんでサイズ変更 → 「✔ 調整おわり」
  - 調整した位置と大きさは次回も使います。「画面いっぱいに戻す」で元に戻ります
- **表示するモニター**:トレイ → 「表示するモニター」で切り替え
- **表示する**:トレイのチェックで一時的に隠せます
- 終了はトレイ → 「終了」

※ ホワイトボードは見るだけです(書くのは Kaki Frost Web の ✏️ボードタブで)。

## 安全のための制限
- 受け付けるのは **このPCの中(127.0.0.1)からの接続だけ**です
- 接続してよいページを限定しています(初期値:`https://kaki.rider.tokyo`、`https://*.pages.dev`、`http://localhost:*`、`http://127.0.0.1:*`)
- ポート番号(初期値 **50211**)と許可するページは、トレイ → 「設定ファイルを開く」の `config.json` で変えられます(変えたら補助exeを起動し直してね。ポートを変えたらアプリ側のポートも同じに)

## GitHub で exe を作って公開する
Yomi Frost 字幕と同じ方式です。リポジトリは **`compact-git/kaki-frost-subtitle`(Public)** を想定しています(Kaki Frost Web の `config.js` の `exeRepo`)。

1. GitHub で新しいリポジトリ `kaki-frost-subtitle` を作る(**Public**)
2. リポジトリのページで「Add file → Upload files」を開き、**このzipを展開した中身を全部**ドラッグ&ドロップ → 「Commit changes」
   - `.github` フォルダ(中の `workflows/build.yml`)も必ず入れてください。エクスプローラーで見えない時は「表示 → 隠しファイル」をオン
3. 「Actions」タブで `build-exe` が動き始めます(5〜10分)。緑のチェックになれば完了
4. **公開は自動**です。`package.json` の `version` の版が Releases に「v<版>」として公開されます(公開文は `RELEASE_NOTES.md`)
   - Kaki Frost Web の「⬇ 補助exeをダウンロード」ボタンは、この最新リリースの exe を直接ダウンロードします
- `kakirender.js` は Kaki Frost Web と同じファイルです。アプリ側で表示の描き方を変えた時は、これも差し替えてビルドし直してください

## ファイル
- `main.js` 本体(透明・最前面の窓、トレイ、127.0.0.1 の WebSocket サーバー、Ctrl+Alt+K)
- `preload.js` 窓とのやりとり
- `overlay.html` / `overlay.js` 表示
- `kakirender.js` 表示の描画(Kaki Frost Web と共通)
- `package.json` 設定(Electron / electron-builder、portable exe)
- `.github/workflows/build.yml` GitHub Actions のビルドと公開の手順
- `RELEASE_NOTES.md` Releases に載せる説明文
- `build/icon.ico`・`build/icon.png`・`build/icon.svg`・`tray.png`・`tray@2x.png` アイコン

## 仕組みとライセンス
Electron(MIT)と ws(MIT)を使っています。

## 更新履歴
- v1.0.2 アイコンを変更(Yomi Frost 字幕と同じシアン+フロストの背景・お皿に乗った Kaki ちゃん)、ホワイトボードの塗りつぶし・図形・蛍光ペンの表示に対応
- v1.0.1 アイコンを変更(オレンジの背景・お皿に乗った Kaki ちゃん)、表示が枠に入りきらない時に文字を自動で小さくする、ランキングのラベル札デザインで名前が見えるように、ホワイトボードの文字の表示に対応
- v1.0.0 初版
