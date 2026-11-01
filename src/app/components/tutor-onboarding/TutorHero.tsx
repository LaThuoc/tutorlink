import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  GraduationCap,
} from "lucide-react";

const PERKS = [
  "Tạo hồ sơ miễn phí",
  "Tự đặt học phí",
  "Được xác minh",
];

export function TutorHero() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
      <div className="relative grid items-center gap-8 overflow-hidden rounded-[36px] bg-[#edf4ff] px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-4 lg:px-12 lg:py-14 xl:px-14">

        <div className="relative z-10 min-w-0">

          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm">
            <GraduationCap
              className="size-[18px]"
              aria-hidden="true"
            />
            Dành cho gia sư
          </span>

          <h1 className="mt-5 max-w-[620px] text-4xl font-bold leading-[1.12] tracking-tight text-slate-900 sm:text-5xl lg:text-[50px] xl:text-[54px]">
            Biến kiến thức của bạn thành những lớp học thật
          </h1>

          <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
            Tạo hồ sơ gia sư trên GiaSuHub để học viên tìm thấy bạn,
            gửi yêu cầu học và cùng chốt lịch dạy.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register?role=tutor"
              className="inline-flex h-[52px] items-center gap-2.5 rounded-2xl bg-blue-600 px-6 font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Đăng ký làm gia sư
              <ArrowRight
                className="size-[18px]"
                aria-hidden="true"
              />
            </Link>

            <Link
              href="#bat-dau"
              className="inline-flex h-[52px] items-center rounded-2xl border border-blue-200 bg-white px-6 font-semibold text-blue-600 transition hover:bg-blue-50"
            >
              Xem cách hoạt động
            </Link>
          </div>

          {/* Benefits */}
          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-700">
            {PERKS.map((perk) => (
              <li
                key={perk}
                className="flex items-center gap-2"
              >
                <Check
                  className="size-[18px] shrink-0 text-emerald-600"
                  strokeWidth={2.4}
                  aria-hidden="true"
                />
                {perk}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[680px] lg:max-w-none">
          <div className="relative aspect-[1060/770] w-full">
            <Image
              src="/images/banners/banner5.png"
              alt="Minh họa hồ sơ gia sư đã xác minh trên GiaSuHub"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="object-contain"
            />
          </div>
        </div>

      </div>
    </section>
  );
}
