'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getNavMenu } from '@/lib/api';

interface NavItem {
  label: string;
  slug: string;
}

const API_CATEGORY_SLUGS = ['model-moi', 'github-hot'];

interface PageLink {
  label: string;
  href: string;
}

const STATIC_PAGES: PageLink[] = [
  { label: 'Startup & Funding', href: '/startup-funding' },
  { label: 'So Sánh', href: '/so-sanh' },
  { label: 'Hướng Dẫn', href: '/huong-dan' },
  { label: 'Phân Tích', href: '/phan-tich' },
  { label: 'Deep Dive', href: '/deep-dive' },
  { label: 'Tuần Qua', href: '/tuan-qua' },
];

const FALLBACK_NAV: NavItem[] = [
  { label: 'Model Mới', slug: 'model-moi' },
  { label: 'GitHub Hot', slug: 'github-hot' },
];

function formatDate() {
  const now = new Date();
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const d = now.getDate().toString().padStart(2, '0');
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const y = now.getFullYear();
  return `${days[now.getDay()]}, ${d}/${m}/${y}`;
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [navItems, setNavItems] = useState<NavItem[]>(FALLBACK_NAV);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Theme: 'light' | 'dark' | 'auto' (system preference)
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('auto');
  const [darkMode, setDarkMode] = useState(false);
  const [dateStr, setDateStr] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDateStr(formatDate());

    getNavMenu()
      .then(res => {
        if (res.data?.length) {
          const items = res.data
            .filter((c: any) => API_CATEGORY_SLUGS.includes(c.slug))
            .sort((a: any, b: any) => API_CATEGORY_SLUGS.indexOf(a.slug) - API_CATEGORY_SLUGS.indexOf(b.slug))
            .map((c: any) => ({ label: c.name, slug: c.slug }));
          if (items.length) setNavItems(items);
        }
      })
      .catch(() => {});

    try {
      const stored = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (stored && token) setUser(JSON.parse(stored));
    } catch {}

    // Theme init: check saved preference or default to auto
    const savedTheme = localStorage.getItem('themeMode') as 'light' | 'dark' | 'auto' | null;
    const mode = savedTheme || 'auto';
    setThemeMode(mode);
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = mode === 'dark' || (mode === 'auto' && systemDark);
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);

    // Listen for system theme changes when in auto mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      const currentMode = localStorage.getItem('themeMode') || 'auto';
      if (currentMode === 'auto') {
        setDarkMode(e.matches);
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleSystemChange);
    // cleanup added below with keydown

    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchOpen(false); };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      mediaQuery.removeEventListener('change', handleSystemChange);
    };
  }, []);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const cycleTheme = () => {
    // Cycle: auto → dark → light → auto
    const order: Array<'auto' | 'dark' | 'light'> = ['auto', 'dark', 'light'];
    const nextIdx = (order.indexOf(themeMode) + 1) % 3;
    const next = order[nextIdx];
    setThemeMode(next);
    localStorage.setItem('themeMode', next);

    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = next === 'dark' || (next === 'auto' && systemDark);
    setDarkMode(isDark);
    document.documentElement.classList.toggle('dark', isDark);
  };
  const themeIcon = themeMode === 'auto' ? 'brightness_auto' : darkMode ? 'dark_mode' : 'light_mode';
  const themeLabel = themeMode === 'auto' ? 'Tự động' : darkMode ? 'Tối' : 'Sáng';

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('token');
    setUser(null);
    setDropdownOpen(false);
    router.push('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const isNavActive = (href: string) => pathname === href;
  const isCatActive = (slug: string) => pathname === `/chuyen-muc/${slug}`;

  const navLinkClass = (active: boolean) =>
    active
      ? 'text-emerald-700 dark:text-emerald-400 font-bold border-b-2 border-emerald-600 dark:border-emerald-400 pb-[1px] whitespace-nowrap'
      : 'text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors whitespace-nowrap';

  return (
    <header className="fixed top-0 w-full z-50 glass-header border-b border-outline-variant/20">
      {/* ── Row 1: Top bar ─────────────────────────────────────────── */}
      <div className="border-b border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-10 flex items-center justify-between gap-4">

          {/* Left: Logo + brand */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-emerald-700 text-white text-xs font-black flex items-center justify-center">
              AI
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-sm text-emerald-900 dark:text-emerald-100 tracking-tight">AI Vietnam</span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 hidden sm:block">Báo AI Việt nhiều người xem nhất</span>
            </div>
          </Link>

          {/* Center: Date */}
          {dateStr && (
            <span className="hidden md:block text-xs text-slate-500 dark:text-slate-400 font-medium absolute left-1/2 -translate-x-1/2">
              {dateStr}
            </span>
          )}

          {/* Right: actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Mới nhất */}
            <Link
              href="/chuyen-muc/tin-nhanh"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 px-2 py-1 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
              </span>
              Mới nhất
            </Link>

            {/* Search */}
            <button
              onClick={() => { setSearchOpen(true); setSearchQuery(''); }}
              className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              aria-label="Tìm kiếm"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
            </button>

            {/* Dark mode */}
            <button
              onClick={cycleTheme}
              className="hidden sm:flex p-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              aria-label="Chế độ tối"
            >
              <span className="material-symbols-outlined text-[20px]">{themeIcon}</span>
            </button>

            {/* Auth */}
            {user ? (
              <div className="relative hidden sm:flex items-center" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-1.5 px-2 py-1 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                    {initials}
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200 hidden md:block max-w-[100px] truncate">
                    {user.name || user.email}
                  </span>
                  <span className="material-symbols-outlined text-slate-400 text-[14px]">expand_more</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 w-52 bg-white dark:bg-[#152019] shadow-xl border border-outline-variant/20 py-1 z-50">
                    <div className="px-3 py-2 border-b border-outline-variant/20">
                      <p className="font-bold text-xs text-on-surface truncate">{user.name}</p>
                      <p className="text-[10px] text-on-surface-variant truncate">{user.email}</p>
                    </div>
                    <Link href="/tai-khoan" className="flex items-center gap-2 px-3 py-2 hover:bg-surface-container-low text-xs text-on-surface transition-colors" onClick={() => setDropdownOpen(false)}>
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">person</span>
                      Tài khoản
                    </Link>
                    <Link href="/tai-khoan/da-luu" className="flex items-center gap-2 px-3 py-2 hover:bg-surface-container-low text-xs text-on-surface transition-colors" onClick={() => setDropdownOpen(false)}>
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">bookmark</span>
                      Bài đã lưu
                    </Link>
                    <Link href="/ai-chat" className="flex items-center gap-2 px-3 py-2 hover:bg-surface-container-low text-xs text-on-surface transition-colors" onClick={() => setDropdownOpen(false)}>
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">smart_toy</span>
                      AI Chat
                    </Link>
                    <div className="border-t border-outline-variant/20 mt-1 pt-1">
                      <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 dark:hover:bg-[#2a1010] text-xs text-red-600 w-full text-left transition-colors">
                        <span className="material-symbols-outlined text-[16px]">logout</span>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/dang-nhap"
                className="hidden sm:block text-xs font-semibold text-slate-700 dark:text-slate-200 px-2 py-1 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              >
                Đăng nhập
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button className="lg:hidden p-1.5 text-slate-600 dark:text-slate-400" onClick={() => setMenuOpen(!menuOpen)}>
              <span className="material-symbols-outlined text-[20px]">{menuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Row 2: Nav bar ─────────────────────────────────────────── */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <nav className="flex items-center justify-center gap-0 h-10 overflow-x-auto scrollbar-none">
            {/* Home icon */}
            <Link
              href="/"
              className={`flex items-center px-3 h-full border-b-2 text-sm transition-colors ${
                pathname === '/'
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400'
              }`}
              aria-label="Trang chủ"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>home</span>
            </Link>

            {/* API categories */}
            {navItems.map((item) => (
              <Link
                key={item.slug}
                href={`/chuyen-muc/${item.slug}`}
                className={`flex items-center px-3 h-full border-b-2 text-sm font-medium transition-colors ${
                  isCatActive(item.slug)
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400'
                }`}
              >
                {item.label}
              </Link>
            ))}

            {/* Static pages */}
            {STATIC_PAGES.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className={`flex items-center px-3 h-full border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                  isNavActive(page.href)
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400'
                }`}
              >
                {page.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────────── */}
      {menuOpen && (
        <nav className="lg:hidden border-t border-outline-variant/20 bg-white dark:bg-[#0a1410] px-4 py-2 flex flex-col">
          <Link href="/" className="py-2 text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2" onClick={() => setMenuOpen(false)}>
            <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>home</span>
            Trang chủ
          </Link>
          {navItems.map(item => (
            <Link key={item.slug} href={`/chuyen-muc/${item.slug}`} className="py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border-t border-outline-variant/10" onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
          {STATIC_PAGES.map(page => (
            <Link key={page.href} href={page.href} className="py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border-t border-outline-variant/10" onClick={() => setMenuOpen(false)}>
              {page.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 pt-3 border-t border-outline-variant/20 mt-1">
            <button onClick={cycleTheme} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">{themeIcon}</span>
              {themeLabel}
            </button>
            {user ? (
              <button onClick={handleLogout} className="text-sm text-red-600 font-medium ml-auto">Đăng xuất</button>
            ) : (
              <Link href="/dang-nhap" className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 ml-auto" onClick={() => setMenuOpen(false)}>Đăng nhập</Link>
            )}
          </div>
        </nav>
      )}

      {/* ── Search modal ─────────────────────────────────────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 px-4" onClick={() => setSearchOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-[#152019] shadow-2xl overflow-hidden animate-[fadeUp_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  setSearchOpen(false);
                  router.push(`/tim-kiem?q=${encodeURIComponent(searchQuery.trim())}`);
                }
              }}
            >
              <div className="flex items-center gap-3 px-5 py-3 border-b border-outline-variant/20">
                <span className="material-symbols-outlined text-emerald-600 text-xl">search</span>
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm bài viết, chủ đề..."
                  className="flex-1 text-base text-on-surface placeholder:text-on-surface-variant outline-none bg-transparent"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <div className="px-5 py-2 bg-surface-container-low text-xs text-on-surface-variant flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-surface-container-lowest border border-outline-variant/30 text-[10px] font-mono">Enter</kbd> để tìm
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-surface-container-lowest border border-outline-variant/30 text-[10px] font-mono">Esc</kbd> để đóng
                </span>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { transform: translateY(-8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </header>
  );
}
