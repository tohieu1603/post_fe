'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ACCOUNT_TABS = [
  { label: 'Thông tin', href: '/tai-khoan' },
  { label: 'Bài đã lưu', href: '/tai-khoan/da-luu' },
  { label: 'Token', href: '/tai-khoan/nap-token' },
];
const PLANS = [
  { id: 'basic', name: 'Cơ bản', price: '50.000₫', tokens: 100, featured: false, features: ['100 câu hỏi AI', 'Đọc bài premium', 'Tóm tắt bài viết'], extra: null },
  { id: 'standard', name: 'Tiêu chuẩn', price: '100.000₫', tokens: 250, featured: true, features: ['250 câu hỏi AI', 'Đọc bài premium', 'Tóm tắt bài viết'], extra: 'Ưu tiên hỗ trợ' },
  { id: 'pro', name: 'Chuyên nghiệp', price: '200.000₫', tokens: 600, featured: false, features: ['600 câu hỏi AI', 'Đọc bài premium', 'Tóm tắt bài viết'], extra: 'API access' },
];

const PAYMENT_METHODS = [
  { id: 'momo', label: 'Ví MoMo', bg: 'bg-[#a50064]', icon: 'account_balance_wallet', filled: true },
  { id: 'vnpay', label: 'VNPay', bg: 'bg-[#005ba1]', icon: 'credit_card', filled: false },
  { id: 'transfer', label: 'Chuyển khoản', bg: 'bg-primary/20', icon: 'account_balance', filled: false },
];

export default function BuyTokensPage() {
  const pathname = usePathname();
  const [selectedPlan, setSelectedPlan] = useState('standard');
  const [selectedPayment, setSelectedPayment] = useState('momo');
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, unknown>;
        const tokens = parsed.tokens ?? parsed.tokenBalance ?? parsed.token_balance;
        if (typeof tokens === 'number') setTokenBalance(tokens);
      }
    } catch {}
  }, []);

  const plan = PLANS.find(p => p.id === selectedPlan) || PLANS[1];
  const payment = PAYMENT_METHODS.find(p => p.id === selectedPayment) || PAYMENT_METHODS[0];

  return (
    <>
<div className="min-h-screen flex flex-col pt-20">
{/* Tab navigation */}
<div className="border-b border-outline-variant/30 px-4 md:px-8">
  <div className="flex items-center gap-6 md:gap-8 max-w-6xl mx-auto overflow-x-auto no-scrollbar">
    {ACCOUNT_TABS.map(({ label, href }) => (
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
</div>
<main className="flex-grow pb-20 px-4 md:px-8 max-w-6xl mx-auto w-full">
{/*  Balance Section  */}
<section className="bg-surface-container-low rounded-xl p-6 md:p-10 text-center mb-10 md:mb-16 transition-all">
<div className="inline-flex items-center justify-center w-16 md:w-20 h-16 md:h-20 rounded-full bg-primary/10 mb-4 md:mb-6">
<span className="material-symbols-outlined text-4xl md:text-5xl text-primary" style={{fontVariationSettings: '"FILL" 1'}}>diamond</span>
</div>
<p className="text-on-surface-variant font-medium mb-1">Số dư hiện tại</p>
<h1 className="text-3xl md:text-5xl font-black text-primary mb-3">
  {tokenBalance !== null ? `${tokenBalance} tokens` : '—'}
</h1>
<p className="text-on-surface-variant/80 text-sm md:text-base">Nạp thêm để tiếp tục sử dụng AI</p>
</section>
{/*  Pricing Section  */}
<section className="mb-12 md:mb-20">
<h2 className="text-2xl md:text-3xl font-black tracking-tight text-center mb-8 md:mb-12">Chọn gói token phù hợp</h2>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-start md:items-center">
{PLANS.map(p => (
  <div
    key={p.id}
    onClick={() => setSelectedPlan(p.id)}
    className={`bg-surface-container-lowest p-5 md:p-8 rounded-xl flex flex-col h-full transition-all cursor-pointer relative
      ${p.featured
        ? 'border-2 border-primary shadow-[0_24px_48px_-12px_rgba(0,108,73,0.12)] md:scale-105 z-10'
        : `border hover:shadow-[0_16px_32px_-8px_rgba(0,108,73,0.08)] ${selectedPlan === p.id ? 'border-primary' : 'border-outline-variant/10'}`
      }`}
  >
    {p.featured && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-tertiary-container text-on-tertiary-container px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap">
        Phổ biến nhất
      </div>
    )}
    <h3 className="text-lg md:text-xl font-bold mb-2">{p.name}</h3>
    <div className="mb-4 md:mb-6">
      <span className="text-2xl md:text-3xl font-black text-on-background">{p.price}</span>
    </div>
    <div className={`${p.featured ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-primary'} px-3 md:px-4 py-2 rounded-lg font-bold inline-block w-fit mb-6 md:mb-8 text-sm md:text-base`}>
      {p.tokens} tokens
    </div>
    <ul className="space-y-3 md:space-y-4 mb-6 md:mb-10 flex-grow">
      {p.features.map(f => (
        <li key={f} className="flex items-center gap-3 text-on-surface-variant text-sm md:text-base">
          <span className="material-symbols-outlined text-primary text-sm flex-shrink-0">check_circle</span>
          <span>{f}</span>
        </li>
      ))}
      {p.extra && (
        <li className="flex items-center gap-3 text-on-surface-variant font-bold text-sm md:text-base">
          <span className="material-symbols-outlined text-primary text-sm flex-shrink-0">{p.id === 'pro' ? 'api' : 'stars'}</span>
          <span>{p.extra}</span>
        </li>
      )}
    </ul>
    {p.featured
      ? <button onClick={() => setSelectedPlan(p.id)} className="w-full min-h-[44px] py-3 px-6 rounded-lg bg-gradient-to-br from-primary to-primary-container text-white font-bold hover:opacity-90 transition-opacity">Mua ngay</button>
      : <button onClick={() => setSelectedPlan(p.id)} className="w-full min-h-[44px] py-3 px-6 rounded-lg border-2 border-primary text-primary font-bold hover:bg-primary/5 transition-colors">Mua ngay</button>
    }
  </div>
))}
</div>
</section>
{/*  Payment & Summary Grid  */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-12 mb-12 md:mb-20">
{/*  Payment Methods  */}
<div className="lg:col-span-2">
<h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Phương thức thanh toán</h2>
<div className="grid grid-cols-3 gap-3 md:gap-4">
{PAYMENT_METHODS.map(pm => (
  <label key={pm.id} className="relative cursor-pointer">
    <input
      className="sr-only peer"
      name="payment"
      type="radio"
      checked={selectedPayment === pm.id}
      onChange={() => setSelectedPayment(pm.id)}
    />
    <div className="p-3 md:p-6 rounded-xl bg-surface-container-lowest border-2 border-transparent peer-checked:border-primary peer-checked:ring-2 peer-checked:ring-primary/20 flex flex-col items-center gap-2 md:gap-4 transition-all hover:bg-surface-container-low min-h-[44px]">
      <div className={`w-10 h-10 md:w-12 md:h-12 ${pm.bg} rounded-xl flex items-center justify-center`}>
        <span className="material-symbols-outlined text-white text-sm md:text-base" style={pm.filled ? {fontVariationSettings: '"FILL" 1'} : undefined}>{pm.icon}</span>
      </div>
      <span className="font-bold text-on-background text-xs md:text-sm text-center">{pm.label}</span>
      <div className="absolute top-2 right-2 opacity-0 peer-checked:opacity-100 transition-opacity">
        <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
      </div>
    </div>
  </label>
))}
</div>
</div>
{/*  Payment Summary  */}
<div className="bg-surface-container-high p-4 md:p-8 rounded-xl h-fit border border-outline-variant/20">
<h2 className="text-xl font-bold mb-4 md:mb-6">Tóm tắt thanh toán</h2>
<div className="space-y-4 mb-8">
<div className="flex justify-between items-center text-on-surface-variant text-sm md:text-base">
<span>Gói lựa chọn:</span>
<span className="font-bold text-on-background">{plan.name}</span>
</div>
<div className="flex justify-between items-center text-on-surface-variant text-sm md:text-base">
<span>Phương thức:</span>
<span className="font-bold text-on-background">{payment.label}</span>
</div>
<div className="flex justify-between items-center text-on-surface-variant text-sm md:text-base">
<span>Token nhận được:</span>
<span className="font-bold text-primary">{plan.tokens} tokens</span>
</div>
<hr className="border-outline-variant/30"/>
<div className="flex justify-between items-center pt-2">
<span className="text-base md:text-lg font-bold">Tổng tiền:</span>
<span className="text-xl md:text-2xl font-black text-on-background">{plan.price}</span>
</div>
</div>
<button
  className="w-full py-4 min-h-[44px] bg-primary text-white rounded-xl font-black text-base md:text-lg shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]"
  onClick={() => alert('Tính năng thanh toán đang được phát triển')}
>
  Thanh toán ngay
</button>
<p className="text-center text-xs text-on-surface-variant mt-4 px-2">
                    Bằng cách nhấn thanh toán, bạn đồng ý với Điều khoản dịch vụ của AI Vietnam.
                </p>
</div>
</div>
{/*  Transaction History  */}
<section>
<div className="flex items-center justify-between mb-6 md:mb-8">
<h2 className="text-xl md:text-2xl font-bold">Lịch sử nạp</h2>
</div>
<div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 py-14 flex flex-col items-center gap-3 text-on-surface-variant">
  <span className="material-symbols-outlined text-4xl text-outline-variant">receipt_long</span>
  <p className="text-sm font-medium">Chưa có giao dịch nào</p>
</div>
</section>
</main>
</div>
    </>
  );
}
