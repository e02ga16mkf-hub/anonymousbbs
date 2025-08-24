import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { board_id, keyword } = req.query;
    
    if (!keyword) {
      return res.status(400).json({ error: 'キーワードは必須です' });
    }

    const db = await getDb();
    let query = `
      SELECT 
        t.id, t.board_id, t.title, t.post_count,
        t.created_at, t.updated_at,
        b.name as board_name
      FROM threads t
      JOIN boards b ON t.board_id = b.id
      WHERE t.title LIKE ?
    `;
    
    const params: any[] = [`%${keyword}%`];
    
    if (board_id) {
      query += ` AND t.board_id = ?`;
      params.push(board_id);
    }
    
    query += ` ORDER BY t.updated_at DESC LIMIT 50`;
    
    const threads = await db.all(query, params);

    res.status(200).json({ threads });
  } catch (error) {
    console.error('Error searching threads:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
