import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

export default function ServerError() {
  const router = useRouter();

  const handleRefresh = () => {
    router.reload();
  };

  return (
    <Layout title="サーバーエラー | 匿名掲示板">
      <div className="max-w-lg mx-auto text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-6">
            <AlertOctagon className="w-20 h-20 text-red-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            500 - サーバーエラー
          </h1>
          
          <p className="text-gray-600 mb-8">
            申し訳ありません。サーバーで問題が発生しました。<br />
            しばらく経ってから再度お試しください。
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              variant="primary"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={handleRefresh}
            >
              ページを再読み込み
            </Button>
            
            <Button
              variant="secondary"
              icon={<Home className="w-4 h-4" />}
              onClick={() => router.push('/')}
            >
              トップページへ
            </Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
