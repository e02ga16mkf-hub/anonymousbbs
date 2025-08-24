import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ミドルウェア
 * - リクエストの前処理
 * - IP制限
 * - アクセスログ
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // リクエストヘッダーからIPアドレスを取得
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  
  // リクエスト情報をレスポンスヘッダーに追加（デバッグ用）
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('x-middleware-cache', 'no-cache');
    response.headers.set('x-middleware-ip', ip);
    response.headers.set('x-middleware-path', request.nextUrl.pathname);
  }
  
  // 禁止されたIPからのアクセスをブロック
  // 実際の実装ではデータベースから禁止IPリストを取得する必要がある
  const BANNED_IPS = process.env.BANNED_IPS ? process.env.BANNED_IPS.split(',') : [];
  if (BANNED_IPS.includes(ip)) {
    return new NextResponse(
      JSON.stringify({ success: false, error: 'アクセスが制限されています' }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
  
  // レート制限（簡易版）
  // 実際の実装ではRedisなどを使用してレート制限を実装する
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // API呼び出しの場合、レート制限を適用
    // ここでは実装を省略
  }
  
  return response;
}

// ミドルウェアを適用するパス
export const config = {
  matcher: [
    // API routes
    '/api/:path*',
    // 特定のページ
    '/boards/:path*',
    '/threads/:path*',
  ],
};