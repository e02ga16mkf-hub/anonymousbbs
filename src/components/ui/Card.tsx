import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * カードコンポーネント
 */
export function Card({ children, className = '', hover = false, onClick }: CardProps) {
  const baseClasses = 'bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-200';
  const hoverClasses = hover ? 'hover:border-blue-300 hover:shadow-md' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  const cardComponent = (
    <div 
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
  
  // クリック可能な場合はモーションエフェクトを追加
  if (onClick) {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }
  
  return cardComponent;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`p-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }: CardBodyProps) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`p-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
}
