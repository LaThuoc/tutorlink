
"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Zap,
  Heart,
  Sparkles,
  Star,
} from "lucide-react";

type HeroVariant = "organic" | "arch" | "wave" | "minimal";

type AboutHeroProps = {
  variant?: HeroVariant;
};

export function AboutHero({
  variant = "organic",
}: AboutHeroProps) {
  const isOrganic = variant === "organic";
  const isArch = variant === "arch";
  const isWave = variant === "wave";
  const isMinimal = variant === "minimal";

  return (
    <section className="relative overflow-hidden bg-white px-5 py-12 md:px-10 lg:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">

        {/* ================= LEFT CONTENT ================= */}
        <div className="relative z-20">

          {/* Label */}
          <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-blue-100 bg-white px-5 py-3 shadow-[0_5px_20px_rgba(37,99,235,0.08)]">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-blue-700">
              Về GiaSuHub
            </span>
            <ArrowRight className="h-4 w-4 text-blue-500" />
          </div>

          {/* Heading */}
          <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.2] tracking-tight text-slate-900 md:text-5xl xl:text-[58px]">
            Giúp việc học luôn có{" "}
            <span className="relative inline-block text-blue-600">
              người đồng hành
              <svg
                className="absolute -bottom-3 left-0 w-full"
                viewBox="0 0 400 18"
                fill="none"
              >
                <path
                  d="M5 12 C100 0 260 0 395 12"
                  stroke="#FBBF24"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          {/* Description */}
          <p className="mt-8 max-w-xl text-base leading-8 text-slate-600 md:text-lg">
            GiaSuHub kết nối học viên với những gia sư đã được
            xác minh, để mỗi người tìm được người hướng dẫn phù
            hợp với mục tiêu và thời gian của mình.
          </p>

          {/* CTA */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/gia-su"
              className="group inline-flex items-center gap-3 rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white shadow-[0_12px_28px_rgba(37,99,235,0.25)] transition hover:-translate-y-1 hover:bg-blue-700"
            >
              Tìm gia sư
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>

            <Link
              href="/dang-ky-gia-su"
              className="inline-flex items-center rounded-2xl border-2 border-blue-500 bg-white px-8 py-4 font-bold text-blue-600 transition hover:-translate-y-1 hover:bg-blue-50"
            >
              Trở thành gia sư
            </Link>
          </div>

          {/* Trust features */}
          <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-9 w-9 shrink-0 text-blue-500" />
              <span className="text-sm font-medium leading-5 text-slate-600">
                Gia sư
                <br />
                được xác minh
              </span>
            </div>

            <div className="hidden h-10 w-px bg-blue-200 sm:block" />

            <div className="flex items-center gap-3">
              <Zap className="h-9 w-9 shrink-0 text-blue-500" />
              <span className="text-sm font-medium leading-5 text-slate-600">
                Kết nối
                <br />
                nhanh chóng
              </span>
            </div>

            <div className="hidden h-10 w-px bg-blue-200 sm:block" />

            <div className="flex items-center gap-3">
              <Heart className="h-9 w-9 shrink-0 text-blue-500" />
              <span className="text-sm font-medium leading-5 text-slate-600">
                Hỗ trợ
                <br />
                tận tâm
              </span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT DECORATION ================= */}
        <div className="relative mx-auto w-full max-w-[680px]">

          {/* Main background panel */}
          <div
            className={`
              relative aspect-[1.45/1] w-full overflow-hidden
              border border-blue-100/80
              bg-gradient-to-br from-white via-blue-50 to-blue-100
              shadow-[0_20px_55px_rgba(59,130,246,0.10)]
              ${
                isOrganic
                  ? "rounded-[42px_100px_42px_100px]"
                  : isArch
                  ? "rounded-[48%_48%_35px_35px]"
                  : isWave
                  ? "rounded-[42px]"
                  : "rounded-[42px]"
              }
            `}
          >
            {/* Soft light */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_25%_20%,rgba(255,255,255,0.95),transparent_55%)]" />

            {/* ========== ORGANIC BLOB ========== */}
            {isOrganic && (
              <>
                <div className="absolute -right-20 -top-32 h-[430px] w-[430px] rounded-full border-[38px] border-blue-100/60" />

                <div className="absolute -bottom-44 -right-12 h-[390px] w-[580px] rotate-[-15deg] rounded-[50%] bg-gradient-to-r from-blue-100/40 to-blue-400/70" />

                <svg
                  className="absolute bottom-0 left-0 h-[37%] w-full"
                  viewBox="0 0 680 220"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 150 C130 80 205 120 320 145 C455 180 560 90 680 55 L680 220 L0 220Z"
                    fill="#BFDBFE"
                    fillOpacity=".55"
                  />
                  <path
                    d="M0 190 C150 125 245 190 365 165 C500 135 570 85 680 75 L680 220 L0 220Z"
                    fill="#60A5FA"
                    fillOpacity=".42"
                  />
                </svg>
              </>
            )}

            {/* ========== ARCH DESIGN ========== */}
            {isArch && (
              <>
                <div className="absolute -left-48 -top-48 h-[620px] w-[620px] rounded-full border-[35px] border-blue-100/80" />

                <div className="absolute -left-36 -top-36 h-[490px] w-[490px] rounded-full border-[24px] border-blue-200/50" />

                <div className="absolute -bottom-32 -right-24 h-64 w-[500px] rounded-[50%] bg-blue-200/50 blur-2xl" />

                <div className="absolute bottom-0 right-0 h-20 w-3/4 rounded-tl-[100%] bg-gradient-to-l from-blue-300/60 to-transparent" />
              </>
            )}

            {/* ========== LAYERED WAVE ========== */}
            {isWave && (
              <>
                <svg
                  className="absolute bottom-0 left-0 h-[65%] w-full"
                  viewBox="0 0 680 300"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 220 C130 90 230 170 340 195 C460 225 560 80 680 90 L680 300 L0 300Z"
                    fill="#DBEAFE"
                    fillOpacity=".8"
                  />
                  <path
                    d="M0 255 C140 150 235 235 355 210 C490 185 565 95 680 125 L680 300 L0 300Z"
                    fill="#93C5FD"
                    fillOpacity=".75"
                  />
                  <path
                    d="M0 280 C160 210 270 260 400 230 C520 200 600 140 680 155 L680 300 L0 300Z"
                    fill="#3B82F6"
                    fillOpacity=".65"
                  />
                </svg>
              </>
            )}

            {/* ========== MINIMAL ELEMENTS ========== */}
            {isMinimal && (
              <>
                <div className="absolute -bottom-36 -right-36 h-[400px] w-[400px] rounded-full border-[40px] border-blue-100/80" />

                <div className="absolute -bottom-24 -right-24 h-[300px] w-[300px] rounded-full border-[24px] border-blue-200/60" />

                <div className="absolute left-10 top-24 grid grid-cols-4 gap-3 opacity-60">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span
                      key={i}
                      className="h-2 w-2 rounded-full bg-blue-300"
                    />
                  ))}
                </div>

                <div className="absolute left-[18%] top-[48%] h-8 w-8 rounded-full bg-blue-300/60 blur-[1px]" />

                <div className="absolute bottom-16 left-[12%] h-5 w-5 rounded-full bg-blue-300/60" />
              </>
            )}

            {/* Book floating card */}
            <div
              className={`
                absolute z-10 flex h-[100px] w-[100px]
                rotate-[-12deg] items-center justify-center
                rounded-[26px] border border-white/90
                bg-white/85 shadow-[0_14px_35px_rgba(37,99,235,0.18)]
                backdrop-blur-md
                ${
                  isArch
                    ? "left-[19%] top-[42%]"
                    : isMinimal
                    ? "left-[19%] top-[38%]"
                    : "left-[25%] top-[34%]"
                }
              `}
            >
              <BookOpen
                className="h-14 w-14 text-blue-600"
                strokeWidth={1.8}
              />
            </div>

            {/* Dashed orbit */}
            {!isWave && (
              <div className="absolute left-[28%] top-[25%] h-44 w-44 rounded-full border-2 border-dashed border-blue-200/80" />
            )}

            {/* Handwritten slogan */}
            <div className="absolute right-[9%] top-[14%] z-20 rotate-[-6deg] text-center">
              <p
                className="text-2xl font-bold italic tracking-tight text-blue-700 md:text-[30px]"
                style={{ fontFamily: "cursive" }}
              >
                Cùng GiaSuHub
              </p>

              <p
                className="mt-1 text-xl italic text-blue-700 md:text-2xl"
                style={{ fontFamily: "cursive" }}
              >
                chạm tới tri thức!
              </p>

              <svg
                className="mt-2 w-full"
                viewBox="0 0 260 20"
                fill="none"
              >
                <path
                  d="M5 15 C80 -2 170 0 255 8"
                  stroke="#60A5FA"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Graduation cap */}
            <GraduationCap className="absolute right-[7%] top-[7%] z-20 h-16 w-16 rotate-[10deg] text-blue-600" strokeWidth={1.6} />

            {/* Yellow sparkles */}
            <Sparkles className="absolute right-[12%] top-[48%] z-20 h-9 w-9 text-amber-400" />

            <Star className="absolute right-[21%] top-[57%] z-20 h-5 w-5 fill-amber-300 text-amber-300" />

            {/* Small decorative dots */}
            <div className="absolute bottom-[22%] right-[9%] flex gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-300" />
              <span className="h-2 w-2 rounded-full bg-blue-300" />
              <span className="h-2 w-2 rounded-full bg-blue-300" />
            </div>

            {/* Small blue circle */}
            <div className="absolute bottom-[20%] left-[12%] h-4 w-4 rounded-full bg-blue-300/70" />
          </div>

          {/* Floating small book sparkle */}
          <div className="absolute -right-3 -top-4 z-20 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-lg shadow-blue-200/60">
            <Sparkles className="h-7 w-7 text-blue-500" />
          </div>
        </div>
      </div>
    </section>
  );
}
