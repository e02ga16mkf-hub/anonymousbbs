import { memo } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { MessageSquare, Clock } from 'lucide-react';
import { formatTitle } from '../lib/formatContent';
import { getRelativeTimeString } from '../lib/utils';
import { Card, CardBody } from './ui/Card';
import { Thread } from '../types';

interface ThreadItemProps {
  thread: Thread;
  index: number;
}

/**
 * スレッド一覧アイテムコンポーネント
 */
function ThreadItem({ thread, index }: ThreadItemProps) {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(`/threads/${thread.id}`);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card 
        hover 
        onClick={handleClick}
      >
        <CardBody>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {formatTitle(thread.title)}
              </h3>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  <span>{thread.post_count}レス</span>
                </div>
                <div className="flex items-center" title={new Date(thread.updated_at).toLocaleString()}>
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{getRelativeTimeString(thread.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

// メモ化してパフォーマンス最適化
export default memo(ThreadItem, (prevProps, nextProps) => {
  // スレッドIDと更新日時が同じ場合は再レンダリングしない
  return (
    prevProps.thread.id === nextProps.thread.id &&
    prevProps.thread.updated_at === nextProps.thread.updated_at
  );
});
