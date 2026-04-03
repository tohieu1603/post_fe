'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getNavMenu } from '@/lib/api';

interface NavItem {
  label: string;
  slug: string;
}

// AI Flash categories — hiển thị trên header nav
const AI_FLASH_SLUGS = ['model-moi', 'github-hot', 'startup-funding', 'so-sanh', 'huong-dan', 'phan-tich', 'deep-dive', 'tuan-qua'];

const FALLBACK_NAV: NavItem[] = [
  { label: 'Model Mới', slug: 'model-moi' },
  { label: 'GitHub Hot', slug: 'github-hot' },
  { label: 'Startup & Funding', slug: 'startup-funding' },
  { label: 'So Sánh', slug: 'so-sanh' },
  { label: 'Hướng Dẫn', slug: 'huong-dan' },
  { label: 'Phân Tích', slug: 'phan-tich' },
  { label: 'Deep Dive', slug: 'deep-dive' },
  { label: 'Tuần Qua', slug: 'tuan-qua' },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [navItems, setNavItems] = useState<NavItem[]>(FALLBACK_NAV);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch nav
    getNavMenu()
      .then(res => {
        if (res.data?.length) {
          // Only show AI Flash categories
          const items = res.data
            .filter((c: any) => AI_FLASH_SLUGS.includes(c.slug))
            .sort((a: any, b: any) => AI_FLASH_SLUGS.indexOf(a.slug) - AI_FLASH_SLUGS.indexOf(b.slug))
            .map((c: any) => ({ label: c.name, slug: c.slug }));
          if (items.length) setNavItems(items);
        }
      })
      .catch(() => {});

    // Check auth state
    try {
      const stored = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (stored && token) {
        setUser(JSON.parse(stored));
      }
    } catch {}

    // Restore dark mode from localStorage
    const savedDark = localStorage.getItem('darkMode') === 'true';
    if (savedDark) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Close search on Esc
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchOpen(false); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Click-outside listener for dropdown
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

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('darkMode', String(next));
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('token');
    setUser(null);
    setDropdownOpen(false);
    router.push('/');
  };

  // Get initials for avatar
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <header className="fixed top-0 w-full z-50 glass-header shadow-sm dark:shadow-none">
      <div className="flex justify-between items-center px-4 md:px-8 h-16 md:h-20 max-w-full mx-auto">
        {/* Brand Identity */}
        <Link href="/" className="text-2xl font-bold tracking-tighter text-emerald-900 dark:text-emerald-50 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">eco</span>
          AI Vietnam
        </Link>

        {/* Main Links */}
        <nav className="hidden lg:flex items-center gap-6 tracking-tight font-medium">
          {navItems.map((item) => {
            const isActive = pathname === `/chuyen-muc/${item.slug}`;
            return (
              <Link
                key={item.slug}
                href={`/chuyen-muc/${item.slug}`}
                className={isActive
                  ? 'text-emerald-700 dark:text-emerald-400 font-bold border-b-2 border-emerald-600 dark:border-emerald-400 px-1 py-1'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors'
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1 sm:gap-2 sm:mr-4">
            <button onClick={() => { setSearchOpen(true); setSearchQuery(''); }} className="p-2 hover:bg-emerald-100/50 rounded-full transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant">search</span>
            </button>
            <button onClick={toggleDarkMode} className="hidden sm:flex p-2 hover:bg-emerald-100/50 rounded-full transition-colors" aria-label="Toggle dark mode">
              <span className="material-symbols-outlined text-on-surface-variant">{darkMode ? 'dark_mode' : 'light_mode'}</span>
            </button>
          </div>

          {/* Auth state: logged in vs guest */}
          {user ? (
            <div className="hidden sm:flex items-center gap-3 relative" ref={dropdownRef}>
              <Link href="/tai-khoan" className="p-2 hover:bg-emerald-100/50 rounded-full transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
              </Link>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 hover:bg-emerald-100/50 rounded-full p-1 pr-3 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                  {initials}
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 hidden md:block">{user.name || user.email}</span>
                <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 text-[18px]">expand_more</span>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-[#152019] rounded-xl shadow-xl border border-outline-variant/20 py-2 z-50">
                  <div className="px-4 py-2 border-b border-outline-variant/20">
                    <p className="font-bold text-sm text-on-surface">{user.name}</p>
                    <p className="text-xs text-on-surface-variant">{user.email}</p>
                  </div>
                  <Link href="/tai-khoan" className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container-low transition-colors text-sm text-on-surface" onClick={() => setDropdownOpen(false)}>
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">person</span>
                    Tài khoản
                  </Link>
                  <Link href="/tai-khoan/da-luu" className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container-low transition-colors text-sm text-on-surface" onClick={() => setDropdownOpen(false)}>
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">bookmark</span>
                    Bài đã lưu
                  </Link>
                  <Link href="/ai-chat" className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container-low transition-colors text-sm text-on-surface" onClick={() => setDropdownOpen(false)}>
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">smart_toy</span>
                    AI Chat
                  </Link>
                  <div className="border-t border-outline-variant/20 mt-1 pt-1">
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-[#2a1010] transition-colors text-sm text-red-600 w-full text-left">
                      <span className="material-symbols-outlined text-[20px]">logout</span>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-4">
              <Link href="/dang-nhap" className="text-slate-600 dark:text-slate-300 font-medium hover:text-primary">Đăng nhập</Link>
              <Link href="/dang-ky" className="editorial-gradient text-white px-6 py-2.5 rounded-lg font-bold tracking-tight">
                Đăng ký
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button className="lg:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="lg:hidden px-4 md:px-8 pt-2 pb-6 flex flex-col gap-1 bg-surface border-t border-outline-variant/10">
          {navItems.map(item => (
            <Link key={item.slug} href={`/chuyen-muc/${item.slug}`} className="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 py-2 font-medium" onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-outline-variant/30">
            {user ? (
              <>
                <Link href="/tai-khoan" className="text-slate-600 font-medium" onClick={() => setMenuOpen(false)}>Tài khoản</Link>
                <button onClick={handleLogout} className="text-red-600 font-medium">Đăng xuất</button>
              </>
            ) : (
              <>
                <Link href="/dang-nhap" className="text-slate-600 dark:text-slate-300 font-medium">Đăng nhập</Link>
                <Link href="/dang-ky" className="editorial-gradient text-white px-6 py-2 rounded-lg font-bold">Đăng ký</Link>
              </>
            )}
          </div>
        </nav>
      )}
      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4" onClick={() => setSearchOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-[#152019] rounded-2xl shadow-2xl overflow-hidden animate-[fadeUp_0.2s_ease-out]"
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
              <div className="flex items-center gap-3 px-6 py-4 border-b border-outline-variant/20">
                <span className="material-symbols-outlined text-emerald-600 text-2xl">search</span>
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm bài viết, chủ đề..."
                  className="flex-1 text-lg text-on-surface placeholder:text-on-surface-variant outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-on-surface-variant hover:text-on-surface p-1"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="px-6 py-3 bg-surface-container-low text-xs text-on-surface-variant flex items-center gap-4">
                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-surface-container-lowest rounded border border-outline-variant/30 text-[10px] font-mono">Enter</kbd> để tìm</span>
                <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-surface-container-lowest rounded border border-outline-variant/30 text-[10px] font-mono">Esc</kbd> để đóng</span>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeUp {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </header>
  );
}
