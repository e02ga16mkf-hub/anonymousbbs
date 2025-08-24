import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import Layout from '../components/Layout';
import BoardItem from '../components/BoardItem';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import { Board } from '../types';

export default function Home() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBoards = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/boards');
      
      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`);
      }
      
      const data = await response.json();
      setBoards(data.boards || []);
    } catch (err) {
      console.error('Error fetching boards:', err);
      setError(err instanceof Error ? err.message : '板情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  // カテゴリごとに板をグループ化
  const groupedBoards = boards.reduce((acc, board) => {
    if (!acc[board.category]) {
      acc[board.category] = [];
    }
    acc[board.category].push(board);
    return acc;
  }, {} as Record<string, Board[]>);

  // スケルトンローダー
  const SkeletonLoader = () => (
    <div className="space-y-8">
      {[1, 2, 3].map(category => (
        <div key={category}>
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map(board => (
              <div key={board} className="border border-gray-200 rounded-lg p-4">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3 animate-pulse"></div>
                <div className="flex items-center space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Layout title="板一覧 | 匿名掲示板">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              掲示板一覧
            </h1>
            
            <Button
              variant="outline"
              icon={<Search className="w-4 h-4" />}
              onClick={() => router.push('/search')}
            >
              スレッド検索
            </Button>
          </div>

          {error && (
            <Alert 
              variant="error" 
              title="エラー" 
              onClose={() => setError(null)}
            >
              <p>{error}</p>
              <div className="mt-2">
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={fetchBoards}
                >
                  再試行
                </Button>
              </div>
            </Alert>
          )}

          {loading ? (
            <SkeletonLoader />
          ) : boards.length === 0 && !error ? (
            <div className="text-center py-12">
              <p className="text-gray-500">板情報がありません</p>
            </div>
          ) : (
            Object.entries(groupedBoards).map(([category, categoryBoards], categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: categoryIndex * 0.1 }}
                className="mb-8"
              >
                <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b-2 border-gray-200 pb-2">
                  {category}
                </h2>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {categoryBoards.map((board, index) => (
                    <BoardItem 
                      key={board.id} 
                      board={board} 
                      index={index}
                      categoryIndex={categoryIndex}
                    />
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </Layout>
  );
}