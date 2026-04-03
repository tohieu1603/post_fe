'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

interface MenuItem {
  label: string;
  href: string;
  icon: string;
}

const MENU_ITEMS: MenuItem[] = [
  { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
  { label: 'Bài viết', href: '/admin/bai-viet', icon: 'article' },
  { label: 'Chuyên mục', href: '/admin/chuyen-muc', icon: 'category' },
  { label: 'Tags', href: '/admin/tags', icon: 'sell' },
  { label: 'Tác giả', href: '/admin/tac-gia', icon: 'person_edit' },
  { label: 'Thành viên', href: '/admin/thanh-vien', icon: 'group' },
  { label: 'Bình luận', href: '/admin/binh-luan', icon: 'forum' },
  { label: 'Doanh thu', href: '/admin/doanh-thu', icon: 'payments' },
  { label: 'SEO', href: '/admin/seo', icon: 'search_insights' },
  { label: 'Cài đặt', href: '/admin/cai-dat', icon: 'settings' },
];

interface AdminSidebarProps {
  adminName?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function AdminSidebar({ adminName = 'Admin', mobileOpen = false, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string): boolean {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  }

  function handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.replace('/dang-nhap');
  }

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-full w-[260px] bg-slate-900 flex flex-col shadow-xl z-50
          transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-800">
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white text-xl">eco</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">AI Vietnam</h1>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Hệ thống quản trị</p>
          </div>
          {/* Mobile close button */}
          <button
            className="ml-auto text-slate-400 hover:text-white lg:hidden"
            onClick={onMobileClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {MENU_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${active
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }
                `}
              >
                <span className="material-symbols-outlined text-xl leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom user + logout */}
        <div className="border-t border-slate-800 px-3 py-4 space-y-1">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-white text-sm font-semibold truncate">{adminName}</span>
              <span className="text-slate-500 text-xs truncate">Quản trị viên</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors text-sm font-medium"
          >
            <span className="material-symbols-outlined text-xl leading-none">logout</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>
    </>
  );
}
