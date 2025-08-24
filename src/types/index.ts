/**
 * 板の型定義
 */
export interface Board {
  id: number;
  name: string;
  description: string;
  category: string;
  created_at: string;
  thread_count?: number;
  post_count?: number;
}

/**
 * スレッドの型定義
 */
export interface Thread {
  id: number;
  board_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  post_count: number;
  is_deleted: number;
  board_name?: string;
}

/**
 * 投稿の型定義
 */
export interface Post {
  id: number;
  thread_id: number;
  post_number: number;
  name: string;
  email: string;
  content: string;
  ip_hash?: string;
  created_at: string;
  is_deleted: number;
  deleted_reason?: string;
}

/**
 * スレッド作成リクエストの型定義
 */
export interface CreateThreadRequest {
  board_id: number;
  title: string;
  name?: string;
  email?: string;
  content: string;
}

/**
 * 投稿作成リクエストの型定義
 */
export interface CreatePostRequest {
  thread_id: number;
  name?: string;
  email?: string;
  content: string;
}

/**
 * APIレスポンスの型定義
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 板一覧レスポンスの型定義
 */
export interface BoardsResponse {
  boards: Board[];
}

/**
 * スレッド一覧レスポンスの型定義
 */
export interface ThreadsResponse {
  threads: Thread[];
}

/**
 * スレッド詳細レスポンスの型定義
 */
export interface ThreadDetailResponse {
  thread: Thread;
  posts: Post[];
}