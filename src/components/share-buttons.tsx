'use client';

import { useState, useEffect, useRef } from 'react';

interface ShareButtonsProps {
  title: string;
  slug: string;
}

function buildShareLinks(encodedUrl: string, encodedTitle: string) {
  return [
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: '#1877F2',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      name: 'Zalo',
      url: `https://zalo.me/share?url=${encodedUrl}`,
      color: '#0068FF',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="#0068FF">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.18-.348-.504-.588-.9-.588h-3.18V5.64c0-.54-.432-.984-.972-.984h-.552c-.54 0-.984.444-.984.984v1.932H8.4c-.396 0-.72.24-.9.588-.18.348-.108.756.168 1.032l3.6 3.6c.18.18.432.276.684.276s.504-.096.684-.276l3.6-3.6c.276-.276.348-.684.168-1.032zM16.8 14.4H7.2c-.66 0-1.2.54-1.2 1.2s.54 1.2 1.2 1.2h9.6c.66 0 1.2-.54 1.2-1.2s-.54-1.2-1.2-1.2z"/>
        </svg>
      ),
    },
    {
      name: 'Messenger',
      url: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419107518&redirect_uri=${encodedUrl}`,
      color: '#0084FF',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="#0084FF">
          <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26L4.2 14.963l5.565-5.907 3.131 3.259 5.86-3.259-5.565 5.907z"/>
        </svg>
      ),
    },
    {
      name: 'X (Twitter)',
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: '#000',
      icon: (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="#000">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: '#0A66C2',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="#0A66C2">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
    },
    {
      name: 'Telegram',
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      color: '#26A5E4',
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="#26A5E4">
          <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      ),
    },
  ];
}

export function ShareButtons({ title, slug }: ShareButtonsProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const shareUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `https://aivietnam.io/bai-viet/${slug}`;

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  useEffect(() => {
    if (!shareOpen) return;
    const handle = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [shareOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const shareLinks = buildShareLinks(encodedUrl, encodedTitle);

  return (
    <div className="flex items-center gap-2">
      {/* Bookmark */}
      <button
        onClick={() => setBookmarked((b) => !b)}
        className="p-2 hover:bg-surface-container transition-colors rounded-full"
        aria-label={bookmarked ? 'Bỏ lưu' : 'Lưu bài viết'}
      >
        <span
          className="material-symbols-outlined text-on-surface-variant"
          style={bookmarked ? { fontVariationSettings: "'FILL' 1", color: '#059669' } : undefined}
        >
          bookmark
        </span>
      </button>

      {/* Share dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShareOpen(!shareOpen)}
          className="p-2 hover:bg-surface-container transition-colors rounded-full"
          aria-label="Chia sẻ"
        >
          <span className="material-symbols-outlined text-on-surface-variant">share</span>
        </button>

        {shareOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 6,
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              padding: '8px 0',
              minWidth: 200,
              zIndex: 50,
            }}
          >
            {shareLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShareOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 16px',
                  fontSize: 14,
                  color: '#374151',
                  textDecoration: 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {link.icon}
                <span>{link.name}</span>
              </a>
            ))}

            {/* Copy link */}
            <div style={{ borderTop: '1px solid #e5e7eb', margin: '4px 0' }} />
            <button
              onClick={() => { handleCopy(); setShareOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 16px',
                fontSize: 14,
                color: '#374151',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#6b7280' }}>
                {copied ? 'check' : 'link'}
              </span>
              <span>{copied ? 'Đã sao chép!' : 'Sao chép liên kết'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
