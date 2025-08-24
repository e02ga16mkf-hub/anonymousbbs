import {
  POST_INTERVAL_SECONDS as ENV_POST_INTERVAL_SECONDS,
  THREAD_INTERVAL_SECONDS as ENV_THREAD_INTERVAL_SECONDS,
  MAX_POSTS_PER_DAY as ENV_MAX_POSTS_PER_DAY,
  ADMIN_USERNAME as ENV_ADMIN_USERNAME,
  ADMIN_PASSWORD as ENV_ADMIN_PASSWORD,
  JWT_SECRET as ENV_JWT_SECRET
} from './env';

// 投稿制限関連
export const POST_INTERVAL_SECONDS = ENV_POST_INTERVAL_SECONDS; // 同一IPからの連続投稿制限（秒）
export const THREAD_INTERVAL_SECONDS = ENV_THREAD_INTERVAL_SECONDS; // 同一IPからのスレッド作成制限（秒）
export const MAX_POSTS_PER_DAY = ENV_MAX_POSTS_PER_DAY; // 1日あたりの最大投稿数

// 文字数制限
export const MAX_THREAD_TITLE_LENGTH = 50;
export const MAX_POST_NAME_LENGTH = 30;
export const MAX_POST_EMAIL_LENGTH = 50;
export const MAX_POST_CONTENT_LENGTH = 1000;

// 禁止ワード
export const BANNED_WORDS = [
  'spam',
  'アダルト広告',
  '出会い系',
  '無修正',
  '児童ポルノ',
  'illegal',
  'malware',
  'phishing'
];

// 管理者認証
export const ADMIN_USERNAME = ENV_ADMIN_USERNAME;
export const ADMIN_PASSWORD = ENV_ADMIN_PASSWORD;
export const JWT_SECRET = ENV_JWT_SECRET;

// 自動更新間隔（ミリ秒）
export const AUTO_REFRESH_INTERVAL = 30000; // 30秒

// 日付フォーマット
export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
};

// 正規表現パターン
export const URL_PATTERN = /https?:\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
export const EMAIL_PATTERN = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/g;
export const ANCHOR_PATTERN = /&gt;&gt;(\d+)/g;