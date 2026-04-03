'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Vui lòng nhập địa chỉ email.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Email không hợp lệ.'); return; }

    setLoading(true);
    // Simulate network delay, no API yet
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `body {
            font-family: 'Inter', sans-serif;
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            display: inline-block;
            vertical-align: middle;
        }
        .editorial-gradient {
            background: linear-gradient(to bottom, #f0fdf4, #ffffff);
        }
        .primary-gradient-btn {
            background: linear-gradient(135deg, #006c49 0%, #10b981 100%);
        }`}} />
      {/*  TopNavBar (Suppressed for focused transactional task as per rules, but identity is maintained in the card)  */}
<div className="bg-surface text-on-background min-h-screen flex flex-col editorial-gradient">
<main className="flex-grow flex items-center justify-center px-4 py-12">
<div className="w-full max-w-[420px] bg-surface-container-lowest rounded-2xl shadow-xl p-6 md:p-10 flex flex-col items-center">
{/*  Branding Section  */}
<div className="flex items-center gap-2 mb-10 group cursor-default">
<span className="material-symbols-outlined text-primary text-3xl" data-icon="eco">eco</span>
<span className="text-xl font-bold tracking-tighter text-primary">AI Vietnam</span>
</div>
{/*  Visual Anchor  */}
<div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-6">
<span className="material-symbols-outlined text-outline-variant text-4xl" data-icon="lock_reset">lock_reset</span>
</div>

{submitted ? (
  <>
    {/*  Success State  */}
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="material-symbols-outlined text-primary text-3xl" style={{fontVariationSettings: '"FILL" 1'}}>mark_email_read</span>
      </div>
      <h1 className="text-xl md:text-2xl font-bold text-on-background tracking-tight mb-2">Kiểm tra hộp thư!</h1>
      <p className="text-on-surface-variant leading-relaxed">
        Chúng tôi đã gửi link đặt lại mật khẩu đến{' '}
        <strong className="text-on-surface break-all">{email}</strong>
      </p>
      <p className="text-sm text-on-surface-variant mt-3">Không nhận được? Kiểm tra thư mục spam hoặc thử lại.</p>
    </div>
    <button
      className="w-full h-11 primary-gradient-btn text-on-primary font-bold rounded-lg shadow-md hover:opacity-90 active:scale-[0.98] transition-all duration-200"
      onClick={() => { setSubmitted(false); setEmail(''); }}
    >
      Gửi lại
    </button>
  </>
) : (
  <>
    {/*  Messaging  */}
    <div className="text-center mb-8">
      <h1 className="text-xl md:text-2xl font-bold text-on-background tracking-tight mb-2">Quên mật khẩu?</h1>
      <p className="text-on-surface-variant leading-relaxed">Nhập email để nhận link đặt lại mật khẩu.</p>
    </div>

    {error && (
      <div className="w-full mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
        {error}
      </div>
    )}

    {/*  Transactional Form  */}
    <form className="w-full space-y-6" onSubmit={handleSubmit}>
    <div className="space-y-1.5">
    <label className="text-sm font-semibold text-on-surface-variant ml-1" htmlFor="email">Địa chỉ Email</label>
    <div className="relative">
    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg" data-icon="mail">mail</span>
    <input
      className="w-full h-11 pl-10 pr-4 bg-surface-container-high border-none rounded-lg focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all placeholder:text-outline-variant"
      id="email"
      placeholder="you@example.com"
      type="email"
      value={email}
      onChange={e => setEmail(e.target.value)}
      autoComplete="email"
    />
    </div>
    </div>
    <button
      className="w-full h-11 primary-gradient-btn text-on-primary font-bold rounded-lg shadow-md hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      type="submit"
      disabled={loading}
    >
      {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
      {loading ? 'Đang gửi...' : 'Gửi link đặt lại'}
    </button>
    </form>
  </>
)}

{/*  Navigation Fallback  */}
<div className="mt-8">
<Link className="flex items-center gap-2 text-primary font-semibold hover:opacity-80 transition-opacity" href="/dang-nhap">
<span className="material-symbols-outlined text-lg" data-icon="arrow_back">arrow_back</span>
<span>Quay lại đăng nhập</span>
</Link>
</div>
</div>
</main>
{/*  Footer - Simplified as per shell mandate for transactional pages  */}
<footer className="w-full py-8 mt-auto">
<div className="flex flex-col md:flex-row justify-between items-center px-4 md:px-8 max-w-7xl mx-auto gap-4 text-center md:text-left">
<p className="text-sm font-['Inter'] leading-relaxed text-on-surface-variant">© 2024 AI Vietnam. The Editorial Intelligence.</p>
<div className="flex flex-wrap justify-center gap-6">
<Link className="text-sm text-on-surface-variant hover:text-primary transition-colors" href="/chinh-sach-bien-tap">Điều khoản</Link>
<Link className="text-sm text-on-surface-variant hover:text-primary transition-colors" href="/chinh-sach-bao-mat">Bảo mật</Link>
<Link className="text-sm text-on-surface-variant hover:text-primary transition-colors" href="/lien-he">Liên hệ</Link>
</div>
</div>
</footer>
{/*  Background Decorative Element (Tonal Plateau)  */}
<div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 opacity-30">
<div className="absolute top-[10%] left-[5%] w-64 h-64 bg-primary/5 rounded-full blur-[100px]"></div>
<div className="absolute bottom-[15%] right-[5%] w-96 h-96 bg-tertiary-container/5 rounded-full blur-[120px]"></div>
</div>
</div>
    </>
  );
}
