'use client';

import Link from 'next/link';
import { useState } from 'react';

const SOCIAL_LINKS = [
  { icon: 'public', title: 'Website' },
  { icon: 'smart_display', title: 'Sắp ra mắt' },
  { icon: 'forum', title: 'Sắp ra mắt' },
  { icon: 'terminal', title: 'Sắp ra mắt' },
];

export function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return;
    setSubmitted(true);
    setEmail('');
    setTimeout(() => setSubmitted(false), 4000);
  }

  return (
    <footer className="bg-emerald-900 text-white mt-12 md:mt-20 py-12 md:py-20 px-4 md:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 max-w-7xl mx-auto mb-10 md:mb-16">
        <div>
          <div className="text-2xl font-bold tracking-tighter text-white mb-6">AI Vietnam</div>
          <p className="text-emerald-100/60 text-sm leading-relaxed mb-6">Trang tin điện tử chuyên sâu về Trí tuệ nhân tạo, công nghệ và phát triển bền vững tại Việt Nam.</p>
          <div className="flex gap-4">
            {SOCIAL_LINKS.map(({ icon, title }) => (
              <a key={icon} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition-colors" href="#" title={title}>
                <span className="material-symbols-outlined text-xl">{icon}</span>
              </a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-6">Chuyên mục</h4>
          <ul className="space-y-3 text-emerald-100/60 text-sm">
            {[
              { label: 'Model Mới', slug: 'model-moi' },
              { label: 'GitHub Hot', slug: 'github-hot' },
              { label: 'Startup & Funding', slug: 'startup-funding' },
              { label: 'Hướng Dẫn', slug: 'huong-dan' },
            ].map(({ label, slug }) => (
              <li key={slug}><Link className="hover:text-white" href={`/chuyen-muc/${slug}`}>{label}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-6">Về chúng tôi</h4>
          <ul className="space-y-3 text-emerald-100/60 text-sm">
            <li><Link className="hover:text-white" href="/gioi-thieu">Giới thiệu toà soạn</Link></li>
            <li><Link className="hover:text-white" href="/lien-he">Liên hệ & Quảng cáo</Link></li>
            <li><Link className="hover:text-white" href="/chinh-sach-bien-tap">Chính sách biên tập</Link></li>
            <li><Link className="hover:text-white" href="/dinh-chinh">Đính chính nội dung</Link></li>
            <li><Link className="hover:text-white" href="/chinh-sach-bao-mat">Chính sách bảo mật</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-6">Kết nối</h4>
          <p className="text-emerald-100/60 text-sm mb-4">Đăng ký để nhận tin tức công nghệ mới nhất trực tiếp vào hộp thư của bạn.</p>
          {submitted ? (
            <p className="text-emerald-300 text-sm font-medium py-3">Đăng ký thành công!</p>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="relative">
              <input
                className="w-full bg-white/10 border-none rounded-lg py-3 px-4 text-sm text-white placeholder:text-emerald-100/30 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Email của bạn"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <button type="submit" className="absolute right-2 top-2 text-primary font-bold text-xs uppercase tracking-widest px-2 py-1 hover:text-emerald-300 transition-colors">Gửi</button>
            </form>
          )}
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 text-emerald-100/40 text-xs flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© 2026 AI Vietnam. The Digital Curator. All Rights Reserved.</p>
        <div className="flex gap-6">
          <Link className="hover:text-white" href="/chinh-sach-bien-tap">Điều khoản sử dụng</Link>
          <a className="hover:text-white" href="#" title="Sắp ra mắt">Sitemap</a>
        </div>
      </div>
    </footer>
  );
}
