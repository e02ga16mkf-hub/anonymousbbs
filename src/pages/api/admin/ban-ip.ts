import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, hashIP } from '../../../lib/db';
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
    const { ip, reason, duration } = req.body;

    // バリデーション
    if (!ip) {
      return res.status(400).json({ error: 'IPアドレスは必須です' });
    }

    const db = await getDb();
    const ipHash = hashIP(ip);
    
    // 期限の計算
    let expiresAt = null;
    if (duration && duration > 0) {
      const now = new Date();
      expiresAt = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000); // duration日後
    }
    
    // IPアドレス規制を追加
    await db.run(`
      INSERT INTO banned_ips (ip_hash, reason, expires_at)
      VALUES (?, ?, ?)
    `, [ipHash, reason || '', expiresAt ? expiresAt.toISOString() : null]);
    
    res.status(201).json({ success: true });
  } catch (error) {
    console.error('Error banning IP:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
