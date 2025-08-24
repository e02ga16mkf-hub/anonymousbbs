import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { Board } from '../../../types';

type ResponseData = {
  board?: Board;
  error?: string;
};

/**
 * 特定の板の情報を取得するAPI
 * 
 * @route GET /api/boards/[id]
 * @param {number} id - 板ID
 * @returns {Object} 板の詳細情報
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // GETメソッド以外は許可しない
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { id } = req.query;
    
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ error: 'Invalid board ID' });
    }

    // データベース接続
    const db = await getDb();
    
    // 板情報を取得（スレッド数と投稿数も集計）
    const board = await db.get<Board>(`
      SELECT 
        b.id, b.name, b.description, b.category, b.created_at,
        COUNT(DISTINCT t.id) as thread_count,
        COUNT(p.id) as post_count
      FROM boards b
      LEFT JOIN threads t ON b.id = t.board_id AND t.is_deleted = 0
      LEFT JOIN posts p ON t.id = p.thread_id AND p.is_deleted = 0
      WHERE b.id = ?
      GROUP BY b.id, b.name, b.description, b.category
    `, [id]);
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    // 結果を返す
    res.status(200).json({ board });
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
