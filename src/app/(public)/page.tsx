export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { NewsletterForm } from '@/components/newsletter-form';
import {
  getFeatured,
  getLatest,
  getHomeSections,
  getMostViewed,
  getTrendingTags,
} from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import type { Post, Tag } from '@/lib/types';

// ── Placeholder image for posts without coverImage ──────────────────────────
const PLACEHOLDER = 'https://placehold.co/800x450/e4f1e8/006c49?text=AI+Vietnam';
const AVATAR_PLACEHOLDER = 'https://placehold.co/40x40/e4f1e8/006c49?text=AV';

// ── Helper ───────────────────────────────────────────────────────────────────
function cover(post: Post) {
  return post.coverImage ?? PLACEHOLDER;
}

// ── Hero large card ──────────────────────────────────────────────────────────
function HeroMain({ post }: { post: Post }) {
  const author = post.authorInfo?.name ?? post.author;
  const avatar = post.authorInfo?.avatarUrl ?? AVATAR_PLACEHOLDER;
  const hasImage = !!post.coverImage;

  return (
    <Link
      href={`/bai-viet/${post.slug}`}
      className="lg:col-span-7 group relative overflow-hidden rounded-xl bg-surface-container-lowest block"
    >
      <div className="relative aspect-video overflow-hidden rounded-xl">
        {hasImage ? (
          <img
            src={post.coverImage!}
            alt={post.imageAlt ?? post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-800 via-emerald-600 to-teal-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-white/30 text-[120px]" style={{ fontVariationSettings: '"FILL" 1' }}>article</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {post.category && (
          <div className="absolute top-6 left-6">
            <span className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider">
              {post.category.name}
            </span>
          </div>
        )}
        <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8">
          <h1 className="text-white text-2xl md:text-4xl font-extrabold tracking-tight mb-3 md:mb-4 leading-tight line-clamp-3">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-slate-200 text-base md:text-lg mb-4 md:mb-6 line-clamp-2">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-3">
            <img
              src={avatar}
              alt={author ?? 'Tác giả'}
              className="w-10 h-10 rounded-full border-2 border-white/20 object-cover"
            />
            <div className="text-white text-sm">
              {author && <p className="font-bold">{author}</p>}
              <p className="opacity-70">{timeAgo(post.publishedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Hero skeleton ────────────────────────────────────────────────────────────
function HeroSkeleton() {
  return (
    <div className="lg:col-span-7 rounded-xl bg-surface-container-high animate-pulse aspect-video" />
  );
}

// ── Side small card ──────────────────────────────────────────────────────────
function HeroSideCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/bai-viet/${post.slug}`}
      className="flex gap-4 p-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors group"
    >
      <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 overflow-hidden rounded-lg">
        <img
          src={post.coverImage ?? PLACEHOLDER}
          alt={post.imageAlt ?? post.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>
      <div className="flex flex-col justify-between py-1 min-w-0">
        <div>
          {post.category && (
            <span className="text-tertiary font-bold text-xs uppercase tracking-widest mb-2 block">
              {post.category.name}
            </span>
          )}
          <h3 className="font-headline font-bold text-base md:text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
        </div>
        <p className="text-on-surface-variant text-sm">{timeAgo(post.publishedAt)}</p>
      </div>
    </Link>
  );
}

// ── Side small cards skeleton ────────────────────────────────────────────────
function SmallCardSkeleton() {
  return (
    <div className="flex gap-4 p-4 rounded-xl bg-surface-container-lowest animate-pulse">
      <div className="w-32 h-32 flex-shrink-0 rounded-lg bg-surface-container-high" />
      <div className="flex-1 space-y-3 py-1">
        <div className="h-3 bg-surface-container-high rounded w-1/3" />
        <div className="h-4 bg-surface-container-high rounded" />
        <div className="h-4 bg-surface-container-high rounded w-3/4" />
      </div>
    </div>
  );
}

// ── Section header ───────────────────────────────────────────────────────────
function SectionHeader({
  title,
  emoji,
  viewAllHref,
}: {
  title: string;
  emoji?: string;
  viewAllHref?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-5 md:mb-8">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
          {emoji && <span>{emoji}</span>}
          {title}
        </h2>
        <div className="h-[2px] w-12 bg-primary mt-1" />
      </div>
      {viewAllHref && (
        <Link href={viewAllHref} className="text-primary font-bold text-sm hover:underline">
          Xem tất cả
        </Link>
      )}
    </div>
  );
}

// ── Medium article card (Tin mới nhất / quick news) ──────────────────────────
function QuickNewsCard({ post }: { post: Post }) {
  return (
    <article className="group">
      <Link href={`/bai-viet/${post.slug}`} className="block">
        <div className="aspect-[3/2] rounded-xl overflow-hidden mb-4 bg-surface-container-high">
          <img
            src={post.coverImage ?? PLACEHOLDER}
            alt={post.imageAlt ?? post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
        <h4 className="font-bold text-base leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h4>
        <p className="text-on-surface-variant text-xs">{timeAgo(post.publishedAt)}</p>
      </Link>
    </article>
  );
}

// ── Category section article card ────────────────────────────────────────────
function CategoryCard({ post }: { post: Post }) {
  const author = post.authorInfo?.name ?? post.author;
  const avatar = post.authorInfo?.avatarUrl;
  return (
    <article className="bg-surface-container-lowest group rounded-xl overflow-hidden border border-outline-variant/20 hover:shadow-[0_16px_32px_-8px_rgba(0,108,73,0.08)] transition-all duration-300">
      <Link href={`/bai-viet/${post.slug}`}>
        <div className="aspect-video relative overflow-hidden">
          <img
            src={post.coverImage ?? PLACEHOLDER}
            alt={post.imageAlt ?? post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {post.category && (
            <span className="absolute top-4 left-4 bg-primary text-on-primary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
              {post.category.name}
            </span>
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
            {avatar ? (
              <img src={avatar} alt={author ?? ''} className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-base text-on-surface-variant">account_circle</span>
            )}
            {author && <span className="text-xs font-semibold text-on-surface">{author}</span>}
            {post.publishedAt && (
              <span className="text-xs text-on-surface-variant">• {timeAgo(post.publishedAt)}</span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

// ── Trending list item ───────────────────────────────────────────────────────
function TrendingItem({ post, rank }: { post: Post; rank: number }) {
  const num = String(rank).padStart(2, '0');
  return (
    <Link href={`/bai-viet/${post.slug}`} className="flex gap-6 group block">
      <span className="text-4xl md:text-5xl font-black text-outline-variant group-hover:text-tertiary-container transition-colors leading-none italic select-none">
        {num}
      </span>
      <div>
        {post.category && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-tertiary font-bold text-xs uppercase">
              {post.category.name}
            </span>
            <span className="text-on-surface-variant text-xs">• {timeAgo(post.publishedAt)}</span>
          </div>
        )}
        <h3 className="text-lg md:text-xl font-bold group-hover:text-primary transition-colors tracking-tight line-clamp-2">
          {post.title}
        </h3>
      </div>
    </Link>
  );
}

// ── Most-viewed widget ───────────────────────────────────────────────────────
function MostViewedWidget({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;
  return (
    <div className="bg-surface-container-high rounded-2xl p-5 md:p-8 sticky top-24">
      <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">auto_awesome</span>
        Đọc nhiều nhất
      </h3>
      <ul className="space-y-4">
        {posts.slice(0, 5).map((post) => (
          <li key={post._id} className="border-b border-outline-variant/30 pb-4 last:border-0">
            <Link
              href={`/bai-viet/${post.slug}`}
              className="font-medium hover:text-primary transition-colors line-clamp-2 text-sm"
            >
              {post.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Trending tags widget ─────────────────────────────────────────────────────
function TrendingTagsWidget({ tags }: { tags: Tag[] }) {
  if (!tags.length) return null;

  const TAG_COLORS = [
    'bg-emerald-100 text-emerald-800 hover:bg-emerald-500 hover:text-white',
    'bg-blue-100 text-blue-800 hover:bg-blue-500 hover:text-white',
    'bg-purple-100 text-purple-800 hover:bg-purple-500 hover:text-white',
    'bg-amber-100 text-amber-800 hover:bg-amber-500 hover:text-white',
    'bg-rose-100 text-rose-800 hover:bg-rose-500 hover:text-white',
    'bg-cyan-100 text-cyan-800 hover:bg-cyan-500 hover:text-white',
  ];

  return (
    <div className="bg-surface-container-high rounded-2xl p-5 md:p-8 mt-6">
      <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">tag</span>
        Tags nổi bật
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <Link
            key={tag._id}
            href={`/tag/${tag.slug}`}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${TAG_COLORS[i % TAG_COLORS.length]}`}
          >
            #{tag.name}
            {tag.postCount ? (
              <span className="ml-1 text-xs opacity-60">({tag.postCount})</span>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────
function EmptySection({ label }: { label: string }) {
  return (
    <p className="text-on-surface-variant text-sm py-8 text-center">
      Chưa có bài viết trong mục {label}.
    </p>
  );
}

// ── Main page (server component) ─────────────────────────────────────────────
export default async function HomePage() {
  // Fetch all data in parallel; gracefully handle individual failures
  const [featuredRes, latestRes, sectionsRes, mostViewedRes, tagsRes] = await Promise.allSettled([
    getFeatured(4),
    getLatest(8),
    getHomeSections(6),
    getMostViewed(5),
    getTrendingTags(12),
  ]);

  const featured = featuredRes.status === 'fulfilled' ? featuredRes.value.data ?? [] : [];
  const latest = latestRes.status === 'fulfilled' ? latestRes.value.data ?? [] : [];
  const sections = sectionsRes.status === 'fulfilled' ? sectionsRes.value.data ?? [] : [];
  const mostViewed = mostViewedRes.status === 'fulfilled' ? mostViewedRes.value.data ?? [] : [];
  const trendingTags = tagsRes.status === 'fulfilled' ? tagsRes.value.data ?? [] : [];

  const heroMain = featured[0] ?? null;
  const heroSide = featured.slice(1, 4);

  return (
    <>
      <main className="mt-20 md:mt-28 px-4 md:px-8 max-w-7xl mx-auto">

        {/* ── Hero Section ──────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-12 md:mb-20">
          {/* Featured large */}
          {heroMain ? (
            <HeroMain post={heroMain} />
          ) : (
            <HeroSkeleton />
          )}

          {/* Featured side list */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {heroSide.length > 0
              ? heroSide.map((post) => (
                  <HeroSideCard key={post._id} post={post} />
                ))
              : [0, 1, 2].map((i) => <SmallCardSkeleton key={i} />)
            }
          </div>
        </section>

        {/* ── Section: Tin mới nhất ─────────────────────────────────── */}
        <section className="mb-12 md:mb-20">
          <SectionHeader
            title="Tin mới nhất"
            emoji="🔥"
            viewAllHref="/chuyen-muc/tin-nhanh"
          />
          {latest.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {latest.slice(0, 4).map((post) => (
                <QuickNewsCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <EmptySection label="Tin mới nhất" />
          )}
        </section>

        {/* ── Top 2 category sections (skip test cats, only show those with posts) */}
        {sections
          .filter(({ posts, category }) => posts.length > 0 && !category.slug.startsWith('test') && !category.slug.startsWith('check'))
          .slice(0, 2)
          .map(({ category, posts }) => (
          <section key={category._id} className="mb-12 md:mb-20">
            <SectionHeader
              title={category.name}
              viewAllHref={`/chuyen-muc/${category.slug}`}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {posts.slice(0, 3).map((post) => (
                <CategoryCard key={post._id} post={post} />
              ))}
            </div>
          </section>
        ))}

        {/* ── Newsletter ────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl py-10 md:py-16 px-4 md:px-8 text-center mb-12 md:mb-20 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 tracking-tight">
            Nhận bản tin AI chất lượng mỗi ngày
          </h2>
          <p className="text-emerald-100/80 mb-6 md:mb-10 max-w-lg mx-auto">
            Hơn 50,000 độc giả đã đăng ký để không bỏ lỡ bất kỳ xu hướng trí tuệ nhân tạo quan trọng nào.
          </p>
          <NewsletterForm />
        </section>

        {/* ── Trending + Sidebar ────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 mb-12 md:mb-20">
          {/* Trending list */}
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 mb-5 md:mb-8">
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Xu hướng thị trường</h2>
            </div>
            {latest.length > 0 ? (
              <div className="space-y-8">
                {latest.slice(0, 6).map((post, i) => (
                  <TrendingItem key={post._id} post={post} rank={i + 1} />
                ))}
              </div>
            ) : (
              <EmptySection label="xu hướng" />
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <MostViewedWidget posts={mostViewed} />
            <TrendingTagsWidget tags={trendingTags} />
          </div>
        </section>

      </main>

      {/* Chat support FAB */}
      <div className="fixed bottom-5 right-4 md:bottom-8 md:right-8 z-[100]">
        <Link href="/ai-chat" className="bg-emerald-600 dark:bg-emerald-500 w-16 h-16 rounded-full flex items-center justify-center shadow-[0_16px_32px_-8px_rgba(0,108,73,0.3)] hover:scale-110 hover:brightness-110 transition-all group cursor-pointer relative">
          <span
            className="material-symbols-outlined text-white text-3xl"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            chat
          </span>
        </Link>
      </div>
    </>
  );
}
