import Link from 'next/link';
import Image from 'next/image';
import { getCategoryPage, getMostViewed } from '@/lib/api';
import { Pagination } from '@/components/pagination';
import { timeAgo, readingTimeText } from '@/lib/utils';
import type { Post } from '@/lib/types';

export interface StaticCategoryPageProps {
  slug: string;
  title: string;
  description: string;
  icon: string;
}

// ── Sidebar: Most Viewed ──────────────────────────────────────────────────────
function PopularWidget({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;
  return (
    <div className="bg-surface-container-low p-5 md:p-8 rounded-2xl border border-outline-variant/30 shadow-sm">
      <h4 className="text-xl font-bold text-on-surface mb-8 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">trending_up</span>
        Phổ biến nhất
      </h4>
      <div className="space-y-8">
        {posts.slice(0, 5).map((post, i) => (
          <Link key={post._id} href={`/bai-viet/${post.slug}`} className="flex gap-4 group cursor-pointer">
            <span className="text-4xl font-extrabold text-outline-variant leading-none group-hover:text-primary transition-colors shrink-0">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div>
              <h5 className="text-sm font-bold text-on-surface line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                {post.title}
              </h5>
              <p className="text-xs text-slate-400 mt-1">{timeAgo(post.publishedAt)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Post Card ─────────────────────────────────────────────────────────────────
function PostCard({ post }: { post: Post }) {
  return (
    <article className="bg-surface-container-lowest group rounded-xl overflow-hidden border border-outline-variant/20 hover:shadow-[0_16px_32px_-8px_rgba(0,108,73,0.08)] transition-all duration-300">
      <Link href={`/bai-viet/${post.slug}`}>
        <div className="aspect-video relative overflow-hidden">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.imageAlt ?? post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-outline-variant">image</span>
            </div>
          )}
          {post.category && (
            <div className="absolute top-4 left-4 bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
              {post.category.name}
            </div>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-lg font-bold text-on-surface leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-on-surface-variant mt-2 line-clamp-2">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-2 mt-5">
            {post.authorInfo?.avatarUrl ? (
              <Image
                src={post.authorInfo.avatarUrl}
                alt={post.authorInfo.name}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <span className="material-symbols-outlined text-base text-on-surface-variant">account_circle</span>
            )}
            <span className="text-xs font-semibold text-on-surface">
              {post.authorInfo?.name ?? post.author ?? 'AI Vietnam'}
            </span>
            {post.publishedAt && (
              <span className="text-xs text-slate-400">• {timeAgo(post.publishedAt)}</span>
            )}
            {post.readingTime && (
              <span className="text-xs text-slate-400">• {readingTimeText(post.readingTime)}</span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default async function StaticCategoryPage({
  slug,
  title,
  description,
  icon,
  page = 1,
}: StaticCategoryPageProps & { page?: number }) {
  const LIMIT = 9;

  const [categoryRes, mostViewedRes] = await Promise.allSettled([
    getCategoryPage(slug, LIMIT, page),
    getMostViewed(5),
  ]);

  const posts =
    categoryRes.status === 'fulfilled' ? (categoryRes.value.data.posts ?? []) : [];
  const pagination =
    categoryRes.status === 'fulfilled' ? categoryRes.value.data.pagination : null;
  const mostViewed =
    mostViewedRes.status === 'fulfilled' ? (mostViewedRes.value.data ?? []) : [];

  const basePath = `/${slug}`;

  return (
    <main className="pt-20 md:pt-32 pb-12 md:pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 font-inter text-sm text-on-surface-variant mb-6">
        <Link className="hover:text-primary transition-colors" href="/">Trang chủ</Link>
        <span className="material-symbols-outlined text-xs">chevron_right</span>
        <span className="text-on-surface-variant font-medium">{title}</span>
      </nav>

      {/* Heading Section */}
      <div className="mb-8 md:mb-12">
        <div className="flex items-center gap-3 mb-2">
          <span
            className="material-symbols-outlined text-3xl md:text-4xl text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold text-on-background tracking-tight">
            {title}
          </h1>
        </div>
        <p className="text-base md:text-lg text-on-surface-variant mt-1 md:mt-2 max-w-2xl">
          {description}
        </p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 md:gap-12">
        {/* Left: Article Grid */}
        <div className="lg:col-span-7">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">article</span>
              <h2 className="text-xl font-bold text-on-surface mb-2">Chưa có bài viết nào</h2>
              <p className="text-on-surface-variant text-sm">
                Chuyên mục này chưa có bài viết. Hãy quay lại sau nhé!
              </p>
              <Link
                href="/"
                className="mt-6 bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold hover:brightness-110 transition-all"
              >
                Về trang chủ
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-16 flex justify-center items-center gap-2">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    basePath={basePath}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Sidebar */}
        <aside className="lg:col-span-3 space-y-10">
          <PopularWidget posts={mostViewed} />

          {/* Ask AI CTA */}
          <div className="p-1 rounded-2xl bg-gradient-to-br from-primary to-primary-container shadow-lg">
            <Link
              href="/ai-chat"
              className="w-full bg-surface-container-lowest py-6 px-4 rounded-[14px] flex flex-col items-center text-center group hover:bg-emerald-50 transition-colors"
            >
              <span
                className="material-symbols-outlined text-4xl text-primary mb-3 group-hover:scale-110 transition-transform"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                chat
              </span>
              <span className="text-lg font-bold text-on-surface">Đặt câu hỏi cho AI trợ lý</span>
              <p className="text-xs text-on-surface-variant mt-2">
                Nhận giải đáp về mọi ứng dụng AI ngay lập tức
              </p>
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
