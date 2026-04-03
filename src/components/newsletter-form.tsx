'use client';

import { useState } from 'react';

interface NewsletterFormProps {
  /** Stack input and button vertically (sidebar card layout) */
  vertical?: boolean;
}

export function NewsletterForm({ vertical = false }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-2 max-w-md mx-auto">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-white font-semibold">Đăng ký thành công!</p>
        <p className="text-emerald-100 text-sm">Chúng tôi sẽ gửi bản tin đến {email}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={vertical ? 'space-y-3' : 'flex flex-col sm:flex-row gap-3 max-w-md mx-auto'}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={vertical ? 'Email của bạn' : 'email@cuaban.com'}
        required
        className={
          vertical
            ? 'w-full bg-white/10 border border-white/20 rounded-lg py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 placeholder:text-white/50 text-white'
            : 'flex-1 px-4 py-3 rounded-xl bg-white/20 text-white placeholder-emerald-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm'
        }
      />
      <button
        type="submit"
        className={
          vertical
            ? 'w-full bg-white text-primary py-3 rounded-lg font-black hover:bg-white/90 transition-all shadow-xl'
            : 'px-6 py-3 bg-white text-emerald-700 font-bold rounded-xl hover:bg-emerald-50 transition-colors text-sm shrink-0'
        }
      >
        Đăng ký ngay
      </button>
    </form>
  );
}
