'use client';

import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  className?: string;
}

export function Pagination({ currentPage, totalPages, basePath, className = '' }: PaginationProps) {
  if (totalPages <= 1) return null;

  const makeHref = (p: number) => `${basePath}?page=${p}`;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <nav
      className={`flex items-center justify-center gap-2 ${className}`}
      aria-label="Phân trang"
    >
      {/* Prev */}
      {currentPage > 1 ? (
        <Link
          href={makeHref(currentPage - 1)}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-600 hover:bg-emerald-100 transition-colors"
          aria-label="Trang trước"
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </Link>
      ) : (
        <span className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-300 cursor-not-allowed select-none">
          <span className="material-symbols-outlined">chevron_left</span>
        </span>
      )}

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="text-slate-400 px-2 select-none">...</span>
        ) : (
          <Link
            key={p}
            href={makeHref(p)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
              p === currentPage
                ? 'bg-primary text-on-primary font-bold shadow-md'
                : 'text-slate-600 hover:bg-emerald-100'
            }`}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p}
          </Link>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link
          href={makeHref(currentPage + 1)}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-600 hover:bg-emerald-100 transition-colors"
          aria-label="Trang sau"
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </Link>
      ) : (
        <span className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-300 cursor-not-allowed select-none">
          <span className="material-symbols-outlined">chevron_right</span>
        </span>
      )}
    </nav>
  );
}
