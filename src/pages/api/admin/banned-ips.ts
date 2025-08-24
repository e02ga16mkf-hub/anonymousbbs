import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { isAuthenticated } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 管理者認証チェック
  const admin = isAuthenticated(req);
  if (!admin) {
    return res.status(401).json({ error: '認証が必要です' });
  }

  try {
    const db = await getDb();
    
    // 規制IPリストを取得
    const bannedIPs = await db.all(`
      SELECT 
        id, ip_hash, reason, expires_at, created_at
      FROM banned_ips
      ORDER BY created_at DESC
    `);
    
    res.status(200).json({ banned_ips: bannedIPs });
  } catch (error) {
    console.error('Error fetching banned IPs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
