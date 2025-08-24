import { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { CheckCircle, Circle } from 'lucide-react';

interface TestItem {
  id: string;
  description: string;
  checked: boolean;
  category: string;
}

/**
 * 実装確認ページ
 * 機能の動作確認用チェックリスト
 */
export default function ConfirmationPage() {
  const [testItems, setTestItems] = useState<TestItem[]>([
    // 基本機能
    { id: 'board-list', description: '板一覧が表示される', checked: false, category: '基本機能' },
    { id: 'thread-list', description: '板をクリックするとスレッド一覧が表示される', checked: false, category: '基本機能' },
    { id: 'thread-detail', description: 'スレッドをクリックすると投稿一覧が表示される', checked: false, category: '基本機能' },
    { id: 'create-thread', description: 'スレッド作成ボタンからスレッドを作成できる', checked: false, category: '基本機能' },
    { id: 'create-post', description: 'レスボタンから投稿を作成できる', checked: false, category: '基本機能' },
    
    // UI/UX
    { id: 'responsive', description: 'スマートフォンでも正しく表示される', checked: false, category: 'UI/UX' },
    { id: 'animations', description: 'アニメーションが正しく動作する', checked: false, category: 'UI/UX' },
    { id: 'loading', description: 'ローディング状態が表示される', checked: false, category: 'UI/UX' },
    { id: 'error-handling', description: 'エラーメッセージが適切に表示される', checked: false, category: 'UI/UX' },
    { id: 'breadcrumb', description: 'パンくずナビゲーションが機能する', checked: false, category: 'UI/UX' },
    
    // 投稿機能
    { id: 'auto-link', description: 'URLが自動的にリンクになる', checked: false, category: '投稿機能' },
    { id: 'anchor', description: '>>1 形式のアンカーが機能する', checked: false, category: '投稿機能' },
    { id: 'newlines', description: '改行が正しく表示される', checked: false, category: '投稿機能' },
    { id: 'validation', description: 'フォームバリデーションが機能する', checked: false, category: '投稿機能' },
    { id: 'auto-refresh', description: '自動更新機能が動作する', checked: false, category: '投稿機能' },
    
    // ブラウザ互換性
    { id: 'chrome', description: 'Google Chromeで正常に動作する', checked: false, category: 'ブラウザ互換性' },
    { id: 'firefox', description: 'Firefoxで正常に動作する', checked: false, category: 'ブラウザ互換性' },
    { id: 'safari', description: 'Safariで正常に動作する', checked: false, category: 'ブラウザ互換性' },
    { id: 'edge', description: 'Microsoft Edgeで正常に動作する', checked: false, category: 'ブラウザ互換性' },
    
    // エラー処理
    { id: '404-handling', description: '存在しないページで404が表示される', checked: false, category: 'エラー処理' },
    { id: 'invalid-input', description: '不正な入力値が適切に処理される', checked: false, category: 'エラー処理' },
    { id: 'network-error', description: 'ネットワークエラーが適切に処理される', checked: false, category: 'エラー処理' },
  ]);
  
  const [showSuccess, setShowSuccess] = useState(false);
  
  // アイテムのチェック状態を切り替える
  const toggleItem = (id: string) => {
    setTestItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };
  
  // カテゴリでグループ化
  const groupedItems = testItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, TestItem[]>);
  
  // 全てのアイテムをチェック/アンチェックする
  const toggleAll = (checked: boolean) => {
    setTestItems(prev => prev.map(item => ({ ...item, checked })));
  };
  
  // 進捗状況を計算
  const checkedCount = testItems.filter(item => item.checked).length;
  const totalCount = testItems.length;
  const progress = Math.round((checkedCount / totalCount) * 100);
  
  // 確認完了
  const handleConfirmation = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <Layout title="実装確認 | 匿名掲示板">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            実装確認チェックリスト
          </h1>
          
          {showSuccess && (
            <Alert 
              variant="success" 
              title="確認完了" 
              onClose={() => setShowSuccess(false)}
            >
              確認結果が保存されました！
            </Alert>
          )}
          
          {/* 進捗バー */}
          <Card className="mb-6">
            <CardBody>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">進捗状況</span>
                <span className="text-sm font-medium text-gray-700">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-4">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => toggleAll(true)}
                >
                  全てチェック
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => toggleAll(false)}
                >
                  全てクリア
                </Button>
              </div>
            </CardBody>
          </Card>
          
          {/* チェックリスト */}
          {Object.entries(groupedItems).map(([category, items]) => (
            <Card key={category} className="mb-6">
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-800">{category}</h2>
              </CardHeader>
              <CardBody>
                <ul className="space-y-3">
                  {items.map(item => (
                    <li key={item.id}>
                      <button
                        className={`flex items-center w-full text-left p-2 rounded-md hover:bg-gray-50 transition-colors ${
                          item.checked ? 'bg-green-50' : ''
                        }`}
                        onClick={() => toggleItem(item.id)}
                      >
                        <span className="flex-shrink-0 mr-3">
                          {item.checked ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-300" />
                          )}
                        </span>
                        <span className={item.checked ? 'text-gray-700 font-medium' : 'text-gray-600'}>
                          {item.description}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ))}
          
          {/* 確認ボタン */}
          <div className="flex justify-center mt-8">
            <Button
              variant="primary"
              size="lg"
              onClick={handleConfirmation}
              disabled={checkedCount === 0}
            >
              確認完了
            </Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}