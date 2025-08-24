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
    const { post_id, reason } = req.body;

    // バリデーション
    if (!post_id) {
      return res.status(400).json({ error: '投稿IDは必須です' });
    }

    const db = await getDb();
    
    // 投稿の存在確認
    const post = await db.get('SELECT * FROM posts WHERE id = ?', [post_id]);
    
    if (!post) {
      return res.status(404).json({ error: '投稿が見つかりません' });
    }
    
    // トランザクション開始
    await db.run('BEGIN TRANSACTION');
    
    // 投稿を削除状態に更新
    await db.run(`
      UPDATE posts 
      SET is_deleted = 1, deleted_reason = ?
      WHERE id = ?
    `, [reason || '管理者による削除', post_id]);
    
    // コミット
    await db.run('COMMIT');
    
    res.status(200).json({ success: true });
  } catch (error) {
    const db = await getDb();
    await db.run('ROLLBACK');
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
