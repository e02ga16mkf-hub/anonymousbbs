import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Search as SearchIcon, Filter, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import ThreadItem from '../components/ThreadItem';
import Button from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import Breadcrumb from '../components/ui/Breadcrumb';
import { Thread } from '../types';

export default function SearchPage() {
  const router = useRouter();
  const { q: initialQuery, board_id: initialBoardId } = router.query;
  
  const [query, setQuery] = useState<string>(initialQuery as string || '');
  const [boardId, setBoardId] = useState<string>(initialBoardId as string || '');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [boards, setBoards] = useState<{id: number; name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 板一覧を取得
  const fetchBoards = useCallback(async () => {
    try {
      const response = await fetch('/api/boards');
      if (!response.ok) throw new Error('板一覧の取得に失敗しました');
      
      const data = await response.json();
      setBoards(data.boards || []);
    } catch (err) {
      console.error('Error fetching boards:', err);
    }
  }, []);

  // 初期表示時に板一覧を取得
  useState(() => {
    fetchBoards();
    
    // URLにクエリパラメータがある場合は検索を実行
    if (initialQuery) {
      handleSearch();
    }
  });

  // 検索実行
  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      setError('検索キーワードを入力してください');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // URLのクエリパラメータを更新
      const params = new URLSearchParams();
      params.set('q', query);
      if (boardId) params.set('board_id', boardId);
      
      router.replace({
        pathname: '/search',
        query: params.toString()
      }, undefined, { shallow: true });
      
      // 検索APIを呼び出す（実際のAPIはまだ実装されていないため、ダミーデータを返す）
      // TODO: 実際の検索APIを実装する
      await new Promise(resolve => setTimeout(resolve, 1000)); // 検索の遅延をシミュレート
      
      // ダミーデータ
      const dummyThreads: Thread[] = [
        {
          id: 1,
          board_id: 1,
          board_name: '雑談',
          title: `「${query}」に関する雑談スレ`,
          post_count: 15,
          ip_hash: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          board_id: 2,
          board_name: 'ニュース',
          title: `【速報】${query}についての最新情報`,
          post_count: 42,
          ip_hash: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setThreads(dummyThreads);
      setSearched(true);
    } catch (err) {
      console.error('Error searching threads:', err);
      setError('検索中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [query, boardId, router]);

  return (
    <Layout title="スレッド検索 | 匿名掲示板">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* パンくずリスト */}
          <Breadcrumb
            className="mb-4"
            items={[
              { label: '板一覧', href: '/' },
              { label: 'スレッド検索' }
            ]}
          />
          
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            スレッド検索
          </h1>
          
          {/* 検索フォーム */}
          <Card className="mb-6">
            <CardBody>
              <div className="space-y-4">
                <div>
                  <label className="form-label">
                    キーワード
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="検索キーワードを入力"
                      className="form-input rounded-r-none"
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button
                      variant="primary"
                      icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
                      onClick={handleSearch}
                      disabled={loading || !query.trim()}
                      className="rounded-l-none"
                    >
                      検索
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="form-label flex items-center">
                    <Filter className="w-4 h-4 mr-1" />
                    板で絞り込み
                  </label>
                  <select
                    value={boardId}
                    onChange={(e) => setBoardId(e.target.value)}
                    className="form-input"
                  >
                    <option value="">すべての板</option>
                    {boards.map(board => (
                      <option key={board.id} value={board.id}>
                        {board.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardBody>
          </Card>
          
          {/* エラーメッセージ */}
          {error && (
            <Alert 
              variant="error" 
              title="エラー" 
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}
          
          {/* 検索結果 */}
          {searched && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">
                検索結果: {threads.length}件
              </h2>
              
              {threads.length > 0 ? (
                threads.map((thread, index) => (
                  <ThreadItem 
                    key={thread.id} 
                    thread={thread} 
                    index={index} 
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">検索条件に一致するスレッドはありませんでした</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}