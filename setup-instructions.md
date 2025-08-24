# セットアップ手順

Node.jsがインストールされていない場合は、まずNode.jsをインストールしてください。
https://nodejs.org/ からダウンロードしてインストールできます。

## 方法1: 既存のプロジェクトを使用する場合

1. 必要なパッケージをインストールします：
```bash
npm install
```

2. 開発サーバーを起動します：
```bash
npm run dev
```

3. ブラウザで http://localhost:3000 にアクセスします。

## 方法2: 新しくプロジェクトを作成する場合

1. 新しいNext.jsプロジェクトを作成します：
```bash
npx create-next-app@latest anonymous-bbs --typescript --tailwind --eslint
```

2. 作成したプロジェクトディレクトリに移動します：
```bash
cd anonymous-bbs
```

3. 必要な追加パッケージをインストールします：
```bash
npm install sqlite3 sqlite framer-motion lucide-react
```

4. 既存のソースコードを新しいプロジェクトにコピーします：
   - `src/components` フォルダ
   - `src/lib` フォルダ
   - `src/pages` フォルダ
   - `src/styles` フォルダ
   - `src/types` フォルダ

5. 開発サーバーを起動します：
```bash
npm run dev
```

6. ブラウザで http://localhost:3000 にアクセスします。

## トラブルシューティング

### エラー: Module not found
```
npm install [不足しているモジュール名]
```

### エラー: Port 3000 is already in use
```
npx kill-port 3000
npm run dev
```

### エラー: SyntaxError
コードのシンタックスエラーを修正してください。エラーメッセージに表示されるファイルと行番号を確認してください。
