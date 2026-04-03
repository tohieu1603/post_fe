import Link from 'next/link';
import type { Post, Tag } from '@/lib/types';
import { timeAgo } from '@/lib/utils';

const TAG_COLORS = [
  'bg-emerald-100 text-emerald-800 hover:bg-emerald-500 hover:text-white',
  'bg-blue-100 text-blue-800 hover:bg-blue-500 hover:text-white',
  'bg-purple-100 text-purple-800 hover:bg-purple-500 hover:text-white',
  'bg-amber-100 text-amber-800 hover:bg-amber-500 hover:text-white',
  'bg-rose-100 text-rose-800 hover:bg-rose-500 hover:text-white',
  'bg-cyan-100 text-cyan-800 hover:bg-cyan-500 hover:text-white',
];

interface SidebarProps {
  mostViewed: Post[];
  trendingTags: Tag[];
  className?: string;
}

export function Sidebar({ mostViewed, trendingTags, className = '' }: SidebarProps) {
  return (
    <aside className={`space-y-8 ${className}`}>
      {/* Phổ biến nhất */}
      {mostViewed.length > 0 && (
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px -4px rgba(0,108,73,0.06)' }}>
          <h3 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-1 h-5 bg-emerald-500 rounded-full inline-block" />
            Phổ biến nhất
          </h3>
          <ol className="space-y-4">
            {mostViewed.slice(0, 5).map((post, i) => (
              <li key={post._id} className="flex gap-3 group">
                <span
                  className="text-2xl font-extrabold leading-none shrink-0 w-8 tabular-nums"
                  style={{ color: i < 3 ? '#bbcabf' : '#e5e7eb' }}
                >
                  {i + 1}
                </span>
                <Link href={`/bai-viet/${post.slug}`} className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-emerald-600 transition-colors leading-snug">
                    {post.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{timeAgo(post.publishedAt)}</p>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Tags */}
      {trendingTags.length > 0 && (
        <div className="bg-white rounded-2xl p-5" style={{ boxShadow: '0 2px 12px -4px rgba(0,108,73,0.06)' }}>
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-emerald-500 rounded-full inline-block" />
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {trendingTags.map((tag, i) => (
              <Link
                key={tag._id}
                href={`/chuyen-muc/${tag.slug}`}
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
      )}
    </aside>
  );
}
