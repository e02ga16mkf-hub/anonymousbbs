import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../lib/db';
import { ApiResponse, Thread } from '../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ threads: Thread[] }>>
) {
  // GETリクエストのみ許可
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const db = await getDb();
    const { q, board_id } = req.query;
    
    // 検索キーワードは必須
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ success: false, error: '検索キーワードは必須です' });
    }
    
    // SQLクエリを構築
    let query = `
      SELECT t.*, b.name as board_name
      FROM threads t
      JOIN boards b ON t.board_id = b.id
      WHERE (t.title LIKE ? OR EXISTS (
        SELECT 1 FROM posts p WHERE p.thread_id = t.id AND p.content LIKE ?
      ))
    `;
    
    const params = [`%${q}%`, `%${q}%`];
    
    // 板IDで絞り込み
    if (board_id) {
      query += ' AND t.board_id = ?';
      params.push(board_id as string);
    }
    
    // 最終更新日時の降順でソート
    query += ' ORDER BY t.updated_at DESC LIMIT 100';
    
    const threads = await db.all(query, ...params);
    
    // アクセスログの記録
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    await db.run(
      `INSERT INTO access_logs (ip_hash, action, details, created_at)
       VALUES (?, ?, ?, datetime('now'))`,
      [ip, 'search', `keyword: ${q}, board_id: ${board_id || 'all'}`]
    );
    
    return res.status(200).json({ 
      success: true, 
      data: { threads } 
    });
    
  } catch (error) {
    console.error('Error searching threads:', error);
    
    return res.status(500).json({ 
      success: false, 
      error: '検索中にエラーが発生しました' 
    });
  }
}
