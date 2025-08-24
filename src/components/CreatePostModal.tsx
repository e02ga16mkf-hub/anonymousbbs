import { useState } from 'react';
import { Send, HelpCircle } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Alert from './ui/Alert';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  threadId: number;
  onSuccess: () => void;
}

/**
 * 投稿作成モーダルコンポーネント
 */
export default function CreatePostModal({ isOpen, onClose, threadId, onSuccess }: CreatePostModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // フォームリセット
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      content: ''
    });
    setError('');
    setSuccess(false);
    setShowHelp(false);
  };

  // モーダルを閉じる
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thread_id: threadId,
          ...formData
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'エラーが発生しました');
      }

      setSuccess(true);
      
      // 少し待ってからモーダルを閉じる
      setTimeout(() => {
        resetForm();
        onSuccess();
      }, 1500);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // フィールド変更ハンドラ
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="レスを投稿"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-4 sm:p-6">
        {error && (
          <Alert variant="error" title="エラー" onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" title="投稿完了">
            投稿が完了しました！
          </Alert>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                名前
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="form-input"
                placeholder="名無しさん"
                maxLength={20}
                disabled={loading || success}
              />
            </div>
            <div>
              <label className="form-label">
                メール
              </label>
              <input
                type="text"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="form-input"
                placeholder="sage"
                disabled={loading || success}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="form-label">
                本文 <span className="text-red-500">*</span>
              </label>
              <Button
                variant="outline"
                size="sm"
                icon={<HelpCircle className="w-4 h-4" />}
                onClick={() => setShowHelp(!showHelp)}
                type="button"
              >
                アンカーの使い方
              </Button>
            </div>
            
            {showHelp && (
              <Alert variant="info" title="アンカーの使い方" onClose={() => setShowHelp(false)}>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li><code>&gt;&gt;1</code> と入力すると1番の投稿へのリンクになります</li>
                  <li>リンクをクリックすると対象の投稿にスクロールします</li>
                  <li>URLも自動的にリンクになります</li>
                </ul>
              </Alert>
            )}
            
            <textarea
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              className="form-input h-32 resize-none"
              placeholder="投稿内容を入力してください&#10;&#10;>>1 のようにアンカーを付けることができます"
              maxLength={1000}
              required
              disabled={loading || success}
            />
            <p className="form-helper">
              {formData.content.length}/1000文字
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            キャンセル
          </Button>
          <Button
            variant="primary"
            type="submit"
            icon={<Send className="w-4 h-4" />}
            disabled={loading || success || !formData.content}
            isLoading={loading}
          >
            {success ? '投稿完了' : '投稿する'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}