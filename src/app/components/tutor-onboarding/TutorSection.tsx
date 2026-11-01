import Link from "next/link";
import { ArrowRight, Calendar, Check, FileText, Inbox, ShieldCheck, Star, User, Users, Wallet, type LucideIcon } from "lucide-react";
import { TutorCard } from "../tutors/TutorCard";
import type { TutorCardData } from "@/src/types/tutor.type"; // Direct type path

const wrap = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";
const eyebrow = "text-sm font-semibold uppercase tracking-wider text-blue-600";
const h2 = "mt-3 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-[42px]";
const tile = "rounded-3xl bg-blue-50/60 p-7 transition hover:-translate-y-1.5 hover:bg-blue-50 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

const BENEFITS: { icon: LucideIcon; title: string; text: string; tint: string }[] = [
  { icon: Wallet, title: "Tự đặt học phí", text: "Bạn quyết định mức học phí mỗi giờ, môn dạy và hình thức dạy phù hợp với mình.", tint: "bg-blue-100 text-blue-600" },
  { icon: Users, title: "Học viên tìm đến bạn", text: "Hồ sơ của bạn xuất hiện trong kết quả tìm kiếm theo môn, cấp học và khu vực.", tint: "bg-emerald-100 text-emerald-700" },
  { icon: Calendar, title: "Quản lý lịch dạy gọn gàng", text: "Theo dõi yêu cầu học, lịch dạy và trạng thái từng lớp ngay trên bảng điều khiển.", tint: "bg-amber-100 text-amber-700" },
  { icon: Star, title: "Xây dựng uy tín", text: "Đánh giá thật từ học viên giúp hồ sơ của bạn nổi bật và đáng tin hơn.", tint: "bg-rose-100 text-rose-600" },
];

export function TutorBenefits() {
  return (
    <section className={`${wrap} pt-24`}>
      <p className={eyebrow}>Lợi ích</p>
      <h2 className={`${h2} max-w-xl`}>Vì sao nên dạy cùng GiaSuHub</h2>
      <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFITS.map(({ icon: Icon, title, text, tint }) => (
          <li key={title} className={tile}>
            <span className={`grid size-[60px] place-items-center rounded-[18px] ${tint}`}><Icon className="size-7" aria-hidden="true" /></span>
            <h3 className="mb-2 mt-5 text-xl font-semibold text-slate-900">{title}</h3>
            <p className="leading-relaxed text-slate-600">{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: User, title: "Tạo tài khoản", text: "Đăng ký bằng email hoặc Google và chọn vai trò gia sư." },
  { icon: FileText, title: "Hoàn thiện hồ sơ", text: "Điền giới thiệu, môn dạy, cấp học, học phí và khu vực dạy." },
  { icon: ShieldCheck, title: "Chờ xét duyệt", text: "Quản trị viên xem xét hồ sơ và gắn huy hiệu Đã xác minh." },
  { icon: Inbox, title: "Nhận yêu cầu học", text: "Học viên gửi yêu cầu, bạn chấp nhận và chốt lịch dạy." },
];

export function TutorSteps() {
  return (
    <section id="bat-dau" className={`${wrap} scroll-mt-24 pt-24`}>
      <p className={eyebrow}>Bắt đầu</p>
      <h2 className={`${h2} max-w-xl`}>Bốn bước để nhận lớp đầu tiên</h2>
      <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-7">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <li key={title}>
            <div className="flex items-center gap-3.5">
              <span className="grid size-[60px] shrink-0 place-items-center rounded-full bg-blue-600 text-white"><Icon className="size-[26px]" aria-hidden="true" /></span>
              {i < STEPS.length - 1 && <span aria-hidden="true" className="hidden flex-1 border-t-2 border-dashed border-blue-200 lg:block" />}
            </div>
            <p className="mt-5 text-[13px] font-bold uppercase text-blue-600">Bước {i + 1}</p>
            <h3 className="mb-2 mt-1.5 text-[21px] font-semibold text-slate-900">{title}</h3>
            <p className="pr-4 leading-relaxed text-slate-600">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

const FILL = [
  "Giới thiệu bản thân và tiêu đề hồ sơ",
  "Môn dạy và khối lớp bạn nhận",
  "Học phí mỗi giờ và số năm kinh nghiệm",
  "Khu vực dạy, dạy online hoặc tại nhà",
  "Ảnh đại diện rõ mặt, đủ sáng",
];

const SAMPLE: TutorCardData = {
  user_id: "mau",
  name: "Nguyễn Thị Mai Anh",
  avatar: null,
  headline: "Gia sư Toán - Lý kinh nghiệm 3 năm",
  school_name: "Đại học Bách Khoa Hà Nội",
  education: "Cử nhân Sư phạm",
  subjects: ["Toán", "Vật lý"],
  grades: ["Lớp 10", "Lớp 11", "Lớp 12"],
  hourly_rate: 200000,
  address: "Hoàng Mai, Hà Nội",
  is_online: true,
  experience_years: 3,
  rating_avg: 4.9,
  rating_count: 128,
};

export function TutorProfilePreview() {
  return (
    <section className={`${wrap} pt-24`}>
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-[72px]">
        <div>
          <p className={eyebrow}>Hồ sơ của bạn</p>
          <h2 className={h2}>Hồ sơ rõ ràng giúp học viên chọn bạn nhanh hơn</h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Học viên nhìn thấy thẻ hồ sơ này trong kết quả tìm kiếm. Hãy điền đầy đủ các thông tin sau:
          </p>
          <ul className="mt-7 space-y-3.5">
            {FILL.map((t) => (
              <li key={t} className="flex items-center gap-3 text-base text-slate-800">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-600 text-white">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-center rounded-[36px] bg-gradient-to-br from-blue-100 to-blue-50 p-8 sm:p-12">
          <div inert aria-hidden="true" className="pointer-events-none w-full max-w-[320px] select-none">
            <TutorCard tutor={SAMPLE} />
          </div>
        </div>
      </div>
    </section>
  );
}

const REQUESTS = [
  { initials: "NL", name: "Phạm Ngọc Linh", meta: "Lớp 10 · Toán", tint: "bg-blue-100 text-blue-600" },
  { initials: "TA", name: "Hoàng Tuấn Anh", meta: "Lớp 11 · Vật lý", tint: "bg-emerald-100 text-emerald-800" },
  { initials: "TH", name: "Lê Thu Hà", meta: "Lớp 12 · Hóa học", tint: "bg-amber-100 text-amber-700" },
];

export function TutorDashboardPreview() {
  return (
    <section className={`${wrap} pt-24`}>
      <div className="grid items-center gap-12 rounded-[40px] bg-[#0b1f44] px-6 py-14 sm:px-12 lg:grid-cols-[1fr_1.2fr] lg:gap-14 lg:px-16 lg:py-[72px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-300">Bảng điều khiển</p>
          <h2 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-white sm:text-[42px]">Quản lý mọi lớp dạy ở một nơi</h2>
          <p className="mt-4 text-lg leading-relaxed text-blue-200">
            Nhận yêu cầu học mới, chấp nhận hoặc từ chối, theo dõi lịch dạy và đánh giá từ học viên.
          </p>
          <Link href="/register?role=tutor" className="mt-8 inline-flex h-[52px] items-center rounded-2xl bg-white px-7 font-semibold text-blue-800 hover:bg-blue-50 transition-colors">
            Đăng ký làm gia sư
          </Link>
        </div>

        <div aria-hidden="true" className="grid gap-4 rounded-[28px] bg-slate-100 p-5 sm:grid-cols-[1.4fr_1fr] sm:p-6">
          <div className="rounded-[20px] bg-white p-5 shadow-sm">
            <p className="mb-2 font-bold">Yêu cầu học mới</p>
            {REQUESTS.map((r) => (
              <div key={r.name} className="flex items-center gap-2.5 border-t border-slate-100 py-3">
                <span className={`grid size-[38px] place-items-center rounded-full text-xs font-bold ${r.tint}`}>{r.initials}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-[13px] text-slate-600">{r.meta}</p>
                </div>
                <span className="rounded-[9px] bg-blue-600 px-3 py-1.5 text-[13px] font-semibold text-white">Chấp nhận</span>
              </div>
            ))}
          </div>
          <div className="grid gap-4">
            <div className="rounded-[20px] bg-white p-[18px] shadow-sm">
              <p className="text-[13px] text-slate-600">Đã dạy</p>
              <p className="text-[26px] font-bold">42 buổi</p>
            </div>
            <div className="rounded-[20px] bg-white p-[18px] shadow-sm">
              <p className="text-[13px] text-slate-600">Đánh giá</p>
              <p className="flex items-center gap-1.5 text-[26px] font-bold">4.9 <Star className="size-5 fill-amber-400 text-amber-400" /></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TutorFinalCta() {
  return (
    <section className={`${wrap} pt-24`}>
      <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-blue-600 to-blue-900 px-6 py-16 text-center text-white sm:px-16 sm:py-[72px]">
        <span aria-hidden="true" className="animate-float-slow absolute -right-20 -top-24 size-80 rounded-full bg-white/10" />
        <span aria-hidden="true" className="animate-float absolute -bottom-24 -left-14 size-60 rounded-full bg-white/10" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-[42px]">
            Sẵn sàng bắt đầu hành trình làm gia sư?
          </h2>
          <p className="mx-auto mb-9 mt-4 max-w-lg text-lg leading-relaxed text-blue-100">
            Tạo hồ sơ miễn phí và để học viên tìm thấy bạn.
          </p>
          <Link href="/register?role=tutor" className="inline-flex h-[52px] items-center gap-2.5 rounded-2xl bg-white px-7 font-semibold text-blue-800 hover:bg-blue-50 transition-colors">
            Đăng ký làm gia sư <ArrowRight className="size-[18px]" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}