import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb } from '../../lib/db';

/**
 * ヘルスチェックエンドポイント
 * サーバーとデータベースの状態を確認する
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // データベース接続チェック
    const db = await getDb();
    const dbResult = await db.get('SELECT 1 as connected');
    
    // 正常応答
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: dbResult.connected === 1 ? 'connected' : 'error',
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    // エラー応答
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
