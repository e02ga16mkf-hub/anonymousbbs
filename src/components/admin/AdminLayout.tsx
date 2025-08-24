import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Shield, 
  BarChart2, 
  FileText, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (confirm('ログアウトしますか？')) {
      setLoading(true);
      
      try {
        const response = await fetch('/api/admin/logout', {
          method: 'POST',
        });
        
        if (response.ok) {
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const navigation = [
    { name: 'ダッシュボード', href: '/admin', icon: LayoutDashboard },
    { name: '投稿管理', href: '/admin/posts', icon: MessageSquare },
    { name: 'アクセス制限', href: '/admin/bans', icon: Shield },
    { name: '統計', href: '/admin/stats', icon: BarChart2 },
    { name: 'ログ', href: '/admin/logs', icon: FileText },
  ];

  return (
    <>
      <Head>
        <title>{title} | 管理画面</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        {/* モバイルサイドバートグル */}
        <div className="lg:hidden fixed top-0 left-0 w-full bg-white z-30 px-4 py-2 border-b shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">管理画面</h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* サイドバーオーバーレイ */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* サイドバー */}
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-white border-r z-30 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <h1 className="text-xl font-bold text-gray-900">匿名掲示板</h1>
              <p className="text-sm text-gray-600">管理画面</p>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-1">
                {navigation.map((item) => {
                  const isActive = router.pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center px-3 py-2 rounded-md ${
                          isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="p-4 border-t">
              <button
                onClick={handleLogout}
                disabled={loading}
                className="flex items-center w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 mr-3" />
                ) : (
                  <LogOut className="w-5 h-5 mr-3" />
                )}
                <span>ログアウト</span>
              </button>
              <div className="mt-2">
                <Link
                  href="/"
                  className="text-sm text-blue-600 hover:underline"
                >
                  掲示板に戻る
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="lg:pl-64">
          <div className="py-14 lg:py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-6 hidden lg:block">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
