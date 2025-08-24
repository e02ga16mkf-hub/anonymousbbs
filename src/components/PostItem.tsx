import { useState, useEffect, memo } from 'react';
import { motion } from 'framer-motion';
import { formatContent } from '../lib/formatContent';
import { formatDate, getRelativeTimeString } from '../lib/utils';
import { Card, CardBody } from './ui/Card';
import { Post } from '../types';

interface PostItemProps {
  post: Post;
  onAnchorClick?: (postNumber: number) => void;
  isHighlighted?: boolean;
  isNew?: boolean;
}

/**
 * 投稿表示コンポーネント
 */
function PostItem({ 
  post, 
  onAnchorClick, 
  isHighlighted = false,
  isNew = false
}: PostItemProps) {
  const [formattedContent, setFormattedContent] = useState('');
  const [relativeTime, setRelativeTime] = useState('');
  
  useEffect(() => {
    // 投稿内容のフォーマット
    setFormattedContent(formatContent(post.content));
    
    // 相対時間の設定
    setRelativeTime(getRelativeTimeString(post.created_at));
    
    // 1分ごとに相対時間を更新
    const intervalId = setInterval(() => {
      setRelativeTime(getRelativeTimeString(post.created_at));
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [post.content, post.created_at]);
  
  useEffect(() => {
    // アンカークリックイベントの追加
    const postElement = document.getElementById(`post-${post.post_number}`);
    if (postElement) {
      const anchorLinks = postElement.querySelectorAll('a[data-post-number]');
      const handleAnchorClick = (e: Event) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLElement;
        const postNumber = parseInt(target.getAttribute('data-post-number') || '0');
        if (postNumber > 0 && onAnchorClick) {
          onAnchorClick(postNumber);
        } else {
          // デフォルトの動作（アンカーへのスクロール）
          const targetId = (target as HTMLAnchorElement).getAttribute('href');
          if (targetId) {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
              targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // ハイライト効果
              targetElement.classList.add('bg-yellow-100');
              setTimeout(() => {
                targetElement.classList.remove('bg-yellow-100');
              }, 2000);
            }
          }
        }
      };
      
      anchorLinks.forEach(link => {
        link.addEventListener('click', handleAnchorClick);
      });
      
      return () => {
        anchorLinks.forEach(link => {
          link.removeEventListener('click', handleAnchorClick);
        });
      };
    }
  }, [post.post_number, onAnchorClick, formattedContent]);

  return (
    <motion.div
      id={`post-${post.post_number}`}
      initial={isNew ? { opacity: 0, y: -20 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 500, 
        damping: 30,
        duration: 0.3 
      }}
      className={isHighlighted ? 'animate-pulse' : ''}
    >
      <Card className={`transition-colors duration-500 ${isHighlighted ? 'bg-yellow-50 border-yellow-300' : ''}`}>
        <CardBody>
          <div className="flex flex-wrap items-center justify-between mb-3 text-sm text-gray-500 gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {post.post_number}
              </span>
              <span className="font-medium text-gray-700">
                {post.name || '名無しさん'}
              </span>
              {post.email && (
                <span className="text-gray-500">
                  [{post.email}]
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm bg-gray-100 px-2 py-0.5 rounded" title={formatDate(post.created_at, true, true)}>
                {relativeTime}
              </span>
              <span className="text-xs text-gray-400 hidden sm:inline">
                ID:{post.ip_hash?.substring(0, 8) || 'unknown'}
              </span>
            </div>
          </div>
          
          <div 
            className="text-gray-900 break-words whitespace-pre-line"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        </CardBody>
      </Card>
    </motion.div>
  );
}

// メモ化してパフォーマンス最適化
export default memo(PostItem, (prevProps, nextProps) => {
  // 投稿内容が同じで、ハイライト状態も同じ場合は再レンダリングしない
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.isHighlighted === nextProps.isHighlighted &&
    prevProps.isNew === nextProps.isNew
  );
});