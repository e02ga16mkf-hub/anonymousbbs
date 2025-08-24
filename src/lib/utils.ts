import crypto from 'crypto';

/**
 * IPアドレスをハッシュ化する
 */
export function hashIP(ip: string): string {
  return crypto
    .createHash('sha256')
    .update(ip)
    .digest('hex')
    .substring(0, 16);
}

/**
 * 日付を見やすいフォーマットに変換する
 * @param dateString 日付文字列
 * @param includeTime 時間を含めるかどうか
 * @param includeSeconds 秒を含めるかどうか
 */
export function formatDate(
  dateString: string, 
  includeTime: boolean = true,
  includeSeconds: boolean = false
): string {
  const date = new Date(dateString);
  
  // 無効な日付の場合
  if (isNaN(date.getTime())) {
    return '日付不明';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  // 現在の日付
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  // 昨日の日付
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  // 投稿日の00:00
  const postDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  // 1分以内
  if (diffMin < 1) {
    return 'たった今';
  }
  
  // 1時間以内
  if (diffHour < 1) {
    return `${diffMin}分前`;
  }
  
  // 24時間以内
  if (diffDay < 1) {
    return `${diffHour}時間前`;
  }
  
  // 昨日
  if (postDay.getTime() === yesterday.getTime()) {
    if (includeTime) {
      return `昨日 ${formatTime(date, includeSeconds)}`;
    }
    return '昨日';
  }
  
  // 今年
  if (date.getFullYear() === now.getFullYear()) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    if (includeTime) {
      return `${month}月${day}日 ${formatTime(date, includeSeconds)}`;
    }
    return `${month}月${day}日`;
  }
  
  // それ以前
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  if (includeTime) {
    return `${year}年${month}月${day}日 ${formatTime(date, includeSeconds)}`;
  }
  return `${year}年${month}月${day}日`;
}

/**
 * 時間のフォーマット
 */
function formatTime(date: Date, includeSeconds: boolean = false): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  if (includeSeconds) {
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
  
  return `${hours}:${minutes}`;
}

/**
 * HTMLをエスケープする
 */
export function escapeHTML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 連続投稿を制限するための時間チェック
 * @param lastPostTime 最後の投稿時間
 * @param intervalSeconds 制限時間（秒）
 */
export function canPostAgain(lastPostTime: Date | null, intervalSeconds: number): boolean {
  if (!lastPostTime) return true;
  
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - lastPostTime.getTime()) / 1000);
  
  return diffSeconds >= intervalSeconds;
}

/**
 * 禁止ワードチェック
 * @param text チェックするテキスト
 * @param bannedWords 禁止ワードリスト
 */
export function containsBannedWords(text: string, bannedWords: string[]): boolean {
  const lowerText = text.toLowerCase();
  return bannedWords.some(word => lowerText.includes(word.toLowerCase()));
}

/**
 * 文字数制限チェック
 */
export function isWithinCharLimit(text: string, maxLength: number): boolean {
  return text.length <= maxLength;
}

/**
 * 投稿数制限チェック
 */
export function isWithinPostLimit(postCount: number, maxPosts: number): boolean {
  return postCount < maxPosts;
}

/**
 * 相対時間表示（〜分前、〜時間前など）
 */
export function getRelativeTimeString(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  
  if (diffMin < 1) return 'たった今';
  if (diffHour < 1) return `${diffMin}分前`;
  if (diffDay < 1) return `${diffHour}時間前`;
  if (diffDay < 7) return `${diffDay}日前`;
  
  return formatDate(dateString, false);
}