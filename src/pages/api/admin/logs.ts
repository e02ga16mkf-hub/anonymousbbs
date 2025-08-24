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
    const { type = 'access', limit = 100, offset = 0 } = req.query;
    const db = await getDb();
    
    if (type === 'access') {
      // アクセスログを取得
      const logs = await db.all(`
        SELECT 
          id, ip_hash, path, method, status_code, user_agent, created_at
        FROM access_logs
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);
      
      const totalCount = await db.get('SELECT COUNT(*) as count FROM access_logs');
      
      res.status(200).json({ 
        logs,
        total: totalCount.count,
        limit: Number(limit),
        offset: Number(offset)
      });
    } 
    else if (type === 'error') {
      // エラーログを取得
      const logs = await db.all(`
        SELECT 
          id, error_message, stack_trace, created_at
        FROM error_logs
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);
      
      const totalCount = await db.get('SELECT COUNT(*) as count FROM error_logs');
      
      res.status(200).json({ 
        logs,
        total: totalCount.count,
        limit: Number(limit),
        offset: Number(offset)
      });
    }
    else {
      res.status(400).json({ error: '不正なログタイプ' });
    }
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
