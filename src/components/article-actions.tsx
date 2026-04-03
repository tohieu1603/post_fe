'use client';

import { useState } from 'react';

interface ArticleActionsProps {
  title: string;
  slug: string;
}

export function ArticleActions({ title, slug }: ArticleActionsProps) {
  const [bookmarked, setBookmarked] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? window.location.href
    : `https://aivietnam.io/bai-viet/${slug}`;

  return (
    <div className="flex items-center gap-3 py-3 border-t border-b border-gray-100">
      {/* Bookmark */}
      <button
        onClick={() => setBookmarked((b) => !b)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
          bookmarked
            ? 'bg-emerald-50 text-emerald-600'
            : 'text-gray-500 hover:bg-gray-100'
        }`}
        aria-label={bookmarked ? 'Bỏ lưu' : 'Lưu bài viết'}
      >
        <svg className="w-4 h-4" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        {bookmarked ? 'Đã lưu' : 'Lưu'}
      </button>

      {/* Share */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 font-medium">Chia sẻ:</span>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors text-xs font-bold"
          aria-label="Chia sẻ Facebook"
        >
          f
        </a>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center hover:bg-sky-600 transition-colors text-xs font-bold"
          aria-label="Chia sẻ Twitter"
        >
          𝕏
        </a>
      </div>
    </div>
  );
}
