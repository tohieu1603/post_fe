import type { Post, Category, Tag, Pagination, SeoMeta, Author } from './types';

export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5445';

async function fetcher<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
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
  return fetcher<{ success: boolean; data: Post; seo: SeoMeta }>(`/api/public/post/${slug}`);
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
  return fetcher<{ success: boolean; data: Category[] }>('/api/public/navigation/menu');
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
