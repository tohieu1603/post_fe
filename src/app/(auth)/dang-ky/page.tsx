'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = (() => {
    if (!password) return { label: '', color: '', bars: [false, false, false] };
    if (password.length < 6) return { label: 'Yếu', color: 'text-red-500', bars: [true, false, false] };
    if (password.length < 10) return { label: 'Trung bình', color: 'text-emerald-600', bars: [true, true, false] };
    return { label: 'Mạnh', color: 'text-emerald-700', bars: [true, true, true] };
  })();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Vui lòng nhập họ và tên.'); return; }
    if (!email.trim()) { setError('Vui lòng nhập email.'); return; }
    if (!password) { setError('Vui lòng nhập mật khẩu.'); return; }
    if (password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự.'); return; }
    if (password !== confirmPassword) { setError('Mật khẩu xác nhận không khớp.'); return; }
    if (!terms) { setError('Vui lòng đồng ý với điều khoản sử dụng.'); return; }

    setLoading(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      router.push('/dang-nhap?registered=1');
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setError(message.includes('409') ? 'Email này đã được đăng ký.' : 'Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `body { font-family: 'Inter', sans-serif; }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }`}} />
      {/*  TopNavBar: Suppressed on focused Transactional pages (Register) as per Shell Visibility Rule  */}
{/*  However, since the user explicitly requested it, it will be rendered as a minimal version or standard as provided  */}
<div className="bg-background text-on-background min-h-screen flex flex-col">
<nav className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-6 py-4 max-w-7xl mx-auto left-0 right-0 bg-white/70 backdrop-blur-xl transition-all duration-200">
<div className="text-xl font-bold text-emerald-700 flex items-center gap-2 shrink-0">
<span className="material-symbols-outlined" data-icon="eco" style={{fontVariationSettings: '"FILL" 1'}}>eco</span>
            AI Vietnam
        </div>
<div className="hidden md:flex items-center gap-8">
<Link className="text-slate-600 hover:text-emerald-500 transition-colors" href="/gioi-thieu">Về chúng tôi</Link>
<a className="text-slate-600 hover:text-emerald-500 transition-colors" href="/#">Tính năng</a>
<a className="text-slate-600 hover:text-emerald-500 transition-colors" href="/#">Tài liệu</a>
</div>
<div className="flex items-center gap-2 md:gap-4 shrink-0">
<Link className="text-emerald-700 font-semibold border-b-2 border-emerald-500 pb-1 text-sm md:text-base" href="/dang-ky">Đăng ký</Link>
<Link className="px-3 md:px-4 py-2 text-sm md:text-base text-slate-600 hover:text-emerald-500 transition-colors" href="/dang-nhap">Đăng nhập</Link>
</div>
</nav>
{/*  Main Content: Focused Registration Canvas  */}
<main className="flex-grow flex items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-white">
{/*  Abstract background decoration  */}
<div className="absolute top-0 right-0 w-96 h-96 bg-primary-container/10 blur-[120px] -z-10 rounded-full"></div>
<div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary-container/10 blur-[100px] -z-10 rounded-full"></div>
<section className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl p-6 md:p-10 flex flex-col items-center">
{/*  Brand Identity  */}
<div className="flex flex-col items-center mb-8">
<div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
<span className="material-symbols-outlined text-3xl" data-icon="eco" style={{fontVariationSettings: '"FILL" 1'}}>eco</span>
</div>
<h1 className="text-xl md:text-2xl font-bold text-on-surface mb-2 font-headline tracking-tight">Tạo tài khoản</h1>
<p className="text-slate-500 text-sm text-center">Đăng ký để trải nghiệm AI Vietnam</p>
</div>

{error && (
  <div className="w-full mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
    {error}
  </div>
)}

{/*  Registration Form  */}
<form className="w-full space-y-5" onSubmit={handleSubmit}>
<div className="space-y-1.5">
<label className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">Họ và tên</label>
<input
  className="w-full px-4 h-12 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none text-on-surface"
  placeholder="Nguyễn Văn A"
  type="text"
  value={name}
  onChange={e => setName(e.target.value)}
  autoComplete="name"
/>
</div>
<div className="space-y-1.5">
<label className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">Email</label>
<input
  className="w-full px-4 h-12 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none text-on-surface"
  placeholder="you@example.com"
  type="email"
  value={email}
  onChange={e => setEmail(e.target.value)}
  autoComplete="email"
/>
</div>
<div className="space-y-1.5 relative">
<label className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">Mật khẩu</label>
<div className="relative">
<input
  className="w-full px-4 h-12 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none text-on-surface pr-12"
  placeholder="••••••••"
  type={showPassword ? 'text' : 'password'}
  value={password}
  onChange={e => setPassword(e.target.value)}
  autoComplete="new-password"
/>
<button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" type="button" onClick={() => setShowPassword(v => !v)}>
<span className="material-symbols-outlined" data-icon="visibility">{showPassword ? 'visibility_off' : 'visibility'}</span>
</button>
</div>
{/*  Password Strength Bar  */}
{password && (
  <>
    <div className="flex gap-1 pt-1">
      <div className={`h-1 flex-1 rounded-full ${passwordStrength.bars[0] ? 'bg-primary' : 'bg-surface-variant'}`}></div>
      <div className={`h-1 flex-1 rounded-full ${passwordStrength.bars[1] ? 'bg-primary' : 'bg-surface-variant'}`}></div>
      <div className={`h-1 flex-1 rounded-full ${passwordStrength.bars[2] ? 'bg-primary' : 'bg-surface-variant'}`}></div>
    </div>
    <p className="text-[10px] text-slate-400">Độ mạnh: <span className={`font-medium ${passwordStrength.color}`}>{passwordStrength.label}</span></p>
  </>
)}
</div>
<div className="space-y-1.5">
<label className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">Xác nhận mật khẩu</label>
<input
  className="w-full px-4 h-12 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none text-on-surface"
  placeholder="••••••••"
  type="password"
  value={confirmPassword}
  onChange={e => setConfirmPassword(e.target.value)}
  autoComplete="new-password"
/>
</div>
<div className="flex items-start gap-3 py-2">
<input className="mt-1 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" id="terms" type="checkbox" checked={terms} onChange={e => setTerms(e.target.checked)}/>
<label className="text-sm text-slate-500 leading-tight" htmlFor="terms">
                        Tôi đồng ý với <Link className="text-emerald-600 font-medium hover:underline" href="/chinh-sach-bien-tap">Điều khoản sử dụng</Link> và <Link className="text-emerald-600 font-medium hover:underline" href="/chinh-sach-bao-mat">Chính sách bảo mật</Link>
</label>
</div>
<button
  className="w-full h-[44px] bg-primary text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
  type="submit"
  disabled={loading}
>
  {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
  {loading ? 'Đang đăng ký...' : 'Đăng ký'}
</button>
</form>
<div className="w-full flex items-center gap-4 my-6">
<div className="h-px bg-slate-100 flex-grow"></div>
<span className="text-[11px] uppercase tracking-widest text-slate-400 font-medium">hoặc</span>
<div className="h-px bg-slate-100 flex-grow"></div>
</div>
{/*  OAuth Buttons  */}
<div className="w-full space-y-3">
<button className="w-full h-[44px] border border-slate-200 rounded-xl flex items-center justify-center gap-3 text-slate-700 font-medium bg-white cursor-not-allowed opacity-50" type="button" title="Sắp ra mắt" disabled>
<img alt="" className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOtDFmIdbToI1HOwvBXyIPev4J4J6qAgDagZCCU0r25FysLzoT-vcvGt2_b37YbShtxaYTV8rXr1jCdBUGGBlos0h0povf7Y8kQh0heK4pVjxJsLBpq_mXEzdr91TSX3t6CoNIv4SCAyyGt-G9h8yHBxih3EEJ8gM24Lr9C9ysIzjjLFGMF2J_ta6f6d-5owxQcJCaMN1nuoXw3Qu3pQ-2fzW6QiZB9VqVbdT9l3VFz1fAxGZpv-aIa1B0U3qRfAj3Wz6AKKfgvQ"/>
                    Tiếp tục với Google
                </button>
<button className="w-full h-[44px] bg-[#1877F2] text-white rounded-xl flex items-center justify-center gap-3 font-medium cursor-not-allowed opacity-50" type="button" title="Sắp ra mắt" disabled>
<svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path></svg>
                    Tiếp tục với Facebook
                </button>
</div>
<p className="mt-8 text-sm text-slate-500">
                Đã có tài khoản?
                <Link className="text-emerald-600 font-semibold hover:underline" href="/dang-nhap"> Đăng nhập</Link>
</p>
</section>
</main>
{/*  Footer  */}
<footer className="w-full py-6 md:py-12 px-4 md:px-6 bg-slate-50 border-t border-slate-200">
<div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
<div className="text-lg font-bold text-slate-900 flex items-center gap-2 justify-center md:justify-start">
<span className="material-symbols-outlined text-emerald-600" data-icon="eco">eco</span>
                AI Vietnam
            </div>
<div className="flex flex-wrap justify-center gap-4 md:gap-6">
<Link className="text-sm text-slate-500 hover:text-emerald-500 transition-all" href="/chinh-sach-bien-tap">Điều khoản</Link>
<Link className="text-sm text-slate-500 hover:text-emerald-500 transition-all" href="/chinh-sach-bao-mat">Bảo mật</Link>
<Link className="text-sm text-slate-500 hover:text-emerald-500 transition-all" href="/lien-he">Liên hệ</Link>
<a className="text-sm text-slate-500 hover:text-emerald-500 transition-all" href="#">Trợ giúp</a>
</div>
<div className="text-sm text-slate-500 font-['Inter'] text-center md:text-right">
                © 2024 AI Vietnam. Nền tảng trí tuệ nhân tạo hàng đầu.
            </div>
</div>
</footer>
</div>
    </>
  );
}
