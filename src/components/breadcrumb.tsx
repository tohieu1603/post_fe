import Link from 'next/link';

interface BreadcrumbItem {
  name: string;
  /** href for non-last items; last item is not a link */
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1 text-sm text-gray-500 flex-wrap ${className}`}>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={`${item.href}-${i}`} className="flex items-center gap-1">
            {i > 0 && (
              <span className="text-gray-300 select-none mx-0.5">&gt;</span>
            )}
            {isLast ? (
              <span className="text-gray-700 font-medium truncate max-w-xs" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link
                href={item.href}
                className="hover:text-emerald-600 transition-colors"
              >
                {item.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
