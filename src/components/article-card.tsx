import Link from 'next/link';
import type { Post } from '@/lib/types';
import { timeAgo, readingTimeText } from '@/lib/utils';

interface ArticleCardProps {
  post: Post;
  size?: 'large' | 'medium' | 'small';
  /** @deprecated Use size instead */
  variant?: 'default' | 'compact' | 'horizontal';
  className?: string;
}

function PostMeta({ post }: { post: Post }) {
  const author = post.authorInfo?.name ?? post.author;
  return (
    <div className="flex items-center gap-2">
      {post.authorInfo?.avatarUrl && (
        <img
          src={post.authorInfo.avatarUrl}
          alt={author ?? ''}
          className="w-6 h-6 rounded-full"
        />
      )}
      {author && <span className="text-xs font-medium">{author}</span>}
      {post.readingTime && (
        <span className="text-xs text-on-surface-variant ml-auto">{readingTimeText(post.readingTime)}</span>
      )}
    </div>
  );
}

function CategoryBadge({ name, className = '' }: { name: string; className?: string }) {
  return (
    <span className={`text-primary font-bold text-xs uppercase tracking-widest block ${className}`}>
      {name}
    </span>
  );
}

function CoverPlaceholder({ icon = 'image' }: { icon?: string }) {
  return (
    <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
      <span className="material-symbols-outlined text-outline-variant text-4xl">{icon}</span>
    </div>
  );
}

export function ArticleCard({ post, size = 'medium', variant, className = '' }: ArticleCardProps) {
  // Map legacy variant to size
  const resolvedSize: 'large' | 'medium' | 'small' =
    variant === 'compact' || variant === 'horizontal' ? 'small' : size;

  const href = `/bai-viet/${post.slug}`;

  /* ── Small: horizontal layout (used in hero side panel) ──────── */
  if (resolvedSize === 'small') {
    return (
      <Link
        href={href}
        className={`flex gap-4 p-4 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low transition-colors group ${className}`}
      >
        <div className="w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.imageAlt ?? post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <CoverPlaceholder icon="article" />
          )}
        </div>
        <div className="flex flex-col justify-between py-1">
          <div>
            {post.category && (
              <CategoryBadge name={post.category.name} className="mb-2" />
            )}
            <h3 className="font-bold text-lg leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
          </div>
          <p className="text-on-surface-variant text-sm">{timeAgo(post.publishedAt)}</p>
        </div>
      </Link>
    );
  }

  /* ── Large: full card with excerpt + author ────────────────── */
  if (resolvedSize === 'large') {
    return (
      <Link
        href={href}
        className={`group block bg-surface-container-lowest rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${className}`}
      >
        <div className="aspect-video relative overflow-hidden">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.imageAlt ?? post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <CoverPlaceholder />
          )}
          {post.category && (
            <span className="absolute top-4 left-4 bg-primary text-on-primary text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
              {post.category.name}
            </span>
          )}
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-on-surface-variant text-sm mb-6 line-clamp-2">{post.excerpt}</p>
          )}
          <PostMeta post={post} />
        </div>
      </Link>
    );
  }

  /* ── Medium (default): quick news card ────────────────────── */
  return (
    <article className={`group ${className}`}>
      <Link href={href} className="block">
        <div className="aspect-[3/2] rounded-xl overflow-hidden mb-4 bg-surface-container-high">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.imageAlt ?? post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <CoverPlaceholder />
          )}
        </div>
        {post.category && (
          <CategoryBadge name={post.category.name} className="mb-2" />
        )}
        <h4 className="font-bold text-base leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h4>
        <p className="text-on-surface-variant text-xs">{timeAgo(post.publishedAt)}</p>
      </Link>
    </article>
  );
}
