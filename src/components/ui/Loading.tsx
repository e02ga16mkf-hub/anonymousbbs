import React from 'react';
import { motion } from 'framer-motion';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

/**
 * ローディングスピナーコンポーネント
 */
export default function Loading({
  size = 'md',
  text,
  fullScreen = false,
  className = '',
}: LoadingProps) {
  // サイズに基づくスタイル
  const sizeConfig = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  const spinner = (
    <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeConfig[size]} ${className}`} />
  );

  // フルスクリーンモード
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 z-50 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {spinner}
          {text && <p className="mt-4 text-gray-600 text-center">{text}</p>}
        </motion.div>
      </div>
    );
  }

  // 通常モード
  return (
    <div className="flex flex-col items-center justify-center py-8">
      {spinner}
      {text && <p className="mt-2 text-gray-600 text-sm">{text}</p>}
    </div>
  );
}
