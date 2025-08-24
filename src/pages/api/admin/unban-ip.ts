import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { isAuthenticated } from '../../../lib/auth';

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
    const { ban_id } = req.body;

    // バリデーション
    if (!ban_id) {
      return res.status(400).json({ error: '規制IDは必須です' });
    }

    const db = await getDb();
    
    // 規制の存在確認
    const ban = await db.get('SELECT * FROM banned_ips WHERE id = ?', [ban_id]);
    
    if (!ban) {
      return res.status(404).json({ error: '規制が見つかりません' });
    }
    
    // 規制を削除
    await db.run('DELETE FROM banned_ips WHERE id = ?', [ban_id]);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error unbanning IP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
