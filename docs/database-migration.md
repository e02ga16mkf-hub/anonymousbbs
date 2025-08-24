# データベース移行ガイド

このドキュメントでは、SQLiteから他のデータベースへの移行方法について説明します。

## SQLiteから PostgreSQLへの移行

### 前提条件

- PostgreSQLがインストールされていること
- Node.jsがインストールされていること
- 必要なパッケージ: `pg`, `sqlite3`, `better-sqlite3`

### 手順

1. 必要なパッケージをインストールする

```bash
npm install pg better-sqlite3 dotenv
```

2. 移行スクリプトを作成する（`scripts/migrate-to-postgres.js`）

```javascript
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const BetterSqlite3 = require('better-sqlite3');
const { Pool } = require('pg');

// 設定
const SQLITE_DB_PATH = process.env.DB_PATH || './database.sqlite';
const PG_CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/anonymous_bbs';

// SQLiteデータベース接続
const sqliteDb = new BetterSqlite3(SQLITE_DB_PATH);

// PostgreSQL接続プール
const pgPool = new Pool({
  connectionString: PG_CONNECTION_STRING,
});

// テーブル定義
const tables = [
  'boards',
  'threads',
  'posts',
  'admins',
  'banned_ips',
  'access_logs',
  'error_logs'
];

// PostgreSQLスキーマ作成
const createPostgresSchema = async () => {
  const client = await pgPool.connect();
  
  try {
    await client.query('BEGIN');
    
    // boards テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS boards (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )
    `);
    
    // threads テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS threads (
        id SERIAL PRIMARY KEY,
        board_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        ip_hash TEXT NOT NULL,
        post_count INTEGER DEFAULT 0,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        FOREIGN KEY (board_id) REFERENCES boards (id)
      )
    `);
    
    // posts テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        thread_id INTEGER NOT NULL,
        post_number INTEGER NOT NULL,
        name TEXT,
        email TEXT,
        content TEXT NOT NULL,
        ip_hash TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        FOREIGN KEY (thread_id) REFERENCES threads (id),
        UNIQUE (thread_id, post_number)
      )
    `);
    
    // admins テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )
    `);
    
    // banned_ips テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS banned_ips (
        id SERIAL PRIMARY KEY,
        ip_hash TEXT NOT NULL UNIQUE,
        reason TEXT,
        expires_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )
    `);
    
    // access_logs テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS access_logs (
        id SERIAL PRIMARY KEY,
        ip_hash TEXT NOT NULL,
        action TEXT NOT NULL,
        resource_id TEXT,
        details TEXT,
        created_at TIMESTAMP NOT NULL
      )
    `);
    
    // error_logs テーブル
    await client.query(`
      CREATE TABLE IF NOT EXISTS error_logs (
        id SERIAL PRIMARY KEY,
        ip_hash TEXT,
        error_type TEXT NOT NULL,
        error_message TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL
      )
    `);
    
    // インデックス作成
    await client.query(`CREATE INDEX IF NOT EXISTS idx_threads_board_id ON threads (board_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_posts_thread_id ON posts (thread_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_posts_ip_hash ON posts (ip_hash)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_access_logs_ip_hash ON access_logs (ip_hash)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs (created_at)`);
    
    await client.query('COMMIT');
    console.log('PostgreSQLスキーマを作成しました');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('PostgreSQLスキーマ作成エラー:', err);
    throw err;
  } finally {
    client.release();
  }
};

// データ移行
const migrateData = async () => {
  const client = await pgPool.connect();
  
  try {
    await client.query('BEGIN');
    
    for (const table of tables) {
      // SQLiteからデータを取得
      const rows = sqliteDb.prepare(`SELECT * FROM ${table}`).all();
      
      if (rows.length === 0) {
        console.log(`テーブル ${table} にはデータがありません`);
        continue;
      }
      
      console.log(`テーブル ${table} から ${rows.length} 件のデータを移行中...`);
      
      // カラム名を取得
      const columns = Object.keys(rows[0]);
      
      // 各行をPostgreSQLに挿入
      for (const row of rows) {
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const values = columns.map(col => row[col]);
        
        const query = `
          INSERT INTO ${table} (${columns.join(', ')})
          VALUES (${placeholders})
          ON CONFLICT DO NOTHING
        `;
        
        await client.query(query, values);
      }
      
      console.log(`テーブル ${table} のデータ移行が完了しました`);
    }
    
    await client.query('COMMIT');
    console.log('すべてのデータ移行が完了しました');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('データ移行エラー:', err);
    throw err;
  } finally {
    client.release();
  }
};

// シーケンスの更新
const updateSequences = async () => {
  const client = await pgPool.connect();
  
  try {
    await client.query('BEGIN');
    
    for (const table of tables) {
      // シーケンス名を取得
      const result = await client.query(`
        SELECT pg_get_serial_sequence('${table}', 'id') as seq_name
      `);
      
      const seqName = result.rows[0]?.seq_name;
      if (!seqName) continue;
      
      // 最大IDを取得
      const maxResult = await client.query(`SELECT MAX(id) as max_id FROM ${table}`);
      const maxId = maxResult.rows[0]?.max_id || 0;
      
      // シーケンスを更新
      if (maxId > 0) {
        await client.query(`SELECT setval('${seqName}', ${maxId}, true)`);
        console.log(`テーブル ${table} のシーケンスを更新しました: ${maxId}`);
      }
    }
    
    await client.query('COMMIT');
    console.log('すべてのシーケンスを更新しました');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('シーケンス更新エラー:', err);
    throw err;
  } finally {
    client.release();
  }
};

// メイン処理
const main = async () => {
  try {
    console.log('SQLiteからPostgreSQLへの移行を開始します...');
    
    await createPostgresSchema();
    await migrateData();
    await updateSequences();
    
    console.log('移行が正常に完了しました');
  } catch (err) {
    console.error('移行エラー:', err);
    process.exit(1);
  } finally {
    sqliteDb.close();
    await pgPool.end();
  }
};

main();
```

3. データベース接続コードを更新する（`src/lib/db.ts`）

```typescript
import { Pool } from 'pg';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { hashIP } from './utils';

// 環境変数から接続情報を取得
const DB_TYPE = process.env.DB_TYPE || 'sqlite'; // 'sqlite' または 'postgres'
const SQLITE_DB_PATH = process.env.DB_PATH || './database.sqlite';
const PG_CONNECTION_STRING = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/anonymous_bbs';

// PostgreSQL接続プール
let pgPool: Pool | null = null;

// SQLite接続
let sqliteDb: Database | null = null;

/**
 * データベース接続を取得する
 */
export async function getDb(): Promise<any> {
  if (DB_TYPE === 'postgres') {
    return getPostgresDb();
  } else {
    return getSqliteDb();
  }
}

/**
 * PostgreSQL接続を取得する
 */
async function getPostgresDb(): Promise<Pool> {
  if (pgPool) return pgPool;
  
  pgPool = new Pool({
    connectionString: PG_CONNECTION_STRING,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  });
  
  return pgPool;
}

/**
 * SQLite接続を取得する
 */
async function getSqliteDb(): Promise<Database> {
  if (sqliteDb) return sqliteDb;
  
  try {
    sqliteDb = await open({
      filename: SQLITE_DB_PATH,
      driver: sqlite3.Database
    });
    
    // 外部キー制約を有効化
    await sqliteDb.exec('PRAGMA foreign_keys = ON');
    
    return sqliteDb;
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('データベース接続エラー');
  }
}

// 以下は既存のコードを必要に応じて修正...
```

4. 移行スクリプトを実行する

```bash
node scripts/migrate-to-postgres.js
```

5. 環境変数を設定する

```
DB_TYPE=postgres
DATABASE_URL=postgresql://username:password@hostname:port/database
```

### 注意点

- 移行前にデータのバックアップを取ることを強く推奨します
- 大量のデータがある場合は、バッチ処理を検討してください
- PostgreSQLの接続設定は環境に合わせて調整してください

## SQLiteから MySQLへの移行

MySQLへの移行も同様のアプローチで可能です。スクリプトの変更点は以下の通りです：

1. `mysql2`パッケージをインストールする

```bash
npm install mysql2
```

2. 接続コードとスキーマ定義をMySQLに合わせて変更する

詳細な手順は別途ドキュメントを参照してください。

## クラウドデータベースサービスの利用

以下のクラウドデータベースサービスが利用可能です：

- **Heroku Postgres**: Herokuアプリケーションと簡単に連携
- **Amazon RDS**: AWS環境での利用に最適
- **Google Cloud SQL**: Google Cloud Platformでの利用に最適
- **MongoDB Atlas**: ドキュメント指向データベースへの移行を検討する場合

各サービスの設定方法については、それぞれの公式ドキュメントを参照してください。
