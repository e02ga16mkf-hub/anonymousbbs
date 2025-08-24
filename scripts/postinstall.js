#!/usr/bin/env node

/**
 * インストール後の処理を行うスクリプト
 * - 必要なディレクトリの作成
 * - 環境変数ファイルの確認
 * - データベースの初期化（開発環境のみ）
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// プロジェクトルートディレクトリ
const rootDir = process.cwd();

console.log('インストール後の処理を開始します...');

// 必要なディレクトリの作成
const requiredDirs = [
  'backups',
  'logs'
];

requiredDirs.forEach(dir => {
  const dirPath = path.join(rootDir, dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`ディレクトリを作成します: ${dir}`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// 環境変数ファイルの確認
const envFiles = [
  '.env.local',
  '.env.development',
  '.env.production'
];

let envFileExists = false;
envFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    envFileExists = true;
  }
});

if (!envFileExists) {
  console.log('環境変数ファイルが見つかりません。サンプルファイルを作成します...');
  
  const envSample = `# 環境変数設定

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
`;
  
  fs.writeFileSync(path.join(rootDir, '.env.local'), envSample);
  console.log('.env.local ファイルを作成しました');
}

// 開発環境の場合のみデータベースを初期化
if (process.env.NODE_ENV !== 'production') {
  const dbPath = process.env.DB_PATH || path.join(rootDir, 'database.sqlite');
  
  if (!fs.existsSync(dbPath)) {
    console.log('データベースが見つかりません。初期化を行います...');
    
    try {
      const initDbScript = path.join(rootDir, 'scripts', 'init-db.js');
      
      if (fs.existsSync(initDbScript)) {
        execSync(`node ${initDbScript}`, { stdio: 'inherit' });
        console.log('データベースの初期化が完了しました');
      } else {
        console.warn('警告: データベース初期化スクリプトが見つかりません');
      }
    } catch (err) {
      console.error('データベースの初期化に失敗しました:', err);
    }
  }
}

console.log('インストール後の処理が完了しました');
