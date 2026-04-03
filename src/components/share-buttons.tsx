'use client';

import { useState } from 'react';

interface ShareButtonsProps {
  title: string;
  slug: string;
}

export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://aivietnam.io/bai-viet/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: do nothing
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setBookmarked((b) => !b)}
        className="p-2 rounded-full hover:bg-surface-container transition-colors"
        aria-label={bookmarked ? 'Bỏ lưu' : 'Lưu bài viết'}
      >
        <span
          className="material-symbols-outlined text-on-surface-variant"
          style={bookmarked ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          bookmark
        </span>
      </button>
      <div className="relative group">
        <button
          onClick={handleCopy}
          className="p-2 rounded-full hover:bg-surface-container transition-colors"
          aria-label="Chia sẻ"
        >
          <span className="material-symbols-outlined text-on-surface-variant">share</span>
        </button>
        {copied && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-xs px-2 py-1 rounded whitespace-nowrap">
            Đã sao chép!
          </span>
        )}
      </div>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-5 py-2 border-2 border-primary text-primary rounded-lg font-bold hover:bg-primary/5 transition-all text-sm"
        aria-label="Chia sẻ Facebook"
      >
        <span className="material-symbols-outlined scale-75">smart_toy</span>
        Tóm tắt AI
      </a>
    </div>
  );
}
