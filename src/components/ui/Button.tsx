import React from 'react';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
}

/**
 * 汎用ボタンコンポーネント
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  // バリアントに基づくスタイル
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300',
    secondary: 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 focus:ring-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-300',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-300',
    outline: 'bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-50 focus:ring-blue-300',
  };
  
  // サイズに基づくスタイル
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };
  
  // ローディングスピナー
  const spinner = (
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
  );
  
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={disabled || isLoading ? {} : { scale: 1.02 }}
      className={`
        rounded-md font-medium transition-all duration-200 flex items-center justify-center
        focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && spinner}
      {!isLoading && icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      {children}
      {!isLoading && icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </motion.button>
  );
}
