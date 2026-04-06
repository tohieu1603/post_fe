import type { Post, Category, Tag, Pagination, SeoMeta, Author } from './types';

export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5445';

// revalidate: seconds to cache in Next.js App Router server components.
// Mutating requests (POST/PUT/DELETE) and client-side fetches ignore this
// because fetch() on the client doesn't use the Next.js cache layer.
const DEFAULT_REVALIDATE = 60; // 1 minute for public listing data

async function fetcher<T>(path: string, options?: RequestInit & { next?: NextFetchRequestConfig }): Promise<T> {
  const { next, ...restOptions } = options ?? {};

  // Only apply next cache config for GET requests (safe/idempotent).
  // POST/PUT/DELETE should never be cached.
  const method = (restOptions.method ?? 'GET').toUpperCase();
  const nextConfig = method === 'GET' && next === undefined
    ? { revalidate: DEFAULT_REVALIDATE }
    : next;

  const res = await fetch(`${API}${path}`, {
    ...restOptions,
    headers: { 'Content-Type': 'application/json', ...restOptions.headers },
    // next is a Next.js-specific fetch extension for server-side caching;
    // it is a no-op in browser environments so it's safe to always pass.
    ...(nextConfig !== undefined ? { next: nextConfig } : {}),
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

// --- Public API ---

export async function getFeatured(limit = 5) {
  return fetcher<{ success: boolean; data: Post[] }>(`/api/public/home/featured?limit=${limit}`);
}

export async function getLatest(limit = 20, page = 1) {
  return fetcher<{ success: boolean; data: Post[]; pagination: Pagination }>(
    `/api/public/home/latest?limit=${limit}&page=${page}`
  );
}

export async function getHomeSections(limit = 5) {
  return fetcher<{ success: boolean; data: { category: Category; posts: Post[] }[] }>(
    `/api/public/home/sections?limit=${limit}`
  );
}

export async function getCategoryPage(slug: string, limit = 10, page = 1) {
  return fetcher<{
    success: boolean;
    data: { category: Category; posts: Post[]; pagination: Pagination; seoPagination: any };
  }>(`/api/public/category/${slug}?limit=${limit}&page=${page}`);
}

export async function getPost(slug: string) {
  // Article content changes less frequently than listings; cache for 5 minutes
  return fetcher<{ success: boolean; data: Post; seo: SeoMeta }>(`/api/public/post/${slug}`, {
    next: { revalidate: 300 },
  });
}

export async function getRelatedPosts(slug: string, limit = 5) {
  return fetcher<{ success: boolean; data: Post[] }>(`/api/public/post/${slug}/related?limit=${limit}`);
}

export async function searchPosts(q: string, limit = 10, page = 1) {
  return fetcher<{ success: boolean; data: { query: string; posts: Post[]; pagination: Pagination } }>(
    `/api/public/search?q=${encodeURIComponent(q)}&limit=${limit}&page=${page}`
  );
}

export async function getSearchSuggestions(q: string, limit = 5) {
  return fetcher<{ success: boolean; data: { title: string; slug: string }[] }>(
    `/api/public/search/suggest?q=${encodeURIComponent(q)}&limit=${limit}`
  );
}

export async function getMostViewed(limit = 10) {
  return fetcher<{ success: boolean; data: Post[] }>(`/api/public/widget/most-viewed?limit=${limit}`);
}

export async function getTrendingTags(limit = 10) {
  return fetcher<{ success: boolean; data: Tag[] }>(`/api/public/widget/trending-tags?limit=${limit}`);
}

export async function getCategories() {
  return fetcher<{ success: boolean; data: Category[] }>('/api/public/widget/categories');
}

export async function getNavMenu() {
  // Nav menu changes very rarely; cache for 10 minutes server-side
  return fetcher<{ success: boolean; data: Category[] }>('/api/public/navigation/menu', {
    next: { revalidate: 600 },
  });
}

export async function trackEvent(body: { eventType: string; entityType: string; entitySlug?: string }) {
  return fetcher<{ success: boolean }>('/api/public/track', { method: 'POST', body: JSON.stringify(body) });
}

export async function getWeeklyDigest(limit = 50) {
  return fetcher<{
    success: boolean;
    data: {
      days: { date: string; label: string; posts: Post[] }[];
      total: number;
      from: string;
      to: string;
    };
  }>(`/api/public/weekly-digest?limit=${limit}`);
}

export async function getAuthorBySlug(slug: string) {
  return fetcher<Author>(`/api/authors/slug/${slug}`);
}

export async function getAuthorPosts(authorId: string, limit = 12) {
  // Uses the latest endpoint — replace with author-filtered endpoint when available
  return fetcher<{ success: boolean; data: Post[] }>(
    `/api/public/home/latest?limit=${limit}`
  );
}

// --- Auth API ---

export async function login(email: string, password: string) {
  return fetcher<{ user: any; accessToken: string; refreshToken: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(data: { name: string; email: string; password: string }) {
  return fetcher<{ user: any; accessToken: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// --- Bookmark API ---

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('accessToken') || localStorage.getItem('token')
    : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getBookmarks(page = 1, limit = 20) {
  return fetcher<{
    success: boolean;
    data: { id: string; post: Post; savedAt: string }[];
    pagination: Pagination;
  }>(`/api/bookmarks?page=${page}&limit=${limit}`, { headers: authHeaders() });
}

export async function addBookmark(postId: string) {
  return fetcher<{ success: boolean; data: { id: string; postId: string; savedAt: string } }>(
    '/api/bookmarks',
    { method: 'POST', body: JSON.stringify({ postId }), headers: authHeaders() }
  );
}

export async function removeBookmark(postId: string) {
  return fetcher<{ success: boolean }>(`/api/bookmarks/${postId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

export async function checkBookmark(postId: string) {
  return fetcher<{ success: boolean; data: { bookmarked: boolean } }>(
    `/api/bookmarks/check/${postId}`,
    { headers: authHeaders() }
  );
}

// --- Comments API ---

export async function getComments(postId: string, page = 1) {
  return fetcher<{ success: boolean; data: any[]; pagination: any }>(
    `/api/comments/${postId}?page=${page}&limit=20`
  );
}

export async function getCommentCount(postId: string) {
  return fetcher<{ success: boolean; count: number }>(
    `/api/comments/${postId}/count`
  );
}

export async function postComment(postId: string, content: string, parentId?: string) {
  return fetcher<{ success: boolean; data: any }>('/api/comments', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ postId, content, ...(parentId ? { parentId } : {}) }),
  });
}

export async function editComment(commentId: string, content: string) {
  return fetcher<{ success: boolean; data: any }>(`/api/comments/${commentId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ content }),
  });
}

export async function deleteComment(commentId: string) {
  return fetcher<{ success: boolean }>(`/api/comments/${commentId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
}

export async function toggleCommentLike(commentId: string) {
  return fetcher<{ success: boolean; liked: boolean; likesCount: number }>(`/api/comments/${commentId}/like`, {
    method: 'POST',
    headers: authHeaders(),
  });
}

// --- Chat API (streaming) ---

export async function* streamChat(
  messages: { role: string; content: string }[]
): AsyncGenerator<string, void, unknown> {
  const res = await fetch(`${API}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Chat failed' }));
    throw new Error(err.error || `Chat error: ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response stream');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        if (parsed.error) throw new Error(parsed.error);
        if (parsed.content) yield parsed.content;
      } catch (e: any) {
        if (e.message && !e.message.includes('JSON')) throw e;
      }
    }
  }
}
