import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { 
  hashIP, 
  canPostAgain, 
  containsBannedWords, 
  isWithinCharLimit,
  isWithinPostLimit
} from '../../../lib/utils';
import { 
  POST_INTERVAL_SECONDS, 
  BANNED_WORDS,
  MAX_POST_CONTENT_LENGTH,
  MAX_POST_NAME_LENGTH,
  MAX_POST_EMAIL_LENGTH,
  MAX_POSTS_PER_DAY
} from '../../../lib/constants';
import { ApiResponse, CreatePostRequest } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ post_id: number }>>
) {
  // POSTリクエストのみ許可
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const db = await getDb();
    const { thread_id, name, email, content }: CreatePostRequest = req.body;
    
    // 必須項目の検証
    if (!thread_id || !content) {
      return res.status(400).json({ success: false, error: 'スレッドIDと本文は必須です' });
    }
    
    // 数値チェック
    const threadIdNum = parseInt(thread_id.toString());
    if (isNaN(threadIdNum)) {
      return res.status(400).json({ success: false, error: 'スレッドIDは数値である必要があります' });
    }
    
    // 文字数制限チェック
    if (!isWithinCharLimit(content, MAX_POST_CONTENT_LENGTH)) {
      return res.status(400).json({ 
        success: false, 
        error: `本文は${MAX_POST_CONTENT_LENGTH}文字以内で入力してください` 
      });
    }
    
    if (name && !isWithinCharLimit(name, MAX_POST_NAME_LENGTH)) {
      return res.status(400).json({ 
        success: false, 
        error: `名前は${MAX_POST_NAME_LENGTH}文字以内で入力してください` 
      });
    }
    
    if (email && !isWithinCharLimit(email, MAX_POST_EMAIL_LENGTH)) {
      return res.status(400).json({ 
        success: false, 
        error: `メールアドレスは${MAX_POST_EMAIL_LENGTH}文字以内で入力してください` 
      });
    }
    
    // スレッドの存在確認
    const thread = await db.get('SELECT id FROM threads WHERE id = ?', threadIdNum);
    if (!thread) {
      return res.status(404).json({ success: false, error: 'スレッドが見つかりません' });
    }
    
    // 禁止ワードチェック
    if (containsBannedWords(content, BANNED_WORDS)) {
      return res.status(400).json({ success: false, error: '投稿に禁止ワードが含まれています' });
    }
    
    // IPアドレスの取得とハッシュ化
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const hashedIp = hashIP(String(ip));
    
    // 連続投稿制限チェック
    const lastPost = await db.get(
      'SELECT created_at FROM posts WHERE ip_hash = ? ORDER BY created_at DESC LIMIT 1',
      hashedIp
    );
    
    if (lastPost && !canPostAgain(new Date(lastPost.created_at), POST_INTERVAL_SECONDS)) {
      return res.status(429).json({ 
        success: false, 
        error: `連続投稿はできません。${POST_INTERVAL_SECONDS}秒お待ちください` 
      });
    }
    
    // 1日あたりの投稿数チェック
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const postCount = await db.get(
      'SELECT COUNT(*) as count FROM posts WHERE ip_hash = ? AND created_at > ?',
      [hashedIp, oneDayAgo.toISOString()]
    );
    
    if (!isWithinPostLimit(postCount.count, MAX_POSTS_PER_DAY)) {
      return res.status(429).json({ 
        success: false, 
        error: `1日の投稿上限（${MAX_POSTS_PER_DAY}件）に達しました` 
      });
    }
    
    // トランザクション開始
    await db.run('BEGIN TRANSACTION');
    
    try {
      // 投稿番号の取得
      const postNumberResult = await db.get(
        'SELECT MAX(post_number) as max_number FROM posts WHERE thread_id = ?',
        threadIdNum
      );
      const nextPostNumber = (postNumberResult.max_number || 0) + 1;
      
      // 投稿の作成
      const result = await db.run(
        `INSERT INTO posts (thread_id, post_number, name, email, content, ip_hash, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [threadIdNum, nextPostNumber, name || '名無しさん', email || '', content, hashedIp]
      );
      
      // スレッドの投稿数と最終更新日時を更新
      await db.run(
        `UPDATE threads 
         SET post_count = post_count + 1, updated_at = datetime('now') 
         WHERE id = ?`,
        threadIdNum
      );
      
  
    
      // トランザクション確定
      await db.run('COMMIT');
      
      return res.status(200).json({ 
        success: true, 
        data: { post_id: result.lastID! } 
      });
    } catch (error) {
      // トランザクションロールバック
      await db.run('ROLLBACK');
      throw error;
    }
} catch (error) {
  console.error('Error creating post:', error);
  
  // エラーログの記録 - 完全に無効化
  
  return res.status(500).json({ 
    success: false, 
    error: '投稿の作成中にエラーが発生しました' 
  });
}

}
