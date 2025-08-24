import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

type AlertVariant = 'error' | 'success' | 'warning' | 'info';

interface AlertProps {
  variant: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  showIcon?: boolean;
}

/**
 * アラートコンポーネント
 */
export default function Alert({
  variant,
  title,
  children,
  onClose,
  showIcon = true,
}: AlertProps) {
  // バリアントに基づくスタイルとアイコン
  const variantConfig = {
    error: {
      containerClass: 'bg-red-100 border-red-400 text-red-700',
      icon: <AlertCircle className="w-5 h-5" />,
    },
    success: {
      containerClass: 'bg-green-100 border-green-400 text-green-700',
      icon: <CheckCircle className="w-5 h-5" />,
    },
    warning: {
      containerClass: 'bg-yellow-100 border-yellow-400 text-yellow-700',
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    info: {
      containerClass: 'bg-blue-100 border-blue-400 text-blue-700',
      icon: <Info className="w-5 h-5" />,
    },
  };

  const { containerClass, icon } = variantConfig[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={`p-4 rounded-lg border mb-4 ${containerClass}`}
    >
      <div className="flex">
        {showIcon && <div className="flex-shrink-0 mr-3">{icon}</div>}
        <div className="flex-1">
          {title && <p className="font-bold">{title}</p>}
          <div className={title ? 'mt-1' : ''}>{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
