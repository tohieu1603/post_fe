'use client';

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  adminName?: string;
  onMenuToggle?: () => void;
}

export default function AdminHeader({
  title,
  subtitle,
  adminName = 'Admin',
  onMenuToggle,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-3 flex justify-between items-center shadow-sm">
      {/* Left: hamburger (mobile) + title */}
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        {title && (
          <div>
            <h1 className="text-slate-900 font-bold text-xl tracking-tight leading-tight">{title}</h1>
            {subtitle && <p className="text-slate-500 text-xs font-medium">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* Right: search + notifications + avatar */}
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <input
            className="pl-9 pr-4 py-2 bg-slate-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 w-52 transition-all"
            placeholder="Tìm kiếm..."
            type="text"
          />
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
        </div>
        <button className="relative w-9 h-9 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 transition-all">
          <span className="material-symbols-outlined text-xl">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xs font-bold cursor-pointer shrink-0">
          {adminName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
