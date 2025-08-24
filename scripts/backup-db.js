#!/usr/bin/env node

/**
 * データベースバックアップスクリプト
 * 
 * 使用方法:
 * node scripts/backup-db.js
 */

const fs = require('fs');
const path = require('path');

// 環境変数の読み込み
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

// 設定
const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), 'database.sqlite');
const BACKUP_DIR = path.join(process.cwd(), 'backups');
const MAX_BACKUPS = 10;

console.log('データベースバックアップを開始します...');

// データベースファイルの存在確認
if (!fs.existsSync(DB_PATH)) {
  console.error(`エラー: データベースファイルが見つかりません: ${DB_PATH}`);
  process.exit(1);
}

// バックアップディレクトリがなければ作成
if (!fs.existsSync(BACKUP_DIR)) {
  console.log(`バックアップディレクトリを作成します: ${BACKUP_DIR}`);
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// バックアップファイル名（日時を含む）
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}.sqlite`);

try {
  // データベースファイルをコピー
  fs.copyFileSync(DB_PATH, backupPath);
  console.log(`バックアップを作成しました: ${backupPath}`);
  
  // 古いバックアップを削除
  const backups = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('backup-') && file.endsWith('.sqlite'))
    .map(file => path.join(BACKUP_DIR, file))
    .sort((a, b) => fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime());
  
  if (backups.length > MAX_BACKUPS) {
    backups.slice(MAX_BACKUPS).forEach(file => {
      fs.unlinkSync(file);
      console.log(`古いバックアップを削除しました: ${path.basename(file)}`);
    });
  }
  
  console.log(`バックアップが完了しました。保存先: ${BACKUP_DIR}`);
  console.log(`保持バックアップ数: ${Math.min(backups.length, MAX_BACKUPS)}`);
} catch (err) {
  console.error('バックアップ中にエラーが発生しました:', err);
  process.exit(1);
}
