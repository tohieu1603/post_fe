import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chính sách biên tập — AI Vietnam',
  description:
    'Tìm hiểu về quy trình biên tập, tiêu chuẩn kiểm chứng thông tin và các nguyên tắc báo chí của AI Vietnam — trang tin điện tử chuyên sâu về AI tại Việt Nam.',
  alternates: { canonical: 'https://aivietnam.vn/chinh-sach-bien-tap' },
  openGraph: {
    type: 'website',
    title: 'Chính sách biên tập — AI Vietnam',
    description: 'Quy trình biên tập và tiêu chuẩn kiểm chứng thông tin của AI Vietnam.',
    url: 'https://aivietnam.vn/chinh-sach-bien-tap',
  },
};

export default function ChinhSachBienTapPage() {
  return (
    <>
      <main className="pt-20">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="bg-emerald-900 text-white py-12 md:py-16 px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 text-emerald-300 text-sm font-bold mb-4 uppercase tracking-wider">
              <span className="material-symbols-outlined text-base">policy</span>
              Chính sách
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tighter mb-4">
              Chính sách biên tập
            </h1>
            <p className="text-emerald-100/70">
              Cập nhật lần cuối:{' '}
              <time dateTime="2026-01-15">15 tháng 1, 2026</time>
            </p>
          </div>
        </section>

        {/* ── Content ───────────────────────────────────────────────── */}
        <article className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-16 prose prose-emerald prose-lg max-w-none">

          <section aria-labelledby="mission">
            <h2 id="mission">1. Sứ mệnh biên tập</h2>
            <p>
              AI Vietnam cam kết cung cấp thông tin chính xác, khách quan và có chiều sâu về
              Trí tuệ nhân tạo. Chúng tôi phục vụ cộng đồng độc giả Việt Nam — từ chuyên gia
              kỹ thuật đến người dùng phổ thông — với tiêu chuẩn báo chí cao nhất.
            </p>
            <p>
              Chúng tôi hoạt động độc lập về mặt biên tập. Không có tổ chức, nhà tài trợ hay
              đối tác quảng cáo nào được phép ảnh hưởng đến nội dung biên tập.
            </p>
          </section>

          <section aria-labelledby="standards">
            <h2 id="standards">2. Tiêu chuẩn nội dung</h2>

            <h3>2.1. Tính chính xác</h3>
            <p>
              Mọi thông tin đăng tải phải được xác minh từ ít nhất <strong>hai nguồn độc lập</strong>.
              Các tuyên bố mang tính kỹ thuật, khoa học hoặc thống kê phải có trích dẫn nguồn
              rõ ràng (bài báo khoa học, báo cáo chính thức, hoặc tuyên bố trực tiếp từ tổ chức
              liên quan).
            </p>

            <h3>2.2. Tính khách quan</h3>
            <p>
              Phóng viên và biên tập viên phải khai báo xung đột lợi ích trước khi viết về
              bất kỳ công ty, sản phẩm hoặc cá nhân nào có liên quan đến lợi ích cá nhân của họ.
              Nội dung có tài trợ (sponsored content) phải được gắn nhãn rõ ràng và tách biệt
              hoàn toàn khỏi nội dung biên tập.
            </p>

            <h3>2.3. Tính rõ ràng & minh bạch</h3>
            <p>
              Mọi bài viết đều phải ghi rõ tên tác giả, chức danh và ngày xuất bản. Nếu bài viết
              sử dụng AI hỗ trợ trong quá trình nghiên cứu hoặc soạn thảo, điều đó phải được
              công bố minh bạch.
            </p>
          </section>

          <section aria-labelledby="process">
            <h2 id="process">3. Quy trình kiểm chứng thông tin</h2>

            <h3>3.1. Giai đoạn tiếp nhận</h3>
            <p>
              Khi tiếp nhận thông tin (bao gồm thông cáo báo chí, nghiên cứu học thuật, tuyên
              bố của công ty), biên tập viên đặt câu hỏi:
            </p>
            <ul>
              <li>Nguồn tin có uy tín và có thể xác minh độc lập không?</li>
              <li>Có xung đột lợi ích tiềm ẩn nào không?</li>
              <li>Thông tin có nhất quán với các nguồn đáng tin cậy khác không?</li>
              <li>Tuyên bố có phóng đại hoặc thiếu ngữ cảnh không?</li>
            </ul>

            <h3>3.2. Giai đoạn kiểm chứng</h3>
            <p>
              Đối với tin tức về nghiên cứu khoa học, chúng tôi đọc trực tiếp bài báo gốc
              (không chỉ tóm tắt) và tham khảo ý kiến chuyên gia độc lập khi cần thiết.
              Đối với thông tin tài chính/kinh doanh, chúng tôi tham chiếu báo cáo chính
              thức, hồ sơ SEC/UBCKNN hoặc báo cáo thường niên.
            </p>

            <h3>3.3. Giai đoạn phê duyệt</h3>
            <p>
              Trước khi xuất bản, mọi bài viết phải qua ít nhất <strong>một biên tập viên
              độc lập</strong> xem xét về tính chính xác, cấu trúc và phong cách. Các bài
              viết kỹ thuật chuyên sâu phải qua phê duyệt thêm từ cố vấn kỹ thuật.
            </p>
          </section>

          <section aria-labelledby="ai-policy">
            <h2 id="ai-policy">4. Chính sách sử dụng AI trong biên tập</h2>
            <p>
              AI Vietnam là trang tin về AI — chúng tôi ủng hộ việc sử dụng AI có trách nhiệm
              trong quy trình làm việc. Tuy nhiên, chúng tôi tuân theo các nguyên tắc sau:
            </p>
            <ul>
              <li>
                <strong>Không tự động hóa hoàn toàn:</strong> AI chỉ được dùng để hỗ trợ
                nghiên cứu, dịch thuật hoặc kiểm tra ngữ pháp — không được dùng để tạo
                toàn bộ nội dung xuất bản.
              </li>
              <li>
                <strong>Kiểm chứng bắt buộc:</strong> Mọi thông tin do AI gợi ý đều phải
                được con người xác minh độc lập từ nguồn gốc.
              </li>
              <li>
                <strong>Công bố minh bạch:</strong> Các bài viết có sử dụng AI hỗ trợ
                đáng kể sẽ được gắn nhãn &ldquo;Hỗ trợ bởi AI&rdquo; ở cuối bài.
              </li>
            </ul>
          </section>

          <section aria-labelledby="corrections">
            <h2 id="corrections">5. Chính sách đính chính</h2>
            <p>
              Chúng tôi cam kết sửa lỗi nhanh chóng và minh bạch. Mọi đính chính sẽ được
              đặt ở đầu bài viết gốc, ghi rõ ngày sửa và nội dung đã thay đổi.
            </p>
            <p>
              Để gửi yêu cầu đính chính, vui lòng xem trang{' '}
              <a href="/dinh-chinh">Chính sách đính chính</a> hoặc liên hệ{' '}
              <a href="mailto:bientap@aivietnam.vn">bientap@aivietnam.vn</a>.
            </p>
          </section>

          <section aria-labelledby="independence">
            <h2 id="independence">6. Độc lập biên tập & Quảng cáo</h2>
            <p>
              Bộ phận biên tập và bộ phận kinh doanh/quảng cáo hoạt động hoàn toàn tách biệt.
              Nhà quảng cáo không có quyền xem trước, yêu cầu chỉnh sửa hoặc ngăn chặn bất
              kỳ nội dung biên tập nào. Quyết định xuất bản thuộc hoàn toàn về Ban biên tập.
            </p>
          </section>

          <section aria-labelledby="contact">
            <h2 id="contact">7. Liên hệ Ban biên tập</h2>
            <p>
              Nếu bạn có câu hỏi về chính sách biên tập, muốn đề xuất chủ đề hoặc báo cáo
              sai sót, hãy liên hệ:
            </p>
            <ul>
              <li>Email biên tập: <a href="mailto:bientap@aivietnam.vn">bientap@aivietnam.vn</a></li>
              <li>Email chung: <a href="mailto:info@aivietnam.vn">info@aivietnam.vn</a></li>
              <li>Địa chỉ: Tầng 10, Tòa nhà Innovation Hub, 12 Nguyễn Thị Minh Khai, Q.1, TP.HCM</li>
            </ul>
          </section>

        </article>
      </main>
    </>
  );
}
