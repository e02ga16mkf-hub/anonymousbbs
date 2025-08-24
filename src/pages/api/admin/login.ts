import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, verifyPassword } from '../../../lib/db';
import { sign } from 'jsonwebtoken';
import cookie from 'cookie';

// JWT秘密鍵（本番環境では環境変数から取得するべき）
const JWT_SECRET = 'your-secret-key';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // バリデーション
    if (!username || !password) {
      return res.status(400).json({ error: 'ユーザー名とパスワードは必須です' });
    }

    const db = await getDb();
    
    // 管理者アカウントの取得
    const admin = await db.get('SELECT * FROM admins WHERE username = ?', [username]);
    
    if (!admin) {
      return res.status(401).json({ error: 'ユーザー名またはパスワードが正しくありません' });
    }
    
    // パスワード検証
    const isValid = await verifyPassword(password, admin.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'ユーザー名またはパスワードが正しくありません' });
    }
    
    // JWT生成
    const token = sign(
      { 
        id: admin.id,
        username: admin.username
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Cookieにセット
    res.setHeader('Set-Cookie', cookie.serialize('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24時間
      sameSite: 'strict',
      path: '/'
    }));
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
