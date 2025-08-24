import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <Layout title="ページが見つかりません | 匿名掲示板">
      <div className="max-w-lg mx-auto text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-6">
            <AlertTriangle className="w-20 h-20 text-yellow-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            404 - ページが見つかりません
          </h1>
          
          <p className="text-gray-600 mb-8">
            お探しのページは存在しないか、削除された可能性があります。<br />
            URLが正しいかご確認ください。
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              variant="primary"
              icon={<Home className="w-4 h-4" />}
              onClick={() => router.push('/')}
            >
              トップページへ
            </Button>
            
            <Button
              variant="secondary"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => router.back()}
            >
              前のページへ戻る
            </Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
