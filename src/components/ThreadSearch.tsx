import { useState } from 'react';
import { useRouter } from 'next/router';
import { Search } from 'lucide-react';

interface ThreadSearchProps {
  boardId?: number;
}

export default function ThreadSearch({ boardId }: ThreadSearchProps) {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyword.trim()) return;
    
    setIsSearching(true);
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('keyword', keyword);
      
      if (boardId) {
        queryParams.append('board_id', boardId.toString());
      }
      
      router.push(`/search?${queryParams.toString()}`);
    } catch (error) {
      console.error('検索エラー:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md">
      <div className="relative flex-grow">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="スレッド検索..."
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={50}
        />
      </div>
      <button
        type="submit"
        disabled={isSearching || !keyword.trim()}
        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isSearching ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
        ) : (
          <Search className="w-4 h-4" />
        )}
      </button>
    </form>
  );
}
