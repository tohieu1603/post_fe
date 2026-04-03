import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Chính sách đính chính — AI Vietnam',
  description:
    'Quy trình đính chính và xử lý sai sót nội dung tại AI Vietnam. Chúng tôi cam kết minh bạch và sửa lỗi kịp thời để bảo vệ độc giả.',
  alternates: { canonical: 'https://aivietnam.vn/dinh-chinh' },
  openGraph: {
    type: 'website',
    title: 'Chính sách đính chính — AI Vietnam',
    description: 'Quy trình đính chính và xử lý sai sót nội dung tại AI Vietnam.',
    url: 'https://aivietnam.vn/dinh-chinh',
  },
};

export default function DinhChinhPage() {
  return (
    <>
      <main className="pt-20">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="bg-emerald-900 text-white py-12 md:py-16 px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold mb-4 uppercase tracking-wider">
              <span className="material-symbols-outlined text-base">edit_note</span>
              Minh bạch
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tighter mb-4">
              Chính sách đính chính
            </h1>
            <p className="text-emerald-100/70">
              Cập nhật lần cuối:{' '}
              <time dateTime="2026-01-15">15 tháng 1, 2026</time>
            </p>
          </div>
        </section>

        {/* ── Content ───────────────────────────────────────────────── */}
        <article className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-16">

          {/* Commitment banner */}
          <div className="bg-emerald-50 border-l-4 border-emerald-600 rounded-r-2xl p-4 md:p-6 mb-8 md:mb-12">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-emerald-600 text-3xl">verified</span>
              <div>
                <h2 className="text-lg font-extrabold text-emerald-900 mb-2">
                  Cam kết minh bạch của chúng tôi
                </h2>
                <p className="text-slate-700 text-sm leading-relaxed">
                  AI Vietnam thừa nhận rằng sai sót là điều không thể tránh khỏi trong báo chí.
                  Điều quan trọng là chúng tôi sửa chữa nhanh chóng, minh bạch và không che
                  giấu lịch sử. Mọi đính chính đều được ghi nhận công khai.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-10 text-slate-700 leading-relaxed">

            <section aria-labelledby="types">
              <h2 id="types" className="text-2xl font-extrabold text-emerald-900 mb-4">
                1. Các loại sai sót và cách xử lý
              </h2>

              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-emerald-100 p-5">
                  <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500 text-lg">error</span>
                    Sai sót về dữ liệu / thực tế
                  </h3>
                  <p className="text-sm">
                    Số liệu sai, tên sai, ngày tháng sai, hoặc trích dẫn không chính xác.
                    Chúng tôi sửa ngay lập tức và gắn thẻ đính chính ở đầu bài với thời gian
                    cụ thể.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-emerald-100 p-5">
                  <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500 text-lg">warning</span>
                    Thông tin gây hiểu lầm
                  </h3>
                  <p className="text-sm">
                    Thông tin tuy không hoàn toàn sai nhưng thiếu ngữ cảnh quan trọng hoặc
                    có thể gây hiểu lầm. Chúng tôi bổ sung ngữ cảnh, ghi chú rõ ràng và
                    thông báo trong phần đính chính.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-emerald-100 p-5">
                  <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500 text-lg">info</span>
                    Cập nhật thông tin mới
                  </h3>
                  <p className="text-sm">
                    Khi có diễn biến mới liên quan đến bài viết đã đăng, chúng tôi thêm phần
                    &ldquo;Cập nhật&rdquo; ở cuối bài với ngày tháng rõ ràng — không xóa nội dung gốc.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-emerald-100 p-5">
                  <h3 className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-500 text-lg">delete</span>
                    Gỡ bài hoàn toàn
                  </h3>
                  <p className="text-sm">
                    Chỉ trong trường hợp nội dung vi phạm pháp luật, xâm phạm quyền riêng tư
                    nghiêm trọng, hoặc không thể sửa được. Khi gỡ bài, chúng tôi để lại thông
                    báo giải thích lý do.
                  </p>
                </div>
              </div>
            </section>

            <section aria-labelledby="process">
              <h2 id="process" className="text-2xl font-extrabold text-emerald-900 mb-4">
                2. Quy trình xử lý đính chính
              </h2>
              <ol className="list-none space-y-4">
                {[
                  { step: '01', title: 'Tiếp nhận', desc: 'Yêu cầu đính chính được gửi đến ban biên tập qua email hoặc biểu mẫu.' },
                  { step: '02', title: 'Xem xét (trong 24 giờ)', desc: 'Biên tập viên phụ trách xem xét yêu cầu, kiểm tra lại nguồn gốc thông tin.' },
                  { step: '03', title: 'Phê duyệt', desc: 'Tổng biên tập hoặc Phó tổng biên tập phê duyệt đính chính.' },
                  { step: '04', title: 'Cập nhật bài viết', desc: 'Thêm thẻ đính chính vào đầu bài với thời gian cụ thể và nội dung đã thay đổi.' },
                  { step: '05', title: 'Thông báo', desc: 'Phản hồi người gửi yêu cầu và (nếu cần) đăng thông báo trên mạng xã hội.' },
                ].map(({ step, title, desc }) => (
                  <li key={step} className="flex gap-4 items-start">
                    <span className="text-2xl font-extrabold text-emerald-200 w-10 flex-shrink-0">{step}</span>
                    <div>
                      <strong className="text-emerald-900">{title}</strong>
                      <p className="text-sm mt-1">{desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="submit">
              <h2 id="submit" className="text-2xl font-extrabold text-emerald-900 mb-4">
                3. Gửi yêu cầu đính chính
              </h2>
              <p className="mb-6">
                Nếu bạn phát hiện sai sót trong bài viết của chúng tôi, hãy liên hệ ngay.
                Chúng tôi trân trọng sự phản hồi của độc giả — đây là cách chúng tôi không
                ngừng cải thiện chất lượng.
              </p>

              <div className="bg-emerald-50 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-600">mail</span>
                  <div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Email đính chính</div>
                    <a
                      href="mailto:dinhchinh@aivietnam.vn"
                      className="font-bold text-emerald-700 hover:underline"
                    >
                      dinhchinh@aivietnam.vn
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-600">edit</span>
                  <div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Biểu mẫu trực tuyến</div>
                    <Link href="/lien-he" className="font-bold text-emerald-700 hover:underline">
                      Trang liên hệ
                    </Link>
                    {' '}(chọn chủ đề &ldquo;Đính chính nội dung&rdquo;)
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-emerald-600">schedule</span>
                  <div>
                    <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Thời gian phản hồi</div>
                    <span className="font-bold text-emerald-900">Trong vòng 24 giờ làm việc</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-white border border-emerald-100 rounded-2xl p-5">
                <h3 className="font-bold text-emerald-900 mb-3">
                  Thông tin cần cung cấp khi yêu cầu đính chính:
                </h3>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-base mt-0.5">check_circle</span>
                    URL bài viết cụ thể
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-base mt-0.5">check_circle</span>
                    Đoạn văn hoặc thông tin bạn cho là sai
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-base mt-0.5">check_circle</span>
                    Thông tin bạn cho là đúng, kèm nguồn tham khảo (nếu có)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-base mt-0.5">check_circle</span>
                    Thông tin liên lạc của bạn (tùy chọn)
                  </li>
                </ul>
              </div>
            </section>

          </div>
        </article>
      </main>
    </>
  );
}
