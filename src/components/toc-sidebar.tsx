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
    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/30">
      <h4 className="text-lg font-black mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">format_list_bulleted</span>
        Mục lục
      </h4>
      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = activeId === item.anchor;
          return (
            <a
              key={item.anchor}
              href={`#${item.anchor}`}
              className={`toc-link block px-4 py-3 text-sm font-bold rounded-lg transition-all ${
                isActive
                  ? 'bg-surface-container-low border-l-4 border-primary text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container'
              }`}
              style={item.level > 2 ? { paddingLeft: `${(item.level - 2) * 12 + 16}px` } : undefined}
            >
              {item.text}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
