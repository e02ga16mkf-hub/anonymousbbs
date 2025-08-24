# デプロイガイド

このドキュメントでは、匿名掲示板アプリケーションを各種プラットフォームにデプロイする方法を説明します。

## 目次

1. [事前準備](#事前準備)
2. [Vercelへのデプロイ](#vercelへのデプロイ)
3. [Netlifyへのデプロイ](#netlifyへのデプロイ)
4. [Herokuへのデプロイ](#herokuへのデプロイ)
5. [環境変数の設定](#環境変数の設定)
6. [本番用データベースの準備](#本番用データベースの準備)
7. [トラブルシューティング](#トラブルシューティング)

## 事前準備

デプロイ前に以下の準備が必要です：

1. GitHubなどのGitリポジトリにコードをプッシュする
2. 本番環境用の環境変数を準備する
3. データベース初期化スクリプトを確認する

## Vercelへのデプロイ

Vercelは、Next.jsアプリケーションのデプロイに最適なプラットフォームです。

### 手順

1. [Vercel](https://vercel.com/)にアカウント登録・ログインする
2. 「New Project」をクリックする
3. GitHubリポジトリを連携し、デプロイするリポジトリを選択する
4. 以下の設定を行う：
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
5. 「Environment Variables」セクションで必要な環境変数を設定する
6. 「Deploy」ボタンをクリックしてデプロイを開始する

### 注意点

- Vercelでは、`vercel.json`ファイルがルートディレクトリに配置されている場合、その設定が優先されます
- SQLiteを使用する場合、デプロイごとにデータベースが初期化されるため、永続的なデータベースが必要な場合は別途対応が必要です

## Netlifyへのデプロイ

Netlifyも静的サイトホスティングとサーバーレス関数をサポートしています。

### 手順

1. [Netlify](https://www.netlify.com/)にアカウント登録・ログインする
2. 「New site from Git」をクリックする
3. GitHubリポジトリを連携し、デプロイするリポジトリを選択する
4. 以下の設定を行う：
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
5. 「Advanced build settings」から環境変数を設定する
6. 「Deploy site」ボタンをクリックしてデプロイを開始する

### 注意点

- Netlifyで Next.js のAPI Routesを使用するには、`@netlify/plugin-nextjs`プラグインが必要です
- SQLiteを使用する場合、Netlifyの制約上、読み書き可能なファイルシステムにアクセスできないため、別のデータベースサービスへの移行を検討してください

## Herokuへのデプロイ

Herokuは完全なNode.jsアプリケーションをホスティングできるプラットフォームです。

### 手順

1. [Heroku](https://www.heroku.com/)にアカウント登録・ログインする
2. Heroku CLIをインストールする（まだの場合）
3. ターミナルで以下のコマンドを実行する：

```bash
# Herokuにログイン
heroku login

# アプリケーションを作成
heroku create your-app-name

# 環境変数を設定
heroku config:set JWT_SECRET=your-secret-key
heroku config:set ADMIN_USERNAME=admin
heroku config:set ADMIN_PASSWORD=your-secure-password

# デプロイ
git push heroku main
```

### 注意点

- Herokuは定期的にファイルシステムをリセットするため、SQLiteデータベースは永続的ではありません
- 本番環境では、PostgreSQLなどのデータベースアドオンの使用を検討してください

## 環境変数の設定

各プラットフォームで設定すべき主な環境変数：

| 環境変数 | 説明 | 例 |
|---------|------|-----|
| `JWT_SECRET` | JWT認証用のシークレットキー | `random-string-at-least-32-chars` |
| `ADMIN_USERNAME` | 管理者ユーザー名 | `admin` |
| `ADMIN_PASSWORD` | 管理者パスワード | `secure-password` |
| `BANNED_IPS` | 禁止IPリスト（カンマ区切り） | `123.45.67.89,98.76.54.32` |
| `DB_PATH` | データベースファイルのパス | `./database.sqlite` |
| `POST_INTERVAL_SECONDS` | 連続投稿制限（秒） | `30` |
| `THREAD_INTERVAL_SECONDS` | 連続スレッド作成制限（秒） | `300` |
| `MAX_POSTS_PER_DAY` | 1日あたりの最大投稿数 | `50` |

## 本番用データベースの準備

SQLiteはファイルベースのデータベースであり、本番環境では制約があります。以下のオプションを検討してください：

### オプション1: SQLiteを継続使用（小規模サイト向け）

- Vercelなどのサーバーレス環境では、デプロイごとにデータベースが初期化されます
- 定期的なバックアップの仕組みを実装する必要があります

### オプション2: 外部データベースサービスへの移行

- PostgreSQL、MySQL、MongoDB等のデータベースサービスを利用
- データベース接続コードの修正が必要になります

#### PostgreSQLへの移行例（Heroku Postgres使用時）

1. Heroku Postgresアドオンを追加：
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

2. データベース接続コードを修正（別途実装が必要）

## トラブルシューティング

### デプロイ失敗時の確認事項

1. ビルドログを確認する
2. 環境変数が正しく設定されているか確認する
3. Node.jsのバージョンが互換性があるか確認する
4. データベース接続が正しく設定されているか確認する

### よくある問題と解決策

- **ビルドエラー**: `npm run build`が失敗する場合、依存関係やTypeScriptエラーを確認
- **API 500エラー**: サーバーサイドのエラーログを確認し、データベース接続や環境変数を確認
- **データ消失**: 永続的なストレージソリューションを検討（外部データベースサービス等）
- **パフォーマンス問題**: CDNの活用、画像最適化、キャッシュ戦略を検討
