import Image from "next/image";
import { Search } from "lucide-react";
import { Stars } from "../ui/stars";

const DAYS = [
  ["T2", 13], ["T3", 14], ["T4", 15], ["T5", 16], ["T6", 17], ["T7", 18], ["CN", 19],
] as const;

function StepBadge({ n, light = false }: { n: number; light?: boolean }) {
  return (
    <span className={`grid size-9 place-items-center rounded-full text-sm font-bold ${light ? "bg-white text-blue-600" : "bg-blue-600 text-white"}`}>
      {n}
    </span>
  );
}

function TutorRow({ src, name, meta }: { src: string; name: string; meta: string }) {
  return (
    <div className="flex items-center gap-3 border-t border-slate-100 py-2.5">
      <Image src={src} alt={name} width={42} height={42} className="size-[42px] rounded-full object-cover" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{name}</p>
        <p className="flex items-center gap-1 text-xs text-slate-600">
          <Stars count={1} size={12} /> {meta}
        </p>
      </div>
      <span className="rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-600 shrink-0">Xem</span>
    </div>
  );
}

const mock = "mt-auto rounded-2xl bg-white p-4 text-slate-900 shadow-xl shadow-blue-900/10 border border-slate-100/50";
const card = "flex min-h-[380px] flex-col overflow-hidden rounded-[28px] p-6 sm:p-8";

export function HowItWorks() {
  return (
    <section id="cach-hoat-dong" className="w-full bg-white py-12 sm:py-16 scroll-mt-20">
      {/* Khung lề ngang ĐỒNG BỘ HOÀN TOÀN với Hero, FeaturedTutors & StatsBand */}
      <div className="mx-auto w-full max-w-[1920px] px-5 sm:px-8 lg:px-10 xl:px-14 2xl:px-20">
        
        <div className="flex flex-col gap-2">
          <h2 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-[40px]">
            Bốn bước từ tìm gia sư đến buổi học đầu tiên
          </h2>
          <p className="max-w-md text-base sm:text-lg leading-relaxed text-slate-600">
            Mọi thứ diễn ra ngay trên GiaSuHub: tìm, trao đổi, chốt lịch và đánh giá.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-12">
          {/* Bước 1 */}
          <article className={`${card} bg-blue-50/70 lg:col-span-7 border border-blue-100/60`}>
            <StepBadge n={1} />
            <h3 className="mb-2 mt-3.5 text-2xl font-bold tracking-tight text-slate-900">Tìm gia sư phù hợp</h3>
            <p className="mb-6 max-w-md text-slate-600 text-sm sm:text-base">Lọc theo môn học, cấp học, khu vực và mức học phí để thu hẹp danh sách.</p>
            <div className={mock} aria-hidden="true">
              <div className="flex h-11 items-center gap-2.5 rounded-xl bg-slate-100 px-3.5 text-sm text-slate-600">
                <Search className="size-[18px] shrink-0" /> Toán lớp 10, Cầu Giấy
              </div>
              <div className="my-3 flex flex-wrap gap-2 text-[13px]">
                <span className="rounded-full bg-blue-600 px-3 py-1.5 text-white font-medium">Toán</span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">Online</span>
                <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">Dưới 250.000đ</span>
              </div>
              <TutorRow src="/images/stu/stu6.jpg" name="Nguyễn Thị Mai Anh" meta="4.9 · 200.000đ/giờ" />
              <TutorRow src="/images/stu/stu7.jpg" name="Trần Minh Đức" meta="4.8 · 180.000đ/giờ" />
            </div>
          </article>

          {/* Bước 2 */}
         
          <article className={`${card} bg-gradient-to-br from-blue-600 to-indigo-700 text-white lg:col-span-5 shadow-xl shadow-blue-600/25 relative overflow-hidden`}>
            {/* Nền hiệu ứng đốm mờ trang trí */}
            <div className="absolute -right-10 -bottom-10 size-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />

            <StepBadge n={2} light />
            <h3 className="mb-1.5 mt-3 text-2xl font-bold tracking-tight">Gửi yêu cầu học</h3>
            <p className="mb-6 text-blue-100 text-xs sm:text-sm leading-relaxed">
              Xem hồ sơ chi tiết, trao đổi trực tiếp nhu cầu và chốt lịch học ngay trên ứng dụng.
            </p>

            {/* Khung Mockup Chat */}
            <div className="mt-auto flex flex-col gap-2.5 text-xs sm:text-sm relative z-10" aria-hidden="true">
              
              {/* Tin nhắn từ Học viên / Phụ huynh (Gửi đi - Bên phải) */}
              <div className="max-w-[88%] self-end rounded-2xl rounded-br-xs bg-white px-3.5 py-2.5 text-slate-900 shadow-md">
                <p className="font-medium">
                  Em chào cô! Em muốn tìm gia sư Toán 10 ôn thi học kỳ, tuần 2 buổi vào tối T3 & T5 ạ.
                </p>
                <span className="mt-1 block text-[10px] text-slate-400 text-right">19:30</span>
              </div>

              {/* Tin nhắn phản hồi từ Gia sư (Nhận về - Bên trái) */}
              <div className="max-w-[88%] rounded-2xl rounded-bl-xs bg-white/15 backdrop-blur-md px-3.5 py-2.5 text-white border border-white/20 shadow-sm">
                <p className="font-medium">
                  Chào em, cô có thể hỗ trợ khung giờ này nhé. Em đăng ký buổi học thử để cô kiểm tra kiến thức trước nhé!
                </p>
                <span className="mt-1 block text-[10px] text-blue-200">19:32</span>
              </div>

              {/* Thẻ trạng thái Hệ thống xác nhận (System Tag) */}
              <div className="self-center rounded-full bg-emerald-500/20 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-emerald-200 border border-emerald-400/30 flex items-center gap-1.5 mt-0.5">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Gia sư đã nhận lời mời học thử
              </div>

            </div>
          </article>

          {/* Bước 3 */}
          <article className={`${card} bg-slate-50 lg:col-span-5 border border-slate-200/60`}>
            <StepBadge n={3} />
            <h3 className="mb-2 mt-3.5 text-2xl font-bold tracking-tight text-slate-900">Học thử và chốt lịch</h3>
            <p className="mb-6 text-slate-600 text-sm sm:text-base">Gia sư xác nhận, hai bên thống nhất lịch học phù hợp.</p>
            <div className={mock} aria-hidden="true">
              <div className="grid grid-cols-7 gap-1.5 text-center text-[13px]">
                {DAYS.map(([d, n]) => (
                  <div key={d} className={`rounded-xl py-2 ${d === "T3" ? "bg-blue-600 font-bold text-white shadow-sm" : "bg-slate-100 text-slate-700"}`}>
                    {d}
                    <div className="text-[15px] font-semibold">{n}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3.5 flex items-center justify-between text-sm font-semibold pt-2 border-t border-slate-50">
                <span className="text-slate-800">18:00 - 19:30 · Toán</span>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs text-emerald-800 font-bold">Đã xác nhận</span>
              </div>
            </div>
          </article>

          {/* Bước 4 */}
          <article className={`${card} bg-amber-50/80 lg:col-span-7 border border-amber-100`}>
            <StepBadge n={4} />
            <h3 className="mb-2 mt-3.5 text-2xl font-bold tracking-tight text-slate-900">Đánh giá sau buổi học</h3>
            <p className="mb-6 max-w-md text-slate-600 text-sm sm:text-base">Nhận xét của bạn giúp cộng đồng chọn gia sư tốt hơn.</p>
            <div className={mock} aria-hidden="true">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-full bg-blue-100 text-[15px] font-bold text-blue-700">MQ</span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Nguyễn Minh Quân</p>
                  <Stars size={14} />
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">Cô dạy rất nhiệt tình, dễ hiểu. Con tiến bộ rõ rệt sau 1 tháng.</p>
            </div>
          </article>
        </div>

      </div>
    </section>
  );
}