import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { 
  hashIP, 
  canPostAgain, 
  containsBannedWords, 
  isWithinCharLimit 
} from '../../../lib/utils';
import { 
  THREAD_INTERVAL_SECONDS, 
  BANNED_WORDS,
  MAX_THREAD_TITLE_LENGTH,
  MAX_POST_CONTENT_LENGTH,
  MAX_POST_NAME_LENGTH,
  MAX_POST_EMAIL_LENGTH
} from '../../../lib/constants';
import { ApiResponse, Thread, CreateThreadRequest } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ threads: Thread[] } | { thread_id: number }>>
) {
  const db = await getDb();
  
  // GETリクエスト（スレッド一覧取得）
  if (req.method === 'GET') {
    try {
      const { board_id } = req.query;
      
      if (!board_id) {
        return res.status(400).json({ success: false, error: '板IDは必須です' });
      }
      
      // 数値チェック
      const boardIdNum = parseInt(board_id as string);
      if (isNaN(boardIdNum)) {
        return res.status(400).json({ success: false, error: '板IDは数値である必要があります' });
      }
      
      // 板の存在確認
      const board = await db.get('SELECT id FROM boards WHERE id = ?', boardIdNum);
      if (!board) {
        return res.status(404).json({ success: false, error: '指定された板が見つかりません' });
      }
      
      const threads = await db.all(`
        SELECT t.*, b.name as board_name
        FROM threads t
        JOIN boards b ON t.board_id = b.id
        WHERE t.board_id = ?
        ORDER BY t.updated_at DESC
      `, boardIdNum);
      
      return res.status(200).json({ success: true, data: { threads } });
      
    } catch (error) {
      console.error('Error fetching threads:', error);
      return res.status(500).json({ success: false, error: 'スレッド一覧の取得に失敗しました' });
    }
  }
  
  // POSTリクエスト（新規スレッド作成）
  if (req.method === 'POST') {
    try {
      const { board_id, title, name, email, content }: CreateThreadRequest = req.body;
      
      // 必須項目の検証
      if (!board_id || !title || !content) {
        return res.status(400).json({ success: false, error: '板ID、タイトル、本文は必須です' });
      }
      
      // 数値チェック
      const boardIdNum = parseInt(board_id.toString());
      if (isNaN(boardIdNum)) {
        return res.status(400).json({ success: false, error: '板IDは数値である必要があります' });
      }
      
      // 文字数制限チェック
      if (!isWithinCharLimit(title, MAX_THREAD_TITLE_LENGTH)) {
        return res.status(400).json({ 
          success: false, 
          error: `タイトルは${MAX_THREAD_TITLE_LENGTH}文字以内で入力してください` 
        });
      }
      
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
      
      // 板の存在確認
      const board = await db.get('SELECT id FROM boards WHERE id = ?', boardIdNum);
      if (!board) {
        return res.status(404).json({ success: false, error: '板が見つかりません' });
      }
      
      // 禁止ワードチェック
      if (containsBannedWords(title, BANNED_WORDS) || containsBannedWords(content, BANNED_WORDS)) {
        return res.status(400).json({ success: false, error: '投稿に禁止ワードが含まれています' });
      }
      
      // IPアドレスの取得とハッシュ化
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
      const hashedIp = hashIP(String(ip));
      
      // 連続スレッド作成制限チェック
      const lastThread = await db.get(
        'SELECT created_at FROM threads WHERE ip_hash = ? ORDER BY created_at DESC LIMIT 1',
        hashedIp
      );
      
      if (lastThread && !canPostAgain(new Date(lastThread.created_at), THREAD_INTERVAL_SECONDS)) {
        return res.status(429).json({ 
          success: false, 
          error: `連続スレッド作成はできません。${Math.ceil(THREAD_INTERVAL_SECONDS / 60)}分お待ちください` 
        });
      }
      
      // トランザクション開始
      await db.run('BEGIN TRANSACTION');
      
      try {
        // スレッドの作成
        const threadResult = await db.run(
          `INSERT INTO threads (board_id, title, ip_hash, post_count, created_at, updated_at)
           VALUES (?, ?, ?, 1, datetime('now'), datetime('now'))`,
          [boardIdNum, title, hashedIp]
        );
        
        const threadId = threadResult.lastID!;
        
        // 最初の投稿を作成
        await db.run(
          `INSERT INTO posts (thread_id, post_number, name, email, content, ip_hash, created_at, updated_at)
           VALUES (?, 1, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [threadId, name || '名無しさん', email || '', content, hashedIp]
        );
        
        // アクセスログの記録
        await db.run(
          `INSERT INTO access_logs (ip_hash, action, resource_id, created_at)
           VALUES (?, ?, ?, datetime('now'))`,
          [hashedIp, 'create_thread', threadId]
        );
        
        // トランザクション確定
        await db.run('COMMIT');
        
        return res.status(201).json({ 
          success: true, 
          data: { thread_id: threadId } 
        });
      } catch (error) {
        // トランザクションロールバック
        await db.run('ROLLBACK');
        throw error;
      }
      
    } catch (error) {
      console.error('Error creating thread:', error);
      
      // エラーログの記録
      try {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
        const hashedIp = hashIP(String(ip));
        
        await db.run(
          `INSERT INTO error_logs (ip_hash, error_type, error_message, created_at)
           VALUES (?, ?, ?, datetime('now'))`,
          [hashedIp, 'api_error', String(error)]
        );
      } catch (logError) {
        console.error('Failed to log error:', logError);
      }
      
      return res.status(500).json({ 
        success: false, 
        error: 'スレッドの作成中にエラーが発生しました' 
      });
    }
  }
  
  // その他のメソッドは許可しない
  return res.status(405).json({ success: false, error: 'Method not allowed' });
}