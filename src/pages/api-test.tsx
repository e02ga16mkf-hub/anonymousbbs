import { useState } from 'react';
import Layout from '../components/Layout';
import { Board, BoardsResponse } from '../types';

export default function ApiTest() {
  const [loading, setLoading] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchBoards = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/boards');
      
      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`);
      }
      
      const data = await response.json() as BoardsResponse;
      setBoards(data.boards || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="API テスト | 匿名掲示板">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">API テスト</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">板一覧 API</h2>
          <p className="mb-4">
            このテストでは、<code className="bg-gray-100 px-2 py-1 rounded">/api/boards</code> エンドポイントを呼び出して板一覧を取得します。
          </p>
          
          <div className="flex justify-center">
            <button
              onClick={fetchBoards}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '取得中...' : '板一覧を取得'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-bold">エラー</p>
            <p>{error}</p>
          </div>
        )}
        
        {boards.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">板一覧</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名前</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">説明</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">カテゴリ</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">スレッド数</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">投稿数</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {boards.map((board) => (
                    <tr key={board.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{board.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{board.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{board.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{board.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{board.thread_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{board.post_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}