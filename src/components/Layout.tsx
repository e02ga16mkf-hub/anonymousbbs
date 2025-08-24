import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Home, Menu, X, MessageSquare, Search, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

/**
 * 共通レイアウトコンポーネント
 */
export default function Layout({ 
  children, 
  title = '匿名掲示板', 
  description = '匿名で気軽に利用できる掲示板サイト' 
}: LayoutProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ナビゲーションリンク
  const navLinks = [
    { href: '/', label: '板一覧', icon: <Home className="w-5 h-5" /> },
    { href: '/search', label: '検索', icon: <Search className="w-5 h-5" /> },
    { href: '/confirmation', label: '実装確認', icon: <Settings className="w-5 h-5" /> },
  ];

  // 現在のパスがリンクと一致するか確認
  const isActiveLink = (href: string) => {
    return router.pathname === href || 
      (href !== '/' && router.pathname.startsWith(href));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* ロゴ */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <MessageSquare className="w-6 h-6 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">匿名掲示板</span>
              </Link>
            </div>

            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
                    isActiveLink(link.href)
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="hidden lg:block">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>

            {/* モバイルメニューボタン */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* モバイルメニュー */}
        <AnimatedMobileMenu isOpen={mobileMenuOpen} links={navLinks} onLinkClick={() => setMobileMenuOpen(false)} />
      </header>

      {/* メインコンテンツ */}
      <main className="flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        >
          {children}
        </motion.div>
      </main>

      {/* フッター */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-500">
                © 2025 匿名掲示板. All rights reserved.
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex justify-center md:justify-end space-x-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// モバイルメニューコンポーネント
interface MobileMenuProps {
  isOpen: boolean;
  links: { href: string; label: string; icon: React.ReactNode }[];
  onLinkClick: () => void;
}

function AnimatedMobileMenu({ isOpen, links, onLinkClick }: MobileMenuProps) {
  const router = useRouter();
  
  // 現在のパスがリンクと一致するか確認
  const isActiveLink = (href: string) => {
    return router.pathname === href || 
      (href !== '/' && router.pathname.startsWith(href));
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden border-t border-gray-200"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg">
            {links.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={link.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base ${
                    isActiveLink(link.href)
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                  onClick={onLinkClick}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}