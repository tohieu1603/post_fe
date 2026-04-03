'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getBookmarks, removeBookmark } from '@/lib/api';
import type { Post } from '@/lib/types';

interface BookmarkItem {
  id: string;
  post: Post;
  savedAt: string;
}

const PLACEHOLDER = 'https://placehold.co/800x450/e4f1e8/006c49?text=AI+Vietnam';

const ACCOUNT_TABS = [
  { label: 'Thông tin', href: '/tai-khoan' },
  { label: 'Bài đã lưu', href: '/tai-khoan/da-luu' },
  { label: 'Token', href: '/tai-khoan/nap-token' },
];

export default function BookmarksPage() {
  const pathname = usePathname();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in before calling API
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) {
      setError('Vui lòng đăng nhập để xem bài đã lưu.');
      setLoading(false);
      return;
    }
    fetchBookmarks();
  }, []);

  async function fetchBookmarks() {
    try {
      setLoading(true);
      const res = await getBookmarks();
      setBookmarks(res.data || []);
    } catch (err: any) {
      if (err?.message?.includes('401')) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        setError('Không thể tải danh sách. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(postId: string) {
    setRemoving(postId);
    try {
      await removeBookmark(postId);
      setBookmarks((prev) => prev.filter((b) => (b.post as any)?._id !== postId));
    } catch {
      alert('Không thể bỏ lưu bài viết.');
    } finally {
      setRemoving(null);
    }
  }

  return (
    <main className="pt-20 min-h-screen">
      {/* Tab navigation */}
      <div className="border-b border-outline-variant/30 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-6 md:gap-8 overflow-x-auto no-scrollbar">
          {ACCOUNT_TABS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={`pb-3 font-medium whitespace-nowrap transition-colors ${
                pathname === href
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {label}
            </Link>
          ))}
          <span className="pb-3 text-on-surface-variant font-medium whitespace-nowrap cursor-default opacity-50">Lịch sử</span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-10">
          <div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-on-surface leading-tight">Bài đã lưu</h1>
            <p className="text-on-surface-variant font-medium mt-1">
              {loading ? '...' : `${bookmarks.length} bài viết trong thư viện của bạn`}
            </p>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4 block">lock</span>
            <p className="text-on-surface-variant">{error}</p>
            <Link href="/dang-nhap" className="mt-4 inline-block px-6 py-3 min-h-[44px] bg-primary text-white rounded-lg font-bold">
              Đăng nhập
            </Link>
          </div>
        )}

        {/* Loading state */}
        {loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-container-lowest rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-video bg-surface-container-high" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-surface-container-high rounded w-20" />
                  <div className="h-6 bg-surface-container-high rounded w-3/4" />
                  <div className="h-4 bg-surface-container-high rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && bookmarks.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/40 mb-4 block">bookmark</span>
            <h2 className="text-xl font-bold text-on-surface mb-2">Chưa có bài viết nào được lưu</h2>
            <p className="text-on-surface-variant mb-6">Nhấn biểu tượng bookmark trên bài viết để lưu lại đọc sau.</p>
            <Link href="/" className="inline-block px-6 py-3 min-h-[44px] bg-primary text-white rounded-lg font-bold">
              Khám phá bài viết
            </Link>
          </div>
        )}

        {/* Content grid */}
        {!loading && !error && bookmarks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {bookmarks.map((item) => {
              const post = item.post;
              if (!post) return null;
              const postId = (post as any)._id || (post as any).id;

              return (
                <article
                  key={item.id}
                  className="group relative bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-[0_16px_32px_-8px_rgba(0,108,73,0.08)] hover:-translate-y-1 transition-all duration-300"
                >
                  <Link href={`/bai-viet/${post.slug}`} className="block">
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        src={post.coverImage || PLACEHOLDER}
                        alt={post.title}
                      />
                      {(post as any).category && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                            {(post as any).category.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Remove bookmark button */}
                  <button
                    onClick={() => handleRemove(postId)}
                    disabled={removing === postId}
                    className="absolute top-3 right-3 z-10 w-11 h-11 bg-primary rounded-full flex items-center justify-center text-on-primary shadow-lg hover:bg-error transition-colors"
                    title="Bỏ lưu"
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {removing === postId ? 'hourglass_empty' : 'bookmark'}
                    </span>
                  </button>

                  <div className="p-6">
                    <Link href={`/bai-viet/${post.slug}`}>
                      <h3 className="text-xl font-bold leading-snug text-on-surface mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                    </Link>
                    <p className="text-on-surface-variant text-sm line-clamp-2 mb-6">{post.excerpt}</p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/10">
                      <span className="text-xs font-semibold text-on-surface-variant">
                        {post.author || (post as any).authorInfo?.name}
                      </span>
                      <span className="text-[10px] font-medium text-on-surface-variant">
                        {new Date(item.savedAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
