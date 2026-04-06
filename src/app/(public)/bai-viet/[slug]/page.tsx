import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getPost, getRelatedPosts, getMostViewed } from '@/lib/api';
import { BlockRenderer } from '@/components/block-renderer';
import { TocSidebar } from '@/components/toc-sidebar';
import { ShareButtons } from '@/components/share-buttons';
import { ViewTracker } from '@/components/view-tracker';
import { NewsletterForm } from '@/components/newsletter-form';
import { formatDate, readingTimeText } from '@/lib/utils';
import type { Post } from '@/lib/types';
import { CommentSection } from '@/components/comment-section';

// ─── Metadata ────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const { data: post, seo } = await getPost(slug);

    return {
      title: seo?.title ?? post.metaTitle ?? post.title,
      description: seo?.description ?? post.metaDescription ?? post.excerpt ?? undefined,
      alternates: {
        canonical: seo?.canonical ?? undefined,
      },
      robots: seo?.robots ?? undefined,
      openGraph: {
        type: 'article',
        title: seo?.og?.title ?? post.ogTitle ?? post.title,
        description: seo?.og?.description ?? post.ogDescription ?? post.excerpt ?? undefined,
        images: seo?.og?.image
          ? [{ url: seo.og.image }]
          : post.ogImage
          ? [{ url: post.ogImage }]
          : post.coverImage
          ? [{ url: post.coverImage }]
          : undefined,
        url: seo?.og?.url ?? seo?.canonical ?? undefined,
      },
    };
  } catch {
    return { title: 'Bài viết' };
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch post — 404 if missing
  let post: Post;
  try {
    const res = await getPost(slug);
    post = res.data;
  } catch {
    notFound();
  }

  // Parallel fetch: related posts + most viewed
  const [relatedRes, mostViewedRes] = await Promise.allSettled([
    getRelatedPosts(slug, 6),
    getMostViewed(5),
  ]);

  const relatedPosts =
    relatedRes.status === 'fulfilled' ? relatedRes.value.data : [];
  const mostViewed =
    mostViewedRes.status === 'fulfilled' ? mostViewedRes.value.data : [];

  // TOC from contentStructure or empty
  const toc = post.contentStructure?.toc ?? [];

  // Breadcrumb items
  const breadcrumbs = [
    { name: 'Trang chủ', href: '/' },
    ...(post.category
      ? [{ name: post.category.name, href: `/chuyen-muc/${post.category.slug}` }]
      : []),
    { name: post.title, href: '' },
  ];

  // Author info
  const author = post.authorInfo;
  const authorName = author?.name ?? post.author ?? 'Biên tập viên';
  const authorSlug = author?.slug;
  const authorAvatar = author?.avatarUrl;
  const authorBio = author?.bio;
  const authorJobTitle = author?.jobTitle;
  const authorExpertise = author?.expertise ?? [];

  // Reading time
  const readingTime = post.readingTime ?? post.contentStructure?.readingTime ?? null;
  const publishedDate = formatDate(post.publishedAt);
  const updatedDate = post.updatedAt && post.updatedAt !== post.publishedAt ? formatDate(post.updatedAt) : null;
  const viewCount = post.viewCount?.toLocaleString('vi-VN') ?? '0';

  // Content blocks
  const blocks = post.contentBlocks ?? [];

  // Tags
  const tags = post.tags ?? [];

  // FAQ from post field (separate from content blocks)
  const faqItems = post.faq ?? [];

  return (
    <>
      {/* Track view */}
      <ViewTracker slug={slug} />

      <main className="max-w-screen-2xl mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-8 mt-16 md:mt-20">

        {/* ── Breadcrumb ─────────────────────────────────────────── */}
        <nav className="flex text-on-surface-variant text-sm mb-8 gap-2 font-medium flex-wrap">
          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            return (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span>&gt;</span>}
                {isLast ? (
                  <span className="text-on-surface truncate max-w-xs">{crumb.name}</span>
                ) : (
                  <Link href={crumb.href} className="hover:text-primary transition-colors">
                    {crumb.name}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>

        {/* ── Article Header ─────────────────────────────────────── */}
        <header className="mb-10">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-on-background leading-tight mb-6 md:mb-8 tracking-tighter">
            {post.title}
          </h1>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-outline-variant/30">
            {/* Author meta */}
            <div className="flex items-center gap-4">
              {authorAvatar ? (
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant">person</span>
                </span>
              )}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  {authorSlug ? (
                    <Link
                      href={`/tac-gia/${authorSlug}`}
                      className="font-bold text-on-background hover:text-primary transition-colors"
                    >
                      {authorName}
                    </Link>
                  ) : (
                    <span className="font-bold text-on-background">{authorName}</span>
                  )}
                  {authorJobTitle && (
                    <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {authorJobTitle} ✓
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-on-surface-variant flex-wrap">
                  {publishedDate && <span>{publishedDate}</span>}
                  {publishedDate && readingTime && (
                    <span className="w-1 h-1 bg-outline-variant rounded-full" />
                  )}
                  {readingTime && <span>{readingTimeText(readingTime)}</span>}
                  {(publishedDate || readingTime) && (
                    <span className="w-1 h-1 bg-outline-variant rounded-full" />
                  )}
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">visibility</span>
                    <span>{viewCount} lượt xem</span>
                  </div>
                  {updatedDate && (
                    <>
                      <span className="w-1 h-1 bg-outline-variant rounded-full" />
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">update</span>
                        <span>Cập nhật {updatedDate}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Share / Bookmark buttons (client) */}
            <ShareButtons title={post.title} slug={post.slug} />
          </div>
        </header>

        {/* ── Main Content + Sidebar ──────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-8 md:gap-12">

          {/* Left Column: Article Body */}
          <article className="lg:w-[65%] w-full min-w-0">

            {/* Cover Image */}
            {post.coverImage && (
              <div className="relative mb-10 overflow-hidden rounded-xl shadow-2xl">
                <img
                  src={post.coverImage}
                  alt={post.imageAlt ?? post.title}
                  className="w-full aspect-[16/9] object-cover"
                />
                {post.imageAlt && (
                  <span className="absolute bottom-4 right-4 bg-black/50 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-sm">
                    {post.imageAlt}
                  </span>
                )}
              </div>
            )}

            {/* Content Blocks */}
            {blocks.length > 0 ? (
              <div className="space-y-6 text-on-surface leading-relaxed text-base md:text-lg font-body">
                <BlockRenderer blocks={blocks} />
              </div>
            ) : post.content ? (
              <div
                className="space-y-6 text-on-surface leading-relaxed text-base md:text-lg font-body prose prose-emerald max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : null}

            {/* Tags */}
            {tags.length > 0 && (() => {
              const tagColors = [
                'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
                'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
                'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
                'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
                'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
                'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100',
                'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100',
                'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100',
              ];
              return (
                <div className="flex flex-wrap gap-2 pt-12 pb-8">
                  {tags.map((tag, i) => (
                    <Link
                      key={tag}
                      href={`/tim-kiem?q=${encodeURIComponent(tag)}`}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${tagColors[i % tagColors.length]}`}
                    >
                      # {tag}
                    </Link>
                  ))}
                </div>
              );
            })()}

            {/* FAQ Section */}
            {faqItems.length > 0 && (
              <section className="bg-surface-container-low p-5 md:p-8 rounded-2xl mt-12 border border-outline-variant/30">
                <h3 className="text-xl font-black mb-6">Câu hỏi thường gặp</h3>
                <div className="space-y-4">
                  {faqItems.map((faq, i) => (
                    <details key={faq._id ?? i} className="group bg-surface-container-lowest p-4 rounded-xl">
                      <summary className="flex justify-between items-center cursor-pointer font-bold text-primary list-none">
                        {faq.question}
                        <span className="material-symbols-outlined transition-transform group-open:rotate-180">
                          expand_more
                        </span>
                      </summary>
                      <p className="mt-3 text-sm text-on-surface-variant">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Author Box */}
            {author && (
              <div id="author-box" className="mt-12 md:mt-16 bg-surface-container-high rounded-2xl p-5 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                {authorAvatar ? (
                  <img
                    src={authorAvatar}
                    alt={authorName}
                    className="w-24 h-24 rounded-2xl object-cover shadow-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-surface-container-highest flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-5xl text-on-surface-variant">person</span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                    <div>
                      <h4 className="text-xl font-black">{authorName}</h4>
                      {authorJobTitle && (
                        <p className="text-primary font-bold text-sm">{authorJobTitle}</p>
                      )}
                    </div>
                    <button className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-all shadow-md">
                      Theo dõi
                    </button>
                  </div>
                  {authorBio && (
                    <p className="text-sm text-on-surface-variant mb-4">{authorBio}</p>
                  )}
                  {authorExpertise.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {authorExpertise.map((skill) => (
                        <span
                          key={skill}
                          className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded font-bold"
                        >
                          #{skill}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-4">
                    {author.twitter && (
                      <a
                        href={author.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-on-surface-variant hover:text-primary transition-colors"
                        aria-label="Twitter"
                      >
                        <span className="material-symbols-outlined">alternate_email</span>
                      </a>
                    )}
                    {author.github && (
                      <a
                        href={author.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-on-surface-variant hover:text-primary transition-colors"
                        aria-label="GitHub"
                      >
                        <span className="material-symbols-outlined">terminal</span>
                      </a>
                    )}
                    {author.linkedin && (
                      <a
                        href={author.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-on-surface-variant hover:text-primary transition-colors"
                        aria-label="LinkedIn"
                      >
                        <span className="material-symbols-outlined">share</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Comments Section */}
            <section className="mt-12 md:mt-20 pt-8 md:pt-12 border-t border-outline-variant/30">
              <CommentSection postId={post._id} />
            </section>

            {/* Related Posts — VnExpress style: image left + title/excerpt right */}
            {relatedPosts.length > 0 && (
              <section className="mt-10 pt-8 border-t border-outline-variant/30">
                <h3 className="text-xl font-black mb-6 border-b-2 border-on-surface pb-2 inline-block">
                  {post.category?.name ?? 'Bài viết liên quan'}
                </h3>
                <div className="divide-y divide-outline-variant/20">
                  {relatedPosts.map((related) => (
                    <Link
                      key={related._id}
                      href={`/bai-viet/${related.slug}`}
                      className="group flex gap-5 py-5 first:pt-0"
                    >
                      {/* Image left — fixed size for consistency */}
                      <div className="w-[180px] h-[110px] flex-shrink-0 rounded overflow-hidden img-zoom">
                        {related.coverImage ? (
                          <img
                            src={related.coverImage}
                            alt={related.imageAlt ?? related.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                            <span className="material-symbols-outlined text-outline-variant text-3xl">article</span>
                          </div>
                        )}
                      </div>
                      {/* Title + excerpt right */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="text-[15px] font-bold text-on-background leading-snug group-hover:text-primary transition-colors mb-1.5 line-clamp-2">
                          {related.title}
                        </h4>
                        {related.excerpt && (
                          <p className="text-[13px] text-on-surface-variant leading-relaxed line-clamp-2 mb-1.5">
                            {related.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                          {related.category && (
                            <span className="text-primary font-semibold">{related.category.name}</span>
                          )}
                          {related.category && <span>·</span>}
                          <span>{formatDate(related.publishedAt)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Right Column: Sidebar */}
          <aside className="lg:w-[35%] w-full min-w-0">
            <div className="sticky top-24 space-y-6">

              {/* TOC Sidebar (client component) */}
              {toc.length > 0 && <TocSidebar items={toc} />}

              {/* Newsletter Card */}
              <div className="rounded-lg p-5 text-white" style={{ background: 'linear-gradient(135deg, #065f46, #064e3b)' }}>
                <h4 className="text-base font-bold mb-1.5">Bản tin AI hàng ngày</h4>
                <p className="text-xs mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Tin tức AI quan trọng nhất, gửi thẳng vào hộp thư mỗi sáng.
                </p>
                <NewsletterForm vertical />
              </div>

              {/* Most Viewed Widget */}
              {mostViewed.length > 0 && (
                <div>
                  <h4 className="text-base font-bold text-on-surface mb-3 pb-2 border-b-2 border-emerald-600">
                    Xem nhiều
                  </h4>
                  <div className="space-y-0">
                    {mostViewed.map((item, idx) => (
                      <Link
                        key={item._id}
                        href={`/bai-viet/${item.slug}`}
                        className="flex gap-3 items-start py-2.5 border-b border-outline-variant/15 last:border-0 group"
                      >
                        <span className="text-xl font-black text-emerald-600/30 leading-none flex-shrink-0 w-6 group-hover:text-emerald-600 transition-colors">
                          {idx + 1}
                        </span>
                        <p className="text-sm leading-snug text-on-surface group-hover:text-emerald-700 transition-colors">
                          {item.title}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
