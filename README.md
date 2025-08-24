# 匿名掲示板

Next.js、TypeScript、SQLiteで構築された匿名掲示板アプリケーションです。

## 機能

- 板一覧表示
- スレッド一覧表示
- スレッド詳細表示と投稿
- アンカー機能（>>1形式）
- 自動リンク化（URL、メールアドレス）
- レスポンシブデザイン
- アニメーション効果
- スレッド検索
- エラーハンドリング

## 技術スタック

- **フロントエンド**: Next.js, React, TypeScript, Tailwind CSS, Framer Motion
- **バックエンド**: Next.js API Routes
- **データベース**: SQLite
- **その他**: Lucide React（アイコン）

## 開発環境のセットアップ

### 必要条件

- Node.js 18.0.0以上
- npm 8.0.0以上

### インストール

1. リポジトリをクローンする

```bash
git clone https://github.com/yourusername/anonymous-bbs.git
cd anonymous-bbs
```

2. 依存関係をインストールする

```bash
npm install
```

3. データベースを初期化する

```bash
node scripts/init-db.js
```

4. 開発サーバーを起動する

```bash
npm run dev
```

5. ブラウザで http://localhost:3000 にアクセスする

## 本番環境へのデプロイ

### Vercelへのデプロイ

1. [Vercel](https://vercel.com/)にアカウントを作成する
2. 新しいプロジェクトを作成し、GitHubリポジトリを連携する
3. 環境変数を設定する（必要に応じて）
4. デプロイする

### その他の環境へのデプロイ

1. アプリケーションをビルドする

```bash
npm run build
```

2. アプリケーションを起動する

```bash
npm start
```

## 環境変数

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```
# データベースパス
DB_PATH=./database.sqlite

# JWT秘密鍵（本番環境では必ず変更してください）
JWT_SECRET=your-secret-key-change-in-production

# 禁止IPリスト（カンマ区切り）
BANNED_IPS=

# レート制限設定
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=100

# 管理者アカウント
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin1234

# 投稿制限
POST_INTERVAL_SECONDS=30
THREAD_INTERVAL_SECONDS=300
MAX_POSTS_PER_DAY=50
```

## ブラウザ互換性

以下のブラウザで動作確認済みです：

- Google Chrome（最新版）
- Mozilla Firefox（最新版）
- Microsoft Edge（最新版）
- Safari（最新版）

## ライセンス

MITライセンス

## 作者

Your Name