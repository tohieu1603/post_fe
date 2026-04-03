import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Giới thiệu — AI Vietnam',
  description:
    'AI Vietnam là trang tin điện tử chuyên sâu về Trí tuệ nhân tạo, công nghệ và phát triển bền vững tại Việt Nam. Tìm hiểu về sứ mệnh, đội ngũ và các giá trị cốt lõi của chúng tôi.',
  alternates: { canonical: 'https://aivietnam.vn/gioi-thieu' },
  openGraph: {
    type: 'website',
    title: 'Giới thiệu — AI Vietnam',
    description: 'Trang tin điện tử chuyên sâu về Trí tuệ nhân tạo tại Việt Nam.',
    url: 'https://aivietnam.vn/gioi-thieu',
  },
};

const VALUES = [
  {
    icon: 'verified',
    title: 'Chính xác & Đáng tin cậy',
    desc: 'Mọi nội dung đều được kiểm chứng bởi các chuyên gia trước khi xuất bản. Chúng tôi cam kết độ chính xác là ưu tiên hàng đầu.',
  },
  {
    icon: 'science',
    title: 'Chuyên sâu & Học thuật',
    desc: 'Phân tích kỹ lưỡng dựa trên nghiên cứu khoa học, không chạy theo tin tức bề mặt. Mỗi bài viết là một công trình nghiên cứu nhỏ.',
  },
  {
    icon: 'groups',
    title: 'Cộng đồng & Kết nối',
    desc: 'Xây dựng cộng đồng những người yêu thích và nghiên cứu AI tại Việt Nam, tạo cầu nối giữa học thuật và ứng dụng thực tiễn.',
  },
  {
    icon: 'eco',
    title: 'Phát triển bền vững',
    desc: 'Chúng tôi đưa tin về AI trong bối cảnh phát triển bền vững — con người, môi trường và xã hội luôn là trung tâm của mọi câu chuyện.',
  },
];

const TEAM = [
  {
    name: 'Nguyễn Minh Trí',
    role: 'Tổng biên tập',
    bio: '15 năm kinh nghiệm trong lĩnh vực báo chí công nghệ. Từng công tác tại VnExpress, TechCrunch Việt Nam.',
    expertise: ['AI Research', 'Machine Learning', 'Tech Policy'],
  },
  {
    name: 'Lê Thị Hương',
    role: 'Phó Tổng biên tập',
    bio: 'Tiến sĩ Khoa học Máy tính tại ĐH Bách Khoa HN. Nghiên cứu viên AI tại Viện Hàn lâm KH&CN Việt Nam.',
    expertise: ['Deep Learning', 'NLP', 'Computer Vision'],
  },
  {
    name: 'Trần Quốc Bảo',
    role: 'Biên tập viên Kỹ thuật',
    bio: 'Kỹ sư phần mềm với 10 năm kinh nghiệm. Chuyên viết về ứng dụng AI trong doanh nghiệp và khởi nghiệp.',
    expertise: ['AI Engineering', 'MLOps', 'Startups'],
  },
  {
    name: 'Phạm Thị Mai',
    role: 'Biên tập viên Chính sách',
    bio: 'Chuyên gia chính sách công nghệ với nền tảng luật. Theo dõi các quy định AI tại Việt Nam và quốc tế.',
    expertise: ['AI Policy', 'Data Privacy', 'Ethics'],
  },
];

export default function GioiThieuPage() {
  return (
    <>
      <main className="pt-20">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="bg-emerald-900 text-white py-16 md:py-24 px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 text-emerald-200 text-sm font-bold px-4 py-2 rounded-full mb-6 md:mb-8 tracking-wider uppercase">
              <span className="material-symbols-outlined text-base">eco</span>
              E-E-A-T Đạt chuẩn Google News
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-tight mb-6">
              Về <span className="text-emerald-300">AI Vietnam</span>
            </h1>
            <p className="text-base md:text-xl text-emerald-100/80 leading-relaxed max-w-2xl mx-auto">
              Trang tin điện tử chuyên sâu đầu tiên tại Việt Nam tập trung hoàn toàn vào
              Trí tuệ nhân tạo — từ nghiên cứu học thuật đến ứng dụng thực tiễn trong
              cuộc sống hằng ngày.
            </p>
          </div>
        </section>

        {/* ── Mission ───────────────────────────────────────────────── */}
        <section className="bg-emerald-50 py-12 md:py-20 px-4 md:px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <article>
              <h2 className="text-2xl md:text-3xl font-extrabold text-emerald-900 tracking-tighter mb-6">
                Sứ mệnh của chúng tôi
              </h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                AI Vietnam ra đời với sứ mệnh rõ ràng: <strong>phổ biến kiến thức về Trí
                tuệ nhân tạo đến mọi người Việt Nam</strong> một cách chính xác, dễ hiểu
                và có chiều sâu.
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                Chúng tôi tin rằng AI không chỉ là câu chuyện của các kỹ sư hay nhà nghiên
                cứu — đây là cuộc cách mạng ảnh hưởng đến tất cả mọi người, từ nông dân
                đến bác sĩ, từ giáo viên đến doanh nhân.
              </p>
              <p className="text-slate-700 leading-relaxed">
                Được thành lập năm 2024, chúng tôi đã và đang cung cấp hàng trăm bài viết
                chuyên sâu, phân tích xu hướng và hướng dẫn thực tiễn về AI cho độc giả
                Việt Nam.
              </p>
            </article>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {[
                { num: '500+', label: 'Bài viết chuyên sâu' },
                { num: '50K+', label: 'Độc giả hằng tháng' },
                { num: '20+', label: 'Chuyên gia đóng góp' },
                { num: '2024', label: 'Năm thành lập' },
              ].map(({ num, label }) => (
                <div
                  key={label}
                  className="bg-white rounded-2xl p-4 md:p-6 text-center shadow-sm border border-emerald-100"
                >
                  <div className="text-2xl md:text-3xl font-extrabold text-emerald-700 mb-1">{num}</div>
                  <div className="text-xs md:text-sm text-slate-500 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Values ────────────────────────────────────────────────── */}
        <section className="py-12 md:py-20 px-4 md:px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 md:mb-14">
              <h2 className="text-2xl md:text-3xl font-extrabold text-emerald-900 tracking-tighter mb-4">
                Giá trị cốt lõi
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                Bốn nguyên tắc định hình mọi nội dung và hoạt động của AI Vietnam.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {VALUES.map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="flex gap-5 p-6 rounded-2xl bg-emerald-50 border border-emerald-100 hover:border-emerald-300 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-700 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-white text-2xl">{icon}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-900 mb-2">{title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Team ──────────────────────────────────────────────────── */}
        <section className="py-12 md:py-20 px-4 md:px-6 bg-emerald-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 md:mb-14">
              <h2 className="text-2xl md:text-3xl font-extrabold text-emerald-900 tracking-tighter mb-4">
                Đội ngũ biên tập
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                Những chuyên gia hàng đầu đứng sau từng bài viết tại AI Vietnam.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TEAM.map(({ name, role, bio, expertise }) => (
                <div key={name} className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-700 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-white text-3xl">person</span>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-emerald-900">{name}</h3>
                      <p className="text-emerald-600 text-sm font-medium">{role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">{bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {expertise.map((skill) => (
                      <span
                        key={skill}
                        className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <section className="py-12 md:py-16 px-4 md:px-6 bg-emerald-900 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tighter mb-4">
            Muốn cộng tác với chúng tôi?
          </h2>
          <p className="text-emerald-100/70 mb-8 max-w-lg mx-auto">
            Chúng tôi luôn mở cửa đón nhận các chuyên gia, nhà nghiên cứu và nhà báo có
            đam mê với AI muốn chia sẻ kiến thức.
          </p>
          <Link
            href="/lien-he"
            className="inline-flex items-center gap-2 bg-white text-emerald-900 px-8 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors"
          >
            <span className="material-symbols-outlined">mail</span>
            Liên hệ ngay
          </Link>
        </section>

      </main>
    </>
  );
}
