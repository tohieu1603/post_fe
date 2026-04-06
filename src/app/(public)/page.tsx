export const revalidate = 60;

import Link from 'next/link';
import { NewsletterForm } from '@/components/newsletter-form';
import { getFeatured, getLatest, getHomeSections, getMostViewed } from '@/lib/api';
import { timeAgo } from '@/lib/utils';
import type { Post } from '@/lib/types';

const PLACEHOLDER = 'https://placehold.co/800x450/e4f1e8/006c49?text=AI+Vietnam';

function cover(post: Post) {
  return post.coverImage ?? PLACEHOLDER;
}

// ── Top story (VnExpress style: image left + title/excerpt right) ───────────
function TopStory({ post }: { post: Post }) {
  const author = post.authorInfo?.name ?? post.author;
  return (
    <div className="mb-5 border-b border-outline-variant/20 pb-5">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Image left ~50% */}
        <Link href={`/bai-viet/${post.slug}`} className="md:w-[50%] flex-shrink-0 block img-zoom rounded-lg">
          <img
            src={cover(post)}
            alt={post.imageAlt ?? post.title}
            className="w-full h-auto md:h-[350px] object-cover"
          />
        </Link>
        {/* Title + excerpt right ~50% */}
        <div className="flex-1 min-w-0">
          <Link href={`/bai-viet/${post.slug}`} className="group block">
            <h1 className="text-xl md:text-2xl font-bold text-on-surface leading-tight mb-3 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
              {post.title}
            </h1>
          </Link>
          {post.excerpt && (
            <p className="text-sm text-on-surface-variant leading-relaxed mb-3 line-clamp-4">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            {author && <span className="font-medium text-on-surface">{author}</span>}
            {author && <span>·</span>}
            <span>{timeAgo(post.publishedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Left column: article feed item ──────────────────────────────────────────
function FeedArticle({ post }: { post: Post }) {
  const author = post.authorInfo?.name ?? post.author;
  return (
    <article className="border-b border-outline-variant/20 py-4 last:border-0 card-hover rounded-lg px-2 -mx-2">
      <Link href={`/bai-viet/${post.slug}`} className="group block">
        <h2 className="text-base font-bold text-on-surface leading-snug mb-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
          {post.title}
        </h2>
        <div className="flex gap-3">
          {post.excerpt && (
            <p className="flex-1 text-sm text-on-surface-variant leading-relaxed line-clamp-3 min-w-0">
              {post.excerpt}
            </p>
          )}
          <div className="w-[120px] sm:w-[150px] h-[80px] sm:h-[95px] flex-shrink-0 img-zoom rounded-lg">
            <img
              src={cover(post)}
              alt={post.imageAlt ?? post.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-on-surface-variant">
          {post.category && (
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{post.category.name}</span>
          )}
          {post.category && <span>·</span>}
          {author && <span>{author}</span>}
          {author && <span>·</span>}
          <span>{timeAgo(post.publishedAt)}</span>
        </div>
      </Link>
    </article>
  );
}

// ── Right column: category block ─────────────────────────────────────────────
function CategoryBlock({ category, posts }: { category: { name: string; slug: string; _id?: string }; posts: Post[] }) {
  if (!posts.length) return null;
  const [main, ...bullets] = posts;

  return (
    <div className="mb-6 border-b border-outline-variant/20 pb-6 last:border-0 last:pb-0">
      {/* Category heading */}
      <div className="mb-3">
        <Link
          href={`/chuyen-muc/${category.slug}`}
          className="inline font-bold text-sm text-on-surface uppercase tracking-wide border-b-2 border-emerald-600 pb-0.5 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
        >
          {category.name}
        </Link>
      </div>

      {/* Main article: image + title + excerpt */}
      <Link href={`/bai-viet/${main.slug}`} className="group block mb-3">
        <div className="w-full h-[160px] img-zoom rounded mb-2">
          <img
            src={cover(main)}
            alt={main.imageAlt ?? main.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <h3 className="text-sm font-bold text-on-surface leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors mb-1">
          {main.title}
        </h3>
        {main.excerpt && (
          <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">{main.excerpt}</p>
        )}
      </Link>

      {/* Bullet articles */}
      {bullets.slice(0, 3).map((post) => (
        <Link key={post._id} href={`/bai-viet/${post.slug}`} className="group flex items-start gap-2 py-1.5 border-t border-outline-variant/10">
          <span className="text-emerald-600 font-black text-base leading-none mt-0.5 select-none">•</span>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-on-surface group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors leading-snug line-clamp-2">
              {post.title}
            </span>
            <span className="block text-[10px] text-on-surface-variant mt-0.5">{timeAgo(post.publishedAt)}</span>
          </div>
        </Link>
      ))}

      {/* View all */}
      <Link
        href={`/chuyen-muc/${category.slug}`}
        className="inline-block mt-2 text-xs text-emerald-700 dark:text-emerald-400 hover:underline"
      >
        Xem tất cả →
      </Link>
    </div>
  );
}

// ── Xem nhiều: grid 4 cột, numbered, compact ────────────────────────────────
function MostViewedSection({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;
  return (
    <section className="mb-8">
      <h2 className="text-xl font-black text-on-surface mb-5">Xem nhiều</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {posts.slice(0, 8).map((post, i) => (
          <Link
            key={post._id}
            href={`/bai-viet/${post.slug}`}
            className="group bg-surface-container-lowest rounded-xl overflow-hidden card-hover"
          >
            <div className="w-full h-[140px] img-zoom">
              <img src={cover(post)} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
            </div>
            <div className="p-4 flex items-start gap-3">
              <span className="text-2xl font-black text-emerald-600/30 leading-none select-none shrink-0 group-hover:text-emerald-600 transition-colors">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-on-surface leading-snug line-clamp-2 group-hover:text-emerald-700 transition-colors">
                  {post.title}
                </p>
                {post.excerpt && (
                  <p className="text-xs text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                )}
                <p className="text-[10px] text-on-surface-variant/70 mt-1.5">{timeAgo(post.publishedAt)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── Video Shorts section — horizontal cards like VnExpress VNE-GO ────────────
function VideoShortsSection({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-on-surface">Video & Shorts</h2>
        <Link href="/tuan-qua" className="text-sm text-emerald-600 font-semibold hover:underline">Xem tất cả →</Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {posts.slice(0, 5).map((post) => (
          <Link
            key={post._id}
            href={`/bai-viet/${post.slug}`}
            className="group relative rounded-lg overflow-hidden bg-slate-900 aspect-[4/3]"
          >
            <img src={cover(post)} alt={post.title} className="w-full h-full object-cover opacity-85 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            {post.category && (
              <span className="absolute top-2 left-2 text-[8px] font-bold text-white uppercase tracking-wider bg-emerald-600/90 px-1.5 py-0.5 rounded">
                {post.category.name}
              </span>
            )}
            {/* Play icon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined text-white text-3xl drop-shadow-lg" style={{ fontVariationSettings: '"FILL" 1' }}>play_circle</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2.5">
              <p className="text-white text-xs font-bold leading-snug line-clamp-2">{post.title}</p>
              <p className="text-white/50 text-[10px] mt-1">{(post.viewCount ?? 0).toLocaleString('vi-VN')} lượt xem</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ── Banner quảng cáo AI Chat ────────────────────────────────────────────────
function PromoBanner() {
  return (
    <section className="mb-8">
      <Link href="/ai-chat" className="block relative overflow-hidden bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 group hover:shadow-xl transition-all">
        <div className="relative z-10 flex items-center gap-5 px-6 py-5 md:px-10 md:py-6">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-emerald-400 text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>smart_toy</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white text-sm md:text-base font-bold">Trò chuyện với AI Vietnam</h3>
            <p className="text-emerald-100/50 text-xs mt-0.5">Hỏi đáp về AI, tóm tắt bài viết, phân tích xu hướng — miễn phí</p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-500 text-white px-4 py-2 rounded font-bold text-xs flex-shrink-0 group-hover:bg-emerald-400 transition-colors pulse-cta">
            Thử ngay <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </span>
        </div>
      </Link>
    </section>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default async function HomePage() {
  const [featuredRes, latestRes, sectionsRes, mostViewedRes] = await Promise.allSettled([
    getFeatured(5),
    getLatest(20, 1),
    getHomeSections(6),
    getMostViewed(8),
  ]);

  const featured = featuredRes.status === 'fulfilled' ? (featuredRes.value.data ?? []) : [];
  const latest   = latestRes.status === 'fulfilled'   ? (latestRes.value.data ?? [])   : [];
  const sections = sectionsRes.status === 'fulfilled' ? (sectionsRes.value.data ?? []) : [];
  const mostViewed = mostViewedRes.status === 'fulfilled' ? (mostViewedRes.value.data ?? []) : [];

  const topStory = featured[0] ?? latest[0] ?? null;
  // Sub-featured: 2-3 posts below hero (VnExpress style)
  const subFeatured = featured.slice(1, 4);
  // Feed: latest posts excluding top story and sub-featured
  const usedIds = new Set([topStory?._id, ...subFeatured.map((p: Post) => p._id)].filter(Boolean));
  const feedPosts = latest.filter((p: Post) => !usedIds.has(p._id)).slice(0, 15);

  // Sections: skip empty/test categories
  const validSections = sections
    .filter(({ posts, category }: { posts: Post[]; category: { slug: string } }) =>
      posts.length > 0 && !category.slug.startsWith('test') && !category.slug.startsWith('check')
    )
    .slice(0, 6);

  return (
    <>
      {/* Header offset: 2 rows = ~80px */}
      <main className="mt-20 max-w-7xl mx-auto px-4 md:px-6 py-4">

        {/* Top story full-width */}
        {topStory && <TopStory post={topStory} />}

        {/* Sub-featured row: 2-3 articles side by side below hero */}
        {subFeatured.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 pb-5 border-b border-outline-variant/20">
            {subFeatured.map((post: Post) => (
              <Link key={post._id} href={`/bai-viet/${post.slug}`} className="group flex gap-3 items-start">
                <div className="w-24 h-16 flex-shrink-0 overflow-hidden rounded">
                  <img src={cover(post)} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-on-surface leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <span className="text-[10px] text-on-surface-variant mt-1 block">{timeAgo(post.publishedAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ── 2-column layout ─────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT: article feed (60%) */}
          <div className="lg:w-[60%] min-w-0">
            {feedPosts.length > 0
              ? feedPosts.map((post: Post) => <FeedArticle key={post._id} post={post} />)
              : (
                <p className="text-sm text-on-surface-variant py-8 text-center">Chưa có bài viết.</p>
              )
            }

            {/* Đọc nhiều nhất — VnExpress style, no images, just numbered titles */}
            {mostViewed.length > 0 && (
              <div className="mt-6 pt-6 border-t-2 border-on-surface">
                <h3 className="text-lg font-bold text-on-surface mb-4">Đọc nhiều nhất</h3>
                <div className="space-y-0">
                  {mostViewed.slice(0, 5).map((post: Post, i: number) => (
                    <Link key={post._id} href={`/bai-viet/${post.slug}`} className="group flex items-start gap-4 py-3 border-b border-outline-variant/15 last:border-0">
                      <span className="text-4xl font-black text-outline-variant/25 leading-none w-10 flex-shrink-0 group-hover:text-emerald-600 transition-colors">
                        {i + 1}
                      </span>
                      <div className="min-w-0 pt-1">
                        <p className="text-sm font-semibold text-on-surface leading-snug group-hover:text-emerald-700 transition-colors">
                          {post.title}
                        </p>
                        {post.excerpt && (
                          <p className="text-xs text-on-surface-variant mt-1 line-clamp-1 leading-relaxed">{post.excerpt}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px bg-outline-variant/20 self-stretch" />

          {/* RIGHT: category blocks (40%) */}
          <div className="lg:w-[40%] min-w-0">
            {validSections.map(({ category, posts }: { category: { name: string; slug: string; _id?: string }; posts: Post[] }) => (
              <CategoryBlock key={category.slug} category={category} posts={posts} />
            ))}

            {validSections.length === 0 && (
              <p className="text-sm text-on-surface-variant py-8 text-center">Chưa có chuyên mục.</p>
            )}
          </div>
        </div>

        {/* ── Xem nhiều ───────────────────────────────────────────── */}
        <div className="mt-8">
          <MostViewedSection posts={mostViewed} />
        </div>

        {/* ── Video Shorts ─────────────────────────────────────────── */}
        <VideoShortsSection posts={[...featured, ...latest].slice(0, 5)} />

        {/* ── Banner quảng cáo AI Chat ───────────────────────────── */}
        <PromoBanner />

        {/* ── Newsletter CTA ──────────────────────────────────────── */}
        <section className="bg-gradient-to-r from-emerald-700 to-emerald-600 py-8 px-6 text-center mb-8 rounded-lg">
          <h2 className="text-xl font-extrabold text-white mb-2 tracking-tight">
            Nhận bản tin AI chất lượng mỗi ngày
          </h2>
          <p className="text-emerald-100/80 text-sm mb-5 max-w-md mx-auto">
            Hơn 50,000 độc giả đã đăng ký để không bỏ lỡ bất kỳ xu hướng AI quan trọng nào.
          </p>
          <NewsletterForm />
        </section>

      </main>

      {/* Chat FAB */}
      <div className="fixed bottom-5 right-4 md:bottom-8 md:right-8 z-[100] float-animate">
        <Link
          href="/ai-chat"
          className="bg-emerald-700 dark:bg-emerald-600 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 hover:brightness-110 transition-all pulse-cta"
        >
          <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>
            chat
          </span>
        </Link>
      </div>
    </>
  );
}
