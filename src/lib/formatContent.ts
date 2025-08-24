import { escapeHTML } from './utils';
import { URL_PATTERN, EMAIL_PATTERN, ANCHOR_PATTERN } from './constants';

/**
 * 投稿内容をフォーマットする
 * - HTMLエスケープ
 * - URLの自動リンク化
 * - メールアドレスの自動リンク化
 * - アンカー（>>1）のリンク化
 * - 改行の適切な処理
 */
export function formatContent(content: string): string {
  if (!content) return '';
  
  // HTMLエスケープ
  let formatted = escapeHTML(content);
  
  // 改行を<br>に変換（先に行う必要がある）
  formatted = formatted.replace(/\r?\n/g, '<br>');
  
  // URLの自動リンク化
  formatted = formatted.replace(
    URL_PATTERN,
    url => `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${url}</a>`
  );
  
  // メールアドレスの自動リンク化
  formatted = formatted.replace(
    EMAIL_PATTERN,
    email => `<a href="mailto:${email}" class="text-blue-600 hover:underline">${email}</a>`
  );
  
  // アンカー（>>1）のリンク化
  formatted = formatted.replace(
    ANCHOR_PATTERN,
    (match, postNumber) => `<a href="#post-${postNumber}" data-post-number="${postNumber}" class="text-green-600 hover:underline font-medium">${match}</a>`
  );
  
  return formatted;
}

/**
 * スレッドタイトルをフォーマットする（エスケープのみ）
 */
export function formatTitle(title: string): string {
  return escapeHTML(title);
}

/**
 * 投稿者名をフォーマットする（エスケープのみ）
 */
export function formatName(name: string): string {
  return name ? escapeHTML(name) : '名無しさん';
}