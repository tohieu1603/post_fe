'use client';

import { useEffect, useState } from 'react';
import type { TocItem } from '@/lib/types';

interface TocSidebarProps {
  items: TocItem[];
}

export function TocSidebar({ items }: TocSidebarProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (!items.length) return;

    const headingIds = items.map((item) => item.anchor);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    headingIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (!items.length) return null;

  return (
    <nav
      style={{
        background: '#f8faf9',
        borderRadius: '8px',
        padding: '16px 20px',
        borderLeft: '3px solid #10b981',
      }}
    >
      <p
        style={{
          fontSize: '13px',
          fontWeight: 700,
          color: '#065f46',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '12px',
        }}
      >
        Nội dung bài viết
      </p>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {items.map((item) => {
          const isActive = activeId === item.anchor;
          return (
            <li key={item.anchor}>
              <a
                href={`#${item.anchor}`}
                style={{
                  display: 'block',
                  padding: '6px 0',
                  paddingLeft: item.level > 2 ? `${(item.level - 2) * 14}px` : 0,
                  fontSize: '13px',
                  lineHeight: '1.5',
                  color: isActive ? '#059669' : '#4b5563',
                  fontWeight: isActive ? 600 : 400,
                  textDecoration: 'none',
                  borderBottom: '1px solid #e5e7eb',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = '#059669'; }}
                onMouseLeave={(e) => {
                  if (!isActive) (e.target as HTMLElement).style.color = '#4b5563';
                }}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
