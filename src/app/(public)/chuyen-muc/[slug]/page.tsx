import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getCategoryPage, getMostViewed, getTrendingTags } from '@/lib/api';
import { Pagination } from '@/components/pagination';
import { timeAgo, readingTimeText } from '@/lib/utils';
import type { Post, Tag } from '@/lib/types';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await getCategoryPage(slug, 1, 1);
    const { category } = res.data;
    return {
      title: `${category.name} - AI Vietnam`,
      description: category.description ?? `Khám phá các bài viết về ${category.name} trên AI Vietnam.`,
      openGraph: {
        title: `${category.name} - AI Vietnam`,
        description: category.description ?? `Khám phá các bài viết về ${category.name} trên AI Vietnam.`,
      },
    };
  } catch {
    return { title: 'Chuyên mục - AI Vietnam' };
  }
}

// ── Sidebar: Phổ biến nhất widget ────────────────────────────────────────────
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

// ── Sidebar: Tags cloud ───────────────────────────────────────────────────────
function TagsWidget({ tags }: { tags: Tag[] }) {
  if (!tags.length) return null;
  return (
    <div className="bg-surface-container-low p-5 md:p-8 rounded-2xl border border-outline-variant/30">
      <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-6">
        Chủ đề nổi bật
      </h4>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag._id}
            href={`/tim-kiem?q=${encodeURIComponent(tag.slug)}`}
            className="px-4 py-1.5 bg-surface-container-lowest border border-outline-variant/20 rounded-full text-xs font-medium text-on-surface-variant hover:border-primary hover:text-primary transition-all"
          >
            {tag.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Sidebar: Ask AI CTA ───────────────────────────────────────────────────────
function AskAiCta() {
  return (
    <div className="p-1 rounded-2xl bg-gradient-to-br from-primary to-primary-container shadow-lg">
      <Link href="/ai-chat" className="w-full bg-surface-container-lowest py-6 px-4 rounded-[14px] flex flex-col items-center text-center group hover:bg-emerald-50 transition-colors">
        <span
          className="material-symbols-outlined text-4xl text-primary mb-3 group-hover:scale-110 transition-transform"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          chat
        </span>
        <span className="text-lg font-bold text-on-surface">Đặt câu hỏi cho AI trợ lý</span>
        <p className="text-xs text-on-surface-variant mt-2">Nhận giải đáp về mọi ứng dụng AI ngay lập tức</p>
      </Link>
    </div>
  );
}

export default async function CategoryListingPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = Number(sp?.page ?? 1);
  const LIMIT = 9;

  let category, posts, pagination;
  try {
    const res = await getCategoryPage(slug, LIMIT, page);
    category = res.data.category;
    posts = res.data.posts;
    pagination = res.data.pagination;
  } catch {
    notFound();
  }

  const [mostViewedRes, tagsRes] = await Promise.allSettled([
    getMostViewed(5),
    getTrendingTags(10),
  ]);
  const mostViewed = mostViewedRes.status === 'fulfilled' ? mostViewedRes.value.data ?? [] : [];
  const trendingTags = tagsRes.status === 'fulfilled' ? tagsRes.value.data ?? [] : [];

  const basePath = `/chuyen-muc/${slug}`;

  return (
    <>
      <main className="pt-20 md:pt-32 pb-12 md:pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 font-inter text-sm text-on-surface-variant mb-6">
          <Link className="hover:text-primary transition-colors" href="/">Trang chủ</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-on-surface-variant font-medium">{category.name}</span>
        </nav>

        {/* Heading Section */}
        <div className="mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-extrabold text-on-background tracking-tight">{category.name}</h1>
          {category.description && (
            <p className="text-base md:text-lg text-on-surface-variant mt-2 md:mt-3 max-w-2xl">{category.description}</p>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 md:gap-12">
          {/* Left: Article Grid */}
          <div className="lg:col-span-7">
            {posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">article</span>
                <h2 className="text-xl font-bold text-on-surface mb-2">Chưa có bài viết nào</h2>
                <p className="text-on-surface-variant text-sm">Chuyên mục này chưa có bài viết. Hãy quay lại sau nhé!</p>
                <Link href="/" className="mt-6 bg-primary text-on-primary px-6 py-2.5 rounded-lg font-bold hover:brightness-110 transition-all">
                  Về trang chủ
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
                  {posts.map((post) => (
                    <article
                      key={post._id}
                      className="bg-surface-container-lowest group rounded-xl overflow-hidden border border-outline-variant/20 hover:shadow-[0_16px_32px_-8px_rgba(0,108,73,0.08)] transition-all duration-300"
                    >
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
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-16 flex justify-center items-center gap-2">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    basePath={basePath}
                  />
                </div>
              </>
            )}
          </div>

          {/* Right: Sidebar */}
          <aside className="lg:col-span-3 space-y-10">
            <PopularWidget posts={mostViewed} />
            <TagsWidget tags={trendingTags} />
            <AskAiCta />
          </aside>
        </div>
      </main>

      {/* AI Support FAB */}
      <div className="fixed bottom-5 right-4 md:bottom-8 md:right-8 z-[100] group">
        <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white shadow-[0_16px_32px_-8px_rgba(0,108,73,0.3)] cursor-pointer animate-pulse transition-all hover:scale-110 hover:brightness-110">
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
        </div>
        <div className="absolute bottom-20 right-0 w-56 md:w-64 bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/20 p-4 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xs uppercase">AI</div>
            <div>
              <div className="text-sm font-bold text-on-surface">Hỗ trợ AI</div>
              <div className="text-[10px] text-emerald-600 font-medium">Trực tuyến 24/7</div>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant mb-4">Chào bạn! Tôi có thể giúp gì cho bạn về các công cụ AI không?</p>
          <Link href="/ai-chat" className="block w-full bg-primary text-on-primary py-2 rounded-lg text-xs font-bold hover:brightness-110 transition-all text-center">Chat ngay</Link>
        </div>
      </div>
    </>
  );
}
