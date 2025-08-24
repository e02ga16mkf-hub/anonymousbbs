import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../../lib/db';
import { isAuthenticated } from '../../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 管理者認証チェック
  const admin = isAuthenticated(req);
  if (!admin) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  try {
    const { thread_id, reason } = req.body;

    // バリデーション
    if (!thread_id) {
      return res.status(400).json({ error: 'スレッドIDは必須です' });
    }

    const db = await getDb();
    
    // スレッドの存在確認
    const thread = await db.get('SELECT * FROM threads WHERE id = ?', [thread_id]);
    
    if (!thread) {
      return res.status(404).json({ error: 'スレッドが見つかりません' });
    }
    
    // トランザクション開始
    await db.run('BEGIN TRANSACTION');
    
    // スレッドを削除状態に更新
    await db.run(`
      UPDATE threads 
      SET is_deleted = 1
      WHERE id = ?
    `, [thread_id]);
    
    // スレッド内の全投稿を削除状態に更新
    await db.run(`
      UPDATE posts 
      SET is_deleted = 1, deleted_reason = ?
      WHERE thread_id = ?
    `, [reason || 'スレッド削除に伴う削除', thread_id]);
    
    // コミット
    await db.run('COMMIT');
    
    res.status(200).json({ success: true });
  } catch (error) {
    const db = await getDb();
    await db.run('ROLLBACK');
    console.error('Error deleting thread:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
