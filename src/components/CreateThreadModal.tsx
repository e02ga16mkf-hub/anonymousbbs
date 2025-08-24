import { useState } from 'react';
import { Send } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Alert from './ui/Alert';

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: number;
  onSuccess: () => void;
}

/**
 * スレッド作成モーダルコンポーネント
 */
export default function CreateThreadModal({ isOpen, onClose, boardId, onSuccess }: CreateThreadModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    email: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // フォームリセット
  const resetForm = () => {
    setFormData({
      title: '',
      name: '',
      email: '',
      content: ''
    });
    setError('');
    setSuccess(false);
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
      const response = await fetch('/api/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          board_id: boardId,
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
      title="新しいスレッドを作成"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-4 sm:p-6">
        {error && (
          <Alert variant="error" title="エラー" onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" title="作成完了">
            スレッドが作成されました！
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <label className="form-label">
              スレッドタイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="form-input"
              placeholder="スレッドのタイトルを入力"
              maxLength={50}
              required
              disabled={loading || success}
            />
            <p className="form-helper">
              {formData.title.length}/50文字
            </p>
          </div>

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
            <label className="form-label">
              本文 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              className="form-input h-32 resize-none"
              placeholder="投稿内容を入力してください"
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
            disabled={loading || success || !formData.title || !formData.content}
            isLoading={loading}
          >
            {success ? '作成完了' : '作成する'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}