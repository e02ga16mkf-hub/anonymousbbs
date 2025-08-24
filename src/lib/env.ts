/**
 * 環境変数アクセス用ユーティリティ
 */

// データベースパス
export const DB_PATH = process.env.DB_PATH || './database.sqlite';

// JWT秘密鍵
export const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';

// 禁止IPリスト
export const BANNED_IPS = process.env.BANNED_IPS ? process.env.BANNED_IPS.split(',') : [];

// レート制限設定
export const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10);
export const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);

// 管理者アカウント
export const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';

// 投稿制限
export const POST_INTERVAL_SECONDS = parseInt(process.env.POST_INTERVAL_SECONDS || '30', 10);
export const THREAD_INTERVAL_SECONDS = parseInt(process.env.THREAD_INTERVAL_SECONDS || '300', 10);
export const MAX_POSTS_PER_DAY = parseInt(process.env.MAX_POSTS_PER_DAY || '50', 10);
