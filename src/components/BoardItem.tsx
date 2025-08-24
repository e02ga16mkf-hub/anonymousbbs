import { memo } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { MessageSquare, Users } from 'lucide-react';
import { Card, CardBody } from './ui/Card';
import { Board } from '../types';

interface BoardItemProps {
  board: Board;
  index: number;
  categoryIndex: number;
}

/**
 * 板一覧アイテムコンポーネント
 */
function BoardItem({ board, index, categoryIndex }: BoardItemProps) {
  const router = useRouter();
  
  const handleClick = () => {
    router.push(`/boards/${board.id}`);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: categoryIndex * 0.1 + index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        hover
        onClick={handleClick}
      >
        <CardBody>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {board.name}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {board.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <MessageSquare className="w-4 h-4 mr-1" />
              <span>{board.thread_count || 0}スレッド</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{board.post_count || 0}投稿</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}

// メモ化してパフォーマンス最適化
export default memo(BoardItem, (prevProps, nextProps) => {
  // 板IDとスレッド数、投稿数が同じ場合は再レンダリングしない
  return (
    prevProps.board.id === nextProps.board.id &&
    prevProps.board.thread_count === nextProps.board.thread_count &&
    prevProps.board.post_count === nextProps.board.post_count
  );
});
