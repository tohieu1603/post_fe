'use client';

import { useState } from 'react';
import Link from 'next/link';

const SUBJECTS = [
  'Câu hỏi chung',
  'Đính chính nội dung',
  'Hợp tác & Quảng cáo',
  'Đề xuất chủ đề',
  'Cơ hội tuyển dụng',
  'Khác',
];

export default function LienHePage() {
  const [form, setForm] = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    // Simulate async submission — replace with real API call
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
    }, 800);
  }

  return (
    <>
      <main className="pt-20">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="bg-emerald-900 text-white py-12 md:py-16 px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold mb-4 uppercase tracking-wider">
              <span className="material-symbols-outlined text-base">mail</span>
              Kết nối
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tighter mb-4">
              Liên hệ với chúng tôi
            </h1>
            <p className="text-emerald-100/70 max-w-xl">
              Chúng tôi luôn lắng nghe phản hồi, ý kiến đóng góp và câu hỏi từ độc giả.
              Hãy liên hệ — chúng tôi thường phản hồi trong vòng 1 ngày làm việc.
            </p>
          </div>
        </section>

        {/* ── Main Grid ─────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-10 md:py-16 grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12">

          {/* Contact Form — col 3 */}
          <div className="lg:col-span-3">
            <h2 className="text-2xl font-extrabold text-emerald-900 tracking-tighter mb-6">
              Gửi tin nhắn
            </h2>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
                <span className="material-symbols-outlined text-emerald-600 text-5xl mb-4 block">check_circle</span>
                <h3 className="text-xl font-extrabold text-emerald-900 mb-2">Đã gửi thành công!</h3>
                <p className="text-slate-600 text-sm mb-6">
                  Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng 1 ngày làm việc.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' }); }}
                  className="text-emerald-700 font-bold hover:underline text-sm"
                >
                  Gửi tin nhắn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-1.5">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="ban@email.com"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-bold text-slate-700 mb-1.5">
                    Chủ đề
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-slate-700 mb-1.5">
                    Nội dung <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Nội dung tin nhắn của bạn..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">send</span>
                      Gửi tin nhắn
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info — col 2 */}
          <aside className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-extrabold text-emerald-900 tracking-tighter mb-6">
              Thông tin liên hệ
            </h2>

            <div className="space-y-4">
              {[
                {
                  icon: 'mail',
                  label: 'Email biên tập',
                  value: 'bientap@aivietnam.vn',
                  href: 'mailto:bientap@aivietnam.vn',
                },
                {
                  icon: 'mail',
                  label: 'Email quảng cáo',
                  value: 'ads@aivietnam.vn',
                  href: 'mailto:ads@aivietnam.vn',
                },
                {
                  icon: 'location_on',
                  label: 'Địa chỉ',
                  value: 'Tầng 10, Innovation Hub, 12 Nguyễn Thị Minh Khai, Q.1, TP.HCM',
                  href: null,
                },
                {
                  icon: 'schedule',
                  label: 'Giờ làm việc',
                  value: 'Thứ 2 – Thứ 6: 8:00 – 18:00',
                  href: null,
                },
              ].map(({ icon, label, value, href }) => (
                <div key={label} className="flex gap-4 items-start p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="material-symbols-outlined text-emerald-600 mt-0.5">{icon}</span>
                  <div>
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-0.5">{label}</div>
                    {href ? (
                      <a href={href} className="text-sm font-bold text-emerald-700 hover:underline">{value}</a>
                    ) : (
                      <span className="text-sm text-slate-700">{value}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social links */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Mạng xã hội</h3>
              <div className="flex gap-3">
                {[
                  { icon: 'public', label: 'Facebook', href: '#' },
                  { icon: 'smart_display', label: 'YouTube', href: '#' },
                  { icon: 'alternate_email', label: 'Twitter/X', href: '#' },
                  { icon: 'terminal', label: 'GitHub', href: '#' },
                ].map(({ icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center hover:bg-emerald-700 hover:text-white transition-colors group"
                  >
                    <span className="material-symbols-outlined text-emerald-700 group-hover:text-white text-xl">{icon}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div>
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Bản đồ</h3>
              <div className="aspect-[4/3] bg-emerald-50 rounded-2xl border-2 border-dashed border-emerald-200 flex flex-col items-center justify-center gap-2 text-emerald-400">
                <span className="material-symbols-outlined text-4xl">map</span>
                <span className="text-xs font-medium">Google Maps</span>
                <span className="text-xs">12 Nguyễn Thị Minh Khai, Q.1</span>
              </div>
            </div>
          </aside>
        </div>

        {/* ── Quick Links ───────────────────────────────────────────── */}
        <section className="bg-emerald-50 py-10 md:py-12 px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-lg font-extrabold text-emerald-900 mb-6">Câu hỏi thường gặp</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              {[
                { href: '/dinh-chinh', icon: 'edit_note', label: 'Báo cáo sai sót', desc: 'Phát hiện thông tin không chính xác?' },
                { href: '/chinh-sach-bien-tap', icon: 'policy', label: 'Chính sách biên tập', desc: 'Tìm hiểu tiêu chuẩn nội dung của chúng tôi' },
                { href: '/chinh-sach-bao-mat', icon: 'privacy_tip', label: 'Bảo mật dữ liệu', desc: 'Cách chúng tôi bảo vệ thông tin của bạn' },
              ].map(({ href, icon, label, desc }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex gap-3 items-start p-4 bg-white rounded-xl border border-emerald-100 hover:border-emerald-400 transition-colors group"
                >
                  <span className="material-symbols-outlined text-emerald-600 group-hover:text-emerald-800 transition-colors">{icon}</span>
                  <div>
                    <div className="font-bold text-emerald-900 text-sm">{label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

      </main>
    </>
  );
}
