'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Post, Pagination } from '@/lib/types';
import { getSearchSuggestions } from '@/lib/api';
import { timeAgo, readingTimeText } from '@/lib/utils';

interface SearchResultsClientProps {
  initialQuery: string;
  initialPage: number;
  posts: Post[];
  pagination: Pagination | null;
  mostViewed: Post[];
}

function SearchPagination({ currentPage, totalPages, query }: { currentPage: number; totalPages: number; query: string }) {
  if (totalPages <= 1) return null;
  const makeHref = (p: number) => `/tim-kiem?q=${encodeURIComponent(query)}&page=${p}`;
  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }
  return (
    <nav className="flex items-center justify-center gap-2 mt-16" aria-label="Phân trang">
      {currentPage > 1 && (
        <Link href={makeHref(currentPage - 1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-high text-on-surface font-bold hover:bg-primary-container hover:text-white transition-colors">
          <span className="material-symbols-outlined">chevron_left</span>
        </Link>
      )}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="w-10 h-10 flex items-center justify-center text-on-surface-variant text-sm">...</span>
        ) : (
          <Link
            key={p}
            href={makeHref(p as number)}
            className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm transition-colors ${
              p === currentPage ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface hover:bg-primary-container hover:text-white'
            }`}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link href={makeHref(currentPage + 1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-container-high text-on-surface font-bold hover:bg-primary-container hover:text-white transition-colors">
          <span className="material-symbols-outlined">chevron_right</span>
        </Link>
      )}
    </nav>
  );
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={i}
        style={{ backgroundColor: '#fde68a', padding: '0 2px', borderRadius: '2px' }}
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export function SearchResultsClient({
  initialQuery,
  posts,
  pagination,
  mostViewed,
}: SearchResultsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<{ title: string; slug: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await getSearchSuggestions(q, 5);
      setSuggestions(res.data);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
    setShowSuggestions(true);
  };

  const handleSearch = (q?: string) => {
    const term = (q ?? query).trim();
    if (!term) return;
    setShowSuggestions(false);
    router.push(`/tim-kiem?q=${encodeURIComponent(term)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
    if (e.key === 'Escape') setShowSuggestions(false);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.parentElement?.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const currentQ = searchParams.get('q') ?? initialQuery;

  return (
    <main className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content Area */}
        <div className="lg:col-span-8">
          {/* Search Header */}
          <div className="mb-8">
            {currentQ ? (
              <>
                <h1 className="text-xl md:text-3xl font-black tracking-tight text-on-background mb-2">
                  Kết quả tìm kiếm cho &ldquo;{currentQ}&rdquo;
                </h1>
                <p className="text-on-surface-variant font-medium">
                  {pagination ? `${pagination.total} kết quả` : '0 kết quả'}
                </p>
              </>
            ) : (
              <h1 className="text-xl md:text-3xl font-black tracking-tight text-on-background mb-2">Tìm kiếm</h1>
            )}
          </div>

          {/* Search Input */}
          <div className="mb-8 relative" ref={inputRef as React.RefObject<HTMLDivElement>}>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                search
              </span>
              <input
                ref={inputRef}
                className="w-full pl-10 pr-4 py-2 bg-surface-container-high border-none rounded-xl focus:ring-2 focus:ring-primary text-on-surface font-medium outline-none"
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                placeholder="Tìm kiếm bài viết..."
                autoComplete="off"
              />
            </div>

            {/* Autocomplete Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-lowest border border-outline-variant/20 rounded-xl shadow-lg z-50 overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s.slug}
                    className="w-full text-left px-4 py-3 text-sm text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-3"
                    onMouseDown={() => {
                      setQuery(s.title);
                      handleSearch(s.title);
                    }}
                  >
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">search</span>
                    {s.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results */}
          {!currentQ ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">search</span>
              <h2 className="text-xl font-bold text-on-surface mb-2">Nhập từ khóa để tìm kiếm</h2>
              <p className="text-on-surface-variant text-sm">Tìm kiếm bài viết, hướng dẫn và nhiều nội dung khác.</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">search_off</span>
              <h2 className="text-xl font-bold text-on-surface mb-2">Không tìm thấy kết quả</h2>
              <p className="text-on-surface-variant text-sm mb-6">
                Không có bài viết nào phù hợp với &ldquo;{currentQ}&rdquo;. Thử từ khóa khác nhé!
              </p>
              <Link
                href="/"
                className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold hover:brightness-110 transition-all"
              >
                Về trang chủ
              </Link>
            </div>
          ) : (
            <>
              {/* Results List */}
              <div className="space-y-8">
                {posts.map((post) => (
                  <article
                    key={post._id}
                    className="group flex flex-col md:flex-row gap-6 p-4 rounded-2xl transition-all duration-300 hover:bg-surface-container-lowest hover:shadow-[0_16px_32px_-8px_rgba(0,108,73,0.08)]"
                  >
                    <Link
                      href={`/bai-viet/${post.slug}`}
                      className="w-full aspect-video md:w-[120px] md:aspect-auto md:h-[120px] rounded-xl overflow-hidden shrink-0 block"
                    >
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.imageAlt ?? post.title}
                          width={120}
                          height={120}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                          <span className="material-symbols-outlined text-3xl text-outline-variant">image</span>
                        </div>
                      )}
                    </Link>
                    <div className="flex-1">
                      <Link href={`/bai-viet/${post.slug}`}>
                        <h2 className="text-base md:text-xl font-bold text-on-surface leading-tight mb-2 hover:text-primary transition-colors">
                          {highlightText(post.title, currentQ)}
                        </h2>
                      </Link>
                      {post.excerpt && (
                        <p className="text-on-surface-variant text-sm line-clamp-3 mb-4">
                          {highlightText(post.excerpt, currentQ)}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-on-surface-variant">
                        {post.category && (
                          <span className="px-2 py-1 bg-secondary-container text-on-secondary-container rounded-md uppercase tracking-wider text-[10px] font-black">
                            {post.category.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">person</span>
                          {post.authorInfo?.name ?? post.author ?? 'AI Vietnam'}
                        </span>
                        {post.publishedAt && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                            {timeAgo(post.publishedAt)}
                          </span>
                        )}
                        {post.readingTime && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">schedule</span>
                            {readingTimeText(post.readingTime)}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <SearchPagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  query={currentQ}
                />
              )}
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-10">
          {/* Chưa tìm thấy? */}
          <div className="bg-surface-container-low p-5 md:p-8 rounded-3xl text-center">
            <h3 className="text-xl font-bold mb-4">Chưa tìm thấy thứ bạn cần?</h3>
            <p className="text-sm text-on-surface-variant mb-6 leading-relaxed">
              Hãy để AI của chúng tôi giúp bạn tổng hợp thông tin chính xác nhất
              {currentQ ? ` về ${currentQ}` : ''}.
            </p>
            <button className="w-full py-4 px-6 bg-gradient-to-br from-primary to-primary-container text-white font-black rounded-xl shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>smart_toy</span>
              HỎI AI NGAY
            </button>
          </div>

          {/* Phổ biến nhất */}
          {mostViewed.length > 0 && (
            <section>
              <h3 className="text-lg font-black text-on-surface mb-6 uppercase tracking-widest flex items-center gap-2">
                <span className="w-8 h-px bg-primary inline-block" />
                Phổ biến nhất
              </h3>
              <div className="space-y-6">
                {mostViewed.map((post, i) => (
                  <div key={post._id} className="flex items-center gap-4">
                    <span className="text-3xl font-black text-outline-variant shrink-0">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <Link
                      href={`/bai-viet/${post.slug}`}
                      className="font-bold text-on-surface hover:text-primary transition-colors line-clamp-1 text-sm"
                    >
                      {post.title}
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Bản tin AI hàng tuần */}
          <div className="p-6 bg-tertiary-container/10 border border-tertiary-container/20 rounded-2xl">
            <h4 className="font-bold text-on-tertiary-container mb-2">Bản tin AI hàng tuần</h4>
            <p className="text-xs text-on-surface-variant mb-4">
              Cập nhật những công nghệ AI mới nhất trực tiếp vào hộp thư của bạn.
            </p>
            <div className="flex flex-col xs:flex-row gap-2">
              <input
                className="flex-1 bg-surface-container-lowest border-none rounded-lg text-xs py-2 px-3 outline-none"
                placeholder="Email của bạn"
                type="email"
              />
              <button className="w-full xs:w-auto px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:brightness-110 transition-all">
                Đăng ký
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
