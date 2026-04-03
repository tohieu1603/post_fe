import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chính sách bảo mật — AI Vietnam',
  description:
    'Chính sách bảo mật của AI Vietnam: cách chúng tôi thu thập, sử dụng và bảo vệ dữ liệu cá nhân của bạn theo quy định pháp luật Việt Nam và GDPR.',
  alternates: { canonical: 'https://aivietnam.vn/chinh-sach-bao-mat' },
  openGraph: {
    type: 'website',
    title: 'Chính sách bảo mật — AI Vietnam',
    description: 'Cách AI Vietnam thu thập, sử dụng và bảo vệ dữ liệu cá nhân của bạn.',
    url: 'https://aivietnam.vn/chinh-sach-bao-mat',
  },
};

export default function ChinhSachBaoMatPage() {
  return (
    <>
      <main className="pt-20">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="bg-emerald-900 text-white py-12 md:py-16 px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold mb-4 uppercase tracking-wider">
              <span className="material-symbols-outlined text-base">privacy_tip</span>
              Quyền riêng tư
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tighter mb-4">
              Chính sách bảo mật
            </h1>
            <p className="text-emerald-100/70">
              Cập nhật lần cuối:{' '}
              <time dateTime="2026-01-15">15 tháng 1, 2026</time>
            </p>
          </div>
        </section>

        {/* ── Content ───────────────────────────────────────────────── */}
        <article className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-16 space-y-10 text-slate-700 leading-relaxed">

          <p className="text-lg">
            AI Vietnam (&ldquo;chúng tôi&rdquo;) tôn trọng quyền riêng tư của bạn. Chính sách này giải
            thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin cá nhân của
            bạn khi bạn truy cập trang web{' '}
            <a href="https://aivietnam.vn" className="text-emerald-700 hover:underline font-medium">
              aivietnam.vn
            </a>
            .
          </p>

          <section aria-labelledby="collect">
            <h2 id="collect" className="text-2xl font-extrabold text-emerald-900 mb-4">
              1. Thông tin chúng tôi thu thập
            </h2>

            <h3 className="font-bold text-emerald-800 mb-2">1.1. Thông tin bạn cung cấp trực tiếp</h3>
            <ul className="list-disc list-inside space-y-1 text-sm mb-6">
              <li>Tên và địa chỉ email khi đăng ký tài khoản hoặc bản tin</li>
              <li>Nội dung bình luận, thư phản hồi hoặc biểu mẫu liên hệ</li>
              <li>Thông tin hồ sơ (ảnh đại diện, tiểu sử) nếu bạn là tác giả</li>
            </ul>

            <h3 className="font-bold text-emerald-800 mb-2">1.2. Thông tin thu thập tự động</h3>
            <ul className="list-disc list-inside space-y-1 text-sm mb-6">
              <li>Địa chỉ IP và thông tin trình duyệt (user agent)</li>
              <li>Trang bạn truy cập, thời gian đọc và hành vi tương tác</li>
              <li>Dữ liệu hiệu suất trang (thông qua công cụ phân tích)</li>
              <li>Cookie và các công nghệ theo dõi tương tự (xem mục 4)</li>
            </ul>
          </section>

          <section aria-labelledby="use">
            <h2 id="use" className="text-2xl font-extrabold text-emerald-900 mb-4">
              2. Mục đích sử dụng thông tin
            </h2>
            <p className="mb-4">Chúng tôi sử dụng thông tin thu thập được để:</p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Vận hành và cải thiện trang web</li>
              <li>Gửi bản tin email theo yêu cầu (bạn có thể hủy đăng ký bất cứ lúc nào)</li>
              <li>Cá nhân hóa nội dung và đề xuất bài viết phù hợp</li>
              <li>Phân tích lưu lượng truy cập để cải thiện trải nghiệm người dùng</li>
              <li>Phát hiện và ngăn chặn hành vi gian lận hoặc lạm dụng</li>
              <li>Tuân thủ nghĩa vụ pháp lý</li>
            </ul>
          </section>

          <section aria-labelledby="cookies">
            <h2 id="cookies" className="text-2xl font-extrabold text-emerald-900 mb-4">
              3. Cookie và công nghệ theo dõi
            </h2>
            <p className="mb-4">
              Chúng tôi sử dụng cookie và các công nghệ tương tự để:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-emerald-50">
                    <th className="text-left p-3 font-bold text-emerald-900 border border-emerald-100">Loại cookie</th>
                    <th className="text-left p-3 font-bold text-emerald-900 border border-emerald-100">Mục đích</th>
                    <th className="text-left p-3 font-bold text-emerald-900 border border-emerald-100">Thời hạn</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Cần thiết', 'Duy trì phiên đăng nhập, bảo mật CSRF', 'Phiên truy cập'],
                    ['Phân tích', 'Google Analytics — đo lường lưu lượng', '2 năm'],
                    ['Ưu tiên', 'Lưu chủ đề giao diện (sáng/tối)', '1 năm'],
                    ['Quảng cáo', 'Hiển thị quảng cáo liên quan (nếu có)', '90 ngày'],
                  ].map(([type, purpose, duration], i) => (
                    <tr key={type} className={i % 2 === 0 ? 'bg-white' : 'bg-emerald-50/30'}>
                      <td className="p-3 border border-emerald-100 font-medium">{type}</td>
                      <td className="p-3 border border-emerald-100">{purpose}</td>
                      <td className="p-3 border border-emerald-100">{duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-sm">
              Bạn có thể tắt cookie trong cài đặt trình duyệt. Tuy nhiên, một số tính năng
              của trang web có thể không hoạt động đúng.
            </p>
          </section>

          <section aria-labelledby="third-party">
            <h2 id="third-party" className="text-2xl font-extrabold text-emerald-900 mb-4">
              4. Chia sẻ với bên thứ ba
            </h2>
            <p className="mb-4">
              Chúng tôi <strong>không bán</strong> dữ liệu cá nhân của bạn. Thông tin có thể
              được chia sẻ trong các trường hợp sau:
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>
                <strong>Nhà cung cấp dịch vụ:</strong> Vercel (hosting), Google Analytics
                (phân tích), Mailchimp (email marketing) — chỉ để cung cấp dịch vụ cho
                chúng tôi.
              </li>
              <li>
                <strong>Yêu cầu pháp lý:</strong> Khi có yêu cầu hợp lệ từ cơ quan nhà nước
                Việt Nam hoặc lệnh tòa án.
              </li>
              <li>
                <strong>Chuyển nhượng kinh doanh:</strong> Trong trường hợp sáp nhập hoặc
                mua lại, thông tin người dùng có thể được chuyển giao (bạn sẽ được thông báo
                trước).
              </li>
            </ul>
          </section>

          <section aria-labelledby="rights">
            <h2 id="rights" className="text-2xl font-extrabold text-emerald-900 mb-4">
              5. Quyền của bạn
            </h2>
            <p className="mb-4">
              Theo Luật An toàn thông tin mạng Việt Nam và nguyên tắc GDPR, bạn có quyền:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: 'visibility', title: 'Truy cập', desc: 'Yêu cầu bản sao dữ liệu cá nhân chúng tôi lưu trữ về bạn.' },
                { icon: 'edit', title: 'Chỉnh sửa', desc: 'Yêu cầu cập nhật thông tin không chính xác.' },
                { icon: 'delete', title: 'Xóa dữ liệu', desc: 'Yêu cầu xóa tài khoản và dữ liệu liên quan.' },
                { icon: 'block', title: 'Phản đối', desc: 'Phản đối việc xử lý dữ liệu cho mục đích tiếp thị.' },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="material-symbols-outlined text-emerald-600">{icon}</span>
                  <div>
                    <div className="font-bold text-emerald-900 text-sm">{title}</div>
                    <div className="text-xs text-slate-600 mt-1">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm">
              Để thực hiện các quyền trên, gửi email đến:{' '}
              <a href="mailto:privacy@aivietnam.vn" className="text-emerald-700 hover:underline font-medium">
                privacy@aivietnam.vn
              </a>
            </p>
          </section>

          <section aria-labelledby="security">
            <h2 id="security" className="text-2xl font-extrabold text-emerald-900 mb-4">
              6. Bảo mật dữ liệu
            </h2>
            <p>
              Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức phù hợp để bảo vệ thông
              tin của bạn, bao gồm: mã hóa HTTPS, mã hóa mật khẩu (bcrypt), kiểm soát
              truy cập nội bộ và sao lưu định kỳ. Tuy nhiên, không có hệ thống nào an toàn
              100% — nếu phát hiện vi phạm bảo mật, chúng tôi sẽ thông báo trong vòng 72
              giờ.
            </p>
          </section>

          <section aria-labelledby="children">
            <h2 id="children" className="text-2xl font-extrabold text-emerald-900 mb-4">
              7. Trẻ em
            </h2>
            <p>
              Trang web của chúng tôi không dành cho trẻ em dưới 13 tuổi. Chúng tôi không
              cố ý thu thập thông tin cá nhân từ trẻ em. Nếu bạn phát hiện con em mình đã
              cung cấp thông tin cho chúng tôi, hãy liên hệ ngay để chúng tôi xóa dữ liệu.
            </p>
          </section>

          <section aria-labelledby="changes">
            <h2 id="changes" className="text-2xl font-extrabold text-emerald-900 mb-4">
              8. Thay đổi chính sách
            </h2>
            <p>
              Chúng tôi có thể cập nhật chính sách này khi cần thiết. Mọi thay đổi quan
              trọng sẽ được thông báo qua email (nếu bạn đã đăng ký) và hiển thị nổi bật
              trên trang web trong 30 ngày. Việc tiếp tục sử dụng trang web sau khi thay
              đổi có hiệu lực đồng nghĩa với việc bạn chấp nhận chính sách mới.
            </p>
          </section>

          <section aria-labelledby="contact-privacy">
            <h2 id="contact-privacy" className="text-2xl font-extrabold text-emerald-900 mb-4">
              9. Liên hệ
            </h2>
            <div className="bg-emerald-50 rounded-2xl p-6 space-y-2 text-sm">
              <p className="font-bold text-emerald-900">AI Vietnam — Bộ phận Bảo mật dữ liệu</p>
              <p>Email: <a href="mailto:privacy@aivietnam.vn" className="text-emerald-700 hover:underline">privacy@aivietnam.vn</a></p>
              <p>Địa chỉ: Tầng 10, Tòa nhà Innovation Hub, 12 Nguyễn Thị Minh Khai, Q.1, TP.HCM</p>
              <p>Điện thoại: +84 28 1234 5678</p>
            </div>
          </section>

        </article>
      </main>
    </>
  );
}
