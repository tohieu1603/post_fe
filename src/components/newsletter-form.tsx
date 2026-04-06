'use client';

import { useState } from 'react';

interface NewsletterFormProps {
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
      <div className="flex items-center gap-2 justify-center py-2">
        <svg className="w-5 h-5" fill="none" stroke="#6ee7b7" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        <p style={{ color: '#fff' }} className="text-sm">Đã đăng ký! Bản tin sẽ gửi đến {email}</p>
      </div>
    );
  }

  if (vertical) {
    return (
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email của bạn"
          required
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: '6px',
            padding: '10px 12px',
            fontSize: '14px',
            color: '#fff',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          style={{
            width: '100%',
            background: '#fff',
            color: '#065f46',
            padding: '10px',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Đăng ký
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@cuaban.com"
        required
        style={{
          flex: 1,
          padding: '10px 16px',
          background: 'rgba(255,255,255,0.2)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: '6px',
          fontSize: '14px',
          outline: 'none',
        }}
      />
      <button
        type="submit"
        style={{
          padding: '10px 24px',
          background: '#fff',
          color: '#065f46',
          fontWeight: 700,
          borderRadius: '6px',
          fontSize: '14px',
          border: 'none',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Đăng ký
      </button>
    </form>
  );
}
