'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Vui lòng nhập email.'); return; }
    if (!password) { setError('Vui lòng nhập mật khẩu.'); return; }

    setLoading(true);
    try {
      const data = await login(email.trim(), password);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/');
    } catch (err) {
      console.error('Login error:', err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message.includes('401') ? 'Email hoặc mật khẩu không đúng.' : `Lỗi: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `body { font-family: 'Inter', sans-serif; }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .login-gradient {
            background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
        }
        .custom-shadow {
            box-shadow: 0 10px 25px rgba(0, 108, 73, 0.08);
        }`}} />
      {/*  Login Shell Suppression: Global Nav is hidden for transactional focus  */}
<div className="bg-background min-h-screen flex flex-col items-center justify-center login-gradient antialiased">
<main className="w-full flex justify-center items-center px-4 py-12">
<div className="max-w-[420px] w-full bg-surface-container-lowest rounded-2xl p-6 md:p-10 custom-shadow transition-all duration-300">
{/*  Brand Identity  */}
<div className="flex flex-col items-center mb-8">
<div className="w-12 h-12 bg-primary-container/10 rounded-xl flex items-center justify-center mb-4">
<span className="material-symbols-outlined text-primary text-3xl" data-icon="eco" style={{fontVariationSettings: '"FILL" 1'}}>eco</span>
</div>
<h1 className="text-xl md:text-2xl font-extrabold tracking-tighter text-on-background">AI Vietnam</h1>
<p className="text-on-surface-variant font-medium mt-1">Chào mừng trở lại!</p>
</div>
<h2 className="text-xl md:text-2xl font-bold text-on-surface mb-6 text-center">Đăng nhập</h2>

{error && (
  <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
    {error}
  </div>
)}

{/*  Form Section  */}
<form className="space-y-5" onSubmit={handleSubmit}>
<div>
<label className="block text-sm font-semibold text-on-surface-variant mb-1.5" htmlFor="email">Email</label>
<input
  className="w-full h-[44px] bg-surface-container-low border-outline-variant/30 rounded-lg px-4 text-on-surface focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline/50"
  id="email"
  placeholder="you@example.com"
  type="email"
  value={email}
  onChange={e => setEmail(e.target.value)}
  autoComplete="email"
/>
</div>
<div>
<label className="block text-sm font-semibold text-on-surface-variant mb-1.5" htmlFor="password">Mật khẩu</label>
<div className="relative">
<input
  className="w-full h-[44px] bg-surface-container-low border-outline-variant/30 rounded-lg px-4 pr-11 text-on-surface focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline/50"
  id="password"
  placeholder="••••••••"
  type={showPassword ? 'text' : 'password'}
  value={password}
  onChange={e => setPassword(e.target.value)}
  autoComplete="current-password"
/>
<button className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors" type="button" onClick={() => setShowPassword(v => !v)}>
<span className="material-symbols-outlined text-[20px]" data-icon="visibility">{showPassword ? 'visibility_off' : 'visibility'}</span>
</button>
</div>
</div>
<div className="flex items-center justify-between text-sm">
<label className="flex items-center cursor-pointer group">
<input className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20 transition-all" type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}/>
<span className="ml-2 text-on-surface-variant group-hover:text-on-surface transition-colors">Ghi nhớ đăng nhập</span>
</label>
<Link className="font-semibold text-primary hover:text-secondary transition-colors" href="/quen-mat-khau">Quên mật khẩu?</Link>
</div>
<button
  className="w-full h-[44px] bg-gradient-to-br from-primary to-primary-container text-white font-bold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-md shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
  type="submit"
  disabled={loading}
>
  {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
</button>
</form>
{/*  Divider  */}
<div className="relative my-8">
<div className="absolute inset-0 flex items-center">
<div className="w-full border-t border-outline-variant/20"></div>
</div>
<div className="relative flex justify-center text-sm">
<span className="px-3 bg-surface-container-lowest text-outline/60 font-medium">hoặc</span>
</div>
</div>
{/*  Social Logins  */}
<div className="space-y-3">
<button className="w-full h-[44px] flex items-center justify-center gap-3 border border-outline-variant/40 rounded-lg bg-white hover:bg-surface-container-low transition-colors cursor-not-allowed opacity-50" type="button" title="Sắp ra mắt" disabled>
<img alt="Google" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPzHfDhjyTa_MYMpzzTU8JpC4qN-gipTWrnq5OZZMO1yzdQK3VeE5G_IDXkvy-oDgIl5BFzyibkFWy-at-8sqNeRfyVURzdQ7Cc-Wz61WBq6OGLqDE65le827VVPYkT5Aw2roZEc7ET13VW7a1bsce856G841nV29S7Q9EgGdXJ_gxn76X1GR4I3e1z3KjBx7DcsLzdpjhsr2XyCnkf_DA_L-YIjN85BDDwCP3ioOsJrykZz9c96s-aztBEZn2QPff_sVsqZ2Vtw"/>
<span className="text-sm font-semibold text-on-surface-variant">Đăng nhập bằng Google</span>
</button>
<button className="w-full h-[44px] flex items-center justify-center gap-3 bg-[#1877F2] text-white rounded-lg cursor-not-allowed opacity-50" type="button" title="Sắp ra mắt" disabled>
<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
<span className="text-sm font-semibold">Đăng nhập bằng Facebook</span>
</button>
</div>
{/*  Footer Link  */}
<div className="mt-8 text-center text-sm">
<p className="text-on-surface-variant">
                    Chưa có tài khoản?
                    <Link className="text-primary font-bold hover:text-secondary ml-1 transition-colors underline-offset-4 hover:underline" href="/dang-ky">Đăng ký ngay</Link>
</p>
</div>
</div>
</main>
{/*  Contextual Footer (Simplified for Transactional Pages)  */}
<footer className="mt-auto py-8 w-full">
<div className="max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-outline/60 text-xs font-medium text-center md:text-left">
<div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
<span className="font-bold text-on-surface-variant/80">AI Vietnam</span>
<span>© 2024 The Digital Curator</span>
</div>
<div className="flex flex-wrap justify-center gap-6">
<Link className="hover:text-primary transition-colors" href="/chinh-sach-bien-tap">Điều khoản</Link>
<Link className="hover:text-primary transition-colors" href="/chinh-sach-bao-mat">Bảo mật</Link>
<Link className="hover:text-primary transition-colors" href="/lien-he">Liên hệ</Link>
</div>
</div>
</footer>
</div>
    </>
  );
}
