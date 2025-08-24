import { useState } from 'react';
import Layout from '../components/Layout';

export default function DbTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runDbTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/db-test');
      const data = await response.json();
      
      setResult(data);
      
      if (!data.success) {
        setError(data.error || 'テストに失敗しました');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="データベーステスト | 匿名掲示板">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">データベーステスト</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <p className="mb-4">
            このページはSQLiteデータベースの接続とテーブル操作をテストします。
            「テスト実行」ボタンをクリックすると、以下の操作を行います：
          </p>
          
          <ul className="list-disc pl-6 mb-4">
            <li>データベース接続</li>
            <li>板一覧の取得</li>
            <li>テストスレッドの作成</li>
            <li>テスト投稿の作成</li>
            <li>作成したデータの取得と確認</li>
          </ul>
          
          <div className="flex justify-center">
            <button
              onClick={runDbTest}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'テスト実行中...' : 'テスト実行'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p className="font-bold">エラー</p>
            <p>{error}</p>
          </div>
        )}
        
        {result && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">テスト結果</h2>
            
            <div className="mb-4">
              <p className={`font-bold ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                {result.success ? '成功' : '失敗'}
              </p>
              <p>{result.message}</p>
            </div>
            
            {result.data && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">板一覧</h3>
                  <div className="bg-gray-50 p-4 rounded overflow-auto max-h-40">
                    <pre className="text-sm">{JSON.stringify(result.data.boards, null, 2)}</pre>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">作成したスレッド</h3>
                  <div className="bg-gray-50 p-4 rounded overflow-auto max-h-40">
                    <pre className="text-sm">{JSON.stringify(result.data.thread, null, 2)}</pre>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">作成した投稿</h3>
                  <div className="bg-gray-50 p-4 rounded overflow-auto max-h-40">
                    <pre className="text-sm">{JSON.stringify(result.data.posts, null, 2)}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}