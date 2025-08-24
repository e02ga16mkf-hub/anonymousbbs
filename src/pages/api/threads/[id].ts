import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../../lib/db';
import { ApiResponse, Thread, Post } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ thread: Thread; posts: Post[] }>>
) {
  // GETリクエストのみ許可
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ success: false, error: 'スレッドIDは必須です' });
    }
    
    const db = await getDb();
    
    // スレッド情報を取得
    const thread = await db.get(`
      SELECT t.*, b.name as board_name
      FROM threads t
      JOIN boards b ON t.board_id = b.id
      WHERE t.id = ?
    `, id);
    
    if (!thread) {
      return res.status(404).json({ success: false, error: 'スレッドが見つかりません' });
    }
    
    // スレッドの投稿を取得
    const posts = await db.all(`
      SELECT id, thread_id, post_number, name, email, content, ip_hash, created_at, updated_at
      FROM posts
      WHERE thread_id = ?
      ORDER BY post_number ASC
    `, id);
    
    // アクセスログの記録
   
    
    return res.status(200).json({ 
      success: true, 
      data: { thread, posts } 
    });
    
  } catch (error) {
    console.error('Error fetching thread:', error);
    
    return res.status(500).json({ 
      success: false, 
      error: 'スレッド情報の取得に失敗しました' 
    });
  }
}
