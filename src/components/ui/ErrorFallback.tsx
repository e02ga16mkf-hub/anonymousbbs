import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

/**
 * エラーバウンダリーのフォールバックコンポーネント
 */
export default function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg my-4">
      <div className="flex items-center mb-4">
        <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
        <h3 className="text-lg font-semibold text-red-700">エラーが発生しました</h3>
      </div>
      
      <p className="text-red-600 mb-4">
        コンポーネントの表示中に問題が発生しました。
      </p>
      
      <div className="bg-white p-3 rounded border border-red-200 mb-4 overflow-auto max-h-32">
        <code className="text-sm text-red-800">
          {error.message}
        </code>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          variant="primary"
          size="sm"
          icon={<RefreshCw className="w-4 h-4" />}
          onClick={resetErrorBoundary}
        >
          再試行
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          icon={<Home className="w-4 h-4" />}
          onClick={() => window.location.href = '/'}
        >
          トップページへ
        </Button>
      </div>
    </div>
  );
}
