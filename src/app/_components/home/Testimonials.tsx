import { Stars } from "../ui/stars";
// TODO: thay bằng đánh giá thật lấy từ bảng reviews
const SMALL = [
  { 
    who: "Học sinh lớp 12", 
    initials: "HS", 
    tint: "bg-emerald-100 text-emerald-800 border border-emerald-200/60", 
    quote: "Mình tìm được thầy dạy Tiếng Anh đúng giờ mình rảnh, học online rất tiện và có lộ trình ôn thi cụ thể." 
  },
  { 
    who: "Sinh viên năm hai", 
    initials: "SV", 
    tint: "bg-violet-100 text-violet-700 border border-violet-200/60", 
    quote: "Mình học thêm Toán cao cấp với một anh khóa trên. Tìm theo môn và khu vực nên liên hệ rất nhanh." 
  },
];

export function Testimonials() {
  return (
    <section className="w-full bg-white py-12 sm:py-16">
      {/* Khung lề ĐỒNG BỘ HOÀN TOÀN với Hero, FeaturedTutors, HowItWorks & StudyTogether */}
      <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-8 lg:px-10 xl:px-14 2xl:px-20">
        
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Đánh giá thực tế</span>
          <h2 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[40px]">
            Học viên nói gì về GiaSuHub
          </h2>
        </div>

        {/* Layout Grid Bento 2 Cột */}
        <div className="mt-10 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          
          {/* Thẻ đánh giá chính màu Navy Blue */}
          <figure className="flex flex-col justify-between gap-8 rounded-[32px] bg-[#0b1f44] p-8 text-white sm:p-12 border border-blue-900/50 shadow-xl shadow-blue-950/10 relative overflow-hidden group">
            {/* Gradient Glow Effect mờ nền */}
            <div className="absolute -right-16 -top-16 size-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none group-hover:bg-blue-600/20 transition-all duration-500" />

            <div className="relative z-10">
              <Stars size={22} />
              <blockquote className="mt-6 text-2xl font-medium leading-snug tracking-tight sm:text-[28px] sm:leading-[1.45] text-slate-100">
                “Cô giáo giảng dễ hiểu, con mình tự tin hơn hẳn sau một tháng. Chọn gia sư qua hồ sơ rõ ràng giúp gia đình yên tâm.”
              </blockquote>
            </div>

            <figcaption className="flex items-center gap-3.5 relative z-10 pt-4 border-t border-white/10">
              <span className="grid size-12 place-items-center rounded-full bg-blue-600 font-bold text-white shadow-md shadow-blue-600/30" aria-hidden="true">
                PH
              </span>
              <div>
                <p className="font-bold text-base text-white">Phụ huynh học sinh lớp 10</p>
                <p className="text-xs text-blue-200">Đã thuê gia sư Toán</p>
              </div>
            </figcaption>
          </figure>

          {/* Cột 2 thẻ đánh giá phụ */}
          <div className="flex flex-col gap-5">
            {SMALL.map((t) => (
              <figure key={t.who} className="flex-1 flex flex-col justify-between rounded-[28px] bg-blue-50/60 p-7 border border-blue-100/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-300">
                <div>
                  <Stars size={18} />
                  <blockquote className="my-3 text-base sm:text-[17px] leading-relaxed text-slate-800 font-medium">
                    “{t.quote}”
                  </blockquote>
                </div>
                
                <figcaption className="flex items-center gap-3 pt-3 border-t border-blue-100/50">
                  <span className={`grid size-11 place-items-center rounded-full text-sm font-extrabold ${t.tint}`} aria-hidden="true">
                    {t.initials}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{t.who}</span>
                </figcaption>
              </figure>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}