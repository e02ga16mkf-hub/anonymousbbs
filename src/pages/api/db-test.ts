import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, hashIP } from '../../lib/db';

type TestResult = {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
};

/**
 * データベース接続テスト用API
 * 各テーブルの基本的なCRUD操作をテストする
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TestResult>
) {
  try {
    // データベース接続
    const db = await getDb();
    
    // 板一覧を取得
    const boards = await db.all('SELECT * FROM boards');
    
    // テスト用スレッド作成
    const testTitle = `テストスレッド_${Date.now()}`;
    const threadResult = await db.run(`
      INSERT INTO threads (board_id, title)
      VALUES (1, ?)
    `, [testTitle]);
    
    const threadId = threadResult.lastID;
    
    // テスト用投稿作成
    const testContent = `テスト投稿内容_${Date.now()}`;
    const testIp = '127.0.0.1';
    const ipHash = hashIP(testIp);
    
    await db.run(`
      INSERT INTO posts (thread_id, post_number, name, content, ip_hash)
      VALUES (?, 1, '名無しさん', ?, ?)
    `, [threadId, testContent, ipHash]);
    
    // スレッドと投稿を取得して確認
    const thread = await db.get('SELECT * FROM threads WHERE id = ?', [threadId]);
    const posts = await db.all('SELECT * FROM posts WHERE thread_id = ?', [threadId]);
    
    // テスト結果を返す
    res.status(200).json({
      success: true,
      message: 'データベーステスト成功',
      data: {
        boards,
        thread,
        posts
      }
    });
  } catch (error) {
    console.error('データベーステストエラー:', error);
    res.status(500).json({
      success: false,
      message: 'データベーステスト失敗',
      error: error instanceof Error ? error.message : '不明なエラー'
    });
  }
}
