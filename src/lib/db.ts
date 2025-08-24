import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { hashIP } from './utils';
import { DB_PATH } from './env';

let db: Database | null = null;

/**
 * データベース接続を取得する
 */
export async function getDb(): Promise<Database> {
  if (db) return db;
  
  try {   // Vercel環境かどうかを確認
    const isVercel = process.env.VERCEL === '1';
    db = await open({
        // Vercel環境ではメモリ内データベースを使用
        filename: isVercel ? ':memory:' : DB_PATH,
        driver: sqlite3.Database
      });
    
    // 外部キー制約を有効化
    await db.exec('PRAGMA foreign_keys = ON');   // Vercel環境の場合、毎回データベースを初期化する必要がある
    if (isVercel) {
      await initializeDb();
    }
    
    return db;
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('データベース接続エラー');
  }
}

/**
 * データベースを初期化する
 */
export async function initializeDb(): Promise<void> {
  const db = await getDb();
  
  try {
    // boards テーブル作成
    await db.exec(`
      CREATE TABLE IF NOT EXISTS boards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    
    // threads テーブル作成
    await db.exec(`
      CREATE TABLE IF NOT EXISTS threads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        board_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        ip_hash TEXT NOT NULL,
        post_count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (board_id) REFERENCES boards (id)
      )
    `);
    
    // posts テーブル作成
    await db.exec(`
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        thread_id INTEGER NOT NULL,
        post_number INTEGER NOT NULL,
        name TEXT,
        email TEXT,
        content TEXT NOT NULL,
        ip_hash TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (thread_id) REFERENCES threads (id),
        UNIQUE (thread_id, post_number)
      )
    `);
    
    // admins テーブル作成
    await db.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    
    // banned_ips テーブル作成
    await db.exec(`
      CREATE TABLE IF NOT EXISTS banned_ips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip_hash TEXT NOT NULL UNIQUE,
        reason TEXT,
        expires_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    
    // access_logs テーブル作成
    await db.exec(`
      CREATE TABLE IF NOT EXISTS access_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip_hash TEXT NOT NULL,
        action TEXT NOT NULL,
        resource_id TEXT,
        details TEXT,
        created_at TEXT NOT NULL
      )
    `);
    
    // error_logs テーブル作成
    await db.exec(`
      CREATE TABLE IF NOT EXISTS error_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip_hash TEXT,
        error_type TEXT NOT NULL,
        error_message TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);
    
    // インデックス作成
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_threads_board_id ON threads (board_id);
      CREATE INDEX IF NOT EXISTS idx_posts_thread_id ON posts (thread_id);
      CREATE INDEX IF NOT EXISTS idx_posts_ip_hash ON posts (ip_hash);
      CREATE INDEX IF NOT EXISTS idx_access_logs_ip_hash ON access_logs (ip_hash);
      CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs (created_at);
    `);
    
    // 初期データ確認
    const boardCount = await db.get('SELECT COUNT(*) as count FROM boards');
    
    // 初期データが存在しない場合は作成
    if (boardCount.count === 0) {
      await insertInitialData(db);
    }
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

/**
 * 初期データを挿入する
 */
async function insertInitialData(db: Database): Promise<void> {
  const now = new Date().toISOString();
  
  // 板データ
  const boards = [
    { name: '雑談', description: '何でも話せる雑談板', category: '一般', created_at: now, updated_at: now },
    { name: 'ニュース', description: '最新ニュースについて語る板', category: '一般', created_at: now, updated_at: now },
    { name: 'プログラミング', description: 'プログラミングに関する話題', category: '技術', created_at: now, updated_at: now },
    { name: 'ゲーム', description: 'ゲームに関する話題', category: '趣味', created_at: now, updated_at: now },
    { name: 'アニメ', description: 'アニメに関する話題', category: '趣味', created_at: now, updated_at: now }
  ];
  
  // 管理者データ
  const adminData = {
    username: 'admin',
    password_hash: hashIP('admin1234'), // 本番環境では適切なハッシュ関数を使用すること
    created_at: now,
    updated_at: now
  };
  
  // トランザクション開始
  await db.run('BEGIN TRANSACTION');
  
  try {
    // 板データ挿入
    for (const board of boards) {
      await db.run(
        `INSERT INTO boards (name, description, category, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
        [board.name, board.description, board.category, board.created_at, board.updated_at]
      );
    }
    
    // 管理者データ挿入
    await db.run(
      `INSERT INTO admins (username, password_hash, created_at, updated_at)
       VALUES (?, ?, ?, ?)`,
      [adminData.username, adminData.password_hash, adminData.created_at, adminData.updated_at]
    );
    
    // コミット
    await db.run('COMMIT');
    
    console.log('Initial data inserted successfully');
  } catch (error) {
    // ロールバック
    await db.run('ROLLBACK');
    console.error('Error inserting initial data:', error);
    throw error;
  }
}