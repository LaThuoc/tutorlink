import { 
  Clock, 
  Code, 
  Eye, 
  FileText, 
  Headset, 
  Heart, 
  ShieldCheck, 
  Star, 
  Target, 
  Users, 
  type LucideIcon 
} from "lucide-react";

// Hệ quy chuẩn khung chứa 1920px đồng bộ toàn dự án
const containerStyle = "mx-auto w-full max-w-[1920px] px-5 sm:px-8 lg:px-10 xl:px-14 2xl:px-20";
const eyebrow = "text-xs font-bold uppercase tracking-wider text-blue-600";
const h2 = "mt-2 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[40px]";
const tile = "rounded-3xl bg-blue-50/60 p-7 border border-blue-100/70 transition-all duration-300 hover:-translate-y-1.5 hover:bg-white hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

// TODO: thay bằng số liệu thật
const STATS: { icon: LucideIcon; value: string; label: string }[] = [
  { icon: Users, value: "10.000+", label: "Gia sư đã đăng ký" },
  { icon: Star, value: "4.8/5", label: "Đánh giá trung bình" },
  { icon: ShieldCheck, value: "100%", label: "Gia sư được xác minh" },
  { icon: Clock, value: "24/7", label: "Hỗ trợ người dùng" },
];

export function AboutStats() {
  return (
    <section className="w-full bg-white py-6">
      <div className={containerStyle}>
        <dl className="grid gap-y-6 rounded-3xl bg-white px-6 py-8 border border-slate-100 shadow-xl shadow-blue-900/5 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-slate-200/80">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center justify-center gap-4 px-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Icon className="size-6" aria-hidden="true" />
              </div>
              <div>
                <dt className="sr-only">{label}</dt>
                <dd className="text-2xl font-extrabold tracking-tight text-slate-900">{value}</dd>
                <dd className="text-xs font-medium text-slate-500">{label}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function AboutMission() {
  return (
    <section className="w-full bg-white py-12 sm:py-16">
      <div className={containerStyle}>
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <p className={eyebrow}>Chúng tôi là ai</p>
            <h2 className={h2}>Nền tảng kết nối học viên và gia sư</h2>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-600">
              Việc tìm một gia sư tốt thường mất nhiều thời gian và khó biết đâu là thông tin đáng tin. GiaSuHub gom hồ sơ, đánh giá và lịch dạy về một nơi để việc chọn gia sư trở nên rõ ràng hơn.
            </p>
          </div>
          
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 p-8 text-white shadow-lg shadow-blue-600/20">
              <span className="grid size-14 place-items-center rounded-2xl bg-white/20 backdrop-blur-md">
                <Target className="size-7" aria-hidden="true" />
              </span>
              <h3 className="mb-2 mt-6 text-2xl font-bold">Sứ mệnh</h3>
              <p className="text-sm leading-relaxed text-blue-100">
                Giúp mọi học viên tiếp cận gia sư phù hợp một cách nhanh chóng, minh bạch và an tâm.
              </p>
            </div>
            
            <div className="rounded-3xl bg-[#0b1f44] p-8 text-white border border-blue-900/50 shadow-xl shadow-blue-950/10">
              <span className="grid size-14 place-items-center rounded-2xl bg-white/10 backdrop-blur-md">
                <Eye className="size-7" aria-hidden="true" />
              </span>
              <h3 className="mb-2 mt-6 text-2xl font-bold">Tầm nhìn</h3>
              <p className="text-sm leading-relaxed text-blue-200">
                Trở thành nơi đầu tiên mọi người nghĩ đến khi cần một người đồng hành trong việc học.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const VALUES = [
  { icon: ShieldCheck, title: "Uy tín", text: "Mọi hồ sơ gia sư đều được xem xét trước khi hiển thị cho học viên.", tint: "bg-blue-100 text-blue-600 border border-blue-200/50" },
  { icon: Eye, title: "Minh bạch", text: "Học phí, môn dạy, khu vực và đánh giá thật được hiển thị rõ ràng.", tint: "bg-emerald-100 text-emerald-700 border border-emerald-200/50" },
  { icon: Clock, title: "Linh hoạt", text: "Học online hoặc offline, thời gian do hai bên tự thống nhất.", tint: "bg-amber-100 text-amber-700 border border-amber-200/50" },
  { icon: Heart, title: "Tận tâm", text: "Chúng tôi đồng hành cùng cả học viên và gia sư trong suốt quá trình học.", tint: "bg-rose-100 text-rose-600 border border-rose-200/50" },
];

export function AboutValues() {
  return (
    <section className="w-full bg-slate-50/50 py-12 sm:py-16 border-y border-slate-100">
      <div className={containerStyle}>
        <div className="flex flex-col items-start gap-1">
          <p className={eyebrow}>Giá trị cốt lõi</p>
          <h2 className={`${h2} max-w-xl`}>Điều chúng tôi cam kết với bạn</h2>
        </div>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map(({ icon: Icon, title, text, tint }) => (
            <li key={title} className={tile}>
              <span className={`grid size-14 place-items-center rounded-2xl ${tint}`}>
                <Icon className="size-7" aria-hidden="true" />
              </span>
              <h3 className="mb-2 mt-5 text-xl font-bold text-slate-900">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const STEPS = [
  { title: "Gia sư đăng ký", text: "Tạo tài khoản và hoàn thiện hồ sơ: môn dạy, cấp học, học phí, kinh nghiệm." },
  { title: "Quản trị viên xem xét", text: "Đội ngũ kiểm duyệt rà soát thông tin trước khi cho phép hiển thị." },
  { title: "Hiển thị công khai", text: "Hồ sơ đạt yêu cầu được duyệt, gắn huy hiệu Đã xác minh và xuất hiện trong kết quả tìm kiếm." },
];

export function AboutVerification() {
  return (
    <section className="w-full bg-white py-12 sm:py-16">
      <div className={containerStyle}>
        <div className="relative overflow-hidden rounded-[36px] bg-[#0b1f44] px-6 py-12 sm:px-12 lg:px-16 lg:py-16 text-white shadow-2xl shadow-blue-950/20">
          {/* Ambient Glow background */}
          <div className="absolute -left-20 -top-20 size-72 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-300">Quy trình xác minh</p>
            <h2 className="mt-2 max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-[40px]">
              Mỗi gia sư đều được xem xét trước khi hiển thị
            </h2>
            <ol className="mt-12 grid gap-8 lg:grid-cols-3 lg:gap-10">
              {STEPS.map((s, i) => (
                <li key={s.title} className="relative flex flex-col">
                  <span className="grid size-12 place-items-center rounded-2xl bg-blue-600 text-xl font-bold text-white shadow-md shadow-blue-600/30">
                    {i + 1}
                  </span>
                  <h3 className="mb-2 mt-5 text-xl font-bold text-white">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-blue-200/90">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

const TEAM = [
  { icon: FileText, title: "Kiểm duyệt hồ sơ", text: "Xem xét và duyệt hồ sơ gia sư, bảo đảm thông tin đầy đủ và trung thực." },
  { icon: Headset, title: "Hỗ trợ người dùng", text: "Giải đáp thắc mắc của học viên và gia sư, xử lý phản hồi và báo cáo." },
  { icon: Code, title: "Phát triển sản phẩm", text: "Xây dựng và cải thiện nền tảng để việc tìm và học cùng gia sư dễ dàng hơn." },
];

export function AboutTeam() {
  return (
    <section className="w-full bg-slate-50/50 py-12 sm:py-16 border-t border-slate-100">
      <div className={containerStyle}>
        <div className="flex flex-col items-start gap-1">
          <p className={eyebrow}>Đội ngũ</p>
          <h2 className={`${h2} max-w-xl`}>Những người đứng sau GiaSuHub</h2>
        </div>
        <ul className="mt-10 grid gap-5 lg:grid-cols-3">
          {TEAM.map(({ icon: Icon, title, text }) => (
            <li key={title} className={`${tile} flex items-start gap-5`}>
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-blue-100 text-blue-600 border border-blue-200/50">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <div>
                <h3 className="mb-1.5 text-lg font-bold text-slate-900">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}