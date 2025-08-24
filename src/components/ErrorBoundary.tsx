import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorFallback from './ui/ErrorFallback';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * エラーバウンダリーコンポーネント
 * 子コンポーネントでエラーが発生した場合にフォールバックUIを表示する
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // エラーログをサーバーに送信する（実装例）
    // fetch('/api/error-log', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ error: error.toString(), errorInfo: errorInfo.componentStack })
    // }).catch(console.error);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // カスタムフォールバックUIが提供されている場合はそれを使用
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // デフォルトのフォールバックUI
      return (
        <ErrorFallback 
          error={this.state.error || new Error('不明なエラー')} 
          resetErrorBoundary={this.handleReset} 
        />
      );
    }

    return this.props.children;
  }
}