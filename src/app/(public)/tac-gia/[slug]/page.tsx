import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAuthorBySlug, getAuthorPosts } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Author, Post } from '@/lib/types';

const PLACEHOLDER = 'https://placehold.co/800x450/e4f1e8/006c49?text=AI+Vietnam';

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const author = await getAuthorBySlug(slug);
    const name = author.name ?? 'Tác giả';
    const bio = author.bio ?? `Hồ sơ tác giả ${name} tại AI Vietnam`;
    return {
      title: `${name} — Tác giả tại AI Vietnam`,
      description: bio,
      alternates: { canonical: `https://aivietnam.vn/tac-gia/${slug}` },
      openGraph: {
        type: 'profile',
        title: `${name} — AI Vietnam`,
        description: bio,
        images: author.avatarUrl ? [{ url: author.avatarUrl }] : undefined,
        url: `https://aivietnam.vn/tac-gia/${slug}`,
      },
    };
  } catch {
    return { title: 'Tác giả — AI Vietnam' };
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AuthorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch author — 404 if not found
  let author: Author;
  try {
    author = await getAuthorBySlug(slug);
    if (!author || !author._id) notFound();
  } catch {
    notFound();
  }

  // Fetch author's recent posts (graceful fallback)
  let posts: Post[] = [];
  try {
    const res = await getAuthorPosts(author._id ?? slug, 12);
    posts = res?.data ?? [];
  } catch {
    posts = [];
  }

  const SOCIAL_LINKS = [
    { key: 'twitter', icon: 'alternate_email', label: 'Twitter/X', href: author.twitter },
    { key: 'linkedin', icon: 'share', label: 'LinkedIn', href: author.linkedin },
    { key: 'github', icon: 'terminal', label: 'GitHub', href: author.github },
    { key: 'facebook', icon: 'public', label: 'Facebook', href: author.facebook },
    { key: 'website', icon: 'language', label: 'Website', href: author.website },
  ].filter((s) => s.href);

  return (
    <>
      <main className="pt-20">

        {/* ── Author Hero ───────────────────────────────────────────── */}
        <section className="bg-emerald-900 text-white py-12 md:py-16 px-4 md:px-6">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">

            {/* Avatar */}
            {author.avatarUrl ? (
              <img
                src={author.avatarUrl}
                alt={author.name}
                className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover shadow-2xl flex-shrink-0 border-4 border-emerald-700"
              />
            ) : (
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-emerald-700 flex items-center justify-center flex-shrink-0 border-4 border-emerald-600">
                <span className="material-symbols-outlined text-6xl text-emerald-200">person</span>
              </div>
            )}

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-300 text-xs font-bold mb-3 uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">person</span>
                Tác giả
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter mb-2">
                {author.name}
              </h1>
              {author.jobTitle && (
                <p className="text-emerald-300 font-bold text-lg mb-4">{author.jobTitle}</p>
              )}
              {author.bio && (
                <p className="text-emerald-100/70 leading-relaxed max-w-2xl mb-6">{author.bio}</p>
              )}

              {/* Expertise tags */}
              {author.expertise?.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                  {author.expertise.map((skill) => (
                    <span
                      key={skill}
                      className="bg-emerald-800 text-emerald-200 text-xs font-bold px-3 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {/* Social links */}
              {SOCIAL_LINKS.length > 0 && (
                <div className="flex gap-3 justify-center md:justify-start">
                  {SOCIAL_LINKS.map(({ key, icon, label, href }) => (
                    <a
                      key={key}
                      href={href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-emerald-600 transition-colors"
                    >
                      <span className="material-symbols-outlined text-xl">{icon}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Stats bar ─────────────────────────────────────────────── */}
        <div className="bg-emerald-800 text-white">
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 flex items-center gap-4 md:gap-8 text-sm flex-wrap">
            <div className="flex items-center gap-2 text-emerald-200">
              <span className="material-symbols-outlined text-base">article</span>
              <span><strong className="text-white">{posts.length}</strong> bài viết</span>
            </div>
            {author.website && (
              <a
                href={author.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-emerald-300 hover:text-white transition-colors ml-auto text-xs"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                Website cá nhân
              </a>
            )}
          </div>
        </div>

        {/* ── Posts Grid ────────────────────────────────────────────── */}
        <section className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-14">
          <h2 className="text-xl md:text-2xl font-extrabold text-emerald-900 tracking-tighter mb-6 md:mb-8">
            Bài viết bởi {author.name}
          </h2>

          {posts.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-4 block">article</span>
              <p>Chưa có bài viết nào được xuất bản.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {posts.map((post) => (
                <article key={post._id}>
                  <Link
                    href={`/bai-viet/${post.slug}`}
                    className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-emerald-100 hover:border-emerald-300 hover:shadow-md transition-all"
                  >
                    {/* Cover image */}
                    <div className="aspect-[16/9] overflow-hidden bg-emerald-50">
                      <img
                        src={post.coverImage ?? PLACEHOLDER}
                        alt={post.imageAlt ?? post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Body */}
                    <div className="p-5 flex flex-col flex-1">
                      {post.category && (
                        <span className="inline-block bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded mb-3 self-start">
                          {post.category.name}
                        </span>
                      )}
                      <h3 className="font-bold text-on-background group-hover:text-emerald-700 leading-snug mb-3 line-clamp-3 flex-1 transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-slate-500 line-clamp-2 mb-4">{post.excerpt}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-auto">
                        {post.publishedAt && (
                          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                        )}
                        {post.readingTime && (
                          <>
                            <span>·</span>
                            <span>{post.readingTime} phút đọc</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ── E-E-A-T Schema block (visible trust signal) ──────────── */}
        <section className="bg-emerald-50 border-t border-emerald-100 py-8 md:py-10 px-4 md:px-6">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-12 h-12 rounded-xl bg-emerald-700 flex items-center justify-center flex-shrink-0 mx-auto md:mx-0">
              <span className="material-symbols-outlined text-white text-2xl">verified</span>
            </div>
            <div>
              <h2 className="font-extrabold text-emerald-900 mb-1">Tác giả được xác minh bởi AI Vietnam</h2>
              <p className="text-sm text-slate-500 max-w-xl">
                {author.name} là thành viên biên tập được xác minh danh tính và chuyên môn.
                Tất cả bài viết đều qua quy trình kiểm duyệt theo{' '}
                <Link href="/chinh-sach-bien-tap" className="text-emerald-700 hover:underline font-medium">
                  Chính sách biên tập
                </Link>{' '}
                của AI Vietnam.
              </p>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
