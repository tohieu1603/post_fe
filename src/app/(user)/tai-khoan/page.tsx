'use client';
import { API } from '@/lib/api';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';


interface UserInfo {
  name: string;
  email: string;
  phone: string;
  bio: string;
  tokens?: number;
}

interface JwtPayload {
  name?: string;
  email?: string;
  iat?: number;
  [key: string]: unknown;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64)) as JwtPayload;
  } catch {
    return null;
  }
}

function formatJoinDate(timestamp?: number): string {
  if (!timestamp) return 'tháng 1, 2026';
  const d = new Date(timestamp * 1000);
  return `tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
}

function loadUserFromStorage(): { user: UserInfo; joinDate: string } {
  const defaults: UserInfo = { name: 'Nguyễn Văn A', email: 'member@email.com', phone: '090 123 4567', bio: '', tokens: 150 };
  let joinDate = 'tháng 1, 2026';
  try {
    if (typeof window === 'undefined') return { user: defaults, joinDate };
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    let name = defaults.name;
    let email = defaults.email;

    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, string>;
      if (parsed.name || parsed.fullName) name = parsed.name || parsed.fullName;
      if (parsed.email) email = parsed.email;
    }

    if (token) {
      const payload = decodeJwt(token);
      if (payload) {
        if (payload.name) name = payload.name;
        if (payload.email) email = payload.email;
        if (payload.iat) joinDate = formatJoinDate(payload.iat);
      }
    }
    return { user: { ...defaults, name, email }, joinDate };
  } catch {
    return { user: defaults, joinDate };
  }
}

export default function ProfilePage() {
  const pathname = usePathname();
  const [{ user: initialUser, joinDate }] = useState(loadUserFromStorage);
  const [user, setUser] = useState<UserInfo>(initialUser);
  const [savedName, setSavedName] = useState(initialUser.name);
  const [savedPhone, setSavedPhone] = useState(initialUser.phone);
  const [savedBio, setSavedBio] = useState('');
  const [saveMsg, setSaveMsg] = useState('');

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  const formSectionRef = useRef<HTMLDivElement>(null);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaveMsg('');
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const token = typeof window !== 'undefined'
        ? (localStorage.getItem('accessToken') || localStorage.getItem('token'))
        : null;
      const userId = stored ? (JSON.parse(stored) as Record<string, string>).id : null;

      if (userId && token) {
        const res = await fetch(`${API}/api/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ name: savedName, phone: savedPhone }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setSaveMsg(data?.message || 'Lưu thất bại. Vui lòng thử lại.');
          return;
        }
        // Update localStorage
        if (stored) {
          const parsed = JSON.parse(stored) as Record<string, string>;
          localStorage.setItem('user', JSON.stringify({ ...parsed, name: savedName, phone: savedPhone }));
        }
      }

      setUser(prev => ({ ...prev, name: savedName, phone: savedPhone, bio: savedBio }));
      setSaveMsg('Đã lưu thay đổi!');
      setTimeout(() => setSaveMsg(''), 3000);
    } catch {
      setSaveMsg('Lưu thất bại. Vui lòng thử lại.');
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg('');
    if (!oldPassword) { setPasswordMsg('Vui lòng nhập mật khẩu cũ.'); return; }
    if (!newPassword) { setPasswordMsg('Vui lòng nhập mật khẩu mới.'); return; }
    if (newPassword.length < 6) { setPasswordMsg('Mật khẩu mới phải có ít nhất 6 ký tự.'); return; }
    if (newPassword !== confirmNewPassword) { setPasswordMsg('Mật khẩu xác nhận không khớp.'); return; }

    try {
      const token = typeof window !== 'undefined'
        ? (localStorage.getItem('accessToken') || localStorage.getItem('token'))
        : null;
      const res = await fetch(`${API}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setPasswordMsg(data?.message || 'Cập nhật mật khẩu thất bại. Vui lòng thử lại.');
        return;
      }
      setPasswordMsg('Đã cập nhật mật khẩu thành công!');
      setOldPassword(''); setNewPassword(''); setConfirmNewPassword('');
      setTimeout(() => setPasswordMsg(''), 4000);
    } catch {
      setPasswordMsg('Cập nhật mật khẩu thất bại. Vui lòng thử lại.');
    }
  }

  return (
    <main className="pt-20 pb-24">
<section className="bg-surface-container-low pt-8 md:pt-12 pb-8">
<div className="max-w-4xl mx-auto px-4 md:px-6">
<div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4 md:gap-6">
<div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
<div className="relative group flex-shrink-0">
<div className="w-[80px] h-[80px] rounded-full overflow-hidden ring-4 ring-white shadow-xl bg-emerald-100 flex items-center justify-center">
  <span className="material-symbols-outlined text-4xl text-emerald-700">person</span>
</div>
</div>
<div className="text-center md:text-left">
<h1 className="text-xl md:text-2xl font-bold text-on-surface">{user.name}</h1>
<p className="text-on-surface-variant font-medium text-sm md:text-base">{user.email}</p>
<p className="text-outline text-sm mt-1">Thành viên từ {joinDate}</p>
</div>
</div>
<button
  className="w-full md:w-auto px-6 py-3 min-h-[44px] border-2 border-primary text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-all duration-200"
  onClick={() => formSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
>
  Chỉnh sửa
</button>
</div>
</div>
</section>
<section className="mt-6 md:mt-8">
<div className="max-w-4xl mx-auto px-4 md:px-6">
<div className="flex items-center gap-6 md:gap-8 border-b border-outline-variant/30 overflow-x-auto no-scrollbar">
{[
  { label: 'Thông tin', href: '/tai-khoan' },
  { label: 'Bài đã lưu', href: '/tai-khoan/da-luu' },
  { label: 'Token', href: '/tai-khoan/nap-token' },
].map(({ label, href }) => (
  <Link
    key={href}
    href={href}
    className={`pb-3 font-medium whitespace-nowrap transition-colors ${
      pathname === href
        ? 'text-primary font-bold border-b-2 border-primary'
        : 'text-on-surface-variant hover:text-primary'
    }`}
  >
    {label}
  </Link>
))}
<span className="pb-3 text-on-surface-variant font-medium whitespace-nowrap cursor-default opacity-50">Lịch sử</span>
</div>
<div ref={formSectionRef} className="mt-8 md:mt-10 grid gap-6 md:gap-8">
<div className="bg-surface-container-lowest rounded-xl p-4 md:p-8 shadow-[0_16px_32px_-8px_rgba(0,108,73,0.08)]">
<div className="flex items-center gap-3 mb-6 md:mb-8">
<span className="material-symbols-outlined text-primary" data-icon="person">person</span>
<h2 className="text-xl font-bold tracking-tight">Thông tin cá nhân</h2>
</div>

{saveMsg && (
  <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium border ${saveMsg.startsWith('Đã') ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
    {saveMsg}
  </div>
)}

<form className="space-y-4 md:space-y-6" onSubmit={handleSaveProfile}>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
<div className="space-y-2">
<label className="text-sm font-bold text-on-surface-variant px-1">Họ tên</label>
<input
  className="w-full bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary/20 py-3 px-4 text-on-surface transition-all"
  type="text"
  value={savedName}
  onChange={e => setSavedName(e.target.value)}
/>
</div>
<div className="space-y-2">
<label className="text-sm font-bold text-on-surface-variant px-1">Email</label>
<input className="w-full bg-surface-variant/50 border-none rounded-lg py-3 px-4 text-outline cursor-not-allowed" disabled type="email" value={user.email}/>
</div>
<div className="space-y-2">
<label className="text-sm font-bold text-on-surface-variant px-1">Số điện thoại</label>
<input
  className="w-full bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary/20 py-3 px-4 text-on-surface transition-all"
  type="tel"
  value={savedPhone}
  onChange={e => setSavedPhone(e.target.value)}
/>
</div>
</div>
<div className="space-y-2">
<label className="text-sm font-bold text-on-surface-variant px-1">Tiểu sử</label>
<textarea
  className="w-full bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary/20 py-3 px-4 text-on-surface transition-all resize-none"
  placeholder="Chia sẻ một chút về bản thân bạn..."
  rows={4}
  value={savedBio}
  onChange={e => setSavedBio(e.target.value)}
></textarea>
</div>
<div className="flex justify-end pt-4">
<button className="w-full md:w-auto bg-gradient-to-br from-primary to-primary-container text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:scale-[1.02] transition-transform active:scale-95" type="submit">
                                    Lưu thay đổi
                                </button>
</div>
</form>
</div>
<div className="bg-surface-container-lowest rounded-xl p-4 md:p-8 shadow-[0_16px_32px_-8px_rgba(0,108,73,0.08)]">
<div className="flex items-center gap-3 mb-6 md:mb-8">
<span className="material-symbols-outlined text-primary" data-icon="lock">lock</span>
<h2 className="text-xl font-bold tracking-tight">Đổi mật khẩu</h2>
</div>

{passwordMsg && (
  <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium border ${passwordMsg.startsWith('Đã') ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
    {passwordMsg}
  </div>
)}

<form className="space-y-4 md:space-y-6" onSubmit={handleChangePassword}>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
<div className="space-y-2">
<label className="text-sm font-bold text-on-surface-variant px-1">Mật khẩu cũ</label>
<input
  className="w-full bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary/20 py-3 px-4 text-on-surface transition-all"
  placeholder="••••••••"
  type="password"
  value={oldPassword}
  onChange={e => setOldPassword(e.target.value)}
/>
</div>
<div className="space-y-2">
<label className="text-sm font-bold text-on-surface-variant px-1">Mật khẩu mới</label>
<input
  className="w-full bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary/20 py-3 px-4 text-on-surface transition-all"
  placeholder="••••••••"
  type="password"
  value={newPassword}
  onChange={e => setNewPassword(e.target.value)}
/>
</div>
<div className="space-y-2">
<label className="text-sm font-bold text-on-surface-variant px-1">Xác nhận mật khẩu</label>
<input
  className="w-full bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary/20 py-3 px-4 text-on-surface transition-all"
  placeholder="••••••••"
  type="password"
  value={confirmNewPassword}
  onChange={e => setConfirmNewPassword(e.target.value)}
/>
</div>
</div>
<div className="flex justify-end pt-4">
<button className="w-full md:w-auto bg-gradient-to-br from-primary to-primary-container text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:scale-[1.02] transition-transform active:scale-95" type="submit">
                                    Cập nhật
                                </button>
</div>
</form>
</div>
</div>
</div>
</section>
    </main>
  );
}
