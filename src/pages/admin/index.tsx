import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/admin/AdminLayout';
import { MessageSquare, Users, Clock, AlertTriangle } from 'lucide-react';

interface StatsSummary {
  board_count: number;
  thread_count: number;
  post_count: number;
  active_threads: number;
  today_posts: number;
  banned_ip_count: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('統計情報の取得に失敗しました');
      }
      
      const data = await response.json();
      setStats(data.summary);
    } catch (error) {
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="ダッシュボード">
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      ) : stats ? (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">総投稿数</h3>
                  <p className="text-2xl font-bold">{stats.post_count.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>スレッド数</span>
                  <span className="font-medium">{stats.thread_count.toLocaleString()}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>板数</span>
                  <span className="font-medium">{stats.board_count.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">今日の投稿数</h3>
                  <p className="text-2xl font-bold">{stats.today_posts.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>アクティブスレッド</span>
                  <span className="font-medium">{stats.active_threads.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center">
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">規制IP数</h3>
                  <p className="text-2xl font-bold">{stats.banned_ip_count.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => router.push('/admin/bans')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  アクセス制限管理へ
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">最近の活動</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 text-blue-600 mr-3" />
                    <span>新規投稿</span>
                  </div>
                  <span className="text-sm text-gray-600">今日: {stats.today_posts}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-green-600 mr-3" />
                    <span>アクティブスレッド</span>
                  </div>
                  <span className="text-sm text-gray-600">24時間: {stats.active_threads}</span>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => router.push('/admin/stats')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  詳細な統計を表示
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 mb-4">クイックアクション</h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/admin/posts')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 text-blue-600 mr-3" />
                    <span>投稿管理</span>
                  </div>
                  <span className="text-sm text-gray-600">→</span>
                </button>
                <button
                  onClick={() => router.push('/admin/logs')}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600 mr-3" />
                    <span>エラーログ確認</span>
                  </div>
                  <span className="text-sm text-gray-600">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>データがありません</p>
        </div>
      )}
    </AdminLayout>
  );
}
