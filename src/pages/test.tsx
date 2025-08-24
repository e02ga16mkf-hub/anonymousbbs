import { useState } from 'react';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Alert from '../components/ui/Alert';

/**
 * テストページ
 * 各種機能のテストと動作確認用
 */
export default function TestPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  // データベース接続テスト
  const testDatabase = async () => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      
      const response = await fetch('/api/health');
      const data = await response.json();
      
      if (data.status === 'ok') {
        setSuccessMessage(`データベース接続テスト成功: ${data.database}`);
        setTestResults(prev => ({ ...prev, database: true }));
      } else {
        throw new Error(`ステータス: ${data.status}`);
      }
    } catch (error) {
      setErrorMessage(`データベース接続テスト失敗: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTestResults(prev => ({ ...prev, database: false }));
    }
  };

  // 板一覧APIテスト
  const testBoardsApi = async () => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      
      const response = await fetch('/api/boards');
      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage(`板一覧API取得成功: ${data.data.boards.length}件の板を取得`);
        setTestResults(prev => ({ ...prev, boardsApi: true }));
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      setErrorMessage(`板一覧API取得失敗: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTestResults(prev => ({ ...prev, boardsApi: false }));
    }
  };

  // スレッド一覧APIテスト
  const testThreadsApi = async () => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      
      // 板IDを1と仮定
      const response = await fetch('/api/threads?board_id=1');
      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage(`スレッド一覧API取得成功: ${data.data.threads.length}件のスレッドを取得`);
        setTestResults(prev => ({ ...prev, threadsApi: true }));
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      setErrorMessage(`スレッド一覧API取得失敗: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTestResults(prev => ({ ...prev, threadsApi: false }));
    }
  };

  // エラーハンドリングテスト
  const testErrorHandling = () => {
    try {
      // 意図的にエラーを発生させる
      throw new Error('テスト用のエラー');
    } catch (error) {
      setErrorMessage(`エラーハンドリングテスト: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTestResults(prev => ({ ...prev, errorHandling: true }));
    }
  };

  // 全テスト実行
  const runAllTests = async () => {
    await testDatabase();
    await testBoardsApi();
    await testThreadsApi();
    testErrorHandling();
  };

  return (
    <Layout title="テストページ | 匿名掲示板">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          機能テストページ
        </h1>
        
        {errorMessage && (
          <Alert 
            variant="error" 
            title="エラー" 
            onClose={() => setErrorMessage(null)}
          >
            {errorMessage}
          </Alert>
        )}
        
        {successMessage && (
          <Alert 
            variant="success" 
            title="成功" 
            onClose={() => setSuccessMessage(null)}
          >
            {successMessage}
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>データベーステスト</CardHeader>
            <CardBody>
              <Button onClick={testDatabase} className="w-full">
                データベース接続テスト
              </Button>
              {testResults.database !== undefined && (
                <div className={`mt-2 text-sm ${testResults.database ? 'text-green-600' : 'text-red-600'}`}>
                  {testResults.database ? '✓ 成功' : '✗ 失敗'}
                </div>
              )}
            </CardBody>
          </Card>
          
          <Card>
            <CardHeader>API テスト</CardHeader>
            <CardBody className="space-y-3">
              <Button onClick={testBoardsApi} className="w-full">
                板一覧API テスト
              </Button>
              {testResults.boardsApi !== undefined && (
                <div className={`text-sm ${testResults.boardsApi ? 'text-green-600' : 'text-red-600'}`}>
                  {testResults.boardsApi ? '✓ 成功' : '✗ 失敗'}
                </div>
              )}
              
              <Button onClick={testThreadsApi} className="w-full">
                スレッド一覧API テスト
              </Button>
              {testResults.threadsApi !== undefined && (
                <div className={`text-sm ${testResults.threadsApi ? 'text-green-600' : 'text-red-600'}`}>
                  {testResults.threadsApi ? '✓ 成功' : '✗ 失敗'}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader>エラーハンドリングテスト</CardHeader>
          <CardBody>
            <Button onClick={testErrorHandling} variant="danger" className="w-full">
              エラー発生テスト
            </Button>
            {testResults.errorHandling !== undefined && (
              <div className={`mt-2 text-sm ${testResults.errorHandling ? 'text-green-600' : 'text-red-600'}`}>
                {testResults.errorHandling ? '✓ 成功' : '✗ 失敗'}
              </div>
            )}
          </CardBody>
        </Card>
        
        <div className="flex justify-center">
          <Button variant="primary" size="lg" onClick={runAllTests}>
            全テスト実行
          </Button>
        </div>
      </div>
    </Layout>
  );
}
