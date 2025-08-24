/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    esmExternals: false,
  },
  // TypeScriptのエラーを無視する設定を追加
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // サーバーサイドでsqlite3をバンドルしないようにする
      config.externals.push('sqlite3');
    }
    return config;
  },
  // 本番環境でのソースマップを無効化
  productionBrowserSourceMaps: false,
  // 画像最適化設定
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  // 国際化設定
  i18n: {
    locales: ['ja'],
    defaultLocale: 'ja',
  },
  // 環境変数
  env: {
    APP_NAME: '匿名掲示板',
    APP_VERSION: '1.0.0',
  },
  // HTTPヘッダー
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;