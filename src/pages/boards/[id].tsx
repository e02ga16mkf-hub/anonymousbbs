import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import Layout from '../../components/Layout';
import ThreadItem from '../../components/ThreadItem';
import CreateThreadModal from '../../components/CreateThreadModal';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Loading from '../../components/ui/Loading';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { Thread, Board } from '../../types';

export default function BoardPage() {
  const router = useRouter();
  const { id } = router.query;
  const [board, setBoard] = useState<Board | null>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [threadCreated, setThreadCreated] = useState(false);

  const fetchThreads = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/threads?board_id=${id}`);
      
      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`);
      }
      
      const data = await response.json();
      setThreads(data.threads || []);
      
      if (data.threads.length > 0) {
        setBoard({
          id: parseInt(id as string),
          name: data.threads[0].board_name,
          description: '',
          category: '',
          created_at: ''
        });
      } else {
        // スレッドがない場合は板情報を別途取得
        const boardResponse = await fetch(`/api/boards/${id}`);
        const boardData = await boardResponse.json();
        
        if (boardData.board) {
          setBoard(boardData.board);
        }
      }
    } catch (err) {
      console.error('Error fetching threads:', err);
      setError(err instanceof Error ? err.message : 'スレッド一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchThreads();
    }
  }, [id, fetchThreads]);

  const handleThreadCreated = useCallback(() => {
    setShowCreateModal(false);
    setThreadCreated(true);
    fetchThreads();
    
    // 5秒後に成功メッセージを非表示
    setTimeout(() => {
      setThreadCreated(false);
    }, 5000);
  }, [fetchThreads]);

  if (loading) {
    return (
      <Layout title="読み込み中... | 匿名掲示板">
        <Loading text="スレッド一覧を読み込み中..." />
      </Layout>
    );
  }

  return (
    <Layout title={`${board?.name || '板'} - スレッド一覧 | 匿名掲示板`}>
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
              { label: board?.name || '板' }
            ]}
          />
          
          {/* ヘッダー */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {board?.name ? `${board.name} - スレッド一覧` : 'スレッド一覧'}
              </h1>
              {board?.description && (
                <p className="text-gray-600 mt-1">{board.description}</p>
              )}
            </div>
            
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowCreateModal(true)}
            >
              スレッド作成
            </Button>
          </div>

          {/* 成功メッセージ */}
          {threadCreated && (
            <Alert 
              variant="success" 
              title="スレッド作成完了"
              onClose={() => setThreadCreated(false)}
            >
              新しいスレッドが作成されました！
            </Alert>
          )}

          {/* エラーメッセージ */}
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
                  onClick={fetchThreads}
                >
                  再試行
                </Button>
              </div>
            </Alert>
          )}

          {/* スレッド一覧 */}
          {threads.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-block p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                  </svg>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">まだスレッドがありません</h3>
                  <p className="text-gray-500 mb-4">最初のスレッドを作成してみましょう</p>
                  <Button
                    variant="primary"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => setShowCreateModal(true)}
                  >
                    スレッド作成
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {threads.map((thread, index) => (
                <ThreadItem 
                  key={thread.id} 
                  thread={thread} 
                  index={index} 
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* スレッド作成モーダル */}
        <CreateThreadModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          boardId={parseInt(id as string)}
          onSuccess={handleThreadCreated}
        />
      </div>
    </Layout>
  );
}