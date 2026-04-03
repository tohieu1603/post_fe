'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin-sidebar';
import AdminHeader from '@/components/admin-header';
import { ToastProvider } from '@/components/toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [adminName, setAdminName] = useState('Admin');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (!token) {
      router.replace('/dang-nhap');
      return;
    }
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user?.name) setAdminName(user.name);
      }
    } catch {}
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <ToastProvider>
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar
        adminName={adminName}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="lg:ml-[260px] flex flex-col min-h-screen">
        <AdminHeader
          adminName={adminName}
          onMenuToggle={() => setMobileOpen((v) => !v)}
        />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
    </ToastProvider>
  );
}
