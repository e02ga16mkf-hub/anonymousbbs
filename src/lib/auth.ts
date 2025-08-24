import { verify } from 'jsonwebtoken';
import { NextApiRequest } from 'next';
import cookie from 'cookie';

// JWT秘密鍵（本番環境では環境変数から取得するべき）
const JWT_SECRET = 'your-secret-key';

interface AdminPayload {
  id: number;
  username: string;
}

// 管理者認証チェック
export function isAuthenticated(req: NextApiRequest): AdminPayload | null {
  try {
    // Cookieからトークンを取得
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.admin_session;
    
    if (!token) {
      return null;
    }
    
    // トークンを検証
    const decoded = verify(token, JWT_SECRET) as AdminPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
