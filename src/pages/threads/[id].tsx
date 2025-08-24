import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, Plus, RefreshCw } from 'lucide-react';
import Layout from '../../components/Layout';
import PostItem from '../../components/PostItem';
import CreatePostModal from '../../components/CreatePostModal';
import Button from '../../components/ui/Button';
import { Card, CardBody } from '../../components/ui/Card';
import Alert from '../../components/ui/Alert';
import Loading from '../../components/ui/Loading';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { formatTitle } from '../../lib/formatContent';
import { formatDate, getRelativeTimeString } from '../../lib/utils';
import { AUTO_REFRESH_INTERVAL } from '../../lib/constants';
import { Thread, Post } from '../../types';

export default function ThreadPage() {
  const router = useRouter();
  const { id } = router.query;
  const [thread, setThread] = useState<Thread | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);
  const [highlightedPost, setHighlightedPost] = useState<number | null>(null);
  const [newPosts, setNewPosts] = useState<number[]>([]);
  const postsContainerRef = useRef<HTMLDivElement>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchThread = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/threads/${id}`);
      
      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`);
      }
      
      const data = await response.json();
      setThread(data.thread);
      setPosts(data.posts);
      setLastRefreshTime(new Date());
    } catch (err) {
      console.error('Error fetching thread:', err);
      setError(err instanceof Error ? err.message : 'スレッド情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const refreshThread = useCallback(async (showLoadingIndicator = true) => {
    if (!id) return;
    
    if (showLoadingIndicator) {
      setRefreshing(true);
    }
    
    try {
      const response = await fetch(`/api/threads/${id}`);
      
      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 新しい投稿を検出
      const currentPostIds = new Set(posts.map(post => post.id));
      const newPostIds = data.posts
        .filter(post => !currentPostIds.has(post.id))
        .map(post => post.post_number);
      
      setThread(data.thread);
      setPosts(data.posts);
      setLastRefreshTime(new Date());
      
      if (newPostIds.length > 0) {
        setNewPosts(newPostIds);
        // 5秒後にハイライトを消す
        setTimeout(() => {
          setNewPosts([]);
        }, 5000);
      }
    } catch (err) {
      console.error('Error refreshing thread:', err);
      if (showLoadingIndicator) {
        setError(err instanceof Error ? err.message : '更新に失敗しました');
      }
    } finally {
      if (showLoadingIndicator) {
        setRefreshing(false);
      }
    }
  }, [id, posts]);

  // 初回読み込み
  useEffect(() => {
    if (id) {
      fetchThread();
    }
    
    // URLからアンカーを取得
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#post-')) {
        const postNumber = parseInt(hash.replace('#post-', ''));
        if (!isNaN(postNumber)) {
          setTimeout(() => {
            setHighlightedPost(postNumber);
            setTimeout(() => setHighlightedPost(null), 2000);
          }, 1000);
        }
      }
    }
  }, [id, fetchThread]);

  // 自動更新
  useEffect(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    
    if (autoRefresh && id) {
      refreshTimerRef.current = setInterval(() => {
        refreshThread(false);
      }, AUTO_REFRESH_INTERVAL);
    }
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, id, refreshThread]);

  const handleAnchorClick = useCallback((postNumber: number) => {
    setHighlightedPost(postNumber);
    
    // 対象の投稿にスクロール
    const targetElement = document.getElementById(`post-${postNumber}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // URLのハッシュを更新（ブラウザ履歴に影響しない）
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', `#post-${postNumber}`);
      }
      
      // ハイライト効果を2秒後に解除
      setTimeout(() => {
        setHighlightedPost(null);
      }, 2000);
    }
  }, []);

  const handlePostCreated = useCallback(() => {
    setShowCreateModal(false);
    refreshThread();
  }, [refreshThread]);

  if (loading) {
    return (
      <Layout title="読み込み中... | 匿名掲示板">
        <Loading text="スレッド情報を読み込み中..." />
      </Layout>
    );
  }

  if (!thread) {
    return (
      <Layout title="スレッドが見つかりません | 匿名掲示板">
        <div className="text-center py-12">
          <Alert variant="error" title="スレッドが見つかりません">
            <p>お探しのスレッドは存在しないか、削除された可能性があります。</p>
            <div className="mt-4">
              <Button variant="primary" onClick={() => router.push('/')}>
                板一覧に戻る
              </Button>
            </div>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${thread.title} | 匿名掲示板`}>
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
              { label: thread.board_name || '板', href: `/boards/${thread.board_id}` },
              { label: formatTitle(thread.title) }
            ]}
          />
          
          {/* スレッドヘッダー */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {formatTitle(thread.title)}
            </h1>
            
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  <span>{thread.post_count}レス</span>
                </span>
                {lastRefreshTime && (
                  <span className="text-xs text-gray-500">
                    最終更新: {formatDate(thread.updated_at)}（{getRelativeTimeString(thread.updated_at)}）
                  </span>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<ArrowLeft className="w-4 h-4" />}
                  onClick={() => router.push(`/boards/${thread.board_id}`)}
                >
                  戻る
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowCreateModal(true)}
                >
                  レス
                </Button>
              </div>
            </div>
          </div>

          {/* 操作パネル */}
          <Card className="mb-4">
            <CardBody className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={() => setAutoRefresh(!autoRefresh)}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">自動更新</span>
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                {lastRefreshTime && (
                  <span className="text-xs text-gray-500">
                    最終取得: {lastRefreshTime.toLocaleTimeString()}
                  </span>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<RefreshCw className="w-4 h-4" />}
                  onClick={() => refreshThread()}
                  isLoading={refreshing}
                >
                  更新
                </Button>
              </div>
            </CardBody>
          </Card>

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
                  onClick={() => refreshThread()}
                >
                  再試行
                </Button>
              </div>
            </Alert>
          )}

          {/* 投稿一覧 */}
          <div className="space-y-4" ref={postsContainerRef}>
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostItem
                  key={post.id}
                  post={post}
                  onAnchorClick={handleAnchorClick}
                  isHighlighted={highlightedPost === post.post_number}
                  isNew={newPosts.includes(post.post_number)}
                />
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>投稿がありません</p>
              </div>
            )}
          </div>
          
          {/* 下部の投稿ボタン */}
          <div className="flex justify-center mt-8">
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowCreateModal(true)}
            >
              レスを書き込む
            </Button>
          </div>
        </motion.div>

        {/* 投稿モーダル */}
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          threadId={parseInt(id as string)}
          onSuccess={handlePostCreated}
        />
      </div>
    </Layout>
  );
}