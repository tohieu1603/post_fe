export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { getWeeklyDigest } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import type { Post } from '@/lib/types';

const PLACEHOLDER = 'https://placehold.co/800x450/e4f1e8/006c49?text=AI+Vietnam';

function PostCard({ post }: { post: Post }) {
  const author = (post as any).authorInfo?.name ?? post.author ?? 'AI Vietnam';
  const avatar = (post as any).authorInfo?.avatarUrl;
  const category = (post as any).category;

  return (
    <Link
      href={`/bai-viet/${post.slug}`}
      className="group flex gap-4 md:gap-6 p-4 rounded-xl hover:bg-surface-container-low transition-colors"
    >
      <div className="w-24 h-24 md:w-40 md:h-28 rounded-lg overflow-hidden shrink-0">
        <img
          src={post.coverImage || PLACEHOLDER}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="flex-1 min-w-0">
        {category && (
          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{category.name}</span>
        )}
        <h3 className="text-base md:text-lg font-bold text-on-surface leading-snug line-clamp-2 group-hover:text-primary transition-colors mt-1">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-on-surface-variant line-clamp-1 mt-1 hidden md:block">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-2 mt-2 text-xs text-on-surface-variant">
          {avatar ? (
            <img src={avatar} alt={author} className="w-5 h-5 rounded-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-sm">account_circle</span>
          )}
          <span className="font-medium">{author}</span>
          {post.publishedAt && (
            <>
              <span className="w-1 h-1 bg-outline-variant rounded-full" />
              <span>{timeAgo(post.publishedAt)}</span>
            </>
          )}
          {(post.viewCount ?? 0) > 0 && (
            <>
              <span className="w-1 h-1 bg-outline-variant rounded-full" />
              <span>{post.viewCount?.toLocaleString('vi-VN')} views</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

export default async function WeeklyDigestPage() {
  let days: { date: string; label: string; posts: Post[] }[] = [];
  let total = 0;
  let error: string | null = null;

  try {
    const res = await getWeeklyDigest(50);
    days = res.data?.days ?? [];
    total = res.data?.total ?? 0;
  } catch (e) {
    error = e instanceof Error ? e.message : 'Không thể tải dữ liệu';
  }

  return (
    <main className="pt-24 md:pt-28 pb-20 px-4 md:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-3xl text-primary" style={{ fontVariationSettings: '"FILL" 1' }}>
            calendar_month
          </span>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-on-surface">Tuần Qua</h1>
        </div>
        <p className="text-on-surface-variant font-medium">
          Tổng hợp {total} bài viết trong 7 ngày gần nhất
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-4 block">error</span>
          <p className="text-on-surface-variant">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!error && days.length === 0 && (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant/40 mb-4 block">inbox</span>
          <h2 className="text-xl font-bold text-on-surface mb-2">Chưa có bài viết nào trong tuần</h2>
          <Link href="/" className="text-primary font-bold hover:underline">Về trang chủ</Link>
        </div>
      )}

      {/* Timeline by day */}
      {!error && days.length > 0 && (
        <div className="space-y-10">
          {days.map((day) => (
            <section key={day.date}>
              {/* Day header */}
              <div className="flex items-center gap-3 mb-4 sticky top-20 bg-surface/90 backdrop-blur-sm py-2 z-10">
                <div className="w-3 h-3 rounded-full bg-primary shrink-0" />
                <h2 className="text-lg font-bold text-on-surface">{day.label}</h2>
                <span className="text-sm text-on-surface-variant">({day.posts.length} bài)</span>
                <div className="flex-1 h-px bg-outline-variant/30" />
              </div>

              {/* Posts */}
              <div className="space-y-1 ml-1.5 pl-5 border-l-2 border-outline-variant/20">
                {day.posts.map((post) => (
                  <PostCard key={(post as any)._id || post.slug} post={post} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
