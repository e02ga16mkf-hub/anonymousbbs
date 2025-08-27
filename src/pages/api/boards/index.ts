import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { Board, BoardsResponse } from '../../../types';

type ErrorResponse = {
  error: string;
};

/**
 * 板一覧を取得するAPI
 * 
 * @route GET /api/boards
 * @returns {Object} 板一覧データ
 * @returns {Board[]} boards - 板データの配列
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BoardsResponse | ErrorResponse>
) {
  // GETメソッド以外は許可しない
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    // データベース接続
    const db = await getDb();
    
    // 板一覧を取得（スレッド数と投稿数も集計）
    const boards = await db.all<Board[]>(`
      SELECT 
        b.id, b.name, b.description, b.category, b.created_at,
        COUNT(DISTINCT t.id) as thread_count,
        COUNT(p.id) as post_count
      FROM boards b
      LEFT JOIN threads t ON b.id = t.board_id 
      LEFT JOIN posts p ON t.id = p.thread_id 
      GROUP BY b.id, b.name, b.description, b.category
      ORDER BY b.category, b.id
    `);
    
    // アクセスログを記録
   
    
    // 結果を返す
    res.status(200).json({ boards });
  } catch (error) {
    console.error('Error fetching boards:', error);
    
    // エラーログを記録
    
    res.status(500).json({ error: 'Internal server error' });
  }
}
