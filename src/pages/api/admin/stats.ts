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
    
    // 基本統計情報を取得
    const [
      boardCount,
      threadCount,
      postCount,
      activeThreads,
      todayPosts,
      bannedIPCount
    ] = await Promise.all([
      db.get('SELECT COUNT(*) as count FROM boards'),
      db.get('SELECT COUNT(*) as count FROM threads WHERE is_deleted = 0'),
      db.get('SELECT COUNT(*) as count FROM posts WHERE is_deleted = 0'),
      db.get(`
        SELECT COUNT(*) as count FROM threads 
        WHERE is_deleted = 0 
        AND updated_at > datetime('now', '-1 day')
      `),
      db.get(`
        SELECT COUNT(*) as count FROM posts 
        WHERE created_at > datetime('now', 'start of day')
      `),
      db.get(`
        SELECT COUNT(*) as count FROM banned_ips 
        WHERE expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP
      `)
    ]);
    
    // 板ごとの投稿数
    const boardStats = await db.all(`
      SELECT 
        b.id, b.name, 
        COUNT(DISTINCT t.id) as thread_count,
        COUNT(p.id) as post_count
      FROM boards b
      LEFT JOIN threads t ON b.id = t.board_id AND t.is_deleted = 0
      LEFT JOIN posts p ON t.id = p.thread_id AND p.is_deleted = 0
      GROUP BY b.id, b.name
      ORDER BY post_count DESC
    `);
    
    // 時間帯別の投稿数（過去24時間）
    const hourlyStats = await db.all(`
      SELECT 
        strftime('%H', created_at) as hour,
        COUNT(*) as count
      FROM posts
      WHERE created_at > datetime('now', '-1 day')
      GROUP BY hour
      ORDER BY hour
    `);
    
    // 日別の投稿数（過去30日）
    const dailyStats = await db.all(`
      SELECT 
        date(created_at) as date,
        COUNT(*) as count
      FROM posts
      WHERE created_at > datetime('now', '-30 day')
      GROUP BY date
      ORDER BY date
    `);
    
    res.status(200).json({
      summary: {
        board_count: boardCount.count,
        thread_count: threadCount.count,
        post_count: postCount.count,
        active_threads: activeThreads.count,
        today_posts: todayPosts.count,
        banned_ip_count: bannedIPCount.count
      },
      board_stats: boardStats,
      hourly_stats: hourlyStats,
      daily_stats: dailyStats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
