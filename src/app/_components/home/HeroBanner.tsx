
import Image from "next/image";
import {
  Search,
  ChevronDown,
  Star,
  ShieldCheck,
  CalendarDays,
  Heart,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";

import { GRADES, SUBJECTS } from "@/src/lib/constants/constants";

const selectClass =
  "h-12 w-full appearance-none rounded-xl bg-white px-3 pr-8 text-sm text-slate-700 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-blue-500";

export function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-[#f8f9fc]">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-blue-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 right-0 h-[500px] w-[500px] rounded-full bg-blue-100/40 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-8 px-5 py-12 sm:px-8 lg:min-h-[680px] lg:grid-cols-[0.95fr_1.05fr] lg:gap-5 lg:px-12 xl:px-16">

        {/* ================= LEFT CONTENT ================= */}
        <div className="relative z-10 min-w-0">

          {/* Small label */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-bold text-blue-700 shadow-sm sm:text-sm">
            <Star className="h-4 w-4 fill-blue-500 text-blue-500" />
            Nền tảng kết nối gia sư uy tín
          </div>

          {/* Heading */}
          <h1 className="max-w-[650px] text-4xl font-extrabold leading-[1.18] tracking-tight text-slate-900 sm:text-5xl xl:text-[58px]">
            Tìm gia sư
            <br />
            phù hợp với{" "}
            <span className="relative inline-block text-blue-600">
              bạn
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 120 14"
                fill="none"
              >
                <path
                  d="M3 10 C35 0 80 2 116 8"
                  stroke="#FBBF24"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
            Kết nối với hàng ngàn gia sư uy tín, giàu kinh nghiệm.
            Tìm người hướng dẫn phù hợp với môn học, mục tiêu và
            thời gian của bạn.
          </p>

          {/* Search form */}
          <form
            action="/tutors"
            method="get"
            role="search"
            className="mt-8 rounded-2xl border border-white bg-white p-3 shadow-[0_12px_40px_rgba(37,99,235,0.09)] ring-1 ring-blue-100/70"
          >
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">

              {/* Search keyword */}
              <label className="relative min-w-0 sm:col-span-2">
                <span className="sr-only">
                  Tìm theo môn học, lớp, tên gia sư
                </span>

                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-500" />

                <input
                  name="q"
                  type="search"
                  placeholder="Bạn muốn tìm gia sư môn gì?"
                  className="h-12 w-full rounded-xl bg-slate-50 pl-12 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </label>

              {/* Subject */}
              <label className="relative min-w-0">
                <span className="sr-only">Môn học</span>

                <select
                  name="subject"
                  defaultValue=""
                  className={selectClass}
                >
                  <option value="">Tất cả môn học</option>
                  {SUBJECTS.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </label>

              {/* Grade */}
              <label className="relative min-w-0">
                <span className="sr-only">Cấp học</span>

                <select
                  name="grade"
                  defaultValue=""
                  className={selectClass}
                >
                  <option value="">Tất cả cấp học</option>
                  {GRADES.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0 sm:h-13"
            >
              <Search className="h-4 w-4" />
              Tìm kiếm gia sư
            </button>
          </form>

          {/* Benefits */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 sm:text-sm">
                  Gia sư uy tín
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Xác minh thông tin
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 sm:text-sm">
                  Linh hoạt
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Chủ động thời gian
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 sm:text-sm">
                  Hỗ trợ tận tâm
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Đồng hành học tập
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT ILLUSTRATION ================= */}
        <div className="relative mx-auto w-full max-w-[720px]">

          {/* Soft glow behind illustration */}
          <div className="absolute left-1/2 top-1/2 h-[75%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200/40 blur-[80px]" />

        

          {/* Illustration */}
          <div className="relative aspect-[1.375/1] w-full">
            <Image
              src="/images/banners/banner2.png"
              alt="Minh họa GiaSuHub kết nối học viên với gia sư"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="object-contain"
            />
          </div>

          {/* Floating verification badge */}
          {/* <div className="absolute bottom-[9%] right-[3%] hidden items-center gap-2 rounded-2xl border border-blue-100 bg-white/95 px-4 py-3 shadow-[0_10px_30px_rgba(37,99,235,0.14)] backdrop-blur-md sm:flex">
            <CheckCircle2 className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-xs font-bold text-slate-800">
                Kết nối thành công
              </p>
              <p className="text-[10px] text-slate-500">
                Gia sư đã được xác minh
              </p>
            </div>
          </div> */}

        </div>
      </div>
    </section>
  );
}
